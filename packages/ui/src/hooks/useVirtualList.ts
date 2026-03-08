'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import type { RefObject } from 'react'

export interface UseVirtualListOptions {
  /** Total number of items in the list */
  readonly itemCount: number
  /** Fixed height (number) or dynamic height function (index => number) */
  readonly itemHeight: number | ((index: number) => number)
  /** Extra items rendered outside visible area (default: 5) */
  readonly overscan?: number
  /** Height of the scrollable container in pixels */
  readonly containerHeight: number
}

export interface VirtualItem {
  /** Index of the item in the original list */
  readonly index: number
  /** Offset from top in pixels */
  readonly start: number
  /** Height of this item in pixels */
  readonly size: number
  /** Bottom edge position in pixels */
  readonly end: number
}

export interface UseVirtualListReturn {
  /** Items currently visible (plus overscan) */
  readonly virtualItems: readonly VirtualItem[]
  /** Total height of all items combined */
  readonly totalHeight: number
  /** Scroll to a specific item index */
  scrollTo: (index: number) => void
  /** Ref to attach to the scroll container */
  containerRef: RefObject<HTMLDivElement | null>
}

/**
 * Binary search to find the first item whose end > scrollTop.
 * Returns the index into the offsets array.
 */
function findStartIndex(offsets: readonly number[], scrollTop: number): number {
  let low = 0
  let high = offsets.length - 1

  while (low < high) {
    const mid = (low + high) >>> 1
    if (offsets[mid] <= scrollTop) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * Precompute cumulative end-offsets for all items.
 * offsets[i] = sum of heights for items 0..i (i.e. the bottom edge of item i).
 */
function buildOffsets(
  itemCount: number,
  itemHeight: number | ((index: number) => number),
): { offsets: number[]; totalHeight: number } {
  const offsets: number[] = new Array(itemCount)
  let cumulative = 0

  if (typeof itemHeight === 'number') {
    for (let i = 0; i < itemCount; i++) {
      cumulative += itemHeight
      offsets[i] = cumulative
    }
  } else {
    for (let i = 0; i < itemCount; i++) {
      cumulative += itemHeight(i)
      offsets[i] = cumulative
    }
  }

  return { offsets, totalHeight: cumulative }
}

/**
 * Hook for virtualizing large lists.
 *
 * Only renders items within the visible viewport (plus overscan),
 * enabling smooth 60fps scrolling with 1000+ items.
 * Supports both fixed and variable item heights.
 * Uses binary search for efficient visible-range computation.
 * SSR-safe: initial render includes only the overscan range from index 0.
 *
 * @example
 * ```tsx
 * const { virtualItems, totalHeight, containerRef, scrollTo } = useVirtualList({
 *   itemCount: 10000,
 *   itemHeight: 40,
 *   containerHeight: 500,
 *   overscan: 5,
 * })
 *
 * return (
 *   <div ref={containerRef} style={{ height: 500, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       {virtualItems.map(item => (
 *         <div
 *           key={item.index}
 *           style={{
 *             position: 'absolute',
 *             top: item.start,
 *             height: item.size,
 *             width: '100%',
 *           }}
 *         >
 *           Row {item.index}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * )
 * ```
 */
export function useVirtualList(options: UseVirtualListOptions): UseVirtualListReturn {
  const { itemCount, itemHeight, containerHeight, overscan = 5 } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const rafId = useRef<number>(0)

  // Precompute offsets (memoized on itemCount + itemHeight identity)
  const { offsets, totalHeight } = useMemo(
    () => buildOffsets(itemCount, itemHeight),
    [itemCount, itemHeight],
  )

  // Compute visible items with binary search
  const virtualItems: readonly VirtualItem[] = useMemo(() => {
    if (itemCount === 0) return []

    const startIdx = findStartIndex(offsets, scrollTop)
    const visibleStart = Math.max(0, startIdx - overscan)

    // Find end: first item whose start >= scrollTop + containerHeight
    const viewBottom = scrollTop + containerHeight
    let endIdx = startIdx
    while (endIdx < itemCount && (endIdx === 0 ? 0 : offsets[endIdx - 1]) < viewBottom) {
      endIdx++
    }
    const visibleEnd = Math.min(itemCount - 1, endIdx - 1 + overscan)

    const items: VirtualItem[] = []
    for (let i = visibleStart; i <= visibleEnd; i++) {
      const end = offsets[i]
      const size = typeof itemHeight === 'number' ? itemHeight : itemHeight(i)
      const start = end - size

      items.push({ index: i, start, size, end })
    }

    return items
  }, [itemCount, offsets, scrollTop, containerHeight, overscan, itemHeight])

  // RAF-throttled scroll handler
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }

      rafId.current = requestAnimationFrame(() => {
        setScrollTop(container.scrollTop)
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  // scrollTo API
  const scrollTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= itemCount) return

      const container = containerRef.current
      if (!container) return

      const targetTop = index === 0 ? 0 : offsets[index - 1]
      container.scrollTop = targetTop
      setScrollTop(targetTop)
    },
    [itemCount, offsets],
  )

  return {
    virtualItems,
    totalHeight,
    scrollTo,
    containerRef,
  }
}
