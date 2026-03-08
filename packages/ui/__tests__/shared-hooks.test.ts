import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetworkStatus } from '../src/hooks/useNetworkStatus'
import { usePWAInstall } from '../src/hooks/usePWAInstall'

describe('useNetworkStatus', () => {
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

  it('returns isOnline true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.isOnline).toBe(true)
  })

  it('returns wasOffline false initially', () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current.wasOffline).toBe(false)
  })

  it('updates isOnline to false on offline event', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('sets wasOffline to true after going offline', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.wasOffline).toBe(true)
  })

  it('updates isOnline back to true on online event', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOnline).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current.isOnline).toBe(true)
  })

  it('retains wasOffline true after reconnecting', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(true)
  })

  it('cleans up event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useNetworkStatus())

    const onlineCalls = addSpy.mock.calls.filter(([type]) => type === 'online')
    const offlineCalls = addSpy.mock.calls.filter(([type]) => type === 'offline')
    expect(onlineCalls.length).toBeGreaterThanOrEqual(1)
    expect(offlineCalls.length).toBeGreaterThanOrEqual(1)

    unmount()

    const removeOnlineCalls = removeSpy.mock.calls.filter(([type]) => type === 'online')
    const removeOfflineCalls = removeSpy.mock.calls.filter(([type]) => type === 'offline')
    expect(removeOnlineCalls.length).toBeGreaterThanOrEqual(1)
    expect(removeOfflineCalls.length).toBeGreaterThanOrEqual(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})

describe('usePWAInstall', () => {
  beforeEach(() => {
    // Reset matchMedia to non-standalone by default
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

  it('returns canInstall false initially (no prompt event)', () => {
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('returns canInstall false when in standalone mode', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('sets canInstall true when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => usePWAInstall())

    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    expect(result.current.canInstall).toBe(true)
  })

  it('install function calls prompt and resolves userChoice', async () => {
    const { result } = renderHook(() => usePWAInstall())

    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.install()
    })

    expect(mockPrompt).toHaveBeenCalledTimes(1)
    // After accepted, canInstall becomes false (prompt is set to null)
    expect(result.current.canInstall).toBe(false)
  })

  it('install does nothing when no prompt event stored', async () => {
    const { result } = renderHook(() => usePWAInstall())

    // install should be a no-op
    await act(async () => {
      await result.current.install()
    })

    expect(result.current.canInstall).toBe(false)
  })

  it('keeps canInstall true if user dismisses install prompt', async () => {
    const { result } = renderHook(() => usePWAInstall())

    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })

    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.install()
    })

    // After dismissed, prompt is NOT cleared, canInstall remains true
    expect(result.current.canInstall).toBe(true)
  })

  it('sets canInstall false on appinstalled event', () => {
    const { result } = renderHook(() => usePWAInstall())

    // First fire a beforeinstallprompt to set canInstall
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    Object.assign(promptEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })

    act(() => {
      window.dispatchEvent(promptEvent)
    })
    expect(result.current.canInstall).toBe(true)

    // Now fire appinstalled
    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.canInstall).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => usePWAInstall())

    const beforeInstallCalls = addSpy.mock.calls.filter(
      ([type]) => type === 'beforeinstallprompt',
    )
    const appInstalledCalls = addSpy.mock.calls.filter(([type]) => type === 'appinstalled')
    expect(beforeInstallCalls.length).toBeGreaterThanOrEqual(1)
    expect(appInstalledCalls.length).toBeGreaterThanOrEqual(1)

    unmount()

    const removeBeforeInstallCalls = removeSpy.mock.calls.filter(
      ([type]) => type === 'beforeinstallprompt',
    )
    const removeAppInstalledCalls = removeSpy.mock.calls.filter(
      ([type]) => type === 'appinstalled',
    )
    expect(removeBeforeInstallCalls.length).toBeGreaterThanOrEqual(1)
    expect(removeAppInstalledCalls.length).toBeGreaterThanOrEqual(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
