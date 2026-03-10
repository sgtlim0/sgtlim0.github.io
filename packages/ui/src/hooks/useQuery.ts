'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryCache } from './QueryProvider'

/** Options for `useQuery`. */
export interface UseQueryOptions<T> {
  /** Time (ms) before cached data is considered stale. Default 5 min. */
  readonly staleTime?: number
  /** Time (ms) to keep an unused entry in memory. Default 30 min. */
  readonly cacheTime?: number
  /** Automatically refetch on this interval (ms). Disabled when 0/undefined. */
  readonly refetchInterval?: number
  /** When `false` the query will not execute automatically. Default `true`. */
  readonly enabled?: boolean
  /** Called after a successful fetch. */
  readonly onSuccess?: (data: T) => void
  /** Called when the fetch throws. */
  readonly onError?: (error: Error) => void
  /** Number of retry attempts on failure. Default 3. */
  readonly retry?: number
}

export interface UseQueryReturn<T> {
  readonly data: T | undefined
  readonly error: Error | null
  readonly isLoading: boolean
  readonly isStale: boolean
  readonly isFetching: boolean
  readonly refetch: () => Promise<void>
}

const DEFAULT_STALE_TIME = 5 * 60 * 1000
const DEFAULT_CACHE_TIME = 30 * 60 * 1000
const DEFAULT_RETRY = 3

/**
 * SWR-like data-fetching hook with in-memory cache.
 *
 * - Returns stale data immediately while revalidating in the background.
 * - Supports automatic refetch intervals, retry logic, and cache
 *   invalidation via QueryProvider.
 *
 * Must be used inside a `<QueryProvider>`.
 */
export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseQueryOptions<T> = {},
): UseQueryReturn<T> {
  const {
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
    refetchInterval,
    enabled = true,
    onSuccess,
    onError,
    retry = DEFAULT_RETRY,
  } = options

  const cache = useQueryCache()
  const mountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  // Seed state from cache
  const cached = cache.get<T>(key)
  const [data, setData] = useState<T | undefined>(cached?.data)
  const [error, setError] = useState<Error | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const isStale = (() => {
    if (!cached) return true
    return Date.now() - cached.timestamp > cached.staleTime
  })()

  const isLoading = data === undefined && isFetching

  // ---- core fetch with retry ----
  const executeFetch = useCallback(
    async (retryCount: number = 0): Promise<void> => {
      if (!mountedRef.current) return
      setIsFetching(true)
      setError(null)

      try {
        const result = await fetcherRef.current()
        if (!mountedRef.current) return

        cache.set(key, result, staleTime)
        setData(result)
        onSuccessRef.current?.(result)
      } catch (err) {
        if (!mountedRef.current) return
        if (retryCount < retry) {
          return executeFetch(retryCount + 1)
        }
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onErrorRef.current?.(error)
      } finally {
        if (mountedRef.current) {
          setIsFetching(false)
        }
      }
    },
    [cache, key, staleTime, retry],
  )

  // ---- initial + stale fetch ----
  useEffect(() => {
    mountedRef.current = true

    if (!enabled) return

    const entry = cache.get<T>(key)
    if (entry) {
      setData(entry.data)
      const stale = Date.now() - entry.timestamp > entry.staleTime
      if (stale) {
        executeFetch()
      }
    } else {
      executeFetch()
    }

    return () => {
      mountedRef.current = false
    }
  }, [key, enabled, executeFetch, cache])

  // ---- cache-time garbage collection ----
  useEffect(() => {
    if (cacheTime <= 0) return

    const timer = setTimeout(() => {
      const entry = cache.get<T>(key)
      if (entry && Date.now() - entry.timestamp > cacheTime) {
        cache.invalidate(key)
      }
    }, cacheTime)

    return () => clearTimeout(timer)
  }, [key, cacheTime, cache, data])

  // ---- refetchInterval ----
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const timer = setInterval(() => {
      executeFetch()
    }, refetchInterval)

    return () => clearInterval(timer)
  }, [refetchInterval, enabled, executeFetch])

  // ---- listen for external invalidations ----
  useEffect(() => {
    const unsub = cache.subscribe((invalidatedKey) => {
      if (invalidatedKey === key && enabled && mountedRef.current) {
        setData(undefined)
        executeFetch()
      }
    })
    return unsub
  }, [cache, key, enabled, executeFetch])

  const refetch = useCallback(() => executeFetch(), [executeFetch])

  return { data, error, isLoading, isStale, isFetching, refetch }
}
