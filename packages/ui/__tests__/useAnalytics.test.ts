import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from '../src/hooks/useAnalytics'
import {
  getEventHistory,
  resetAnalytics,
} from '../src/utils/analytics'

// Mock sanitizePII
vi.mock('../src/utils/sanitize', () => ({
  sanitizePII: vi.fn((text: string) => ({ sanitized: text, maskedCount: 0 })),
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    resetAnalytics()
  })

  afterEach(() => {
    resetAnalytics()
  })

  it('returns stable trackEvent, trackPageView, trackTiming functions', () => {
    const { result, rerender } = renderHook(() => useAnalytics())

    const first = result.current
    rerender()
    const second = result.current

    expect(first.trackEvent).toBe(second.trackEvent)
    expect(first.trackPageView).toBe(second.trackPageView)
    expect(first.trackTiming).toBe(second.trackTiming)
  })

  it('trackEvent delegates to core analytics', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackEvent('click', 'interaction', { target: 'btn' })
    })

    const history = getEventHistory()
    expect(history).toHaveLength(1)
    expect(history[0].name).toBe('click')
    expect(history[0].category).toBe('interaction')
  })

  it('trackPageView delegates to core analytics', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackPageView('/home', 'Home')
    })

    const history = getEventHistory()
    expect(history).toHaveLength(1)
    expect(history[0].name).toBe('page_view')
    expect(history[0].properties?.path).toBe('/home')
  })

  it('trackTiming delegates to core analytics', () => {
    const { result } = renderHook(() => useAnalytics())

    act(() => {
      result.current.trackTiming('render', 120)
    })

    const history = getEventHistory()
    expect(history).toHaveLength(1)
    expect(history[0].properties?.durationMs).toBe(120)
  })

  it('automatically tracks page view when path is provided', () => {
    const { rerender } = renderHook(
      ({ path, title }) => useAnalytics(path, title),
      { initialProps: { path: '/page-a', title: 'Page A' } },
    )

    // Initial render should track
    expect(getEventHistory()).toHaveLength(1)
    expect(getEventHistory()[0].properties?.path).toBe('/page-a')

    // Same path should not re-track
    rerender({ path: '/page-a', title: 'Page A' })
    expect(getEventHistory()).toHaveLength(1)

    // Different path should track
    rerender({ path: '/page-b', title: 'Page B' })
    expect(getEventHistory()).toHaveLength(2)
    expect(getEventHistory()[1].properties?.path).toBe('/page-b')
  })

  it('does not auto-track when path is undefined', () => {
    renderHook(() => useAnalytics())
    expect(getEventHistory()).toHaveLength(0)
  })
})
