export type AnalysisMode = 'summarize' | 'explain' | 'research' | 'translate'

export interface PageContext {
  text: string
  url: string
  title: string
  favicon?: string
  timestamp: number
  sanitized: boolean
}

export interface AnalyzeRequest {
  text: string
  mode: AnalysisMode
  url?: string
  title?: string
  targetLang?: string
}

export interface StreamChunk {
  type: 'token' | 'chunk' | 'done' | 'error'
  content: string
  metadata?: Record<string, unknown>
}
