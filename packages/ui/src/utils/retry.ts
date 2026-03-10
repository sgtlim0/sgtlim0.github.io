/**
 * Retry utility with configurable backoff strategies
 *
 * Wraps an async function with automatic retry logic:
 *   - Linear or exponential backoff
 *   - Conditional retry via `retryOn` predicate
 *   - AbortController integration for cancellation
 *   - Callback on each retry attempt
 *
 * Designed to compose with the existing circuitBreaker utility.
 */

export interface RetryOptions {
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
  /** AbortSignal to cancel pending retries */
  signal?: AbortSignal
}

export class RetryAbortedError extends Error {
  constructor() {
    super('Retry aborted')
    this.name = 'RetryAbortedError'
  }
}

export class MaxRetriesExceededError extends Error {
  public readonly attempts: number
  public readonly lastError: Error

  constructor(attempts: number, lastError: Error) {
    super(`Max retries (${attempts}) exceeded: ${lastError.message}`)
    this.name = 'MaxRetriesExceededError'
    this.attempts = attempts
    this.lastError = lastError
  }
}

const DEFAULT_OPTIONS: Required<Pick<RetryOptions, 'maxRetries' | 'delay' | 'backoff'>> = {
  maxRetries: 3,
  delay: 1000,
  backoff: 'exponential',
}

function computeDelay(
  attempt: number,
  baseDelay: number,
  backoff: 'linear' | 'exponential',
): number {
  if (backoff === 'linear') {
    return baseDelay * attempt
  }
  return baseDelay * Math.pow(2, attempt - 1)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new RetryAbortedError())
      return
    }

    const timer = setTimeout(resolve, ms)

    if (signal) {
      const onAbort = () => {
        clearTimeout(timer)
        reject(new RetryAbortedError())
      }
      signal.addEventListener('abort', onAbort, { once: true })
      // Clean up listener when timer fires
      const originalResolve = resolve
      resolve = () => {
        signal.removeEventListener('abort', onAbort)
        originalResolve()
      }
    }
  })
}

/**
 * Execute an async function with automatic retries.
 *
 * ```ts
 * const data = await withRetry(() => fetch('/api/data'), {
 *   maxRetries: 3,
 *   backoff: 'exponential',
 *   retryOn: (err) => err.message.includes('network'),
 * })
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_OPTIONS.maxRetries
  const delay = options?.delay ?? DEFAULT_OPTIONS.delay
  const backoff = options?.backoff ?? DEFAULT_OPTIONS.backoff
  const { retryOn, onRetry, signal } = options ?? {}

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw new RetryAbortedError()
    }

    try {
      return await fn()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      lastError = err

      // If we've exhausted all retries, throw
      if (attempt >= maxRetries) {
        throw new MaxRetriesExceededError(maxRetries, err)
      }

      // Check if we should retry this specific error
      if (retryOn && !retryOn(err)) {
        throw err
      }

      onRetry?.(attempt + 1, err)

      const waitMs = computeDelay(attempt + 1, delay, backoff)
      await sleep(waitMs, signal)
    }
  }

  // Unreachable, but TypeScript needs this
  throw new MaxRetriesExceededError(maxRetries, lastError ?? new Error('Unknown error'))
}
