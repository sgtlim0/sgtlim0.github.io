import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { OfflineQueue, resetOfflineQueue } from '../src/utils/offlineQueue'
import type { QueuedRequest, DeadLetterItem } from '../src/utils/offlineQueue'
import { useOfflineQueue } from '../src/hooks/useOfflineQueue'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ---------------------------------------------------------------------------
// OfflineQueue service tests
// ---------------------------------------------------------------------------

describe('OfflineQueue service', () => {
  let originalOnLine: boolean

  beforeEach(() => {
    originalOnLine = navigator.onLine
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
    vi.restoreAllMocks()
    vi.useRealTimers()
    resetOfflineQueue()
  })

  // -- enqueue / remove / clear ---------------------------------------------

  it('enqueues a request and assigns an id', () => {
    const queue = new OfflineQueue({ persistKey: 'test:q' })
    const id = queue.enqueue({ url: '/api/foo', method: 'POST', maxRetries: 3 })

    expect(id).toBeTruthy()
    expect(queue.pendingCount).toBe(1)
    expect(queue.getQueue()[0]).toMatchObject({
      id,
      url: '/api/foo',
      method: 'POST',
      retryCount: 0,
    })
    queue.destroy()
  })

  it('enqueues multiple requests', () => {
    const queue = new OfflineQueue({ persistKey: 'test:q2' })
    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    queue.enqueue({ url: '/b', method: 'POST', body: { x: 1 }, maxRetries: 3 })
    queue.enqueue({ url: '/c', method: 'PUT', maxRetries: 3 })

    expect(queue.pendingCount).toBe(3)
    queue.destroy()
  })

  it('removes a specific request by id', () => {
    const queue = new OfflineQueue({ persistKey: 'test:q3' })
    const id1 = queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    queue.enqueue({ url: '/b', method: 'GET', maxRetries: 3 })

    queue.remove(id1)
    expect(queue.pendingCount).toBe(1)
    expect(queue.getQueue().find((r) => r.id === id1)).toBeUndefined()
    queue.destroy()
  })

  it('clears all queued requests', () => {
    const queue = new OfflineQueue({ persistKey: 'test:q4' })
    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    queue.enqueue({ url: '/b', method: 'GET', maxRetries: 3 })
    queue.clear()

    expect(queue.pendingCount).toBe(0)
    expect(queue.getQueue()).toHaveLength(0)
    queue.destroy()
  })

  // -- localStorage persistence ---------------------------------------------

  it('persists queue to localStorage', () => {
    const key = 'test:persist'
    const queue = new OfflineQueue({ persistKey: key })
    queue.enqueue({ url: '/api/data', method: 'POST', maxRetries: 3 })
    queue.destroy()

    const raw = localStorage.getItem(key)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as QueuedRequest[]
    expect(parsed).toHaveLength(1)
    expect(parsed[0].url).toBe('/api/data')
  })

  it('loads persisted queue on construction', () => {
    const key = 'test:load'
    const initial: QueuedRequest[] = [
      {
        id: 'abc',
        url: '/api/saved',
        method: 'GET',
        timestamp: Date.now(),
        retryCount: 1,
        maxRetries: 3,
      },
    ]
    localStorage.setItem(key, JSON.stringify(initial))

    const queue = new OfflineQueue({ persistKey: key })
    expect(queue.pendingCount).toBe(1)
    expect(queue.getQueue()[0].url).toBe('/api/saved')
    queue.destroy()
  })

  it('handles corrupted localStorage gracefully', () => {
    const key = 'test:corrupt'
    localStorage.setItem(key, 'not-valid-json{{')

    const queue = new OfflineQueue({ persistKey: key })
    expect(queue.pendingCount).toBe(0)
    queue.destroy()
  })

  // -- retry with exponential backoff ---------------------------------------

  it('retries a request with exponential backoff delay', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const queue = new OfflineQueue({ persistKey: 'test:retry', baseDelayMs: 100 })
    const id = queue.enqueue({ url: '/api/test', method: 'POST', body: { msg: 'hello' }, maxRetries: 3 })

    // retryCount=0 → delay = 100 * 2^0 = 100ms
    const retryPromise = queue.retry(id)

    // Advance past the backoff delay
    await vi.advanceTimersByTimeAsync(150)
    const result = await retryPromise

    expect(result).not.toBeNull()
    expect(result!.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: undefined,
      body: JSON.stringify({ msg: 'hello' }),
    })

    // Item should be removed from queue after success
    expect(queue.pendingCount).toBe(0)
    queue.destroy()
  })

  it('increments retryCount on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const queue = new OfflineQueue({ persistKey: 'test:inc', baseDelayMs: 50, maxRetries: 3 })
    const id = queue.enqueue({ url: '/api/fail', method: 'GET', maxRetries: 3 })

    const retryPromise = queue.retry(id)
    await vi.advanceTimersByTimeAsync(100)
    await retryPromise

    expect(queue.getQueue()[0].retryCount).toBe(1)
    queue.destroy()
  })

  it('moves to dead-letter queue after maxRetries exhausted', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fail'))
    const onDeadLetter = vi.fn()

    const queue = new OfflineQueue({
      persistKey: 'test:dlq',
      baseDelayMs: 10,
      maxRetries: 1,
      onDeadLetter,
    })

    // Set up a request that already has retryCount=0 and maxRetries=1
    const id = queue.enqueue({ url: '/dead', method: 'POST', maxRetries: 1 })

    const retryPromise = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await retryPromise

    // Should be removed from main queue
    expect(queue.pendingCount).toBe(0)

    // Should be in DLQ
    const dlq = queue.getDeadLetterQueue()
    expect(dlq).toHaveLength(1)
    expect(dlq[0].request.url).toBe('/dead')
    expect(dlq[0].lastError).toBe('fail')
    expect(onDeadLetter).toHaveBeenCalledOnce()
    queue.destroy()
  })

  it('persists dead-letter queue to localStorage', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('err'))
    const dlqKey = 'test:dlq-persist'
    const queue = new OfflineQueue({
      persistKey: 'test:dlqp',
      dlqKey,
      baseDelayMs: 10,
      maxRetries: 1,
    })

    const id = queue.enqueue({ url: '/x', method: 'GET', maxRetries: 1 })
    const retryPromise = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await retryPromise

    const raw = localStorage.getItem(dlqKey)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as DeadLetterItem[]
    expect(parsed).toHaveLength(1)
    queue.destroy()
  })

  it('exponential backoff increases delay with retryCount', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++
      throw new Error('fail')
    })

    const queue = new OfflineQueue({
      persistKey: 'test:backoff',
      baseDelayMs: 100,
      maxRetries: 4,
    })
    const id = queue.enqueue({ url: '/slow', method: 'GET', maxRetries: 4 })

    // First retry: delay = 100ms (100 * 2^0)
    const p1 = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    expect(callCount).toBe(0) // Not yet
    await vi.advanceTimersByTimeAsync(60)
    await p1
    expect(callCount).toBe(1)

    // Second retry: delay = 200ms (100 * 2^1)
    const p2 = queue.retry(id)
    await vi.advanceTimersByTimeAsync(150)
    expect(callCount).toBe(1) // Not yet
    await vi.advanceTimersByTimeAsync(100)
    await p2
    expect(callCount).toBe(2)

    queue.destroy()
  })

  // -- retryAll -------------------------------------------------------------

  it('retryAll processes all queued items', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const queue = new OfflineQueue({ persistKey: 'test:all', baseDelayMs: 10 })
    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    queue.enqueue({ url: '/b', method: 'POST', maxRetries: 3 })

    const retryPromise = queue.retryAll()
    await vi.advanceTimersByTimeAsync(100)
    await retryPromise

    expect(queue.pendingCount).toBe(0)
    queue.destroy()
  })

  it('retryAll prevents concurrent execution', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const queue = new OfflineQueue({ persistKey: 'test:conc', baseDelayMs: 10 })
    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })

    // Start two retryAll calls simultaneously
    const p1 = queue.retryAll()
    const p2 = queue.retryAll()

    await vi.advanceTimersByTimeAsync(100)
    await Promise.all([p1, p2])

    // fetch should only have been called once, not twice
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    queue.destroy()
  })

  // -- onRetrySuccess callback ----------------------------------------------

  it('calls onRetrySuccess after successful retry', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)
    const onSuccess = vi.fn()

    const queue = new OfflineQueue({
      persistKey: 'test:success-cb',
      baseDelayMs: 10,
      onRetrySuccess: onSuccess,
    })
    const id = queue.enqueue({ url: '/cb', method: 'GET', maxRetries: 3 })

    const retryPromise = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await retryPromise

    expect(onSuccess).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/cb' }),
      expect.any(Response),
    )
    queue.destroy()
  })

  // -- online event auto-retry ----------------------------------------------

  it('automatically retries on online event', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const queue = new OfflineQueue({ persistKey: 'test:auto', baseDelayMs: 10 })
    queue.enqueue({ url: '/auto', method: 'GET', maxRetries: 3 })

    // Simulate coming back online
    window.dispatchEvent(new Event('online'))
    await vi.advanceTimersByTimeAsync(100)
    await flushPromises()

    expect(queue.pendingCount).toBe(0)
    queue.destroy()
  })

  // -- subscribe / notify ---------------------------------------------------

  it('notifies subscribers on enqueue, remove, clear', () => {
    const queue = new OfflineQueue({ persistKey: 'test:sub' })
    const listener = vi.fn()
    queue.subscribe(listener)

    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    expect(listener).toHaveBeenCalledTimes(1)

    const id = queue.getQueue()[0].id
    queue.remove(id)
    expect(listener).toHaveBeenCalledTimes(2)

    queue.enqueue({ url: '/b', method: 'GET', maxRetries: 3 })
    queue.clear()
    expect(listener).toHaveBeenCalledTimes(4) // enqueue + clear

    queue.destroy()
  })

  it('unsubscribe removes listener', () => {
    const queue = new OfflineQueue({ persistKey: 'test:unsub' })
    const listener = vi.fn()
    const unsub = queue.subscribe(listener)

    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
    expect(listener).toHaveBeenCalledTimes(1)

    unsub()
    queue.enqueue({ url: '/b', method: 'GET', maxRetries: 3 })
    expect(listener).toHaveBeenCalledTimes(1) // No additional call

    queue.destroy()
  })

  // -- isOnline property ----------------------------------------------------

  it('returns isOnline based on navigator.onLine', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })

    const queue = new OfflineQueue({ persistKey: 'test:online' })
    expect(queue.isOnline).toBe(false)
    queue.destroy()
  })

  // -- clearDeadLetterQueue -------------------------------------------------

  it('clears the dead-letter queue', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fail'))

    const queue = new OfflineQueue({
      persistKey: 'test:cdlq',
      baseDelayMs: 10,
      maxRetries: 1,
    })
    const id = queue.enqueue({ url: '/x', method: 'GET', maxRetries: 1 })

    const p = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await p

    expect(queue.getDeadLetterQueue()).toHaveLength(1)

    queue.clearDeadLetterQueue()
    expect(queue.getDeadLetterQueue()).toHaveLength(0)
    queue.destroy()
  })

  // -- retry returns null for unknown id ------------------------------------

  it('retry returns null for non-existent id', async () => {
    const queue = new OfflineQueue({ persistKey: 'test:noid' })
    const result = await queue.retry('nonexistent')
    expect(result).toBeNull()
    queue.destroy()
  })

  // -- HTTP error (non-ok response) -----------------------------------------

  it('treats non-ok HTTP response as failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('error', { status: 500 }),
    )

    const queue = new OfflineQueue({
      persistKey: 'test:http-err',
      baseDelayMs: 10,
      maxRetries: 2,
    })
    const id = queue.enqueue({ url: '/err', method: 'GET', maxRetries: 2 })

    const p = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await p

    // Should still be in queue with incremented retryCount
    expect(queue.pendingCount).toBe(1)
    expect(queue.getQueue()[0].retryCount).toBe(1)
    queue.destroy()
  })

  // -- headers forwarding ---------------------------------------------------

  it('forwards custom headers in retry fetch call', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const queue = new OfflineQueue({ persistKey: 'test:headers', baseDelayMs: 10 })
    const id = queue.enqueue({
      url: '/api/with-headers',
      method: 'POST',
      headers: { Authorization: 'Bearer token123', 'Content-Type': 'application/json' },
      maxRetries: 3,
    })

    const p = queue.retry(id)
    await vi.advanceTimersByTimeAsync(50)
    await p

    expect(fetchSpy).toHaveBeenCalledWith('/api/with-headers', {
      method: 'POST',
      headers: { Authorization: 'Bearer token123', 'Content-Type': 'application/json' },
      body: undefined,
    })
    queue.destroy()
  })

  // -- default maxRetries from constructor ----------------------------------

  it('uses constructor maxRetries as default', () => {
    const queue = new OfflineQueue({ persistKey: 'test:default-max', maxRetries: 5 })
    queue.enqueue({ url: '/a', method: 'GET', maxRetries: 5 })

    expect(queue.getQueue()[0].maxRetries).toBe(5)
    queue.destroy()
  })
})

// ---------------------------------------------------------------------------
// useOfflineQueue hook tests
// ---------------------------------------------------------------------------

describe('useOfflineQueue hook', () => {
  let originalOnLine: boolean

  beforeEach(() => {
    originalOnLine = navigator.onLine
    localStorage.clear()
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
    resetOfflineQueue()
  })

  it('initializes with empty queue and online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() =>
      useOfflineQueue({ persistKey: 'test:hook1' }),
    )

    expect(result.current.queue).toHaveLength(0)
    expect(result.current.isOnline).toBe(true)
    expect(result.current.pendingCount).toBe(0)
  })

  it('enqueues a request and updates queue state', () => {
    const { result } = renderHook(() =>
      useOfflineQueue({ persistKey: 'test:hook2' }),
    )

    act(() => {
      result.current.enqueue({ url: '/api/test', method: 'POST', maxRetries: 3 })
    })

    expect(result.current.queue).toHaveLength(1)
    expect(result.current.pendingCount).toBe(1)
    expect(result.current.queue[0].url).toBe('/api/test')
  })

  it('removes a request from the queue', () => {
    const { result } = renderHook(() =>
      useOfflineQueue({ persistKey: 'test:hook3' }),
    )

    let id: string
    act(() => {
      id = result.current.enqueue({ url: '/api/x', method: 'GET', maxRetries: 3 })
    })

    act(() => {
      result.current.remove(id)
    })

    expect(result.current.queue).toHaveLength(0)
  })

  it('clears the queue', () => {
    const { result } = renderHook(() =>
      useOfflineQueue({ persistKey: 'test:hook4' }),
    )

    act(() => {
      result.current.enqueue({ url: '/a', method: 'GET', maxRetries: 3 })
      result.current.enqueue({ url: '/b', method: 'GET', maxRetries: 3 })
    })

    act(() => {
      result.current.clear()
    })

    expect(result.current.queue).toHaveLength(0)
    expect(result.current.pendingCount).toBe(0)
  })

  it('tracks offline status via window events', () => {
    const { result } = renderHook(() =>
      useOfflineQueue({ persistKey: 'test:hook5' }),
    )

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.isOnline).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.isOnline).toBe(true)
  })
})
