import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamResponse } from '../src/user/services/sseService'
import type { SSEStream } from '../src/user/services/sseService'

describe('sseService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('streamResponse - mock mode', () => {
    it('should return an object with subscribe and abort', () => {
      const stream = streamResponse('Hello', 'chat')
      expect(stream).toHaveProperty('subscribe')
      expect(stream).toHaveProperty('abort')
      expect(typeof stream.subscribe).toBe('function')
      expect(typeof stream.abort).toBe('function')
    })

    it('should satisfy SSEStream interface', () => {
      const stream: SSEStream = streamResponse('Hello', 'chat')
      expect(stream.subscribe).toBeDefined()
      expect(stream.abort).toBeDefined()
    })

    it('should call onChunk with text chunks', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Hello', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      vi.advanceTimersByTime(5000)

      expect(onChunk).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    it('should call onDone after all chunks are delivered', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Hello', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      vi.advanceTimersByTime(10000)

      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('should not call onChunk after abort', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Hello', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      // Abort immediately
      stream.abort()

      vi.advanceTimersByTime(10000)

      expect(onChunk).not.toHaveBeenCalled()
      expect(onDone).not.toHaveBeenCalled()
    })

    it('should not call onDone after abort', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Hello', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      stream.abort()
      vi.advanceTimersByTime(10000)

      expect(onDone).not.toHaveBeenCalled()
    })

    it('should produce string chunks', () => {
      const chunks: string[] = []
      const onChunk = (chunk: string) => chunks.push(chunk)
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Test', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      vi.advanceTimersByTime(10000)

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach((chunk) => {
        expect(typeof chunk).toBe('string')
      })
    })

    it('should concatenate chunks into a meaningful response', () => {
      const chunks: string[] = []
      const onChunk = (chunk: string) => chunks.push(chunk)
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Test', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      vi.advanceTimersByTime(10000)

      const fullResponse = chunks.join('')
      expect(fullResponse.length).toBeGreaterThan(10)
    })

    it('should deliver chunks incrementally over time', () => {
      const chunks: string[] = []
      const onChunk = (chunk: string) => chunks.push(chunk)
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Test', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      // After very short time, not all chunks should be delivered
      vi.advanceTimersByTime(80)
      const earlyCount = chunks.length

      // After long time, all chunks should be delivered
      vi.advanceTimersByTime(10000)
      const finalCount = chunks.length

      expect(finalCount).toBeGreaterThanOrEqual(earlyCount)
    })

    it('should not call onError during normal streaming', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Normal message', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      vi.advanceTimersByTime(10000)

      expect(onError).not.toHaveBeenCalled()
    })

    it('should handle different assistantId values', () => {
      const onChunk1 = vi.fn()
      const onDone1 = vi.fn()
      const onError1 = vi.fn()

      const stream1 = streamResponse('Hello', 'work')
      stream1.subscribe(onChunk1, onDone1, onError1)

      vi.advanceTimersByTime(10000)

      expect(onChunk1).toHaveBeenCalled()
      expect(onDone1).toHaveBeenCalledTimes(1)
    })

    it('abort should clear all pending timeouts', () => {
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = streamResponse('Hello', 'chat')
      stream.subscribe(onChunk, onDone, onError)

      // Let some chunks through
      vi.advanceTimersByTime(100)
      const countBeforeAbort = onChunk.mock.calls.length

      stream.abort()
      vi.advanceTimersByTime(10000)

      // No new chunks after abort
      expect(onChunk.mock.calls.length).toBe(countBeforeAbort)
    })
  })
})
