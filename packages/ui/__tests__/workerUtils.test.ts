import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { supportsWorker, createWorkerClient, runWorkerTask } from '../src/utils/workerUtils'

describe('workerUtils', () => {
  describe('supportsWorker', () => {
    it('returns true when Worker is available', () => {
      // jsdom doesn't provide Worker, but we can mock it
      const original = globalThis.Worker
      globalThis.Worker = vi.fn() as unknown as typeof Worker
      expect(supportsWorker()).toBe(true)
      globalThis.Worker = original
    })

    it('returns false when Worker is undefined', () => {
      const original = globalThis.Worker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).Worker = undefined
      expect(supportsWorker()).toBe(false)
      globalThis.Worker = original
    })
  })

  describe('createWorkerClient — fallback path', () => {
    let originalWorker: typeof Worker

    beforeEach(() => {
      originalWorker = globalThis.Worker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).Worker = undefined
    })

    afterEach(() => {
      globalThis.Worker = originalWorker
    })

    it('throws if no fallback provided and Worker is unavailable', () => {
      expect(() => createWorkerClient('fake-url')).toThrow('폴백 함수가 제공되지 않았습니다')
    })

    it('uses fallback function when Worker is unavailable', async () => {
      const fallback = vi.fn().mockReturnValue({ result: 42 })
      const client = createWorkerClient('fake-url', undefined, fallback)

      const result = await client.postMessage({ input: 'test' })

      expect(fallback).toHaveBeenCalledWith({ input: 'test' })
      expect(result).toEqual({ result: 42 })
    })

    it('uses async fallback function', async () => {
      const fallback = vi.fn().mockResolvedValue({ result: 99 })
      const client = createWorkerClient('fake-url', undefined, fallback)

      const result = await client.postMessage({ input: 'async' })

      expect(result).toEqual({ result: 99 })
    })

    it('terminate is a no-op in fallback mode', () => {
      const client = createWorkerClient('fake-url', undefined, () => 'ok')
      // Should not throw
      client.terminate()
      client.terminate()
    })
  })

  describe('createWorkerClient — worker path', () => {
    let originalWorker: typeof Worker
    let mockWorkerInstance: {
      postMessage: ReturnType<typeof vi.fn>
      terminate: ReturnType<typeof vi.fn>
      addEventListener: ReturnType<typeof vi.fn>
      removeEventListener: ReturnType<typeof vi.fn>
      _listeners: Record<string, Array<(...args: unknown[]) => void>>
    }

    beforeEach(() => {
      originalWorker = globalThis.Worker
      mockWorkerInstance = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          if (!mockWorkerInstance._listeners[event]) {
            mockWorkerInstance._listeners[event] = []
          }
          mockWorkerInstance._listeners[event].push(handler)
        }),
        removeEventListener: vi.fn(),
        _listeners: {},
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      globalThis.Worker = function MockWorker() { return mockWorkerInstance } as any
    })

    afterEach(() => {
      globalThis.Worker = originalWorker
    })

    it('creates a Worker and sends messages', async () => {
      const client = createWorkerClient<{ cmd: string }, { ok: boolean }>('test-url', { type: 'module' })

      const promise = client.postMessage({ cmd: 'go' })

      // Simulate worker response
      expect(mockWorkerInstance.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      const messageHandler = mockWorkerInstance._listeners['message']?.[0]
      messageHandler?.({ data: { ok: true } })

      const result = await promise
      expect(result).toEqual({ ok: true })
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({ cmd: 'go' })
    })

    it('sends with transfer array when provided', async () => {
      const client = createWorkerClient<ArrayBuffer, { done: boolean }>('test-url')
      const buf = new ArrayBuffer(8)

      const promise = client.postMessage(buf, [buf])

      const messageHandler = mockWorkerInstance._listeners['message']?.[0]
      messageHandler?.({ data: { done: true } })

      await promise
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(buf, [buf])
    })

    it('rejects when worker emits error', async () => {
      const client = createWorkerClient<string, string>('test-url')

      const promise = client.postMessage('fail')

      const errorHandler = mockWorkerInstance._listeners['error']?.[0]
      errorHandler?.({ message: 'Worker crashed' })

      await expect(promise).rejects.toThrow('Worker crashed')
    })

    it('rejects with default message when error has no message', async () => {
      const client = createWorkerClient<string, string>('test-url')

      const promise = client.postMessage('fail')

      const errorHandler = mockWorkerInstance._listeners['error']?.[0]
      errorHandler?.({ message: '' })

      await expect(promise).rejects.toThrow('Worker에서 오류가 발생했습니다.')
    })

    it('terminate stops the worker', () => {
      const client = createWorkerClient<string, string>('test-url')
      client.terminate()
      expect(mockWorkerInstance.terminate).toHaveBeenCalledOnce()
    })

    it('rejects postMessage after terminate', async () => {
      const client = createWorkerClient<string, string>('test-url')
      client.terminate()

      await expect(client.postMessage('late')).rejects.toThrow('Worker가 이미 종료되었습니다.')
    })

    it('terminate is idempotent', () => {
      const client = createWorkerClient<string, string>('test-url')
      client.terminate()
      client.terminate()
      expect(mockWorkerInstance.terminate).toHaveBeenCalledOnce()
    })
  })

  describe('runWorkerTask', () => {
    let originalWorker: typeof Worker

    beforeEach(() => {
      originalWorker = globalThis.Worker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).Worker = undefined
    })

    afterEach(() => {
      globalThis.Worker = originalWorker
    })

    it('runs a one-shot task with fallback and terminates', async () => {
      const result = await runWorkerTask<string, number>(
        'fake-url',
        'hello',
        { fallback: (msg) => msg.length },
      )

      expect(result).toBe(5)
    })

    it('propagates errors from fallback', async () => {
      await expect(
        runWorkerTask<string, number>('fake-url', 'oops', {
          fallback: () => {
            throw new Error('boom')
          },
        }),
      ).rejects.toThrow('boom')
    })
  })
})
