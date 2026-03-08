import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransition } from '../src/hooks/useTransition'
import { useAnimatedList } from '../src/hooks/useAnimatedList'
import { getTransitionPreset } from '../src/Transition'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flushRAF() {
  // Flush double-rAF used by useTransition entering logic.
  vi.advanceTimersByTime(0)
  vi.advanceTimersByTime(0)
}

// ---------------------------------------------------------------------------
// useTransition
// ---------------------------------------------------------------------------

describe('useTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    // Default: no reduced motion.
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts in exited state when isVisible is false', () => {
    const { result } = renderHook(() => useTransition(false))
    expect(result.current.state).toBe('exited')
    expect(result.current.isMounted).toBe(false)
  })

  it('transitions to entering then entered when isVisible becomes true', async () => {
    // Use real timers for this test since rAF doesn't work well with fake timers.
    vi.useRealTimers()

    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 300 }),
      { initialProps: { show: false } },
    )

    expect(result.current.state).toBe('exited')

    // Show the element.
    rerender({ show: true })

    // Should be in entering state (before rAF fires).
    expect(result.current.state).toBe('entering')
    expect(result.current.isMounted).toBe(true)

    // Wait for double-rAF to transition to entered.
    await vi.waitFor(() => {
      expect(result.current.state).toBe('entered')
    })

    expect(result.current.isMounted).toBe(true)

    // Restore fake timers for remaining tests.
    vi.useFakeTimers()
  })

  it('transitions to exiting then exited when isVisible becomes false', () => {
    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 200 }),
      { initialProps: { show: true } },
    )

    // Let it reach entered.
    act(() => { flushRAF() })

    // Hide the element.
    rerender({ show: false })
    expect(result.current.state).toBe('exiting')
    expect(result.current.isMounted).toBe(true)

    // After duration, should be exited.
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.state).toBe('exited')
    expect(result.current.isMounted).toBe(false)
  })

  it('calls onEnter when entering', () => {
    const onEnter = vi.fn()
    const { rerender } = renderHook(
      ({ show }) => useTransition(show, { onEnter }),
      { initialProps: { show: false } },
    )

    expect(onEnter).not.toHaveBeenCalled()

    rerender({ show: true })
    expect(onEnter).toHaveBeenCalledOnce()
  })

  it('calls onExit when exit completes', () => {
    const onExit = vi.fn()
    const { rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 100, onExit }),
      { initialProps: { show: true } },
    )

    act(() => { flushRAF() })
    rerender({ show: false })

    // Not called yet (still exiting).
    expect(onExit).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('provides style with opacity and transition', () => {
    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 300 }),
      { initialProps: { show: false } },
    )

    // Exited style.
    expect(result.current.style.opacity).toBe(0)

    rerender({ show: true })
    act(() => { flushRAF() })

    // Entered style.
    expect(result.current.style.opacity).toBe(1)
    expect(result.current.style.transition).toContain('300ms')
  })

  it('uses 0ms duration when prefers-reduced-motion is active', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 500 }),
      { initialProps: { show: true } },
    )

    act(() => { flushRAF() })

    expect(result.current.style.transition).toContain('0ms')

    // Exit should complete instantly.
    rerender({ show: false })
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current.state).toBe('exited')
  })

  it('defaults duration to 300ms', () => {
    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show),
      { initialProps: { show: true } },
    )

    act(() => { flushRAF() })
    expect(result.current.style.transition).toContain('300ms')
  })

  it('stays exited when toggling from false to false', () => {
    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show),
      { initialProps: { show: false } },
    )

    rerender({ show: false })
    expect(result.current.state).toBe('exited')
    expect(result.current.isMounted).toBe(false)
  })

  it('handles rapid toggle (show -> hide before entering completes)', () => {
    const { result, rerender } = renderHook(
      ({ show }) => useTransition(show, { duration: 200 }),
      { initialProps: { show: false } },
    )

    // Show.
    rerender({ show: true })
    // Hide immediately before rAF fires.
    rerender({ show: false })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.state).toBe('exited')
    expect(result.current.isMounted).toBe(false)
  })

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { rerender, unmount } = renderHook(
      ({ show }) => useTransition(show, { duration: 300 }),
      { initialProps: { show: true } },
    )

    act(() => { flushRAF() })
    rerender({ show: false })

    // Unmount while exiting.
    unmount()
    // clearTimeout should be called during cleanup.
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// useAnimatedList
// ---------------------------------------------------------------------------

describe('useAnimatedList', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts with an empty items array', () => {
    const { result } = renderHook(() => useAnimatedList<string>())
    expect(result.current.items).toEqual([])
  })

  it('adds an item in entering state then transitions to entered', () => {
    const { result } = renderHook(() => useAnimatedList<string>())

    act(() => {
      result.current.add('a', 'Item A')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].key).toBe('a')
    expect(result.current.items[0].item).toBe('Item A')
    expect(result.current.items[0].state).toBe('entering')

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(result.current.items[0].state).toBe('entered')
  })

  it('removes an item with exiting transition', () => {
    const { result } = renderHook(() => useAnimatedList<string>({ duration: 200 }))

    act(() => {
      result.current.add('a', 'Item A')
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.remove('a')
    })

    expect(result.current.items[0].state).toBe('exiting')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('prevents duplicate keys on add', () => {
    const { result } = renderHook(() => useAnimatedList<string>())

    act(() => {
      result.current.add('a', 'Item A')
      result.current.add('a', 'Item A duplicate')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].item).toBe('Item A')
  })

  it('set replaces all items with stagger delay', () => {
    const { result } = renderHook(() =>
      useAnimatedList<string>({ staggerDelay: 100 }),
    )

    act(() => {
      result.current.set([
        { key: 'a', item: 'A' },
        { key: 'b', item: 'B' },
        { key: 'c', item: 'C' },
      ])
    })

    expect(result.current.items).toHaveLength(3)
    expect(result.current.items.every((i) => i.state === 'entering')).toBe(true)

    // First item enters after 32ms (base delay).
    act(() => {
      vi.advanceTimersByTime(32)
    })
    expect(result.current.items[0].state).toBe('entered')
    expect(result.current.items[1].state).toBe('entering')

    // Second item enters at 100 + 32 = 132ms.
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.items[1].state).toBe('entered')
    expect(result.current.items[2].state).toBe('entering')

    // Third item enters at 200 + 32 = 232ms.
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.items[2].state).toBe('entered')
  })

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { result, unmount } = renderHook(() =>
      useAnimatedList<string>({ duration: 300 }),
    )

    act(() => {
      result.current.add('a', 'A')
    })

    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// getTransitionPreset
// ---------------------------------------------------------------------------

describe('getTransitionPreset', () => {
  it('returns fade preset with correct styles', () => {
    const preset = getTransitionPreset('fade', 300)
    expect(preset.visible.opacity).toBe(1)
    expect(preset.hidden.opacity).toBe(0)
    expect(preset.visible.transform).toBe('none')
    expect(preset.hidden.transform).toBe('none')
    expect(preset.transition).toContain('300ms')
  })

  it('returns slideUp preset with translateY', () => {
    const preset = getTransitionPreset('slideUp', 200)
    expect(preset.visible.transform).toBe('translateY(0)')
    expect(preset.hidden.transform).toBe('translateY(16px)')
    expect(preset.transition).toContain('200ms')
  })

  it('returns slideDown preset with negative translateY', () => {
    const preset = getTransitionPreset('slideDown')
    expect(preset.hidden.transform).toBe('translateY(-16px)')
  })

  it('returns scale preset with scale transform', () => {
    const preset = getTransitionPreset('scale')
    expect(preset.visible.transform).toBe('scale(1)')
    expect(preset.hidden.transform).toBe('scale(0.9)')
  })

  it('defaults duration to 300ms', () => {
    const preset = getTransitionPreset('fade')
    expect(preset.transition).toContain('300ms')
  })
})
