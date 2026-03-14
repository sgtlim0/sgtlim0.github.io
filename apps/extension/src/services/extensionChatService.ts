import type { ExtensionChatService, Conversation } from './types'
import type { StreamChunk } from '../types'
import { getSettings } from '../utils/storage'

async function parseSSEStream(
  response: Response,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel()
        throw new Error('Aborted')
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          onChunk({ type: 'done', content: '' })
          return
        }

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            onChunk({ type: 'chunk', content: parsed.content })
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createRealChatService(): ExtensionChatService {
  const conversationsCache = new Map<string, Conversation>()

  return {
    async sendMessage(
      conversationId: string,
      content: string,
      onChunk: (chunk: StreamChunk) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: content,
        }),
        signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(errorText || `Chat request failed (${response.status})`)
      }

      await parseSSEStream(response, onChunk, signal)
    },

    async getConversations(): Promise<Conversation[]> {
      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/conversations`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations (${response.status})`)
      }

      const data = await response.json()
      const conversations: Conversation[] = data.conversations ?? []
      conversations.forEach((conv) => conversationsCache.set(conv.id, conv))
      return conversations
    },

    async getConversation(id: string): Promise<Conversation | null> {
      if (conversationsCache.has(id)) {
        return conversationsCache.get(id)!
      }

      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/conversations/${id}`, {
        method: 'GET',
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation (${response.status})`)
      }

      const data = await response.json()
      const conversation: Conversation = data.conversation
      conversationsCache.set(conversation.id, conversation)
      return conversation
    },

    async createConversation(title: string): Promise<Conversation> {
      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create conversation (${response.status})`)
      }

      const data = await response.json()
      const conversation: Conversation = data.conversation
      conversationsCache.set(conversation.id, conversation)
      return conversation
    },

    async deleteConversation(id: string): Promise<void> {
      const settings = await getSettings()
      const response = await fetch(`${settings.apiBaseUrl}/api/v1/conversations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete conversation (${response.status})`)
      }

      conversationsCache.delete(id)
    },
  }
}
