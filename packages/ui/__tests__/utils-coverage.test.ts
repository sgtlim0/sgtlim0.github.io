/**
 * Utils coverage extension tests.
 * Targets: healthCheck (checkServiceHealth success/degraded, getSystemHealth aggregation),
 * errorMonitoring (initSentry, breadcrumbs, transactions, getErrorBoundaryConfig, getMonitoringConfig),
 * webVitals (evaluateMetric, reportWebVitals, buildReport, createMetric, clearCollectedMetrics).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---------- healthCheck ----------

describe('healthCheck - extended', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('checkServiceHealth returns "up" for ok response', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({ ok: true, status: 200 } as Response),
    )
    const { checkServiceHealth } = await import('../src/utils/healthCheck')
    const result = await checkServiceHealth('api', 'https://api.test/health')
    expect(result.status).toBe('up')
    expect(result.name).toBe('api')
    expect(result.latency).toBeGreaterThanOrEqual(0)
    expect(result.error).toBeUndefined()
  })

  it('checkServiceHealth returns "degraded" for non-ok response', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({ ok: false, status: 503 } as Response),
    )
    const { checkServiceHealth } = await import('../src/utils/healthCheck')
    const result = await checkServiceHealth('api', 'https://api.test/health')
    expect(result.status).toBe('degraded')
  })

  it('checkServiceHealth returns "down" on fetch error', async () => {
    fetchMock.mockReturnValue(Promise.reject(new Error('Network fail')))
    const { checkServiceHealth } = await import('../src/utils/healthCheck')
    const result = await checkServiceHealth('db', 'https://db.test/health')
    expect(result.status).toBe('down')
    expect(result.error).toBe('Network fail')
  })

  it('checkServiceHealth returns "down" on non-Error throw', async () => {
    fetchMock.mockReturnValue(Promise.reject('string error'))
    const { checkServiceHealth } = await import('../src/utils/healthCheck')
    const result = await checkServiceHealth('cache', 'https://cache.test')
    expect(result.status).toBe('down')
    expect(result.error).toBe('Unknown')
  })

  it('getSystemHealth returns "healthy" when all services are up', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({ ok: true, status: 200 } as Response),
    )
    const { getSystemHealth } = await import('../src/utils/healthCheck')
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.test' },
      { name: 'db', url: 'https://db.test' },
    ])
    expect(health.status).toBe('healthy')
    expect(health.services).toHaveLength(2)
    expect(health.timestamp).toBeTruthy()
  })

  it('getSystemHealth returns "degraded" when one service is degraded', async () => {
    fetchMock
      .mockReturnValueOnce(Promise.resolve({ ok: true, status: 200 } as Response))
      .mockReturnValueOnce(Promise.resolve({ ok: false, status: 503 } as Response))
    const { getSystemHealth } = await import('../src/utils/healthCheck')
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.test' },
      { name: 'slow', url: 'https://slow.test' },
    ])
    expect(health.status).toBe('degraded')
  })

  it('getSystemHealth returns "unhealthy" when one service is down', async () => {
    fetchMock
      .mockReturnValueOnce(Promise.resolve({ ok: true, status: 200 } as Response))
      .mockReturnValueOnce(Promise.reject(new Error('timeout')))
    const { getSystemHealth } = await import('../src/utils/healthCheck')
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.test' },
      { name: 'dead', url: 'https://dead.test' },
    ])
    expect(health.status).toBe('unhealthy')
  })
})

// ---------- errorMonitoring - extended ----------

describe('errorMonitoring - extended', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initSentry stores instance and captureError forwards to it', async () => {
    const mockSentry = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      startTransaction: vi.fn(() => ({ finish: vi.fn(), setData: vi.fn() })),
    }
    const mod = await import('../src/utils/errorMonitoring')
    mod.initSentry(mockSentry)

    mod.captureError(new Error('test'), { component: 'App' })
    expect(mockSentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ component: 'App' }) }),
    )
  })

  it('captureMessage forwards to sentry when initialized', async () => {
    const mockSentry = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      startTransaction: vi.fn(() => ({ finish: vi.fn(), setData: vi.fn() })),
    }
    const mod = await import('../src/utils/errorMonitoring')
    mod.initSentry(mockSentry)

    mod.captureMessage('hello', 'warning')
    expect(mockSentry.captureMessage).toHaveBeenCalledWith('hello', 'warning')
  })

  it('setUser and clearUser call sentry.setUser', async () => {
    const mockSentry = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      startTransaction: vi.fn(() => ({ finish: vi.fn(), setData: vi.fn() })),
    }
    const mod = await import('../src/utils/errorMonitoring')
    mod.initSentry(mockSentry)

    mod.setUser({ id: '1', email: 'a@b.com', role: 'admin' })
    expect(mockSentry.setUser).toHaveBeenCalledWith({ id: '1', email: 'a@b.com', role: 'admin' })

    mod.clearUser()
    expect(mockSentry.setUser).toHaveBeenCalledWith(null)
  })

  it('addBreadcrumb forwards to sentry when initialized', async () => {
    const mockSentry = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      startTransaction: vi.fn(() => ({ finish: vi.fn(), setData: vi.fn() })),
    }
    const mod = await import('../src/utils/errorMonitoring')
    mod.initSentry(mockSentry)

    mod.addBreadcrumb({ category: 'nav', message: 'clicked button' })
    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'nav', message: 'clicked button' }),
    )
  })

  it('addBreadcrumb stores in buffer when sentry not initialized', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    // No initSentry call

    mod.addBreadcrumb({ category: 'test', message: 'breadcrumb 1' })
    mod.addBreadcrumb({ category: 'test', message: 'breadcrumb 2' })

    const crumbs = mod.getBreadcrumbs()
    expect(crumbs.length).toBeGreaterThanOrEqual(2)
    expect(crumbs.some((c) => c.message === 'breadcrumb 1')).toBe(true)
  })

  it('startTransaction and finishTransaction track duration', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    const id = mod.startTransaction('load', 'page.load', { page: '/home' })
    expect(typeof id).toBe('string')

    const result = mod.finishTransaction(id)
    expect(result).not.toBeNull()
    expect(result!.duration).toBeGreaterThanOrEqual(0)
  })

  it('finishTransaction returns null for unknown id', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    const result = mod.finishTransaction('unknown-id')
    expect(result).toBeNull()
  })

  it('startTransaction with sentry calls startTransaction on sentry', async () => {
    const mockTx = { finish: vi.fn(), setData: vi.fn() }
    const mockSentry = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      startTransaction: vi.fn(() => mockTx),
    }
    const mod = await import('../src/utils/errorMonitoring')
    mod.initSentry(mockSentry)

    const id = mod.startTransaction('api', 'http.request', { url: '/test' })
    expect(mockSentry.startTransaction).toHaveBeenCalledWith({ name: 'api', op: 'http.request' })
    expect(mockTx.setData).toHaveBeenCalledWith('url', '/test')

    const result = mod.finishTransaction(id)
    expect(result).not.toBeNull()
    expect(mockTx.finish).toHaveBeenCalled()
  })

  it('getErrorBoundaryConfig returns working config', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    const config = mod.getErrorBoundaryConfig('TestComponent')
    expect(config.fallback).toBe('default')
    expect(typeof config.onError).toBe('function')

    // Calling onError should not throw
    config.onError(new Error('boundary error'), { componentStack: 'stack' })
  })

  it('getErrorBoundaryConfig with custom fallback option', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    const config = mod.getErrorBoundaryConfig('Widget', { fallback: 'minimal' })
    expect(config.fallback).toBe('minimal')
  })

  it('getMonitoringConfig returns config shape', async () => {
    const mod = await import('../src/utils/errorMonitoring')
    const config = mod.getMonitoringConfig()
    expect(config).toHaveProperty('dsn')
    expect(config).toHaveProperty('environment')
    expect(config).toHaveProperty('enabled')
    expect(typeof config.enabled).toBe('boolean')
  })
})

// ---------- webVitals - extended ----------

describe('webVitals - extended', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('evaluateMetric returns "good" for values within threshold', async () => {
    const { evaluateMetric } = await import('../src/utils/webVitals')
    expect(evaluateMetric('LCP', 1000)).toBe('good')
    expect(evaluateMetric('FID', 50)).toBe('good')
    expect(evaluateMetric('CLS', 0.05)).toBe('good')
  })

  it('evaluateMetric returns "needs-improvement" for mid-range values', async () => {
    const { evaluateMetric } = await import('../src/utils/webVitals')
    expect(evaluateMetric('LCP', 3000)).toBe('needs-improvement')
    expect(evaluateMetric('FID', 200)).toBe('needs-improvement')
    expect(evaluateMetric('CLS', 0.2)).toBe('needs-improvement')
  })

  it('evaluateMetric returns "poor" for values above threshold', async () => {
    const { evaluateMetric } = await import('../src/utils/webVitals')
    expect(evaluateMetric('LCP', 5000)).toBe('poor')
    expect(evaluateMetric('FID', 500)).toBe('poor')
    expect(evaluateMetric('CLS', 0.5)).toBe('poor')
  })

  it('evaluateMetric handles all metric types', async () => {
    const { evaluateMetric } = await import('../src/utils/webVitals')
    expect(evaluateMetric('TTFB', 100)).toBe('good')
    expect(evaluateMetric('INP', 100)).toBe('good')
    expect(evaluateMetric('FCP', 1000)).toBe('good')
  })

  it('createMetric generates a valid metric with auto-rating', async () => {
    const { createMetric } = await import('../src/utils/webVitals')
    const metric = createMetric('LCP', 1500)
    expect(metric.name).toBe('LCP')
    expect(metric.value).toBe(1500)
    expect(metric.rating).toBe('good')
    expect(metric.id).toMatch(/^v4-/)
    expect(metric.delta).toBe(1500) // delta defaults to value
  })

  it('createMetric uses custom delta when provided', async () => {
    const { createMetric } = await import('../src/utils/webVitals')
    const metric = createMetric('FCP', 2000, 500)
    expect(metric.delta).toBe(500)
  })

  it('reportWebVitals collects metrics and buildReport returns them', async () => {
    const { reportWebVitals, buildReport, clearCollectedMetrics, createMetric } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals(createMetric('LCP', 1200))
    reportWebVitals(createMetric('FID', 50))

    const report = buildReport()
    expect(report.metrics).toHaveLength(2)
    expect(report.metrics[0].name).toBe('LCP')
    expect(report.metrics[1].name).toBe('FID')
    expect(report.timestamp).toBeTruthy()
    expect(report.overallRating).toBe('good')
  })

  it('reportWebVitals updates existing metric by name', async () => {
    const { reportWebVitals, getCollectedMetrics, clearCollectedMetrics, createMetric } =
      await import('../src/utils/webVitals')
    clearCollectedMetrics()

    reportWebVitals(createMetric('LCP', 1200))
    reportWebVitals(createMetric('LCP', 5000)) // update

    const metrics = getCollectedMetrics()
    const lcp = metrics.filter((m) => m.name === 'LCP')
    expect(lcp).toHaveLength(1)
    expect(lcp[0].value).toBe(5000)
  })

  it('clearCollectedMetrics empties the buffer', async () => {
    const { reportWebVitals, getCollectedMetrics, clearCollectedMetrics, createMetric } =
      await import('../src/utils/webVitals')
    reportWebVitals(createMetric('CLS', 0.1))
    clearCollectedMetrics()
    expect(getCollectedMetrics()).toHaveLength(0)
  })

  it('buildReport overall is "poor" when any metric is poor', async () => {
    const { reportWebVitals, buildReport, clearCollectedMetrics, createMetric } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals(createMetric('LCP', 1200)) // good
    reportWebVitals(createMetric('FID', 400)) // poor

    const report = buildReport()
    expect(report.overallRating).toBe('poor')
  })

  it('buildReport overall is "needs-improvement" when no poor but has mid', async () => {
    const { reportWebVitals, buildReport, clearCollectedMetrics, createMetric } = await import(
      '../src/utils/webVitals'
    )
    clearCollectedMetrics()

    reportWebVitals(createMetric('LCP', 1200)) // good
    reportWebVitals(createMetric('FID', 200)) // needs-improvement

    const report = buildReport()
    expect(report.overallRating).toBe('needs-improvement')
  })

  it('WEB_VITAL_THRESHOLDS has all 6 metric types', async () => {
    const { WEB_VITAL_THRESHOLDS } = await import('../src/utils/webVitals')
    const expectedNames = ['LCP', 'FID', 'CLS', 'TTFB', 'INP', 'FCP']
    for (const name of expectedNames) {
      expect(WEB_VITAL_THRESHOLDS[name as keyof typeof WEB_VITAL_THRESHOLDS]).toBeDefined()
      expect(
        WEB_VITAL_THRESHOLDS[name as keyof typeof WEB_VITAL_THRESHOLDS].good,
      ).toBeLessThan(
        WEB_VITAL_THRESHOLDS[name as keyof typeof WEB_VITAL_THRESHOLDS].poor,
      )
    }
  })
})
