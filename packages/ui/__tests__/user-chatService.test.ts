import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getConversations,
  saveConversations,
  createConversation,
  addMessage,
  deleteConversation,
  searchConversations,
} from '../src/user/services/chatService'
import type { Conversation, ChatMessage } from '../src/user/services/types'

const mockConversation: Conversation = {
  id: 'conv_test_1',
  title: 'Test Chat',
  messages: [
    { id: 'msg1', role: 'user', content: 'Hello AI', timestamp: '2026-01-01T00:00:00Z' },
    { id: 'msg2', role: 'assistant', content: 'Hi there!', timestamp: '2026-01-01T00:00:01Z' },
  ],
  assistantId: 'assistant-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:01Z',
}

describe('chatService', () => {
  beforeEach(() => {
    vi.mocked(localStorage.clear)()
    vi.mocked(localStorage.getItem).mockReturnValue(null)
  })

  describe('getConversations', () => {
    it('returns empty array when no data', () => {
      const result = getConversations()
      expect(result).toEqual([])
    })

    it('returns stored conversations', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = getConversations()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('conv_test_1')
    })

    it('handles corrupted storage gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json{')
      const result = getConversations()
      expect(result).toEqual([])
    })
  })

  describe('saveConversations', () => {
    it('saves to localStorage', () => {
      saveConversations([mockConversation])
      expect(localStorage.setItem).toHaveBeenCalledWith('hchat-conversations', expect.any(String))
    })
  })

  describe('createConversation', () => {
    it('creates a new conversation', () => {
      const conv = createConversation('assistant-1', 'New Chat')
      expect(conv.title).toBe('New Chat')
      expect(conv.assistantId).toBe('assistant-1')
      expect(conv.messages).toEqual([])
      expect(conv.id).toMatch(/^conv_/)
    })

    it('saves to storage', () => {
      createConversation('assistant-1', 'Test')
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('addMessage', () => {
    it('adds message to conversation', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))

      const newMsg: ChatMessage = {
        id: 'msg3',
        role: 'user',
        content: 'How are you?',
        timestamp: '2026-01-01T00:01:00Z',
      }

      const result = addMessage('conv_test_1', newMsg)
      const updated = result.find((c) => c.id === 'conv_test_1')
      expect(updated!.messages).toHaveLength(3)
      expect(updated!.messages[2].content).toBe('How are you?')
    })

    it('does not mutate other conversations', () => {
      const other: Conversation = { ...mockConversation, id: 'conv_other', messages: [] }
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation, other]))

      const newMsg: ChatMessage = {
        id: 'msg3',
        role: 'user',
        content: 'Test',
        timestamp: '2026-01-01T00:01:00Z',
      }

      const result = addMessage('conv_test_1', newMsg)
      const otherConv = result.find((c) => c.id === 'conv_other')
      expect(otherConv!.messages).toHaveLength(0)
    })
  })

  describe('deleteConversation', () => {
    it('removes conversation by id', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))

      const result = deleteConversation('conv_test_1')
      expect(result).toHaveLength(0)
    })

    it('keeps other conversations', () => {
      const other: Conversation = { ...mockConversation, id: 'conv_other' }
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation, other]))

      const result = deleteConversation('conv_test_1')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('conv_other')
    })
  })

  describe('searchConversations', () => {
    it('returns all for empty query', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = searchConversations('')
      expect(result).toHaveLength(1)
    })

    it('matches by title', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = searchConversations('Test')
      expect(result).toHaveLength(1)
    })

    it('matches by message content', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = searchConversations('Hello AI')
      expect(result).toHaveLength(1)
    })

    it('case-insensitive', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = searchConversations('hello ai')
      expect(result).toHaveLength(1)
    })

    it('returns empty for no match', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([mockConversation]))
      const result = searchConversations('xyz123')
      expect(result).toEqual([])
    })
  })
})
