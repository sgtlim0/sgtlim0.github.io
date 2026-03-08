'use client'

import { useState, useCallback } from 'react'
import { createResearchService } from '../services/researchService'
import type { Conversation, ChatMessage } from '../services/types'

interface UseResearchOptions {
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
}

interface UseResearchReturn {
  isResearching: boolean
  researchQuery: string | undefined
  handleSendResearchMessage: (content: string, targetConversationId: string) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function appendAssistantMessage(
  conversations: Conversation[],
  targetConversationId: string,
  message: ChatMessage,
): Conversation[] {
  return conversations.map((conv) =>
    conv.id === targetConversationId
      ? {
          ...conv,
          messages: [...conv.messages, message],
          updatedAt: message.timestamp,
        }
      : conv,
  )
}

export function useResearch({ setConversations }: UseResearchOptions): UseResearchReturn {
  const [isResearching, setIsResearching] = useState(false)
  const [researchQuery, setResearchQuery] = useState<string | undefined>()

  const handleSendResearchMessage = useCallback(
    async (content: string, targetConversationId: string) => {
      setIsResearching(true)
      setResearchQuery(content)

      try {
        const researchService = createResearchService()
        const result = await researchService.search(content)

        const now = new Date().toISOString()
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: result.answer,
          timestamp: now,
          mode: 'research',
          sources: result.sources,
        }

        setConversations((prev) =>
          appendAssistantMessage(prev, targetConversationId, assistantMessage),
        )
      } catch (error) {
        const now = new Date().toISOString()
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Research 검색 중 오류가 발생했습니다.',
          timestamp: now,
          mode: 'research',
        }

        setConversations((prev) =>
          appendAssistantMessage(prev, targetConversationId, errorMessage),
        )
      } finally {
        setIsResearching(false)
        setResearchQuery(undefined)
      }
    },
    [setConversations],
  )

  return {
    isResearching,
    researchQuery,
    handleSendResearchMessage,
  }
}
