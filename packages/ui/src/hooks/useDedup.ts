'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createRequestDedup } from '../utils/requestDedup'
import type { DedupOptions, DedupStats } from '../utils/requestDedup'

export interface UseDedupReturn {
  /** Execute a deduplicated fetch. Shares in-flight promises for the same key. */
  readonly dedupFetch: <T>(key: string, fetcher: () => Promise<T>, options?: DedupOptions) => Promise<T>
  /** Cancel a pending request by key. */
  readonly cancel: (key: string) => void
  /** Cancel all pending requests. */
  readonly cancelAll: () => void
  /** List currently pending request keys. */
  readonly getPending: () => string[]
  /** Deduplication statistics. */
  readonly getStats: () => DedupStats
}

/**
 * React hook wrapper for request deduplication.
 *
 * Creates a `RequestDedup` instance scoped to the component lifecycle.
 * All pending requests are cancelled automatically on unmount.
 */
export function useDedup(): UseDedupReturn {
  const dedupRef = useRef(createRequestDedup())

  // Cancel all pending requests on unmount
  useEffect(() => {
    const dedup = dedupRef.current
    return () => {
      dedup.cancelAll()
    }
  }, [])

  const dedupFetch = useCallback(
    <T,>(key: string, fetcher: () => Promise<T>, options?: DedupOptions): Promise<T> => {
      return dedupRef.current.dedupFetch(key, fetcher, options)
    },
    [],
  )

  const cancel = useCallback((key: string): void => {
    dedupRef.current.cancel(key)
  }, [])

  const cancelAll = useCallback((): void => {
    dedupRef.current.cancelAll()
  }, [])

  const getPending = useCallback((): string[] => {
    return dedupRef.current.getPending()
  }, [])

  const getStats = useCallback((): DedupStats => {
    return dedupRef.current.getStats()
  }, [])

  return { dedupFetch, cancel, cancelAll, getPending, getStats }
}
