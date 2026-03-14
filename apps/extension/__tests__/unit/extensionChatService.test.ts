import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRealChatService } from '../../src/services/extensionChatService'
import type { StreamChunk } from '../../src/types/context'

// Mock storage module
vi.mock('../../src/utils/storage', () => ({
  getSettings: vi.fn().mockResolvedValue({
    apiBaseUrl: 'http://localhost:3003',
    theme: 'light',
  }),
}))

describe('extensionChatService', () => {
  let chatService: ReturnType<typeof createRealChatService>

  beforeEach(() => {
    chatService = createRealChatService()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('SSE streaming', () => {
    it('should parse SSE data lines correctly', async () => {
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

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Test message', onChunk)

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

    it('should skip empty lines in SSE stream', async () => {
      const mockStream = createMockSSEStream([
        '',
        'data: {"content":"test"}',
        '',
        '',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Test', onChunk)

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

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Test', onChunk)

      expect(onChunk).toHaveBeenCalledTimes(2)
    })

    it('should handle invalid JSON gracefully', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"valid"}',
        'data: {invalid json}',
        'data: {"content":"another"}',
        'data: [DONE]',
      ])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Test', onChunk)

      // Should skip invalid JSON line
      expect(onChunk).toHaveBeenCalledTimes(3)
      expect(onChunk).toHaveBeenNthCalledWith(1, {
        type: 'chunk',
        content: 'valid',
      })
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        type: 'chunk',
        content: 'another',
      })
      expect(onChunk).toHaveBeenNthCalledWith(3, { type: 'done', content: '' })
    })

    it('should handle [DONE] sentinel', async () => {
      const mockStream = createMockSSEStream(['data: {"content":"text"}', 'data: [DONE]'])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Test', onChunk)

      const lastCall = onChunk.mock.calls[onChunk.mock.calls.length - 1][0]
      expect(lastCall).toEqual({ type: 'done', content: '' })
    })

    it('should respect abort signal', async () => {
      const mockStream = createMockSSEStream([
        'data: {"content":"chunk1"}',
        'data: {"content":"chunk2"}',
        'data: {"content":"chunk3"}',
        'data: [DONE]',
      ])

      const controller = new AbortController()

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const onChunk = vi.fn((chunk: StreamChunk) => {
        if (chunk.type === 'chunk' && chunk.content === 'chunk2') {
          controller.abort()
        }
      })

      await expect(
        chatService.sendMessage('conv-123', 'Test', onChunk, controller.signal),
      ).rejects.toThrow('Aborted')
    })
  })

  describe('sendMessage', () => {
    it('should send POST request to correct endpoint', async () => {
      const mockStream = createMockSSEStream(['data: [DONE]'])

      vi.mocked(fetch).mockResolvedValue(new Response(mockStream, { status: 200 }))

      const onChunk = vi.fn()
      await chatService.sendMessage('conv-123', 'Hello AI', onChunk)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/v1/chat/stream',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: 'conv-123',
            message: 'Hello AI',
          }),
        }),
      )
    })

    it('should throw on HTTP error', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response('Internal Server Error', { status: 500 }))

      const onChunk = vi.fn()
      await expect(chatService.sendMessage('conv-123', 'Test', onChunk)).rejects.toThrow(
        /Internal Server Error|Chat request failed/,
      )
    })

    it('should throw if no response body', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

      const onChunk = vi.fn()
      await expect(chatService.sendMessage('conv-123', 'Test', onChunk)).rejects.toThrow(
        'No response body',
      )
    })
  })

  describe('getConversations', () => {
    it('should fetch conversations from API', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'conv-2',
          title: 'Chat 2',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversations: mockConversations }), {
          status: 200,
        }),
      )

      const result = await chatService.getConversations()

      expect(fetch).toHaveBeenCalledWith('http://localhost:3003/api/v1/conversations', {
        method: 'GET',
      })
      expect(result).toEqual(mockConversations)
    })

    it('should throw on fetch error', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

      await expect(chatService.getConversations()).rejects.toThrow(/Failed to fetch conversations/)
    })

    it('should cache conversations', async () => {
      const mockConv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversations: [mockConv] }), {
          status: 200,
        }),
      )

      await chatService.getConversations()

      // Subsequent getConversation should use cache
      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-1')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConv)
    })
  })

  describe('getConversation', () => {
    it('should return null for 404', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

      const result = await chatService.getConversation('non-existent')
      expect(result).toBeNull()
    })

    it('should fetch conversation by id', async () => {
      const mockConv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversation: mockConv }), {
          status: 200,
        }),
      )

      const result = await chatService.getConversation('conv-1')

      expect(fetch).toHaveBeenCalledWith('http://localhost:3003/api/v1/conversations/conv-1', {
        method: 'GET',
      })
      expect(result).toEqual(mockConv)
    })

    it('should throw on non-404 error', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

      await expect(chatService.getConversation('conv-1')).rejects.toThrow(
        /Failed to fetch conversation/,
      )
    })
  })

  describe('createConversation', () => {
    it('should POST to create endpoint', async () => {
      const mockConv = {
        id: 'conv-new',
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversation: mockConv }), {
          status: 200,
        }),
      )

      const result = await chatService.createConversation('New Chat')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3003/api/v1/conversations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' }),
        }),
      )
      expect(result).toEqual(mockConv)
    })

    it('should cache created conversation', async () => {
      const mockConv = {
        id: 'conv-new',
        title: 'Test',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversation: mockConv }), {
          status: 200,
        }),
      )

      await chatService.createConversation('Test')

      // Should use cache
      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-new')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConv)
    })
  })

  describe('deleteConversation', () => {
    it('should DELETE conversation', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

      await chatService.deleteConversation('conv-123')

      expect(fetch).toHaveBeenCalledWith('http://localhost:3003/api/v1/conversations/conv-123', {
        method: 'DELETE',
      })
    })

    it('should remove from cache', async () => {
      const mockConv = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Populate cache
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversations: [mockConv] }), {
          status: 200,
        }),
      )
      await chatService.getConversations()

      // Delete
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      await chatService.deleteConversation('conv-1')

      // Should fetch from API, not cache
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))
      const result = await chatService.getConversation('conv-1')

      expect(result).toBeNull()
    })
  })
})

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
