/**
 * Tests for useResearch hook (packages/ui/src/user/hooks/useResearch.ts)
 *
 * Covers:
 * - Initial state (isResearching, researchQuery)
 * - handleSendResearchMessage success path
 * - handleSendResearchMessage error path (Error instance)
 * - handleSendResearchMessage error path (non-Error thrown)
 * - Sets isResearching during research
 * - Clears researchQuery after completion
 * - Appends assistant message to correct conversation
 * - Does not modify other conversations
 * - Includes sources in the result message
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Conversation } from '../src/user/services/types'

// Mock research service
const mockSearch = vi.fn()

vi.mock('../src/user/services/researchService', () => ({
  createResearchService: () => ({
    search: mockSearch,
  }),
}))

import { useResearch } from '../src/user/hooks/useResearch'

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    title: 'Test',
    assistantId: 'a1',
    messages: [],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

describe('useResearch', () => {
  let conversations: Conversation[]
  let setConversations: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    conversations = [makeConversation()]
    setConversations = vi.fn((updater) => {
      if (typeof updater === 'function') {
        conversations = updater(conversations)
      } else {
        conversations = updater
      }
    })
  })

  it('should return initial state with isResearching=false and researchQuery=undefined', () => {
    const { result } = renderHook(() => useResearch({ setConversations }))

    expect(result.current.isResearching).toBe(false)
    expect(result.current.researchQuery).toBeUndefined()
  })

  it('should expose handleSendResearchMessage function', () => {
    const { result } = renderHook(() => useResearch({ setConversations }))

    expect(typeof result.current.handleSendResearchMessage).toBe('function')
  })

  it('should append assistant message on successful research', async () => {
    const mockResult = {
      query: 'AI trends',
      answer: 'Here are the AI trends for 2026...',
      sources: [
        { title: 'Source 1', url: 'https://example.com/1', snippet: 'Snippet 1' },
        { title: 'Source 2', url: 'https://example.com/2' },
      ],
    }
    mockSearch.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('AI trends', 'conv-1')
    })

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    // setConversations should have been called with a function that appends a message
    expect(setConversations).toHaveBeenCalled()

    // Check the resulting conversation
    const conv = conversations.find((c) => c.id === 'conv-1')
    expect(conv).toBeDefined()
    expect(conv!.messages).toHaveLength(1)

    const msg = conv!.messages[0]
    expect(msg.role).toBe('assistant')
    expect(msg.content).toBe('Here are the AI trends for 2026...')
    expect(msg.mode).toBe('research')
    expect(msg.sources).toHaveLength(2)
    expect(msg.sources![0].title).toBe('Source 1')
  })

  it('should set isResearching=false and researchQuery=undefined after success', async () => {
    mockSearch.mockResolvedValue({
      query: 'test',
      answer: 'Answer',
      sources: [],
    })

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('test', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    expect(result.current.researchQuery).toBeUndefined()
  })

  it('should handle Error instance during research', async () => {
    mockSearch.mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('query', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    // Should have appended an error message
    const conv = conversations.find((c) => c.id === 'conv-1')
    expect(conv).toBeDefined()
    expect(conv!.messages).toHaveLength(1)

    const msg = conv!.messages[0]
    expect(msg.role).toBe('assistant')
    expect(msg.content).toBe('Network failure')
    expect(msg.mode).toBe('research')
  })

  it('should handle non-Error thrown during research with default message', async () => {
    mockSearch.mockRejectedValue('string error')

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('query', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    const conv = conversations.find((c) => c.id === 'conv-1')
    expect(conv!.messages[0].content).toBe('Research 검색 중 오류가 발생했습니다.')
  })

  it('should not modify other conversations when appending message', async () => {
    const otherConv = makeConversation({
      id: 'conv-2',
      title: 'Other',
      messages: [
        {
          id: 'existing-msg',
          role: 'user',
          content: 'Existing',
          timestamp: '2026-03-01T00:00:00Z',
        },
      ],
    })
    conversations = [makeConversation(), otherConv]

    mockSearch.mockResolvedValue({
      query: 'test',
      answer: 'Result',
      sources: [],
    })

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('test', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    // conv-2 should be unchanged
    const other = conversations.find((c) => c.id === 'conv-2')
    expect(other!.messages).toHaveLength(1)
    expect(other!.messages[0].content).toBe('Existing')
  })

  it('should call search on the research service with the query', async () => {
    mockSearch.mockResolvedValue({
      query: 'specific query',
      answer: 'Answer',
      sources: [],
    })

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('specific query', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    expect(mockSearch).toHaveBeenCalledWith('specific query')
  })

  it('should generate unique message ids', async () => {
    mockSearch
      .mockResolvedValueOnce({ query: 'q1', answer: 'A1', sources: [] })
      .mockResolvedValueOnce({ query: 'q2', answer: 'A2', sources: [] })

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('q1', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    const firstMsgId = conversations.find((c) => c.id === 'conv-1')!.messages[0].id

    await act(async () => {
      result.current.handleSendResearchMessage('q2', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    const secondMsgId = conversations.find((c) => c.id === 'conv-1')!.messages[1].id
    expect(firstMsgId).not.toBe(secondMsgId)
  })

  it('should update updatedAt on the target conversation', async () => {
    const originalUpdatedAt = '2026-03-01T00:00:00Z'
    conversations = [makeConversation({ updatedAt: originalUpdatedAt })]

    mockSearch.mockResolvedValue({
      query: 'test',
      answer: 'Result',
      sources: [],
    })

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('test', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    const conv = conversations.find((c) => c.id === 'conv-1')
    expect(conv!.updatedAt).not.toBe(originalUpdatedAt)
  })

  it('should handle research for non-existent conversation gracefully', async () => {
    mockSearch.mockResolvedValue({
      query: 'test',
      answer: 'Result',
      sources: [],
    })

    const { result } = renderHook(() => useResearch({ setConversations }))

    // Should not throw for a non-existent conversation id
    await act(async () => {
      result.current.handleSendResearchMessage('test', 'nonexistent')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    // Original conversation should be unchanged
    const conv = conversations.find((c) => c.id === 'conv-1')
    expect(conv!.messages).toHaveLength(0)
  })

  it('should always clear isResearching even on error (finally block)', async () => {
    mockSearch.mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useResearch({ setConversations }))

    await act(async () => {
      result.current.handleSendResearchMessage('query', 'conv-1')
    })

    await waitFor(() => {
      expect(result.current.isResearching).toBe(false)
    })

    expect(result.current.researchQuery).toBeUndefined()
  })
})
