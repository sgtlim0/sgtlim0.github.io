import type {
  ExtensionChatService,
  ExtensionAnalyzeService,
  Conversation,
  ChatMessage,
} from './types'
import type { AnalyzeRequest, StreamChunk, AnalysisMode } from '../types'

const MOCK_RESPONSES: Record<AnalysisMode, string> = {
  summarize:
    'H Chat은 현대차그룹 임직원용 생성형 AI 서비스로, 다수의 LLM 모델을 통합하여 업무 효율성을 향상시키는 기업용 AI 플랫폼입니다.',
  explain:
    'H Chat은 기업 내부에서 안전하게 사용할 수 있는 AI 챗봇 서비스입니다. OpenAI, Anthropic 등 다양한 제공자의 모델을 LLM 라우터를 통해 적절히 분배하며, 문서 요약, 코드 생성, 번역 등 다양한 업무에 활용할 수 있습니다.',
  research:
    '관련 분석: H Chat은 2024년 출시된 기업용 AI 서비스로, 글로벌 자동차 그룹 중 최초로 멀티 LLM 라우팅 기술을 도입했습니다. 주요 경쟁 서비스로는 Samsung Gauss, LG Exaone 등이 있습니다.',
  translate:
    'H Chat is a generative AI service for Hyundai Motor Group employees. It maximizes work efficiency by utilizing various LLM models.',
}

function simulateStreamingText(
  text: string,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const words = text.split(' ')
    let index = 0

    const intervalId = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(intervalId)
        reject(new Error('Aborted'))
        return
      }

      if (index >= words.length) {
        clearInterval(intervalId)
        onChunk({ type: 'done', content: '' })
        resolve()
        return
      }

      const word = words[index]
      onChunk({
        type: 'chunk',
        content: index === 0 ? word : ` ${word}`,
      })
      index++
    }, 50)
  })
}

export function createMockChatService(): ExtensionChatService {
  const conversations = new Map<string, Conversation>()

  return {
    async sendMessage(
      conversationId: string,
      content: string,
      onChunk: (chunk: StreamChunk) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const conversation = conversations.get(conversationId)
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`)
      }

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      conversation.messages = [...conversation.messages, userMessage]

      const mockResponse = '안녕하세요. H Chat AI 비서입니다. 무엇을 도와드릴까요?'

      await simulateStreamingText(mockResponse, onChunk, signal)

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: mockResponse,
        timestamp: Date.now(),
      }

      conversation.messages = [...conversation.messages, assistantMessage]
      conversation.updatedAt = Date.now()
      conversations.set(conversationId, conversation)
    },

    async getConversations(): Promise<Conversation[]> {
      return Array.from(conversations.values()).sort((a, b) => b.updatedAt - a.updatedAt)
    },

    async getConversation(id: string): Promise<Conversation | null> {
      return conversations.get(id) ?? null
    },

    async createConversation(title: string): Promise<Conversation> {
      const conversation: Conversation = {
        id: `conv-${Date.now()}`,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      conversations.set(conversation.id, conversation)
      return conversation
    },

    async deleteConversation(id: string): Promise<void> {
      conversations.delete(id)
    },
  }
}

export function createMockAnalyzeService(): ExtensionAnalyzeService {
  return {
    async analyze(
      request: AnalyzeRequest,
      onChunk: (chunk: StreamChunk) => void,
      signal?: AbortSignal,
    ): Promise<void> {
      const responseText = MOCK_RESPONSES[request.mode]
      await simulateStreamingText(responseText, onChunk, signal)
    },
  }
}
