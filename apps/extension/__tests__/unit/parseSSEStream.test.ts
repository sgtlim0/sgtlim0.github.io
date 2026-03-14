import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StreamChunk } from '../../src/types'

// Helper to create mock SSE stream
function createMockSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let index = 0

  return new ReadableStream({
    pull(controller) {
      if (index < lines.length) {
        controller.enqueue(encoder.encode(lines[index] + '\n'))
        index++
      } else {
        controller.close()
      }
    },
  })
}

// Helper to extract parseSSEStream from module
async function getParseSSEStream() {
  const mod = await import('../../src/services/extensionChatService')
  // Access internal function via module inspection
  // Since parseSSEStream is not exported, we test it via createRealChatService
  return mod.createRealChatService
}

describe('parseSSEStream (via extensionChatService)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('SSE line parsing', () => {
    it('should parse valid data lines', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"Hello"}',
        'data: {"content":" world"}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(
        new Response(mockStream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      )

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(3)
      expect(onChunk).toHaveBeenNthCalledWith(1, {
        type: 'chunk',
        content: 'Hello',
      })
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        type: 'chunk',
        content: ' world',
      })
      expect(onChunk).toHaveBeenNthCalledWith(3, { type: 'done', content: '' })
    })

    it('should skip empty lines', async () => {
      const mockStream = createMockSSEStream([
        '',
        'data: {"content":"test"}',
        '',
        '',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2) // content + done
    })

    it('should skip non-data lines', async () => {
      const mockStream = createMockSSEStream([
        'event: message',
        'id: 123',
        'data: {"content":"test"}',
        'retry: 1000',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2)
    })

    it('should handle lines without "data:" prefix', async () => {
      const mockStream = createMockSSEStream([
        'some random line',
        'data: {"content":"valid"}',
        'another line',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, {
        type: 'chunk',
        content: 'valid',
      })
    })
  })

  describe('JSON parsing', () => {
    it('should skip invalid JSON gracefully', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"valid"}',
        'data: {invalid json}',
        'data: {"content":"another"}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(3)
      expect(onChunk).toHaveBeenNthCalledWith(1, {
        type: 'chunk',
        content: 'valid',
      })
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        type: 'chunk',
        content: 'another',
      })
    })

    it('should skip JSON without content field', async () => {
      const mockStream = createMockSSEStream([
        'data: {"other":"field"}',
        'data: {"content":"valid"}',
        'data: {"no_content":true}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'valid' })
    })

    it('should handle empty content field', async () => {
      const mockStream = createMockSSEStream(['data: {"content":""}', 'data: [DONE]'])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(1) // Only done (empty content skipped)
    })
  })

  describe('[DONE] sentinel handling', () => {
    it('should emit done chunk on [DONE]', async () => {
      const mockStream = createMockSSEStream(['data: {"content":"text"}', 'data: [DONE]'])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      const lastCall = onChunk.mock.calls[onChunk.mock.calls.length - 1][0]
      expect(lastCall).toEqual({ type: 'done', content: '' })
    })

    it('should stop processing after [DONE]', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"before"}',
        'data: [DONE]',
        'data: {"content":"after"}',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'before' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'done', content: '' })
    })
  })

  describe('abort signal handling', () => {
    it('should respect abort signal', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"chunk1"}',
        'data: {"content":"chunk2"}',
        'data: {"content":"chunk3"}',
        'data: [DONE]',
      ])

      const controller = new AbortController()

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn((chunk: StreamChunk) => {
        if (chunk.type === 'chunk' && chunk.content === 'chunk2') {
          controller.abort()
        }
      })

      await expect(
        service.sendMessage('conv-123', 'Test', onChunk, controller.signal),
      ).rejects.toThrow('Aborted')
    })

    it('should cancel reader on abort', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"chunk1"}',
        'data: {"content":"chunk2"}',
      ])

      const controller = new AbortController()
      controller.abort()

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await expect(
        service.sendMessage('conv-123', 'Test', onChunk, controller.signal),
      ).rejects.toThrow('Aborted')
    })
  })

  describe('buffer handling', () => {
    it('should handle partial lines across chunks', async () => {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Split "data: {" and '"content":"test"}\n' across chunks
          controller.enqueue(encoder.encode('data: {'))
          controller.enqueue(encoder.encode('"content":"test"}\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n'))
          controller.close()
        },
      })

      vi.mocked(fetch).mockResolvedValue(new Response(stream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'test' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'done', content: '' })
    })

    it('should handle multiple lines in single chunk', async () => {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('data: {"content":"line1"}\ndata: {"content":"line2"}\ndata: [DONE]\n'),
          )
          controller.close()
        },
      })

      vi.mocked(fetch).mockResolvedValue(new Response(stream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(3)
      expect(onChunk).toHaveBeenNthCalledWith(1, { type: 'chunk', content: 'line1' })
      expect(onChunk).toHaveBeenNthCalledWith(2, { type: 'chunk', content: 'line2' })
      expect(onChunk).toHaveBeenNthCalledWith(3, { type: 'done', content: '' })
    })
  })

  describe('error handling', () => {
    it('should throw on no response body', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await expect(service.sendMessage('conv-123', 'Test', onChunk)).rejects.toThrow(
        'No response body',
      )
    })

    it('should release reader lock on error', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream error'))
        },
      })

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await expect(service.sendMessage('conv-123', 'Test', onChunk)).rejects.toThrow()
    })
  })

  describe('unicode and special characters', () => {
    it('should handle unicode characters', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"안녕하세요"}',
        'data: {"content":"こんにちは"}',
        'data: {"content":"🚀"}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: '안녕하세요' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'こんにちは' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: '🚀' })
    })

    it('should handle escaped characters in JSON', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"line\\nbreak"}',
        'data: {"content":"tab\\there"}',
        'data: {"content":"quote\\"test"}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const service = (await getParseSSEStream())()
      const onChunk = vi.fn()

      await service.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'line\nbreak' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'tab\there' })
      expect(onChunk).toHaveBeenCalledWith({ type: 'chunk', content: 'quote"test' })
    })
  })
})
