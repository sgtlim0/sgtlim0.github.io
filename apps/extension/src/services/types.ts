import type { AnalysisMode } from '../types'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode?: AnalysisMode
  timestamp: number
}

export interface ExtensionChatService {
  sendMessage(
    conversationId: string,
    content: string,
    onChunk: (chunk: import('../types').StreamChunk) => void,
    signal?: AbortSignal,
  ): Promise<void>
  getConversations(): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | null>
  createConversation(title: string): Promise<Conversation>
  deleteConversation(id: string): Promise<void>
}

export interface ExtensionAnalyzeService {
  analyze(
    request: import('../types').AnalyzeRequest,
    onChunk: (chunk: import('../types').StreamChunk) => void,
    signal?: AbortSignal,
  ): Promise<void>
}
