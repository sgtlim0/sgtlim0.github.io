import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMonitoring } from '../src/hooks/useMonitoring'
import { useNetworkStatus } from '../src/hooks/useNetworkStatus'
import { usePWAInstall } from '../src/hooks/usePWAInstall'

// ---------------------------------------------------------------------------
// useMonitoring
// ---------------------------------------------------------------------------

describe('useMonitoring', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial state with isLoading true and data null', () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useMonitoring())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches monitoring data on mount and sets data on success', async () => {
    const mockData = {
      webVitals: { lcp: 1000, fid: 30, cls: 0.01, ttfb: 500, inp: 80 },
      errorRate: 0.5,
      uptime: 99.99,
      activeAlerts: 0,
    }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    const { result } = renderHook(() =>
      useMonitoring({ refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('falls back to mock data when response is not ok', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)

    const { result } = renderHook(() =>
      useMonitoring({ refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data!.webVitals.lcp).toBe(1850)
  })

  it('falls back to mock data and sets error on fetch failure', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() =>
      useMonitoring({ refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.error).toBe(
      'Monitoring endpoint unavailable — using mock data',
    )
  })

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useMonitoring({ enabled: false }),
    )

    // Give a tick for effect to run
    await new Promise((r) => setTimeout(r, 10))

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(result.current.data).toBeNull()
  })

  it('uses custom endpoint when provided', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          webVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0, inp: 0 },
          errorRate: 0,
          uptime: 100,
          activeAlerts: 0,
        }),
    } as Response)

    const { result } = renderHook(() =>
      useMonitoring({ endpoint: '/api/custom-health', refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/custom-health')
  })

  it('refresh triggers a new fetch', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          webVitals: { lcp: 100, fid: 10, cls: 0, ttfb: 100, inp: 50 },
          errorRate: 0,
          uptime: 100,
          activeAlerts: 0,
        }),
    } as Response)

    const { result } = renderHook(() =>
      useMonitoring({ refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.refresh()
    })

    await vi.waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('sets up interval based on refreshInterval', async () => {
    vi.useFakeTimers()

    let callCount = 0
    vi.mocked(globalThis.fetch).mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            webVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0, inp: 0 },
            errorRate: 0,
            uptime: 100,
            activeAlerts: 0,
          }),
      } as Response)
    })

    renderHook(() => useMonitoring({ refreshInterval: 5000 }))

    // Flush the initial fetch effect
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    const initialCalls = callCount

    // Advance by the interval
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(callCount).toBeGreaterThan(initialCalls)

    vi.useRealTimers()
  })

  it('does not set interval when refreshInterval is 0', async () => {
    vi.useFakeTimers()

    let callCount = 0
    vi.mocked(globalThis.fetch).mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            webVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0, inp: 0 },
            errorRate: 0,
            uptime: 100,
            activeAlerts: 0,
          }),
      } as Response)
    })

    renderHook(() => useMonitoring({ refreshInterval: 0 }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    const afterInitial = callCount

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000)
    })

    // No additional calls beyond initial
    expect(callCount).toBe(afterInitial)

    vi.useRealTimers()
  })

  it('cleans up interval on unmount', async () => {
    vi.useFakeTimers()

    let callCount = 0
    vi.mocked(globalThis.fetch).mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            webVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0, inp: 0 },
            errorRate: 0,
            uptime: 100,
            activeAlerts: 0,
          }),
      } as Response)
    })

    const { unmount } = renderHook(() =>
      useMonitoring({ refreshInterval: 1000 }),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    const afterInitial = callCount

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    // No more calls after unmount
    expect(callCount).toBe(afterInitial)

    vi.useRealTimers()
  })

  it('uses default options when no options provided', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          webVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0, inp: 0 },
          errorRate: 0,
          uptime: 100,
          activeAlerts: 0,
        }),
    } as Response)

    const { result } = renderHook(() =>
      useMonitoring({ refreshInterval: -1 }),
    )

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/health')
  })
})

// ---------------------------------------------------------------------------
// useNetworkStatus - additional edge cases
// ---------------------------------------------------------------------------

describe('useNetworkStatus - edge cases', () => {
  let originalOnLine: boolean

  beforeEach(() => {
    originalOnLine = navigator.onLine
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
  })

  it('detects initial offline state', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(false)
  })

  it('handles rapid online/offline toggling', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('offline'))
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(true)
  })

  it('stays online when only online events are fired', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// usePWAInstall - additional edge cases
// ---------------------------------------------------------------------------

describe('usePWAInstall - edge cases', () => {
  beforeEach(() => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('handles multiple beforeinstallprompt events (latest wins)', () => {
    const { result } = renderHook(() => usePWAInstall())

    const promptEvent1 = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent1, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    })

    const mockPrompt2 = vi.fn().mockResolvedValue(undefined)
    const promptEvent2 = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent2, {
      prompt: mockPrompt2,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent1)
    })
    expect(result.current.canInstall).toBe(true)

    act(() => {
      window.dispatchEvent(promptEvent2)
    })
    expect(result.current.canInstall).toBe(true)
  })

  it('canInstall is false when installed via appinstalled without prior prompt', () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.canInstall).toBe(false)
  })
})
