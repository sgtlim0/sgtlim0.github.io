/**
 * Extended webVitals tests covering reportWebVitals (dev + prod paths),
 * sendToEndpoint batching, buildReport, clearCollectedMetrics.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('webVitals - extended coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('reportWebVitals stores metric and updates existing one', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'test' },
    })

    vi.resetModules()
    const {
      reportWebVitals,
      getCollectedMetrics,
      clearCollectedMetrics,
    } = await import('../src/utils/webVitals')

    clearCollectedMetrics()

    reportWebVitals({
      name: 'LCP',
      value: 2000,
      id: 'v4-1',
      delta: 2000,
      rating: 'good',
    })

    expect(getCollectedMetrics().length).toBe(1)
    expect(getCollectedMetrics()[0].name).toBe('LCP')

    // Update same metric
    reportWebVitals({
      name: 'LCP',
      value: 3000,
      id: 'v4-2',
      delta: 1000,
      rating: 'needs-improvement',
    })

    expect(getCollectedMetrics().length).toBe(1)
    expect(getCollectedMetrics()[0].value).toBe(3000)
  })

  it('reportWebVitals logs in development mode', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'development' },
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({
      name: 'FCP',
      value: 1500,
      id: 'v4-dev',
      delta: 1500,
      rating: 'good',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WebVitals] FCP'),
    )
  })

  it('reportWebVitals logs needs-improvement rating in dev', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'development' },
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({
      name: 'CLS',
      value: 0.15,
      id: 'v4-ni',
      delta: 0.15,
      rating: 'needs-improvement',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NEEDS IMPROVEMENT]'),
    )
  })

  it('reportWebVitals logs poor rating in dev', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'development' },
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({
      name: 'LCP',
      value: 5000,
      id: 'v4-poor',
      delta: 5000,
      rating: 'poor',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[POOR]'),
    )
  })

  it('reportWebVitals triggers sendToEndpoint in production mode', async () => {
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_VITALS_ENDPOINT: 'https://vitals.test/api',
      },
    })

    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({
      name: 'TTFB',
      value: 500,
      id: 'v4-prod',
      delta: 500,
      rating: 'good',
    })

    // sendToEndpoint uses a 5s debounce
    vi.advanceTimersByTime(5100)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://vitals.test/api',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }),
    )
  })

  it('sendToEndpoint does nothing when no endpoint is set', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'production' },
    })

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({
      name: 'INP',
      value: 100,
      id: 'v4-no-ep',
      delta: 100,
      rating: 'good',
    })

    vi.advanceTimersByTime(5100)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sendToEndpoint debounces multiple rapid reports', async () => {
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_VITALS_ENDPOINT: 'https://vitals.test/api',
      },
    })

    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-1', delta: 2000, rating: 'good' })
    reportWebVitals({ name: 'FID', value: 50, id: 'v4-2', delta: 50, rating: 'good' })
    reportWebVitals({ name: 'CLS', value: 0.05, id: 'v4-3', delta: 0.05, rating: 'good' })

    vi.advanceTimersByTime(5100)

    // Should batch into one call
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sendToEndpoint silently handles fetch errors', async () => {
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_VITALS_ENDPOINT: 'https://vitals.test/api',
      },
    })

    const fetchMock = vi.fn().mockRejectedValue(new Error('Network'))
    vi.stubGlobal('fetch', fetchMock)

    vi.resetModules()
    const { reportWebVitals, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-err', delta: 2000, rating: 'good' })

    vi.advanceTimersByTime(5100)

    // Should not throw
    expect(fetchMock).toHaveBeenCalled()
  })

  it('buildReport includes URL from window.location', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'test' },
    })

    vi.resetModules()
    const { buildReport, clearCollectedMetrics, reportWebVitals } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-r', delta: 2000, rating: 'good' })

    const report = buildReport()
    expect(report.metrics.length).toBe(1)
    expect(report.timestamp).toBeDefined()
    expect(report.url).toBeDefined()
    expect(report.overallRating).toBe('good')
  })

  it('buildReport overall rating is poor when any metric is poor', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'test' },
    })

    vi.resetModules()
    const { buildReport, clearCollectedMetrics, reportWebVitals } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-g', delta: 2000, rating: 'good' })
    reportWebVitals({ name: 'FID', value: 500, id: 'v4-p', delta: 500, rating: 'poor' })

    const report = buildReport()
    expect(report.overallRating).toBe('poor')
  })

  it('buildReport overall rating is needs-improvement when no poor but has ni', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'test' },
    })

    vi.resetModules()
    const { buildReport, clearCollectedMetrics, reportWebVitals } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-g', delta: 2000, rating: 'good' })
    reportWebVitals({
      name: 'CLS',
      value: 0.15,
      id: 'v4-ni',
      delta: 0.15,
      rating: 'needs-improvement',
    })

    const report = buildReport()
    expect(report.overallRating).toBe('needs-improvement')
  })

  it('clearCollectedMetrics empties the array', async () => {
    vi.stubGlobal('process', {
      env: { NODE_ENV: 'test' },
    })

    vi.resetModules()
    const { reportWebVitals, getCollectedMetrics, clearCollectedMetrics } = await import(
      '../src/utils/webVitals'
    )

    clearCollectedMetrics()
    reportWebVitals({ name: 'LCP', value: 2000, id: 'v4-c', delta: 2000, rating: 'good' })
    expect(getCollectedMetrics().length).toBe(1)

    clearCollectedMetrics()
    expect(getCollectedMetrics().length).toBe(0)
  })

  it('createMetric creates a properly shaped metric', async () => {
    vi.resetModules()
    const { createMetric } = await import('../src/utils/webVitals')

    const metric = createMetric('LCP', 2500)
    expect(metric.name).toBe('LCP')
    expect(metric.value).toBe(2500)
    expect(metric.delta).toBe(2500) // defaults to value
    expect(metric.rating).toBe('good')
    expect(metric.id).toMatch(/^v4-/)
  })

  it('createMetric with custom delta', async () => {
    vi.resetModules()
    const { createMetric } = await import('../src/utils/webVitals')

    const metric = createMetric('FID', 200, 50)
    expect(metric.delta).toBe(50)
    expect(metric.rating).toBe('needs-improvement')
  })

  it('evaluateMetric returns correct ratings for all thresholds', async () => {
    vi.resetModules()
    const { evaluateMetric } = await import('../src/utils/webVitals')

    expect(evaluateMetric('LCP', 2000)).toBe('good')
    expect(evaluateMetric('LCP', 3000)).toBe('needs-improvement')
    expect(evaluateMetric('LCP', 5000)).toBe('poor')

    expect(evaluateMetric('FID', 50)).toBe('good')
    expect(evaluateMetric('FID', 200)).toBe('needs-improvement')
    expect(evaluateMetric('FID', 400)).toBe('poor')

    expect(evaluateMetric('CLS', 0.05)).toBe('good')
    expect(evaluateMetric('CLS', 0.2)).toBe('needs-improvement')
    expect(evaluateMetric('CLS', 0.5)).toBe('poor')

    expect(evaluateMetric('TTFB', 500)).toBe('good')
    expect(evaluateMetric('TTFB', 1000)).toBe('needs-improvement')
    expect(evaluateMetric('TTFB', 2000)).toBe('poor')

    expect(evaluateMetric('INP', 100)).toBe('good')
    expect(evaluateMetric('INP', 300)).toBe('needs-improvement')
    expect(evaluateMetric('INP', 600)).toBe('poor')

    expect(evaluateMetric('FCP', 1000)).toBe('good')
    expect(evaluateMetric('FCP', 2000)).toBe('needs-improvement')
    expect(evaluateMetric('FCP', 4000)).toBe('poor')
  })
})
