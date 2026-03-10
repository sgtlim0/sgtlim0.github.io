'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { OfflineQueue } from '../utils/offlineQueue'
import type { QueuedRequest, OfflineQueueOptions } from '../utils/offlineQueue'

export interface UseOfflineQueueOptions {
  /** Maximum retry attempts per request (default 3). */
  readonly maxRetries?: number
  /** Base delay in ms for exponential backoff (default 1000). */
  readonly baseDelayMs?: number
  /** localStorage key for the queue. */
  readonly persistKey?: string
}

export interface UseOfflineQueueReturn {
  readonly queue: readonly QueuedRequest[]
  readonly enqueue: (
    request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>,
  ) => string
  readonly remove: (id: string) => void
  readonly clear: () => void
  readonly retry: (id: string) => Promise<Response | null>
  readonly retryAll: () => Promise<void>
  readonly isOnline: boolean
  readonly pendingCount: number
}

/**
 * React hook for managing an offline request queue.
 *
 * - Persists queued requests to localStorage
 * - Automatically retries when `online` event fires
 * - Exponential backoff (1s, 2s, 4s ...)
 * - Dead-letter queue for exhausted retries
 * - SSR-safe
 */
export function useOfflineQueue(
  options: UseOfflineQueueOptions = {},
): UseOfflineQueueReturn {
  const { maxRetries, baseDelayMs, persistKey } = options

  const queueRef = useRef<OfflineQueue | null>(null)

  // Lazy-init the OfflineQueue instance (SSR-safe)
  if (queueRef.current === null && typeof window !== 'undefined') {
    const opts: OfflineQueueOptions = {}
    if (maxRetries !== undefined) (opts as Record<string, unknown>).maxRetries = maxRetries
    if (baseDelayMs !== undefined) (opts as Record<string, unknown>).baseDelayMs = baseDelayMs
    if (persistKey !== undefined) (opts as Record<string, unknown>).persistKey = persistKey
    queueRef.current = new OfflineQueue(opts)
  }

  const [queue, setQueue] = useState<readonly QueuedRequest[]>(
    () => queueRef.current?.getQueue() ?? [],
  )
  const [isOnline, setIsOnline] = useState(true)

  // Subscribe to queue changes
  useEffect(() => {
    const instance = queueRef.current
    if (!instance) return

    const unsubscribe = instance.subscribe(() => {
      setQueue(instance.getQueue())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Track online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      queueRef.current?.destroy()
      queueRef.current = null
    }
  }, [])

  const enqueue = useCallback(
    (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): string => {
      if (!queueRef.current) return ''
      return queueRef.current.enqueue(request)
    },
    [],
  )

  const remove = useCallback((id: string) => {
    queueRef.current?.remove(id)
  }, [])

  const clear = useCallback(() => {
    queueRef.current?.clear()
  }, [])

  const retry = useCallback(async (id: string): Promise<Response | null> => {
    if (!queueRef.current) return null
    return queueRef.current.retry(id)
  }, [])

  const retryAll = useCallback(async (): Promise<void> => {
    if (!queueRef.current) return
    await queueRef.current.retryAll()
  }, [])

  return {
    queue,
    enqueue,
    remove,
    clear,
    retry,
    retryAll,
    isOnline,
    pendingCount: queue.length,
  }
}
