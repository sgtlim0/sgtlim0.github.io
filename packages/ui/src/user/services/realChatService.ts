import type { Conversation, ChatMessage } from './types'
import type { ApiClient } from '../../client/apiClient'
import { getApiClient } from '../../client/serviceFactory'
import { conversationsResponseSchema } from '../../schemas/user'

export class RealChatService {
  private client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await this.client.get<Conversation[]>('/conversations')
      return conversationsResponseSchema.parse(data)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '대화 목록을 불러오는데 실패했습니다.',
      )
    }
  }

  async saveConversation(conversation: Conversation): Promise<Conversation> {
    try {
      return await this.client.put<Conversation>(
        `/conversations/${conversation.id}`,
        conversation,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '대화 저장에 실패했습니다.',
      )
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await this.client.delete(`/conversations/${id}`)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '대화 삭제에 실패했습니다.',
      )
    }
  }

  async createConversation(
    assistantId: string,
    title: string,
  ): Promise<Conversation> {
    try {
      return await this.client.post<Conversation>('/conversations', {
        assistantId,
        title,
      })
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '새 대화 생성에 실패했습니다.',
      )
    }
  }

  async addMessage(
    conversationId: string,
    message: ChatMessage,
  ): Promise<Conversation> {
    try {
      return await this.client.post<Conversation>(
        `/conversations/${conversationId}/messages`,
        message,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '메시지 전송에 실패했습니다.',
      )
    }
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.client.get<Conversation[]>(
        `/conversations/search?q=${encodedQuery}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '대화 검색에 실패했습니다.',
      )
    }
  }
}

export function createRealChatService(): RealChatService {
  return new RealChatService(getApiClient())
}
