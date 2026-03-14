import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockChatService,
  createMockAnalyzeService,
} from '../../src/services/mockExtensionService'
import type { Conversation } from '../../src/services/types'
import type { AnalysisMode, StreamChunk } from '../../src/types/context'

describe('mockChatService', () => {
  let chatService: ReturnType<typeof createMockChatService>

  beforeEach(() => {
    chatService = createMockChatService()
  })

  describe('createConversation', () => {
    it('should create a conversation with unique id', async () => {
      const conv = await chatService.createConversation('Test Chat')

      expect(conv).toMatchObject({
        id: expect.stringContaining('conv-'),
        title: 'Test Chat',
        messages: [],
      })
      expect(conv.createdAt).toBeGreaterThan(0)
      expect(conv.updatedAt).toEqual(conv.createdAt)
    })

    it('should create conversations with different ids', async () => {
      const conv1 = await chatService.createConversation('Chat 1')
      await new Promise((resolve) => setTimeout(resolve, 2))
      const conv2 = await chatService.createConversation('Chat 2')

      expect(conv1.id).not.toEqual(conv2.id)
    })
  })

  describe('getConversations', () => {
    it('should return empty array initially', async () => {
      const convs = await chatService.getConversations()
      expect(convs).toEqual([])
    })

    it('should return all created conversations', async () => {
      await chatService.createConversation('Chat 1')
      await new Promise((resolve) => setTimeout(resolve, 2))
      await chatService.createConversation('Chat 2')

      const convs = await chatService.getConversations()
      expect(convs).toHaveLength(2)
      // Sorted by updatedAt descending, so Chat 2 is first
      expect(convs[0].title).toEqual('Chat 2')
      expect(convs[1].title).toEqual('Chat 1')
    })

    it('should sort conversations by updatedAt descending', async () => {
      const conv1 = await chatService.createConversation('Old Chat')
      await new Promise((resolve) => setTimeout(resolve, 10))
      const conv2 = await chatService.createConversation('New Chat')

      const convs = await chatService.getConversations()
      expect(convs[0].id).toEqual(conv2.id)
      expect(convs[1].id).toEqual(conv1.id)
    })
  })

  describe('getConversation', () => {
    it('should return null for non-existent conversation', async () => {
      const conv = await chatService.getConversation('non-existent')
      expect(conv).toBeNull()
    })

    it('should return conversation by id', async () => {
      const created = await chatService.createConversation('Test')
      const fetched = await chatService.getConversation(created.id)

      expect(fetched).toEqual(created)
    })

    it('should return updated conversation with messages', async () => {
      const conv = await chatService.createConversation('Test')
      const onChunk = vi.fn()
      await chatService.sendMessage(conv.id, 'Hello', onChunk)

      const fetched = await chatService.getConversation(conv.id)
      expect(fetched?.messages).toHaveLength(2) // user + assistant
    })
  })

  describe('deleteConversation', () => {
    it('should remove conversation from list', async () => {
      const conv = await chatService.createConversation('Test')
      await chatService.deleteConversation(conv.id)

      const convs = await chatService.getConversations()
      expect(convs).toHaveLength(0)
    })

    it('should not throw on non-existent id', async () => {
      await expect(chatService.deleteConversation('non-existent')).resolves.toBeUndefined()
    })
  })

  describe('sendMessage', () => {
    it('should throw if conversation not found', async () => {
      const onChunk = vi.fn()
      await expect(chatService.sendMessage('non-existent', 'Hello', onChunk)).rejects.toThrow(
        'Conversation non-existent not found',
      )
    })

    it('should call onChunk with streaming tokens', async () => {
      const conv = await chatService.createConversation('Test')
      const onChunk = vi.fn()

      await chatService.sendMessage(conv.id, 'Hello', onChunk)

      expect(onChunk).toHaveBeenCalled()
      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)

      // Should have multiple chunk calls followed by done
      const chunkCalls = calls.filter((c) => c.type === 'chunk')
      const doneCalls = calls.filter((c) => c.type === 'done')

      expect(chunkCalls.length).toBeGreaterThan(0)
      expect(doneCalls).toHaveLength(1)
    })

    it('should add user and assistant messages to conversation', async () => {
      const conv = await chatService.createConversation('Test')
      const onChunk = vi.fn()

      await chatService.sendMessage(conv.id, 'Hello AI', onChunk)

      const fetched = await chatService.getConversation(conv.id)
      expect(fetched?.messages).toHaveLength(2)
      expect(fetched?.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello AI',
      })
      expect(fetched?.messages[1]).toMatchObject({
        role: 'assistant',
        content: expect.stringContaining('H Chat'),
      })
    })

    it('should update conversation updatedAt timestamp', async () => {
      const conv = await chatService.createConversation('Test')
      const initialUpdatedAt = conv.updatedAt

      await new Promise((resolve) => setTimeout(resolve, 10))

      const onChunk = vi.fn()
      await chatService.sendMessage(conv.id, 'Hello', onChunk)

      const fetched = await chatService.getConversation(conv.id)
      expect(fetched?.updatedAt).toBeGreaterThan(initialUpdatedAt)
    })

    it('should respect abort signal', async () => {
      const conv = await chatService.createConversation('Test')
      const onChunk = vi.fn()
      const controller = new AbortController()

      // Abort after 75ms (streaming takes ~50ms per word, need multiple words)
      setTimeout(() => controller.abort(), 75)

      await expect(
        chatService.sendMessage(conv.id, 'Test', onChunk, controller.signal),
      ).rejects.toThrow('Aborted')

      // Should have received at least one chunk before abort
      expect(onChunk.mock.calls.length).toBeGreaterThanOrEqual(1)
      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const doneCalls = calls.filter((c) => c.type === 'done')
      expect(doneCalls).toHaveLength(0) // Should not reach done
    })

    it('should assign unique message ids', async () => {
      const conv = await chatService.createConversation('Test')
      const onChunk = vi.fn()

      await chatService.sendMessage(conv.id, 'Message 1', onChunk)
      await chatService.sendMessage(conv.id, 'Message 2', onChunk)

      const fetched = await chatService.getConversation(conv.id)
      const messageIds = fetched?.messages.map((m) => m.id) ?? []

      expect(new Set(messageIds).size).toEqual(messageIds.length)
    })
  })
})

describe('mockAnalyzeService', () => {
  let analyzeService: ReturnType<typeof createMockAnalyzeService>

  beforeEach(() => {
    analyzeService = createMockAnalyzeService()
  })

  describe('analyze - mode responses', () => {
    it('should return Korean summary for summarize mode', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Sample text', mode: 'summarize' }, onChunk)

      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const content = calls
        .filter((c) => c.type === 'chunk')
        .map((c) => c.content)
        .join('')

      expect(content).toContain('H Chat')
      expect(content).toContain('임직원')
    })

    it('should return Korean explanation for explain mode', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Sample text', mode: 'explain' }, onChunk)

      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const content = calls
        .filter((c) => c.type === 'chunk')
        .map((c) => c.content)
        .join('')

      expect(content).toContain('기업 내부')
      expect(content).toContain('AI 챗봇')
    })

    it('should return Korean research for research mode', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Sample text', mode: 'research' }, onChunk)

      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const content = calls
        .filter((c) => c.type === 'chunk')
        .map((c) => c.content)
        .join('')

      expect(content).toContain('관련 분석')
      expect(content).toContain('2024년')
    })

    it('should return English translation for translate mode', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Sample text', mode: 'translate' }, onChunk)

      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const content = calls
        .filter((c) => c.type === 'chunk')
        .map((c) => c.content)
        .join('')

      expect(content).toContain('H Chat is')
      expect(content).toContain('employees')
    })

    it('should return different content for each mode', async () => {
      const modes: AnalysisMode[] = ['summarize', 'explain', 'research', 'translate']
      const results: string[] = []

      for (const mode of modes) {
        const onChunk = vi.fn()
        await analyzeService.analyze({ text: 'Test', mode }, onChunk)

        const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
        const content = calls
          .filter((c) => c.type === 'chunk')
          .map((c) => c.content)
          .join('')

        results.push(content)
      }

      // All results should be unique
      expect(new Set(results).size).toEqual(4)
    }, 10000)
  })

  describe('analyze - streaming', () => {
    it('should call onChunk multiple times with tokens', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Test', mode: 'summarize' }, onChunk)

      expect(onChunk).toHaveBeenCalled()
      const calls = onChunk.mock.calls.map((call) => call[0] as StreamChunk)
      const chunkCalls = calls.filter((c) => c.type === 'chunk')

      expect(chunkCalls.length).toBeGreaterThan(5) // Multiple words
    })

    it('should end with done chunk', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Test', mode: 'summarize' }, onChunk)

      const lastCall = onChunk.mock.calls[onChunk.mock.calls.length - 1][0]
      expect(lastCall).toEqual({ type: 'done', content: '' })
    })

    it('should respect abort signal', async () => {
      const onChunk = vi.fn()
      const controller = new AbortController()

      // Abort after 75ms
      setTimeout(() => controller.abort(), 75)

      await expect(
        analyzeService.analyze({ text: 'Test', mode: 'summarize' }, onChunk, controller.signal),
      ).rejects.toThrow('Aborted')

      // Should have received at least one chunk before abort
      expect(onChunk.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('should stream first chunk without leading space', async () => {
      const onChunk = vi.fn()

      await analyzeService.analyze({ text: 'Test', mode: 'summarize' }, onChunk)

      const firstChunk = onChunk.mock.calls[0][0] as StreamChunk
      expect(firstChunk.type).toEqual('chunk')
      expect(firstChunk.content).not.toMatch(/^ /)
    })
  })
})
