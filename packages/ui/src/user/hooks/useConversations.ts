'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Conversation, ChatMessage, Assistant } from '../services/types'
import { getConversations, saveConversations } from '../services/chatService'
import { mockConversations } from '../services/mockData'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseConversationsOptions {
  allAssistants: readonly Assistant[]
  chatMode: 'chat' | 'research'
}

export interface UseConversationsReturn {
  conversations: Conversation[]
  currentConversationId: string | undefined
  currentConversation: Conversation | undefined
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | undefined>>
  handleNewChat: () => void
  handleSelectConversation: (id: string) => void
  handleSelectAssistant: (assistant: Assistant) => void
  handleDeleteConversation: (id: string) => void
  addUserMessageAndGetConversationId: (content: string) => string
}

export function useConversations({
  allAssistants,
  chatMode,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()

  // Load on mount
  useEffect(() => {
    const loaded = getConversations()
    setConversations(loaded.length > 0 ? loaded : mockConversations)
  }, [])

  // Persist on change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId),
    [conversations, currentConversationId],
  )

  const handleNewChat = useCallback(() => {
    setCurrentConversationId(undefined)
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  const handleSelectAssistant = useCallback((assistant: Assistant) => {
    const now = new Date().toISOString()
    const newConversation: Conversation = {
      id: generateId(),
      title: `${assistant.name}와의 대화`,
      assistantId: assistant.id,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
  }, [])

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (currentConversationId === id) {
        setCurrentConversationId(undefined)
      }
    },
    [currentConversationId],
  )

  const addUserMessageAndGetConversationId = useCallback(
    (content: string): string => {
      let targetConversationId = currentConversationId

      if (!targetConversationId) {
        const defaultAssistant = allAssistants[0]
        const now = new Date().toISOString()
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: now,
          mode: chatMode,
        }
        const newConversation: Conversation = {
          id: generateId(),
          title: content.length > 30 ? `${content.slice(0, 30)}...` : content,
          assistantId: defaultAssistant.id,
          messages: [userMessage],
          createdAt: now,
          updatedAt: now,
        }
        setConversations((prev) => [newConversation, ...prev])
        setCurrentConversationId(newConversation.id)
        targetConversationId = newConversation.id
      } else {
        const now = new Date().toISOString()
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: now,
          mode: chatMode,
        }
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === targetConversationId
              ? { ...conv, messages: [...conv.messages, userMessage], updatedAt: now }
              : conv,
          ),
        )
      }

      return targetConversationId
    },
    [currentConversationId, allAssistants, chatMode],
  )

  return {
    conversations,
    currentConversationId,
    currentConversation,
    setConversations,
    setCurrentConversationId,
    handleNewChat,
    handleSelectConversation,
    handleSelectAssistant,
    handleDeleteConversation,
    addUserMessageAndGetConversationId,
  }
}
