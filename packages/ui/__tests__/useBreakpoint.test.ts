import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '../src/hooks/useMediaQuery'
import { useWindowSize } from '../src/hooks/useWindowSize'
import { useBreakpoint, BREAKPOINTS } from '../src/hooks/useBreakpoint'
import type { Breakpoint } from '../src/hooks/useBreakpoint'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setInnerWidth(w: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: w,
    writable: true,
    configurable: true,
  })
}

function setInnerHeight(h: number) {
  Object.defineProperty(window, 'innerHeight', {
    value: h,
    writable: true,
    configurable: true,
  })
}

// ---------------------------------------------------------------------------
// useMediaQuery
// ---------------------------------------------------------------------------

describe('useMediaQuery', () => {
  let listeners: Map<string, ((e: MediaQueryListEvent) => void)[]>
  let matchesMap: Map<string, boolean>

  beforeEach(() => {
    listeners = new Map()
    matchesMap = new Map()

    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => {
        if (!listeners.has(query)) {
          listeners.set(query, [])
        }
        return {
          matches: matchesMap.get(query) ?? false,
          media: query,
          addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
            listeners.get(query)!.push(cb)
          },
          removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
            const arr = listeners.get(query)!
            const idx = arr.indexOf(cb)
            if (idx >= 0) arr.splice(idx, 1)
          },
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when query does not match', () => {
    matchesMap.set('(min-width: 768px)', false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('returns true when query matches', () => {
    matchesMap.set('(min-width: 768px)', true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('updates when media query changes', () => {
    matchesMap.set('(min-width: 768px)', false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => {
      const cbs = listeners.get('(min-width: 768px)') ?? []
      for (const cb of cbs) {
        cb({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })

  it('cleans up listener on unmount', () => {
    matchesMap.set('(min-width: 768px)', false)
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(listeners.get('(min-width: 768px)')!.length).toBe(1)

    unmount()
    expect(listeners.get('(min-width: 768px)')!.length).toBe(0)
  })

  it('re-subscribes when query changes', () => {
    matchesMap.set('(min-width: 768px)', true)
    matchesMap.set('(min-width: 1024px)', false)

    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useMediaQuery(q),
      { initialProps: { q: '(min-width: 768px)' } },
    )
    expect(result.current).toBe(true)

    rerender({ q: '(min-width: 1024px)' })
    expect(result.current).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useWindowSize
// ---------------------------------------------------------------------------

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setInnerWidth(1024)
    setInnerHeight(768)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial window dimensions', () => {
    const { result } = renderHook(() => useWindowSize())
    expect(result.current).toEqual({ width: 1024, height: 768 })
  })

  it('updates after debounced resize', () => {
    const { result } = renderHook(() => useWindowSize())

    act(() => {
      setInnerWidth(800)
      setInnerHeight(600)
      window.dispatchEvent(new Event('resize'))
    })

    // Before debounce fires, still old value
    expect(result.current.width).toBe(1024)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toEqual({ width: 800, height: 600 })
  })

  it('debounces rapid resizes — only fires once', () => {
    const { result } = renderHook(() => useWindowSize())

    act(() => {
      setInnerWidth(500)
      window.dispatchEvent(new Event('resize'))
    })

    act(() => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      setInnerWidth(600)
      window.dispatchEvent(new Event('resize'))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.width).toBe(600)
  })

  it('cleans up on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useWindowSize())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// useBreakpoint
// ---------------------------------------------------------------------------

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setWidth(w: number) {
    setInnerWidth(w)
    setInnerHeight(768)
  }

  function renderAtWidth(w: number) {
    setWidth(w)
    return renderHook(() => useBreakpoint())
  }

  // --- breakpoint detection ---

  it.each<[number, Breakpoint]>([
    [320, 'xs'],
    [639, 'xs'],
    [640, 'sm'],
    [767, 'sm'],
    [768, 'md'],
    [1023, 'md'],
    [1024, 'lg'],
    [1279, 'lg'],
    [1280, 'xl'],
    [1535, 'xl'],
    [1536, '2xl'],
    [1920, '2xl'],
  ])('detects breakpoint at width %d → %s', (width, expected) => {
    const { result } = renderAtWidth(width)
    expect(result.current.breakpoint).toBe(expected)
  })

  // --- isMobile ---

  it('isMobile is true for xs', () => {
    const { result } = renderAtWidth(320)
    expect(result.current.isMobile).toBe(true)
  })

  it('isMobile is true for sm', () => {
    const { result } = renderAtWidth(640)
    expect(result.current.isMobile).toBe(true)
  })

  it('isMobile is false for md+', () => {
    const { result } = renderAtWidth(768)
    expect(result.current.isMobile).toBe(false)
  })

  // --- isTablet ---

  it('isTablet is true for md', () => {
    const { result } = renderAtWidth(768)
    expect(result.current.isTablet).toBe(true)
  })

  it('isTablet is false for lg', () => {
    const { result } = renderAtWidth(1024)
    expect(result.current.isTablet).toBe(false)
  })

  // --- isDesktop ---

  it('isDesktop is true for lg+', () => {
    const { result } = renderAtWidth(1024)
    expect(result.current.isDesktop).toBe(true)
  })

  it('isDesktop is false for md', () => {
    const { result } = renderAtWidth(768)
    expect(result.current.isDesktop).toBe(false)
  })

  // --- isAbove / isBelow ---

  it('isAbove returns true when width >= breakpoint', () => {
    const { result } = renderAtWidth(1024)
    expect(result.current.isAbove('lg')).toBe(true)
    expect(result.current.isAbove('xl')).toBe(false)
  })

  it('isBelow returns true when width < breakpoint', () => {
    const { result } = renderAtWidth(768)
    expect(result.current.isBelow('lg')).toBe(true)
    expect(result.current.isBelow('md')).toBe(false)
  })

  it('isAbove xs is always true', () => {
    const { result } = renderAtWidth(320)
    expect(result.current.isAbove('xs')).toBe(true)
  })

  it('isBelow xs is always false', () => {
    const { result } = renderAtWidth(320)
    expect(result.current.isBelow('xs')).toBe(false)
  })

  // --- width ---

  it('exposes the current width', () => {
    const { result } = renderAtWidth(1280)
    expect(result.current.width).toBe(1280)
  })

  // --- resize ---

  it('updates breakpoint on window resize', () => {
    const { result } = renderAtWidth(1024)
    expect(result.current.breakpoint).toBe('lg')

    act(() => {
      setInnerWidth(640)
      window.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(100)
    })

    expect(result.current.breakpoint).toBe('sm')
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
  })

  // --- BREAKPOINTS constant ---

  it('exports BREAKPOINTS synced with Tailwind', () => {
    expect(BREAKPOINTS).toEqual({
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    })
  })
})
