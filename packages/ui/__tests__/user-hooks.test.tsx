/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for User Service Hooks and Provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React, { ReactNode } from 'react'
import {
  useConversations,
  useAssistants,
  useUsageStats,
  useSubscription,
  useTranslationJobs,
  useDocProjects,
  useOCRJobs,
} from '../src/user/services/hooks'
import { UserServiceProvider, useUserService } from '../src/user/services/UserServiceProvider'
import type { UserService } from '../src/user/services/userService'
import type {
  Conversation,
  Assistant,
  ModelUsage,
  Subscription,
  TranslationJob,
  DocProject,
  OCRJob,
} from '../src/user/services/types'

// Mock UserService
const mockUserService: UserService = {
  // Chat methods
  getConversations: vi.fn(),
  getConversation: vi.fn(),
  createConversation: vi.fn(),
  deleteConversation: vi.fn(),
  sendMessage: vi.fn(),

  // Assistant methods
  getAssistants: vi.fn(),
  getCustomAssistants: vi.fn(),
  createCustomAssistant: vi.fn(),
  deleteCustomAssistant: vi.fn(),

  // My page methods
  getUsageStats: vi.fn(),
  getSubscription: vi.fn(),

  // Translation methods
  getTranslationJobs: vi.fn(),
  createTranslation: vi.fn(),

  // Docs methods
  getDocProjects: vi.fn(),
  createDocProject: vi.fn(),

  // OCR methods
  getOCRJobs: vi.fn(),
  uploadOCRFile: vi.fn(),
}

// Wrapper component for providing context
const wrapper = ({ children, service }: { children: ReactNode; service?: UserService }) => (
  <UserServiceProvider service={service || mockUserService}>{children}</UserServiceProvider>
)

describe('UserServiceProvider', () => {
  it('should provide service through context', () => {
    const { result } = renderHook(() => useUserService(), {
      wrapper: ({ children }) => wrapper({ children, service: mockUserService }),
    })

    expect(result.current).toBe(mockUserService)
  })

  it('should use default MockUserService when no service provided', () => {
    const { result } = renderHook(() => useUserService(), {
      wrapper: ({ children }) => <UserServiceProvider>{children}</UserServiceProvider>,
    })

    expect(result.current).toBeDefined()
    expect(result.current.getConversations).toBeDefined()
  })
})

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch conversations on mount', async () => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        assistantId: 'assistant-1',
        assistantName: 'Test Assistant',
        assistantAvatar: '👤',
        title: 'Test Conversation',
        lastMessage: 'Hello',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
      },
    ]

    ;(mockUserService.getConversations as any).mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    // Initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.conversations).toEqual([])

    // Wait for data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toEqual(mockConversations)
    expect(result.current.error).toBe(null)
    expect(mockUserService.getConversations).toHaveBeenCalledTimes(1)
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch conversations')
    ;(mockUserService.getConversations as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.conversations).toEqual([])
  })

  it('should create new conversation', async () => {
    const existingConversations: Conversation[] = [
      { id: '1', assistantId: 'assistant-1', title: 'Existing' } as Conversation,
    ]

    const newConversation: Conversation = {
      id: '2',
      assistantId: 'assistant-2',
      assistantName: 'New Assistant',
      assistantAvatar: '🤖',
      title: 'New Conversation',
      lastMessage: '',
      createdAt: '2024-03-20T11:00:00Z',
      updatedAt: '2024-03-20T11:00:00Z',
    }

    ;(mockUserService.getConversations as any).mockResolvedValue(existingConversations)
    ;(mockUserService.createConversation as any).mockResolvedValue(newConversation)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Create new conversation
    let createdConv: Conversation | undefined
    await act(async () => {
      createdConv = await result.current.create('assistant-2')
    })

    expect(createdConv).toEqual(newConversation)
    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.conversations[0]).toEqual(newConversation)
    expect(mockUserService.createConversation).toHaveBeenCalledWith('assistant-2')
  })

  it('should handle create errors', async () => {
    const mockError = new Error('Failed to create conversation')
    ;(mockUserService.getConversations as any).mockResolvedValue([])
    ;(mockUserService.createConversation as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Try to create conversation
    let errorThrown = false
    try {
      await act(async () => {
        await result.current.create('assistant-1')
      })
    } catch (error) {
      errorThrown = true
      expect(error).toEqual(mockError)
    }
    expect(errorThrown).toBe(true)
  })

  it('should delete conversation', async () => {
    const conversations: Conversation[] = [
      { id: '1', assistantId: 'assistant-1', title: 'Conv 1' } as Conversation,
      { id: '2', assistantId: 'assistant-2', title: 'Conv 2' } as Conversation,
    ]

    ;(mockUserService.getConversations as any).mockResolvedValue(conversations)
    ;(mockUserService.deleteConversation as any).mockResolvedValue(undefined)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toHaveLength(2)

    // Delete conversation
    await act(async () => {
      await result.current.remove('1')
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('2')
    expect(mockUserService.deleteConversation).toHaveBeenCalledWith('1')
  })

  it('should refetch conversations', async () => {
    const initialConversations: Conversation[] = [{ id: '1', title: 'Initial' } as Conversation]

    const updatedConversations: Conversation[] = [
      { id: '1', title: 'Updated' } as Conversation,
      { id: '2', title: 'New' } as Conversation,
    ]

    ;(mockUserService.getConversations as any)
      .mockResolvedValueOnce(initialConversations)
      .mockResolvedValueOnce(updatedConversations)

    const { result } = renderHook(() => useConversations(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toEqual(initialConversations)

    // Refetch
    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.conversations).toEqual(updatedConversations)
    expect(mockUserService.getConversations).toHaveBeenCalledTimes(2)
  })
})

describe('useAssistants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch both official and custom assistants', async () => {
    const officialAssistants: Assistant[] = [
      {
        id: 'official-1',
        name: 'Official Assistant',
        description: 'Official',
        avatar: '🤖',
        model: 'gpt-4',
        systemPrompt: 'You are helpful',
        temperature: 0.7,
        isCustom: false,
        category: 'general',
      },
    ]

    const customAssistants: Assistant[] = [
      {
        id: 'custom-1',
        name: 'Custom Assistant',
        description: 'Custom',
        avatar: '👤',
        model: 'gpt-3.5-turbo',
        systemPrompt: 'Custom prompt',
        temperature: 0.5,
        isCustom: true,
        category: 'personal',
      },
    ]

    ;(mockUserService.getAssistants as any).mockResolvedValue(officialAssistants)
    ;(mockUserService.getCustomAssistants as any).mockResolvedValue(customAssistants)

    const { result } = renderHook(() => useAssistants(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.assistants).toEqual(officialAssistants)
    expect(result.current.customAssistants).toEqual(customAssistants)
    expect(result.current.allAssistants).toHaveLength(2)
    expect(result.current.allAssistants).toEqual([...officialAssistants, ...customAssistants])
    expect(result.current.error).toBe(null)
  })

  it('should handle partial fetch errors', async () => {
    const officialAssistants: Assistant[] = [{ id: 'official-1', name: 'Official' } as Assistant]

    ;(mockUserService.getAssistants as any).mockResolvedValue(officialAssistants)
    ;(mockUserService.getCustomAssistants as any).mockRejectedValue(
      new Error('Custom fetch failed'),
    )

    const { result } = renderHook(() => useAssistants(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    // The actual error message would be the one thrown, not the Korean message
    expect(result.current.error?.message).toBeTruthy()
  })
})

describe('useUsageStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch usage statistics', async () => {
    const mockStats: ModelUsage[] = [
      {
        model: 'GPT-4',
        usage: 1500,
        cost: 45.5,
        percentage: 35,
      },
    ]

    ;(mockUserService.getUsageStats as any).mockResolvedValue(mockStats)

    const { result } = renderHook(() => useUsageStats(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStats)
    expect(result.current.error).toBe(null)
  })

  it('should handle string errors', async () => {
    ;(mockUserService.getUsageStats as any).mockRejectedValue('String error')

    const { result } = renderHook(() => useUsageStats(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Unknown error')
  })
})

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch subscription information', async () => {
    const mockSubscription: Subscription = {
      plan: 'Premium',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      tokensUsed: 50000,
      tokensLimit: 100000,
      features: ['unlimited-chat', 'priority-support'],
    }

    ;(mockUserService.getSubscription as any).mockResolvedValue(mockSubscription)

    const { result } = renderHook(() => useSubscription(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockSubscription)
    expect(result.current.error).toBe(null)
  })
})

describe('useTranslationJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch translation jobs', async () => {
    const mockJobs: TranslationJob[] = [
      {
        id: '1',
        fileName: 'document.pdf',
        sourceLanguage: 'en',
        targetLanguage: 'ko',
        status: 'completed',
        progress: 100,
        createdAt: '2024-03-20T10:00:00Z',
      },
    ]

    ;(mockUserService.getTranslationJobs as any).mockResolvedValue(mockJobs)

    const { result } = renderHook(() => useTranslationJobs(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockJobs)
    expect(result.current.error).toBe(null)
  })
})

describe('useDocProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch document projects', async () => {
    const mockProjects: DocProject[] = [
      {
        id: '1',
        name: 'Project 1',
        type: 'technical',
        fileCount: 5,
        status: 'active',
        lastModified: '2024-03-20T10:00:00Z',
        createdAt: '2024-03-01T10:00:00Z',
      },
    ]

    ;(mockUserService.getDocProjects as any).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useDocProjects(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProjects)
    expect(result.current.error).toBe(null)
  })
})

describe('useOCRJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch OCR jobs', async () => {
    const mockJobs: OCRJob[] = [
      {
        id: '1',
        fileName: 'scan.pdf',
        status: 'processing',
        progress: 50,
        pageCount: 10,
        completedPages: 5,
        createdAt: '2024-03-20T10:00:00Z',
      },
    ]

    ;(mockUserService.getOCRJobs as any).mockResolvedValue(mockJobs)

    const { result } = renderHook(() => useOCRJobs(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockJobs)
    expect(result.current.error).toBe(null)
  })

  it('should refetch OCR jobs', async () => {
    const initialJobs: OCRJob[] = [{ id: '1', status: 'processing' } as OCRJob]

    const updatedJobs: OCRJob[] = [{ id: '1', status: 'completed' } as OCRJob]

    ;(mockUserService.getOCRJobs as any)
      .mockResolvedValueOnce(initialJobs)
      .mockResolvedValueOnce(updatedJobs)

    const { result } = renderHook(() => useOCRJobs(), {
      wrapper: ({ children }) => wrapper({ children }),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(initialJobs)

    // Refetch
    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.data).toEqual(updatedJobs)
    expect(mockUserService.getOCRJobs).toHaveBeenCalledTimes(2)
  })
})
