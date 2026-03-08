'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { Conversation, ChatMessage, Assistant } from '../services/types'
import { migrateFromLocalStorage, saveAllConversations } from '../services/indexedDbService'
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
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(true)
  const isInitializedRef = useRef(false)

  // Load on mount: migrate from localStorage → IndexedDB
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const loaded = await migrateFromLocalStorage()
        if (!cancelled) {
          setConversations(loaded.length > 0 ? loaded : mockConversations)
          isInitializedRef.current = true
        }
      } catch {
        if (!cancelled) {
          setConversations(mockConversations)
          isInitializedRef.current = true
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist to IndexedDB on change (skip until initial load completes)
  useEffect(() => {
    if (!isInitializedRef.current) return
    if (conversations.length > 0) {
      saveAllConversations(conversations).catch(() => {
        // IndexedDB write failure: silently ignore
      })
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
    isLoading,
    setConversations,
    setCurrentConversationId,
    handleNewChat,
    handleSelectConversation,
    handleSelectAssistant,
    handleDeleteConversation,
    addUserMessageAndGetConversationId,
  }
}
