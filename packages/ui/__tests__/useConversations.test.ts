/**
 * Tests for useConversations hook (packages/ui/src/user/hooks/useConversations.ts)
 *
 * Covers:
 * - Initial state (isLoading, conversations, currentConversationId)
 * - Load from IndexedDB migration
 * - Fallback to mockConversations on empty result
 * - Fallback to mockConversations on error
 * - Persistence via saveAllConversations
 * - handleNewChat: resets currentConversationId
 * - handleSelectConversation: sets currentConversationId
 * - handleSelectAssistant: creates new conversation
 * - handleDeleteConversation: removes and unselects if current
 * - addUserMessageAndGetConversationId: creates new or appends to existing
 * - currentConversation derived state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Conversation, Assistant } from '../src/user/services/types'

// Mock IndexedDB service
const mockMigrateFromLocalStorage = vi.fn()
const mockSaveAllConversations = vi.fn()

vi.mock('../src/user/services/indexedDbService', () => ({
  migrateFromLocalStorage: (...args: unknown[]) => mockMigrateFromLocalStorage(...args),
  saveAllConversations: (...args: unknown[]) => mockSaveAllConversations(...args),
}))

// Mock mockData
const testMockConversations: Conversation[] = [
  {
    id: 'mock-c1',
    title: 'Mock Conversation',
    assistantId: 'a1',
    messages: [],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
]

vi.mock('../src/user/services/mockData', () => ({
  mockConversations: [
    {
      id: 'mock-c1',
      title: 'Mock Conversation',
      assistantId: 'a1',
      messages: [],
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
  ],
}))

import { useConversations } from '../src/user/hooks/useConversations'

const testAssistants: readonly Assistant[] = [
  {
    id: 'a1',
    name: 'Default Bot',
    icon: '🤖',
    iconColor: '#000',
    model: 'GPT-4o',
    description: 'Default',
    category: '채팅',
    isOfficial: true,
  },
  {
    id: 'a2',
    name: 'Work Bot',
    icon: '📋',
    iconColor: '#111',
    model: '',
    description: 'Work',
    category: '업무',
    isOfficial: true,
  },
]

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMigrateFromLocalStorage.mockResolvedValue([])
    mockSaveAllConversations.mockResolvedValue(undefined)
  })

  it('should start with isLoading=true', () => {
    mockMigrateFromLocalStorage.mockReturnValue(new Promise(() => {
      // Never resolves
    }))

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('should load conversations from IndexedDB migration', async () => {
    const loadedConversations: Conversation[] = [
      {
        id: 'idb-c1',
        title: 'From IndexedDB',
        assistantId: 'a1',
        messages: [],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
    ]
    mockMigrateFromLocalStorage.mockResolvedValue(loadedConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('idb-c1')
  })

  it('should fallback to mockConversations when migration returns empty', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('mock-c1')
  })

  it('should fallback to mockConversations on migration error', async () => {
    mockMigrateFromLocalStorage.mockRejectedValue(new Error('IndexedDB not available'))

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('mock-c1')
  })

  it('should set isLoading to false after load', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should have currentConversationId=undefined initially', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.currentConversationId).toBeUndefined()
    expect(result.current.currentConversation).toBeUndefined()
  })

  it('should select a conversation via handleSelectConversation', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.handleSelectConversation('mock-c1')
    })

    expect(result.current.currentConversationId).toBe('mock-c1')
    expect(result.current.currentConversation).toBeDefined()
    expect(result.current.currentConversation!.id).toBe('mock-c1')
  })

  it('should reset currentConversationId via handleNewChat', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Select first
    act(() => {
      result.current.handleSelectConversation('mock-c1')
    })

    expect(result.current.currentConversationId).toBe('mock-c1')

    // New chat
    act(() => {
      result.current.handleNewChat()
    })

    expect(result.current.currentConversationId).toBeUndefined()
  })

  it('should create a new conversation via handleSelectAssistant', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.handleSelectAssistant(testAssistants[1])
    })

    // Should have 2 conversations now (mock + new)
    expect(result.current.conversations).toHaveLength(2)

    // The new conversation should be first (prepended)
    const newConv = result.current.conversations[0]
    expect(newConv.assistantId).toBe('a2')
    expect(newConv.title).toContain('Work Bot')
    expect(newConv.messages).toHaveLength(0)

    // Should be selected
    expect(result.current.currentConversationId).toBe(newConv.id)
  })

  it('should delete a conversation via handleDeleteConversation', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.handleDeleteConversation('mock-c1')
    })

    expect(result.current.conversations).toHaveLength(0)
  })

  it('should unselect current conversation when deleting it', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Select and then delete
    act(() => {
      result.current.handleSelectConversation('mock-c1')
    })

    expect(result.current.currentConversationId).toBe('mock-c1')

    act(() => {
      result.current.handleDeleteConversation('mock-c1')
    })

    expect(result.current.currentConversationId).toBeUndefined()
  })

  it('should not unselect current when deleting a different conversation', async () => {
    const twoConversations: Conversation[] = [
      ...testMockConversations,
      {
        id: 'c2',
        title: 'Second',
        assistantId: 'a2',
        messages: [],
        createdAt: '2026-03-02T00:00:00Z',
        updatedAt: '2026-03-02T00:00:00Z',
      },
    ]
    mockMigrateFromLocalStorage.mockResolvedValue(twoConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Select first one
    act(() => {
      result.current.handleSelectConversation('mock-c1')
    })

    // Delete the other one
    act(() => {
      result.current.handleDeleteConversation('c2')
    })

    // Should still have mock-c1 selected
    expect(result.current.currentConversationId).toBe('mock-c1')
    expect(result.current.conversations).toHaveLength(1)
  })

  it('should create new conversation in addUserMessageAndGetConversationId when no current', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // No conversation selected
    let targetId: string = ''
    act(() => {
      targetId = result.current.addUserMessageAndGetConversationId('Hello world')
    })

    expect(targetId).toBeDefined()
    expect(targetId.length).toBeGreaterThan(0)

    // A new conversation should be prepended
    expect(result.current.conversations).toHaveLength(2)
    const newConv = result.current.conversations[0]
    expect(newConv.id).toBe(targetId)
    expect(newConv.messages).toHaveLength(1)
    expect(newConv.messages[0].role).toBe('user')
    expect(newConv.messages[0].content).toBe('Hello world')
    expect(newConv.messages[0].mode).toBe('chat')

    // Should become the current conversation
    expect(result.current.currentConversationId).toBe(targetId)
  })

  it('should append message to existing conversation in addUserMessageAndGetConversationId', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue(testMockConversations)

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Select existing conversation
    act(() => {
      result.current.handleSelectConversation('mock-c1')
    })

    let targetId: string = ''
    act(() => {
      targetId = result.current.addUserMessageAndGetConversationId('Follow up')
    })

    expect(targetId).toBe('mock-c1')

    const conv = result.current.conversations.find((c) => c.id === 'mock-c1')
    expect(conv!.messages).toHaveLength(1)
    expect(conv!.messages[0].content).toBe('Follow up')
  })

  it('should truncate title for long messages in addUserMessageAndGetConversationId', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const longMessage = 'This is a very long message that exceeds thirty characters'

    act(() => {
      result.current.addUserMessageAndGetConversationId(longMessage)
    })

    const newConv = result.current.conversations[0]
    expect(newConv.title.length).toBeLessThanOrEqual(33) // 30 + '...'
    expect(newConv.title).toContain('...')
  })

  it('should use short message as title directly in addUserMessageAndGetConversationId', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.addUserMessageAndGetConversationId('Short msg')
    })

    const newConv = result.current.conversations[0]
    expect(newConv.title).toBe('Short msg')
  })

  it('should use research mode in message when chatMode is research', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'research' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.addUserMessageAndGetConversationId('Research query')
    })

    const newConv = result.current.conversations[0]
    expect(newConv.messages[0].mode).toBe('research')
  })

  it('should use first assistant as default when creating conversation without selection', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.addUserMessageAndGetConversationId('Hello')
    })

    const newConv = result.current.conversations[0]
    expect(newConv.assistantId).toBe('a1')
  })

  it('should return all expected fields', async () => {
    mockMigrateFromLocalStorage.mockResolvedValue([])

    const { result } = renderHook(() =>
      useConversations({ allAssistants: testAssistants, chatMode: 'chat' }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const keys = Object.keys(result.current)
    expect(keys).toContain('conversations')
    expect(keys).toContain('currentConversationId')
    expect(keys).toContain('currentConversation')
    expect(keys).toContain('isLoading')
    expect(keys).toContain('setConversations')
    expect(keys).toContain('setCurrentConversationId')
    expect(keys).toContain('handleNewChat')
    expect(keys).toContain('handleSelectConversation')
    expect(keys).toContain('handleSelectAssistant')
    expect(keys).toContain('handleDeleteConversation')
    expect(keys).toContain('addUserMessageAndGetConversationId')
  })
})
