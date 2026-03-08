'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Result type for useAsyncData hook
 */
export interface AsyncDataResult<T> {
  readonly data: T | null
  readonly loading: boolean
  readonly error: Error | null
  readonly refetch: () => void
}

/**
 * Generic hook for async data fetching with loading/error/refetch support.
 *
 * Handles mounted-check to prevent state updates after unmount.
 * Provides a stable `refetch` callback for manual re-fetching.
 *
 * @param fetchFn - Async function that returns data
 * @param deps - Dependency array that triggers re-fetch when changed
 * @returns Object with data, loading, error, and refetch
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAsyncData(
 *   () => api.getUsers(),
 *   [page]
 * );
 * ```
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    execute()

    return () => {
      mountedRef.current = false
    }
  }, [execute])

  return { data, loading, error, refetch: execute }
}
