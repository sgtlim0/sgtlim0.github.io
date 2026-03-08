'use client'

import { useState, useCallback, useMemo } from 'react'

export interface UsePaginationOptions {
  /** Total number of items across all pages */
  readonly totalItems: number
  /** Number of items per page */
  readonly pageSize: number
  /** Initial page number (1-indexed, default: 1) */
  readonly initialPage?: number
  /** Number of page numbers to show on each side of current page (default: 1) */
  readonly siblingCount?: number
}

export interface UsePaginationReturn {
  /** Current page number (1-indexed) */
  readonly page: number
  /** Total number of pages */
  readonly totalPages: number
  /** Array of page numbers and ellipsis markers for rendering */
  readonly pageRange: readonly (number | 'ellipsis')[]
  /** Navigate to a specific page */
  setPage: (page: number) => void
  /** Navigate to the next page */
  nextPage: () => void
  /** Navigate to the previous page */
  prevPage: () => void
  /** Whether there is a next page */
  readonly canNext: boolean
  /** Whether there is a previous page */
  readonly canPrev: boolean
  /** Start index of items on the current page (0-based, inclusive) */
  readonly startIndex: number
  /** End index of items on the current page (0-based, exclusive) */
  readonly endIndex: number
}

/**
 * Build the page range array with ellipsis markers.
 *
 * Always shows first page, last page, and a window of siblingCount
 * pages around the current page.
 *
 * Example with siblingCount=1, totalPages=20, page=6:
 *   [1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]
 */
function buildPageRange(
  page: number,
  totalPages: number,
  siblingCount: number,
): readonly (number | 'ellipsis')[] {
  if (totalPages <= 0) return []

  // If total pages fit within the window, show all
  const totalSlots = siblingCount * 2 + 5 // first + last + current + 2*siblings + 2 ellipsis
  if (totalPages <= totalSlots) {
    const pages: number[] = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  const leftSiblingStart = Math.max(2, page - siblingCount)
  const rightSiblingEnd = Math.min(totalPages - 1, page + siblingCount)

  const showLeftEllipsis = leftSiblingStart > 2
  const showRightEllipsis = rightSiblingEnd < totalPages - 1

  const range: (number | 'ellipsis')[] = [1]

  if (showLeftEllipsis) {
    range.push('ellipsis')
  } else {
    // Fill pages between 1 and leftSiblingStart
    for (let i = 2; i < leftSiblingStart; i++) {
      range.push(i)
    }
  }

  for (let i = leftSiblingStart; i <= rightSiblingEnd; i++) {
    range.push(i)
  }

  if (showRightEllipsis) {
    range.push('ellipsis')
  } else {
    // Fill pages between rightSiblingEnd and totalPages
    for (let i = rightSiblingEnd + 1; i < totalPages; i++) {
      range.push(i)
    }
  }

  range.push(totalPages)

  return range
}

/**
 * Hook for managing pagination state with computed page ranges.
 *
 * Features:
 * - 1-indexed page numbers
 * - Ellipsis-aware page range computation
 * - Boundary-safe navigation (clamps to valid pages)
 * - Computed start/end indices for slicing data
 *
 * @example
 * ```tsx
 * const {
 *   page, totalPages, pageRange,
 *   setPage, nextPage, prevPage,
 *   canNext, canPrev,
 *   startIndex, endIndex,
 * } = usePagination({
 *   totalItems: 200,
 *   pageSize: 10,
 *   siblingCount: 1,
 * })
 *
 * const visibleItems = items.slice(startIndex, endIndex)
 * ```
 */
export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const {
    totalItems,
    pageSize,
    initialPage = 1,
    siblingCount = 1,
  } = options

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const [page, setPageState] = useState(() =>
    Math.min(Math.max(1, initialPage), totalPages),
  )

  // Clamp page if totalPages shrinks below current page
  const clampedPage = Math.min(page, totalPages)

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(Math.min(Math.max(1, newPage), totalPages))
    },
    [totalPages],
  )

  const nextPage = useCallback(() => {
    setPageState((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(prev - 1, 1))
  }, [])

  const canNext = clampedPage < totalPages
  const canPrev = clampedPage > 1

  const startIndex = (clampedPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const pageRange = useMemo(
    () => buildPageRange(clampedPage, totalPages, siblingCount),
    [clampedPage, totalPages, siblingCount],
  )

  return {
    page: clampedPage,
    totalPages,
    pageRange,
    setPage,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    startIndex,
    endIndex,
  }
}
