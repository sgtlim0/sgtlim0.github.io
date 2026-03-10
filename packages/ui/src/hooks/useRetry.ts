'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { withRetry, RetryAbortedError, type RetryOptions } from '../utils/retry'

export interface UseRetryOptions {
  /** Maximum number of retry attempts (default 3) */
  maxRetries?: number
  /** Base delay between retries in ms (default 1000) */
  delay?: number
  /** Backoff strategy (default 'exponential') */
  backoff?: 'linear' | 'exponential'
  /** Return true to retry on this error, false to fail immediately */
  retryOn?: (error: Error) => boolean
  /** Called before each retry attempt */
  onRetry?: (attempt: number, error: Error) => void
}

export interface UseRetryReturn<T> {
  /** Execute the retryable function */
  execute: () => Promise<T>
  /** Whether a retry is currently in progress */
  isRetrying: boolean
  /** Current attempt number (0 = not started, 1 = first try, etc.) */
  attempt: number
  /** The last error encountered, if any */
  lastError: Error | null
  /** Reset state back to initial */
  reset: () => void
}

/**
 * React hook for executing async functions with automatic retry logic.
 *
 * SSR-safe: No side effects on mount. AbortController auto-cancels on unmount.
 *
 * ```tsx
 * const { execute, isRetrying, attempt, lastError } = useRetry(
 *   () => fetchData(),
 *   { maxRetries: 3, backoff: 'exponential' }
 * )
 * ```
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options?: UseRetryOptions,
): UseRetryReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const fnRef = useRef(fn)
  const optionsRef = useRef(options)

  // Keep refs in sync without triggering re-renders
  fnRef.current = fn
  optionsRef.current = options

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const execute = useCallback(async (): Promise<T> => {
    // Abort any in-flight retry sequence
    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setIsRetrying(true)
    setAttempt(1)
    setLastError(null)

    const retryOptions: RetryOptions = {
      maxRetries: optionsRef.current?.maxRetries,
      delay: optionsRef.current?.delay,
      backoff: optionsRef.current?.backoff,
      retryOn: optionsRef.current?.retryOn,
      signal: controller.signal,
      onRetry: (retryAttempt, error) => {
        setAttempt(retryAttempt + 1)
        setLastError(error)
        optionsRef.current?.onRetry?.(retryAttempt, error)
      },
    }

    try {
      const result = await withRetry(() => fnRef.current(), retryOptions)
      setIsRetrying(false)
      return result
    } catch (error) {
      setIsRetrying(false)
      if (error instanceof RetryAbortedError) {
        throw error
      }
      const err = error instanceof Error ? error : new Error(String(error))
      setLastError(err)
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsRetrying(false)
    setAttempt(0)
    setLastError(null)
  }, [])

  return { execute, isRetrying, attempt, lastError, reset }
}
