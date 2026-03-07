import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamResponse } from '../src/user/services/sseService'

describe('sseService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('streamResponse', () => {
    it('should return an object with subscribe and abort', () => {
      const stream = streamResponse('Hello', 'chat')
      expect(stream).toHaveProperty('subscribe')
      expect(stream).toHaveProperty('abort')
      expect(typeof stream.subscribe).toBe('function')
      expect(typeof stream.abort).toBe('function')
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

    it('should call onDone after all chunks', () => {
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
  })
})
