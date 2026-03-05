/**
 * Type definitions for SSE streaming chat completion
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamingOptions {
  model: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  topP?: number
  onToken?: (token: string) => void
  onComplete?: (result: StreamingResult) => void
  onError?: (error: Error) => void
}

export interface StreamingResult {
  content: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  responseTimeMs: number
  estimatedCostKRW: number
  finishReason: 'stop' | 'length' | 'error'
}

export interface StreamingController {
  abort: () => void
}
