// AI 비서
export interface Assistant {
  id: string
  name: string
  icon: string
  iconColor: string
  model: string
  description: string
  category: AssistantCategory
  isOfficial: boolean
}

export type AssistantCategory =
  | '전체'
  | '채팅'
  | '업무'
  | '번역'
  | '정리'
  | '보고'
  | '그림'
  | '글쓰기'

// 번역
export type TranslationEngine = 'internal' | 'deepl'

export interface TranslationJob {
  id: string
  fileName: string
  engine: TranslationEngine
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  resultUrl?: string
  createdAt: string
}

// 문서 작성
export interface DocProject {
  id: string
  name: string
  docType: 'HWP' | 'DOCX'
  lastModified: string
  step: 1 | 2 | 3 | 4 | 5
}

// OCR
export interface OCRJob {
  id: string
  fileName: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  resultUrl?: string
}

// 사용량
export interface ModelUsage {
  modelName: string
  currentUsage: string
  cost: number
}

export interface Subscription {
  planName: string
  planType: string
  renewalDate: string
  email: string
}

// 대화
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sessionId?: string
  assistantId?: string
  mode?: 'chat' | 'research'
  sources?: Array<{ title: string; url: string; snippet?: string }>
  compressionStats?: { originalTokens: number; compressedTokens: number; reductionPct: number }
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  assistantId: string
  createdAt: string
  updatedAt: string
}
