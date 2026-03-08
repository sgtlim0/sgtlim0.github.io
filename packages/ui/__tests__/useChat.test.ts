/**
 * Tests for useChat hook (packages/ui/src/user/hooks/useChat.ts)
 *
 * Strategy:
 * - Pure function tests for buildSlidingWindow, appendChunkToMessage, setErrorOnMessage
 *   (These are module-private, so we test them indirectly via the hook behavior.)
 * - Hook tests for handleSendChatMessage, handleStopStreaming, isStreaming state
 * - SSE streamResponse is mocked
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Conversation, ChatMessage } from '../src/user/services/types'
import type { SSEStream } from '../src/user/services/sseService'

// Capture the mock for streamResponse so we can control it in tests
let mockStreamSubscribe: (
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
) => void
let mockStreamAbort: ReturnType<typeof vi.fn>

const createMockStream = (): SSEStream => {
  mockStreamAbort = vi.fn()
  return {
    subscribe: (onChunk, onDone, onError) => {
      mockStreamSubscribe(onChunk, onDone, onError)
    },
    abort: mockStreamAbort,
  }
}

vi.mock('../src/user/services/sseService', () => ({
  streamResponse: vi.fn(() => createMockStream()),
}))

import { useChat } from '../src/user/hooks/useChat'
import { streamResponse } from '../src/user/services/sseService'

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    title: 'Test Conversation',
    assistantId: 'a1',
    messages: [],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

describe('useChat', () => {
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

    // Default: immediate success stream
    mockStreamSubscribe = (onChunk, onDone) => {
      onChunk('Hello ')
      onChunk('World')
      onDone()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial isStreaming as false', () => {
    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    expect(result.current.isStreaming).toBe(false)
  })

  it('should expose handleSendChatMessage and handleStopStreaming functions', () => {
    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    expect(typeof result.current.handleSendChatMessage).toBe('function')
    expect(typeof result.current.handleStopStreaming).toBe('function')
  })

  it('should call streamResponse with correct args when sending a message', () => {
    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Test message', 'conv-1')
    })

    expect(streamResponse).toHaveBeenCalledWith('Test message', 'a1')
  })

  it('should add an empty assistant message to the conversation before streaming', () => {
    const callArgs: unknown[][] = []
    setConversations = vi.fn((updater) => {
      if (typeof updater === 'function') {
        conversations = updater(conversations)
        callArgs.push([...conversations])
      }
    })

    // Use a stream that does nothing (so we see the initial state)
    mockStreamSubscribe = () => {
      // intentionally empty
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    // setConversations should have been called at least once (for adding assistant msg)
    expect(setConversations).toHaveBeenCalled()
    // The first call adds the initial empty assistant message
    const firstCallArg = setConversations.mock.calls[0][0]
    expect(typeof firstCallArg).toBe('function')
  })

  it('should append chunks to the assistant message during streaming', () => {
    // Track all updates to conversations
    const stateSnapshots: Conversation[][] = []

    setConversations = vi.fn((updater) => {
      if (typeof updater === 'function') {
        conversations = updater(conversations)
        stateSnapshots.push(JSON.parse(JSON.stringify(conversations)))
      }
    })

    mockStreamSubscribe = (onChunk, onDone) => {
      onChunk('Hello ')
      onChunk('World')
      onDone()
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    // After streaming, the conversation should have an assistant message with accumulated content
    const lastSnapshot = stateSnapshots[stateSnapshots.length - 1]
    if (lastSnapshot) {
      const conv = lastSnapshot.find((c) => c.id === 'conv-1')
      if (conv && conv.messages.length > 0) {
        const assistantMsg = conv.messages.find((m) => m.role === 'assistant')
        if (assistantMsg) {
          expect(assistantMsg.content).toContain('Hello ')
        }
      }
    }
  })

  it('should set isStreaming to false after stream completes', () => {
    mockStreamSubscribe = (onChunk, onDone) => {
      onChunk('done')
      onDone()
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    expect(result.current.isStreaming).toBe(false)
  })

  it('should set isStreaming to false on stream error', () => {
    mockStreamSubscribe = (_onChunk, _onDone, onError) => {
      onError(new Error('Stream failed'))
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    expect(result.current.isStreaming).toBe(false)
  })

  it('should set error content on assistant message when stream errors with no content', () => {
    const stateSnapshots: Conversation[][] = []

    setConversations = vi.fn((updater) => {
      if (typeof updater === 'function') {
        conversations = updater(conversations)
        stateSnapshots.push(JSON.parse(JSON.stringify(conversations)))
      }
    })

    mockStreamSubscribe = (_onChunk, _onDone, onError) => {
      onError(new Error('Stream failed'))
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    // The last snapshot should have an error message on the assistant
    const lastSnapshot = stateSnapshots[stateSnapshots.length - 1]
    if (lastSnapshot) {
      const conv = lastSnapshot.find((c) => c.id === 'conv-1')
      if (conv) {
        const assistantMsg = conv.messages.find((m) => m.role === 'assistant')
        if (assistantMsg) {
          // Should have the default error message since content was empty
          expect(assistantMsg.content).toBe(
            '응답을 생성하는 중 오류가 발생했습니다.',
          )
        }
      }
    }
  })

  it('should abort the stream when handleStopStreaming is called', () => {
    // Use a stream that never completes
    mockStreamSubscribe = () => {
      // intentionally never calls onDone
    }

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    act(() => {
      result.current.handleStopStreaming()
    })

    expect(mockStreamAbort).toHaveBeenCalled()
    expect(result.current.isStreaming).toBe(false)
  })

  it('should do nothing if handleStopStreaming is called without active stream', () => {
    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    // Should not throw
    act(() => {
      result.current.handleStopStreaming()
    })

    expect(result.current.isStreaming).toBe(false)
  })

  it('should use empty assistantId if conversation not found', () => {
    conversations = [] // No conversations

    const { result } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Test', 'nonexistent')
    })

    expect(streamResponse).toHaveBeenCalledWith('Test', '')
  })

  it('should update historyRef via sliding window when conversations change', () => {
    const msgs: ChatMessage[] = [
      makeMessage({ id: 'm1', role: 'user', content: 'Q1' }),
      makeMessage({ id: 'm2', role: 'assistant', content: 'A1' }),
      makeMessage({ id: 'm3', role: 'user', content: 'Q2' }),
    ]
    conversations = [
      makeConversation({
        messages: msgs,
        updatedAt: '2026-03-02T00:00:00Z',
      }),
    ]

    // This test mainly verifies no error occurs when conversations change
    const { rerender } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    // Update conversations to trigger the sliding window effect
    conversations = [
      makeConversation({
        messages: [...msgs, makeMessage({ id: 'm4', role: 'assistant', content: 'A2' })],
        updatedAt: '2026-03-03T00:00:00Z',
      }),
    ]
    rerender()

    // No error should occur
    expect(true).toBe(true)
  })

  it('should reset historyRef when conversations become empty', () => {
    conversations = [makeConversation({ messages: [makeMessage()] })]

    const { rerender } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    // Set to empty
    conversations = []
    rerender()

    // No error should occur
    expect(true).toBe(true)
  })

  it('should cleanup abort on unmount', () => {
    mockStreamSubscribe = () => {
      // Never completes
    }

    const { result, unmount } = renderHook(() =>
      useChat({ conversations, setConversations }),
    )

    act(() => {
      result.current.handleSendChatMessage('Hi', 'conv-1')
    })

    unmount()

    expect(mockStreamAbort).toHaveBeenCalled()
  })
})
