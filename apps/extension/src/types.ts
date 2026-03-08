export interface ExtensionContext {
  text: string
  url: string
  title: string
  mode: 'summarize' | 'explain' | 'research' | 'translate'
}

export interface AnalyzeRequest {
  text: string
  mode: ExtensionContext['mode']
  url?: string
  title?: string
}

export interface AnalyzeResponse {
  result: string
  mode: ExtensionContext['mode']
}

export type MessageAction = 'EXTRACT_TEXT' | 'ANALYZE' | 'SET_CONTEXT'

export interface ExtensionMessage {
  action: MessageAction
  payload?: ExtensionContext | AnalyzeRequest | string
}
