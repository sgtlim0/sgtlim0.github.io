import { describe, it, expect, beforeEach } from 'vitest'
import {
  getConversations,
  createConversation,
  deleteConversation,
  addMessage,
  searchConversations,
} from '../src/user/services/chatService'
import type { ChatMessage } from '../src/user/services/types'

const makeMsg = (content: string, role: 'user' | 'assistant' = 'user'): ChatMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  role,
  content,
  timestamp: Date.now(),
})

describe('chatService extended', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should create conversation with assistantId and title', () => {
    const conv = createConversation('chat', '테스트 대화')
    expect(conv.title).toBe('테스트 대화')
    expect(conv.assistantId).toBe('chat')
    expect(conv.messages).toEqual([])
  })

  it('should create multiple conversations', () => {
    createConversation('chat', '대화 1')
    createConversation('translate', '대화 2')
    const conversations = getConversations()
    expect(conversations.length).toBe(2)
  })

  it('should delete a conversation', () => {
    const conv = createConversation('chat', '삭제할 대화')
    deleteConversation(conv.id)
    const conversations = getConversations()
    expect(conversations.length).toBe(0)
  })

  it('should only delete the specified conversation', () => {
    createConversation('chat', 'Keep')
    const toDelete = createConversation('chat', 'Delete')
    deleteConversation(toDelete.id)
    const conversations = getConversations()
    expect(conversations.length).toBe(1)
    expect(conversations[0].title).toBe('Keep')
  })

  it('should add a message to a conversation', () => {
    const conv = createConversation('chat', '대화')
    const msg = makeMsg('안녕하세요')
    addMessage(conv.id, msg)

    const conversations = getConversations()
    const updated = conversations.find((c) => c.id === conv.id)
    expect(updated!.messages.length).toBe(1)
    expect(updated!.messages[0].content).toBe('안녕하세요')
  })

  it('should add multiple messages', () => {
    const conv = createConversation('chat', '대화')
    addMessage(conv.id, makeMsg('질문', 'user'))
    addMessage(conv.id, makeMsg('답변', 'assistant'))

    const conversations = getConversations()
    const updated = conversations.find((c) => c.id === conv.id)
    expect(updated!.messages.length).toBe(2)
  })

  it('should search conversations by title', () => {
    createConversation('chat', 'React 질문')
    createConversation('chat', 'Python 학습')
    createConversation('chat', 'React 컴포넌트')

    const results = searchConversations('React')
    expect(results.length).toBe(2)
  })

  it('should search conversations by message content', () => {
    const conv = createConversation('chat', '대화')
    addMessage(conv.id, makeMsg('TypeScript 타입 시스템에 대해 알려주세요'))

    const results = searchConversations('TypeScript')
    expect(results.length).toBe(1)
  })

  it('should return empty array when no matches', () => {
    createConversation('chat', '대화')
    const results = searchConversations('존재하지않는키워드')
    expect(results.length).toBe(0)
  })

  it('should handle case-insensitive search', () => {
    createConversation('chat', 'Next.js 가이드')
    const results = searchConversations('next.js')
    expect(results.length).toBe(1)
  })

  it('should return all when query is empty', () => {
    createConversation('chat', 'A')
    createConversation('chat', 'B')
    const results = searchConversations('')
    expect(results.length).toBe(2)
  })

  it('should persist conversations to localStorage', () => {
    createConversation('chat', '영속 대화')
    const raw = localStorage.getItem('hchat-conversations')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.length).toBe(1)
    expect(parsed[0].title).toBe('영속 대화')
  })
})
