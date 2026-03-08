/**
 * Extended SSE service tests covering parseSSELine, streamResponseReal,
 * createStreamResponse, and splitIntoChunks edge cases.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to access internal functions, so we test via the module
describe('sseService - extended coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Ensure mock mode by default
    vi.stubGlobal('process', {
      ...process,
      env: { ...process.env, NEXT_PUBLIC_API_MODE: undefined },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('createStreamResponse', () => {
    it('returns SSEStream with subscribe and abort in mock mode', async () => {
      const { createStreamResponse } = await import('../src/user/services/sseService')
      const stream = createStreamResponse('Hello', 'chat', [
        { role: 'user', content: 'Hi' },
      ])
      expect(stream).toHaveProperty('subscribe')
      expect(stream).toHaveProperty('abort')
    })

    it('delivers chunks via createStreamResponse in mock mode', async () => {
      const { createStreamResponse } = await import('../src/user/services/sseService')
      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const stream = createStreamResponse('Test', 'chat')
      stream.subscribe(onChunk, onDone, onError)
      vi.advanceTimersByTime(10000)

      expect(onChunk).toHaveBeenCalled()
      expect(onDone).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('streamResponse - real mode with fetch mock', () => {
    it('calls fetch with correct parameters in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      // Create a readable stream that sends data and closes
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"text":"Hello"}\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      })
      vi.stubGlobal('fetch', mockFetch)

      // Re-import to pick up new env
      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      // Let promises resolve
      await vi.advanceTimersByTimeAsync(100)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/stream'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          }),
        }),
      )
    })

    it('handles non-ok response in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('500'),
        }),
      )
    })

    it('handles response without body in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: null,
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ReadableStream'),
        }),
      )
    })

    it('abort prevents further processing in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"text":"chunk1"}\n\n'))
          // Intentionally not closing to simulate ongoing stream
        },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)
      sseStream.abort()

      await vi.advanceTimersByTimeAsync(100)

      // After abort, errors should be suppressed
      expect(onError).not.toHaveBeenCalled()
    })

    it('handles fetch rejection with non-Error in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const mockFetch = vi.fn().mockRejectedValue('string error')
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('알 수 없는 오류'),
        }),
      )
    })

    it('parses SSE lines that are not "data:" prefixed (skips them)', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('event: message\n'))
          controller.enqueue(encoder.encode('data: {"text":"actual"}\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const chunks: string[] = []
      const onChunk = (c: string) => chunks.push(c)
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      expect(chunks).toContain('actual')
      expect(onError).not.toHaveBeenCalled()
    })

    it('parses SSE line with non-JSON data as raw text', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: raw text here\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const chunks: string[] = []
      const onChunk = (c: string) => chunks.push(c)
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      expect(chunks).toContain('raw text here')
    })

    it('parses SSE JSON without text field and returns raw data', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"other":"value"}\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { streamResponse } = await import('../src/user/services/sseService')

      const chunks: string[] = []
      const onChunk = (c: string) => chunks.push(c)
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = streamResponse('Hello', 'chat')
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      // When text field is undefined, it falls back to raw data string
      expect(chunks.length).toBeGreaterThan(0)
    })
  })

  describe('createStreamResponse - real mode', () => {
    it('delegates to realStreamResponse in real mode', async () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, NEXT_PUBLIC_API_MODE: 'real' },
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Unavailable',
      })
      vi.stubGlobal('fetch', mockFetch)

      vi.resetModules()
      const { createStreamResponse } = await import('../src/user/services/sseService')

      const onChunk = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const sseStream = createStreamResponse('Hello', 'chat', [
        { role: 'user', content: 'hi' },
      ])
      sseStream.subscribe(onChunk, onDone, onError)

      await vi.advanceTimersByTimeAsync(100)

      // realStreamResponse was called (via fetch)
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
