import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  withRetry,
  RetryAbortedError,
  MaxRetriesExceededError,
} from '../src/utils/retry'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ---------------------------------------------------------------------------
  // Successful execution
  // ---------------------------------------------------------------------------
  it('resolves immediately when the function succeeds on first try', async () => {
    const result = await withRetry(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('does not call onRetry when the first attempt succeeds', async () => {
    const onRetry = vi.fn()
    await withRetry(() => Promise.resolve('ok'), { onRetry })
    expect(onRetry).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // Retry logic
  // ---------------------------------------------------------------------------
  it('retries up to maxRetries times before throwing', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const promise = withRetry(fn, { maxRetries: 3, delay: 100 })
    // Attach handler early to prevent unhandled rejection warning
    const caught = promise.catch((e: unknown) => e)

    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(10_000)
    }

    const error = await caught
    expect(error).toBeInstanceOf(MaxRetriesExceededError)
    // 1 initial + 3 retries = 4 calls
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('returns the result when a retry succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success')

    const promise = withRetry(fn, { maxRetries: 3, delay: 100 })

    await vi.advanceTimersByTimeAsync(200)
    await vi.advanceTimersByTimeAsync(400)

    const result = await promise
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('calls onRetry with attempt number and error for each retry', async () => {
    const onRetry = vi.fn()
    const errors = [new Error('e1'), new Error('e2')]
    const fn = vi.fn()
      .mockRejectedValueOnce(errors[0])
      .mockRejectedValueOnce(errors[1])
      .mockResolvedValueOnce('done')

    const promise = withRetry(fn, { maxRetries: 3, delay: 50, onRetry })

    await vi.advanceTimersByTimeAsync(50)
    await vi.advanceTimersByTimeAsync(200)

    await promise
    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledWith(1, errors[0])
    expect(onRetry).toHaveBeenCalledWith(2, errors[1])
  })

  // ---------------------------------------------------------------------------
  // Backoff strategies
  // ---------------------------------------------------------------------------
  it('uses exponential backoff by default', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    const delay = 100

    const promise = withRetry(fn, { maxRetries: 3, delay })
    const caught = promise.catch((e: unknown) => e)

    // attempt 1 fails -> wait 100ms (100 * 2^0)
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // attempt 2 fails -> wait 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    // attempt 3 fails -> wait 400ms (100 * 2^2)
    await vi.advanceTimersByTimeAsync(400)
    expect(fn).toHaveBeenCalledTimes(4)

    const error = await caught
    expect(error).toBeInstanceOf(MaxRetriesExceededError)
  })

  it('uses linear backoff when specified', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    const delay = 100

    const promise = withRetry(fn, { maxRetries: 3, delay, backoff: 'linear' })
    const caught = promise.catch((e: unknown) => e)

    // attempt 1 fails -> wait 100ms (100 * 1)
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // attempt 2 fails -> wait 200ms (100 * 2)
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    // attempt 3 fails -> wait 300ms (100 * 3)
    await vi.advanceTimersByTimeAsync(300)
    expect(fn).toHaveBeenCalledTimes(4)

    const error = await caught
    expect(error).toBeInstanceOf(MaxRetriesExceededError)
  })

  // ---------------------------------------------------------------------------
  // Conditional retry (retryOn)
  // ---------------------------------------------------------------------------
  it('does not retry when retryOn returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('auth error'))

    await expect(
      withRetry(fn, {
        maxRetries: 3,
        delay: 100,
        retryOn: (err) => err.message.includes('network'),
      }),
    ).rejects.toThrow('auth error')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries when retryOn returns true', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce('recovered')

    const promise = withRetry(fn, {
      maxRetries: 3,
      delay: 50,
      retryOn: (err) => err.message.includes('network'),
    })

    await vi.advanceTimersByTimeAsync(50)

    const result = await promise
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  // ---------------------------------------------------------------------------
  // AbortController integration
  // ---------------------------------------------------------------------------
  it('throws RetryAbortedError when signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      withRetry(() => Promise.resolve('ok'), { signal: controller.signal }),
    ).rejects.toThrow(RetryAbortedError)
  })

  it('throws RetryAbortedError when aborted during a delay', async () => {
    const controller = new AbortController()
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const promise = withRetry(fn, {
      maxRetries: 5,
      delay: 1000,
      signal: controller.signal,
    })
    const caught = promise.catch((e: unknown) => e)

    // First attempt fails, starts waiting for delay
    await vi.advanceTimersByTimeAsync(500)
    controller.abort()

    const error = await caught
    expect(error).toBeInstanceOf(RetryAbortedError)
  })

  // ---------------------------------------------------------------------------
  // MaxRetriesExceededError
  // ---------------------------------------------------------------------------
  it('includes attempts and lastError in MaxRetriesExceededError', async () => {
    const originalError = new Error('persistent failure')
    const fn = vi.fn().mockRejectedValue(originalError)

    const promise = withRetry(fn, { maxRetries: 2, delay: 10 })
    const caught = promise.catch((e: unknown) => e)

    await vi.advanceTimersByTimeAsync(10)
    await vi.advanceTimersByTimeAsync(20)

    const error = await caught
    expect(error).toBeInstanceOf(MaxRetriesExceededError)
    const retryError = error as MaxRetriesExceededError
    expect(retryError.attempts).toBe(2)
    expect(retryError.lastError).toBe(originalError)
    expect(retryError.message).toContain('persistent failure')
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  it('handles non-Error thrown values by wrapping them', async () => {
    const fn = vi.fn().mockRejectedValue('string error')

    await expect(
      withRetry(fn, { maxRetries: 0 }),
    ).rejects.toThrow(MaxRetriesExceededError)
  })

  it('works with maxRetries=0 (no retries)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('immediate'))

    await expect(
      withRetry(fn, { maxRetries: 0 }),
    ).rejects.toThrow(MaxRetriesExceededError)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses default options when none are provided', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok')

    const promise = withRetry(fn)

    // Default exponential backoff: 1000ms for first retry
    await vi.advanceTimersByTimeAsync(1000)

    const result = await promise
    expect(result).toBe('ok')
  })
})

describe('RetryAbortedError', () => {
  it('has the correct name and message', () => {
    const error = new RetryAbortedError()
    expect(error.name).toBe('RetryAbortedError')
    expect(error.message).toBe('Retry aborted')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('MaxRetriesExceededError', () => {
  it('has the correct name, attempts, and lastError', () => {
    const cause = new Error('root cause')
    const error = new MaxRetriesExceededError(3, cause)
    expect(error.name).toBe('MaxRetriesExceededError')
    expect(error.attempts).toBe(3)
    expect(error.lastError).toBe(cause)
    expect(error.message).toContain('3')
    expect(error.message).toContain('root cause')
    expect(error).toBeInstanceOf(Error)
  })
})
