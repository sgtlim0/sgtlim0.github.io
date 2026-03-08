'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { RefObject } from 'react'

export interface UseInfiniteScrollOptions<T> {
  /** Async function that fetches a page of data */
  readonly fetchPage: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
  /** Starting page number (default: 1) */
  readonly initialPage?: number
  /** Distance in pixels from sentinel to trigger load (default: 200) */
  readonly threshold?: number
  /** Whether infinite scroll is active (default: true) */
  readonly enabled?: boolean
}

export interface UseInfiniteScrollReturn<T> {
  /** All accumulated items across pages */
  readonly items: readonly T[]
  /** True during initial page load */
  readonly isLoading: boolean
  /** True while loading subsequent pages */
  readonly isLoadingMore: boolean
  /** Last fetch error, if any */
  readonly error: Error | null
  /** Whether more pages are available */
  readonly hasMore: boolean
  /** Manually trigger loading the next page */
  loadMore: () => void
  /** Reset to initial state and refetch page 1 */
  reset: () => void
  /** Ref to attach to sentinel element at end of list */
  sentinelRef: RefObject<HTMLDivElement | null>
}

/**
 * Hook for infinite scroll with IntersectionObserver.
 *
 * Attaches an IntersectionObserver to a sentinel element placed at the
 * bottom of a list. When the sentinel enters the viewport (within
 * `threshold` pixels), the next page is fetched automatically.
 *
 * SSR-safe: skips IntersectionObserver when unavailable.
 * Prevents duplicate requests while a fetch is in progress.
 * Supports error recovery by re-calling `loadMore`.
 *
 * @example
 * ```tsx
 * const { items, isLoading, sentinelRef, hasMore } = useInfiniteScroll({
 *   fetchPage: async (page) => {
 *     const res = await fetch(`/api/items?page=${page}`)
 *     return res.json()
 *   },
 * })
 *
 * return (
 *   <div>
 *     {items.map(item => <div key={item.id}>{item.name}</div>)}
 *     <div ref={sentinelRef} />
 *   </div>
 * )
 * ```
 */
export function useInfiniteScroll<T>(
  options: UseInfiniteScrollOptions<T>,
): UseInfiniteScrollReturn<T> {
  const { fetchPage, initialPage = 1, threshold = 200, enabled = true } = options

  const [items, setItems] = useState<readonly T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const pageRef = useRef(initialPage)
  const loadingRef = useRef(false)
  const mountedRef = useRef(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const fetchNextPage = useCallback(
    async (page: number, isInitial: boolean) => {
      if (loadingRef.current) return
      loadingRef.current = true

      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      try {
        const result = await fetchPage(page)

        if (!mountedRef.current) return

        setItems((prev) => [...prev, ...result.data])
        setHasMore(result.hasMore)
        pageRef.current = page + 1
      } catch (err) {
        if (!mountedRef.current) return

        setError(err instanceof Error ? err : new Error('Failed to fetch page'))
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
        loadingRef.current = false
      }
    },
    [fetchPage],
  )

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true

    if (enabled) {
      fetchNextPage(initialPage, true)
    }

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, initialPage])

  // IntersectionObserver for sentinel
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    if (!enabled) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !loadingRef.current) {
          fetchNextPage(pageRef.current, false)
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, threshold, fetchNextPage])

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      fetchNextPage(pageRef.current, false)
    }
  }, [hasMore, fetchNextPage])

  const reset = useCallback(() => {
    loadingRef.current = false
    pageRef.current = initialPage
    setItems([])
    setError(null)
    setHasMore(true)
    setIsLoading(true)
    setIsLoadingMore(false)
    fetchNextPage(initialPage, true)
  }, [initialPage, fetchNextPage])

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    sentinelRef,
  }
}
