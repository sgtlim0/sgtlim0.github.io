import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Conversation } from '../../src/services/types'

// Mock storage
vi.mock('../../src/utils/storage', () => ({
  getSettings: vi.fn().mockResolvedValue({
    apiBaseUrl: 'http://localhost:3003',
    theme: 'light',
  }),
}))

describe('conversationCache (via extensionChatService)', () => {
  let chatService: ReturnType<
    typeof import('../../src/services/extensionChatService').createRealChatService
  >

  beforeEach(async () => {
    const mod = await import('../../src/services/extensionChatService')
    chatService = mod.createRealChatService()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('cache population', () => {
    it('should cache conversations from getConversations', async () => {
      const mockConversations: Conversation[] = [
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

      await chatService.getConversations()

      // Clear fetch mock to verify cache is used
      vi.mocked(fetch).mockClear()

      const cached = await chatService.getConversation('conv-1')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConversations[0])
    })

    it('should cache conversation from getConversation', async () => {
      const mockConv: Conversation = {
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

      await chatService.getConversation('conv-1')

      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-1')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConv)
    })

    it('should cache conversation from createConversation', async () => {
      const mockConv: Conversation = {
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

      await chatService.createConversation('New Chat')

      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-new')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConv)
    })
  })

  describe('cache invalidation', () => {
    it('should remove from cache on deleteConversation', async () => {
      const mockConv: Conversation = {
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
      expect(fetch).toHaveBeenCalledWith('http://localhost:3003/api/v1/conversations/conv-1', {
        method: 'GET',
      })
    })

    it('should not cache on 404 response', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

      const result1 = await chatService.getConversation('non-existent')
      expect(result1).toBeNull()

      // Second call should still fetch, not use cache
      const result2 = await chatService.getConversation('non-existent')
      expect(result2).toBeNull()

      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('cache consistency', () => {
    it('should return cached version when available', async () => {
      const mockConv: Conversation = {
        id: 'conv-1',
        title: 'Test Title',
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

      // Should return cached version without fetching
      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-1')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached?.title).toEqual('Test Title')
    })

    it('should handle multiple conversations in cache', async () => {
      const mockConvs: Conversation[] = [
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
        {
          id: 'conv-3',
          title: 'Chat 3',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversations: mockConvs }), {
          status: 200,
        }),
      )

      await chatService.getConversations()

      vi.mocked(fetch).mockClear()

      // All should be cached
      const cached1 = await chatService.getConversation('conv-1')
      const cached2 = await chatService.getConversation('conv-2')
      const cached3 = await chatService.getConversation('conv-3')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached1?.id).toEqual('conv-1')
      expect(cached2?.id).toEqual('conv-2')
      expect(cached3?.id).toEqual('conv-3')
    })

    it('should not affect cache on failed delete', async () => {
      const mockConv: Conversation = {
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

      // Failed delete
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

      await expect(chatService.deleteConversation('conv-1')).rejects.toThrow()

      // Cache should still have the conversation
      vi.mocked(fetch).mockClear()
      const cached = await chatService.getConversation('conv-1')

      expect(fetch).not.toHaveBeenCalled()
      expect(cached).toEqual(mockConv)
    })
  })

  describe('cache isolation', () => {
    it('should maintain separate cache per service instance', async () => {
      const mockConv: Conversation = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ conversations: [mockConv] }), {
          status: 200,
        }),
      )

      await chatService.getConversations()

      // Create second instance
      const mod2 = await import('../../src/services/extensionChatService')
      const chatService2 = mod2.createRealChatService()

      vi.mocked(fetch).mockClear()

      // Second instance should not have cached data - need to fetch
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ conversation: mockConv }), {
          status: 200,
        }),
      )
      await chatService2.getConversation('conv-1')

      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('cache with empty responses', () => {
    it('should handle empty conversations array', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ conversations: [] }), {
          status: 200,
        }),
      )

      const result = await chatService.getConversations()

      expect(result).toEqual([])

      // getConversation should still fetch from API
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))
      const conv = await chatService.getConversation('conv-1')

      expect(conv).toBeNull()
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle missing conversations key', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
        }),
      )

      const result = await chatService.getConversations()

      expect(result).toEqual([])
    })
  })
})
