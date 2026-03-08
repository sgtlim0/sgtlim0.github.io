import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVirtualList } from '../src/hooks/useVirtualList'

// Mock requestAnimationFrame / cancelAnimationFrame
let rafCallback: FrameRequestCallback | null = null
const originalRAF = globalThis.requestAnimationFrame
const originalCAF = globalThis.cancelAnimationFrame

beforeEach(() => {
  rafCallback = null
  globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    rafCallback = cb
    return 1
  })
  globalThis.cancelAnimationFrame = vi.fn()
})

afterEach(() => {
  globalThis.requestAnimationFrame = originalRAF
  globalThis.cancelAnimationFrame = originalCAF
})

function flushRAF() {
  if (rafCallback) {
    rafCallback(performance.now())
    rafCallback = null
  }
}

describe('useVirtualList', () => {
  describe('fixed item height', () => {
    it('calculates visible items for initial scroll position', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
          overscan: 2,
        }),
      )

      // containerHeight=200, itemHeight=40 → 5 visible + 2 overscan after = 7 items
      // At scrollTop=0: visible 0..4, overscan extends to 6
      expect(result.current.virtualItems.length).toBe(7)
      expect(result.current.virtualItems[0].index).toBe(0)
      expect(result.current.virtualItems[6].index).toBe(6)
    })

    it('returns correct totalHeight', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      expect(result.current.totalHeight).toBe(4000)
    })

    it('computes correct start/end/size for each item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 10,
          itemHeight: 50,
          containerHeight: 200,
          overscan: 0,
        }),
      )

      const first = result.current.virtualItems[0]
      expect(first.index).toBe(0)
      expect(first.start).toBe(0)
      expect(first.size).toBe(50)
      expect(first.end).toBe(50)

      const second = result.current.virtualItems[1]
      expect(second.index).toBe(1)
      expect(second.start).toBe(50)
      expect(second.size).toBe(50)
      expect(second.end).toBe(100)
    })

    it('uses default overscan of 5', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      // 5 visible + 5 overscan after = 10
      expect(result.current.virtualItems.length).toBe(10)
    })
  })

  describe('variable item height', () => {
    it('handles dynamic height function', () => {
      const getHeight = (index: number) => (index % 2 === 0 ? 30 : 50)

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 20,
          itemHeight: getHeight,
          containerHeight: 200,
          overscan: 0,
        }),
      )

      // Item 0: height=30, start=0, end=30
      // Item 1: height=50, start=30, end=80
      // Item 2: height=30, start=80, end=110
      // Item 3: height=50, start=110, end=160
      // Item 4: height=30, start=160, end=190
      // Item 5: height=50, start=190, end=240 (exceeds 200, still partially visible)
      const items = result.current.virtualItems
      expect(items[0].start).toBe(0)
      expect(items[0].size).toBe(30)
      expect(items[1].start).toBe(30)
      expect(items[1].size).toBe(50)
    })

    it('computes correct totalHeight for variable heights', () => {
      const getHeight = (index: number) => (index % 2 === 0 ? 30 : 50)

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 4,
          itemHeight: getHeight,
          containerHeight: 500,
          overscan: 0,
        }),
      )

      // 30 + 50 + 30 + 50 = 160
      expect(result.current.totalHeight).toBe(160)
    })
  })

  describe('empty list', () => {
    it('returns empty virtualItems for zero itemCount', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 0,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      expect(result.current.virtualItems).toEqual([])
      expect(result.current.totalHeight).toBe(0)
    })
  })

  describe('overscan', () => {
    it('renders extra items before and after visible range', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 100,
          containerHeight: 200,
          overscan: 3,
        }),
      )

      // At scrollTop=0: visible 0..1, overscan before=0 (clamped), overscan after=3 → items 0..4
      expect(result.current.virtualItems.length).toBe(5)
      expect(result.current.virtualItems[0].index).toBe(0)
      expect(result.current.virtualItems[4].index).toBe(4)
    })

    it('clamps overscan at list boundaries', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 5,
          itemHeight: 100,
          containerHeight: 200,
          overscan: 10,
        }),
      )

      // All 5 items fit + overscan is clamped to actual count
      expect(result.current.virtualItems.length).toBe(5)
    })
  })

  describe('scrollTo', () => {
    it('provides a scrollTo function', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      expect(typeof result.current.scrollTo).toBe('function')
    })

    it('scrollTo sets scrollTop on the container', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      // Create a mock container element
      const mockContainer = {
        scrollTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }

      // Manually set the ref
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      act(() => {
        result.current.scrollTo(10)
      })

      // scrollTo(10) should set scrollTop to offset of item 10 = 10 * 40 = 400
      expect(mockContainer.scrollTop).toBe(400)
    })

    it('scrollTo(0) sets scrollTop to 0', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      const mockContainer = {
        scrollTop: 500,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }

      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      act(() => {
        result.current.scrollTo(0)
      })

      expect(mockContainer.scrollTop).toBe(0)
    })

    it('ignores scrollTo with out-of-range index', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 10,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      const mockContainer = {
        scrollTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }

      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      act(() => {
        result.current.scrollTo(-1)
      })
      expect(mockContainer.scrollTop).toBe(0)

      act(() => {
        result.current.scrollTo(100)
      })
      expect(mockContainer.scrollTop).toBe(0)
    })
  })

  describe('containerRef', () => {
    it('provides a ref object', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 10,
          itemHeight: 40,
          containerHeight: 200,
        }),
      )

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.containerRef.current).toBeNull()
    })
  })

  describe('recalculation on option changes', () => {
    it('recalculates when itemCount changes', () => {
      const { result, rerender } = renderHook(
        (props: { itemCount: number }) =>
          useVirtualList({
            itemCount: props.itemCount,
            itemHeight: 40,
            containerHeight: 200,
            overscan: 0,
          }),
        { initialProps: { itemCount: 100 } },
      )

      expect(result.current.totalHeight).toBe(4000)

      rerender({ itemCount: 50 })

      expect(result.current.totalHeight).toBe(2000)
    })

    it('recalculates when containerHeight changes', () => {
      const { result, rerender } = renderHook(
        (props: { containerHeight: number }) =>
          useVirtualList({
            itemCount: 100,
            itemHeight: 40,
            containerHeight: props.containerHeight,
            overscan: 0,
          }),
        { initialProps: { containerHeight: 200 } },
      )

      const countBefore = result.current.virtualItems.length

      rerender({ containerHeight: 400 })

      expect(result.current.virtualItems.length).toBeGreaterThan(countBefore)
    })
  })

  describe('small list (all items fit)', () => {
    it('renders all items when list is shorter than container', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 3,
          itemHeight: 40,
          containerHeight: 500,
          overscan: 0,
        }),
      )

      expect(result.current.virtualItems.length).toBe(3)
      expect(result.current.totalHeight).toBe(120)
    })
  })

  describe('single item', () => {
    it('handles single item list', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 1,
          itemHeight: 40,
          containerHeight: 200,
          overscan: 5,
        }),
      )

      expect(result.current.virtualItems.length).toBe(1)
      expect(result.current.virtualItems[0]).toEqual({
        index: 0,
        start: 0,
        size: 40,
        end: 40,
      })
    })
  })
})
