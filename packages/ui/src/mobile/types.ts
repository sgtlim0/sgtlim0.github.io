export type MobileTab = 'chat' | 'assistants' | 'history' | 'settings'

export interface MobileChat {
  id: string
  title: string
  lastMessage: string
  model: string
  timestamp: number
  unread: boolean
}

export type AssistantCategory = '전체' | '일반' | '코딩' | '글쓰기' | '번역' | '분석'

export interface MobileAssistant {
  id: string
  name: string
  description: string
  category: string
  icon: string
  isFavorite: boolean
  model?: string
}

export interface MobileChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type MobileSettingType = 'toggle' | 'select' | 'link'

export interface MobileSetting {
  id: string
  section: string
  label: string
  type: MobileSettingType
  value?: boolean | string
  description?: string
  options?: string[]
}

export interface MobileNotification {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: 'system' | 'chat' | 'update'
}
