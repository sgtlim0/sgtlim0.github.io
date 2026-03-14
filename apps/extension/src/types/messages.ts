export type MessageAction =
  | 'EXTRACT_TEXT'
  | 'ANALYZE'
  | 'SET_CONTEXT'
  | 'CLEAR_CONTEXT'
  | 'GET_SETTINGS'
  | 'SET_SETTINGS'
  | 'OPEN_SIDEPANEL'

export interface ExtensionMessage<T = unknown> {
  action: MessageAction
  payload?: T
  requestId?: string
}

export interface ExtensionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
