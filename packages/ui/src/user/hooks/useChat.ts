'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { streamResponse } from '../services/sseService'
import type { SSEStream } from '../services/sseService'
import type { Conversation, ChatMessage } from '../services/types'

const MAX_HISTORY = 20

interface HistoryEntry {
  role: 'user' | 'assistant'
  content: string
}

interface UseChatOptions {
  conversations: Conversation[]
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
}

interface UseChatReturn {
  isStreaming: boolean
  handleSendChatMessage: (content: string, targetConversationId: string) => void
  handleStopStreaming: () => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildSlidingWindow(messages: ChatMessage[]): HistoryEntry[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-MAX_HISTORY)
}

function appendChunkToMessage(
  conversations: Conversation[],
  targetConversationId: string,
  assistantMessageId: string,
  chunk: string,
): Conversation[] {
  return conversations.map((conv) =>
    conv.id === targetConversationId
      ? {
          ...conv,
          messages: conv.messages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
          updatedAt: new Date().toISOString(),
        }
      : conv,
  )
}

function setErrorOnMessage(
  conversations: Conversation[],
  targetConversationId: string,
  assistantMessageId: string,
): Conversation[] {
  return conversations.map((conv) =>
    conv.id === targetConversationId
      ? {
          ...conv,
          messages: conv.messages.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: msg.content || '응답을 생성하는 중 오류가 발생했습니다.',
                }
              : msg,
          ),
        }
      : conv,
  )
}

export function useChat({ conversations, setConversations }: UseChatOptions): UseChatReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<SSEStream | null>(null)
  const historyRef = useRef<HistoryEntry[]>([])

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Update sliding window when conversations change
  useEffect(() => {
    if (conversations.length === 0) {
      historyRef.current = []
      return
    }
    // Find the most recently updated conversation with messages
    const sorted = [...conversations]
      .filter((c) => c.messages.length > 0)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const latest = sorted[0]
    if (latest) {
      historyRef.current = buildSlidingWindow(latest.messages)
    }
  }, [conversations])

  const handleSendChatMessage = useCallback(
    (content: string, targetConversationId: string) => {
      const conversation = conversations.find((c) => c.id === targetConversationId)
      const assistantId = conversation?.assistantId ?? ''

      setIsStreaming(true)
      const assistantMessageId = generateId()
      const now = new Date().toISOString()

      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: now,
        assistantId,
        mode: 'chat',
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === targetConversationId
            ? {
                ...conv,
                messages: [...conv.messages, initialAssistantMessage],
                updatedAt: now,
              }
            : conv,
        ),
      )

      const stream = streamResponse(content, assistantId)
      abortControllerRef.current = stream

      stream.subscribe(
        (chunk: string) => {
          setConversations((prev) =>
            appendChunkToMessage(prev, targetConversationId, assistantMessageId, chunk),
          )
        },
        () => {
          setIsStreaming(false)
          abortControllerRef.current = null
        },
        (_error: Error) => {
          setIsStreaming(false)
          abortControllerRef.current = null
          setConversations((prev) =>
            setErrorOnMessage(prev, targetConversationId, assistantMessageId),
          )
        },
      )
    },
    [conversations, setConversations],
  )

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [])

  return {
    isStreaming,
    handleSendChatMessage,
    handleStopStreaming,
  }
}
