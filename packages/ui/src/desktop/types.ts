export interface DesktopChat {
  id: string
  title: string
  model: string
  messages: DesktopMessage[]
  createdAt: number
  updatedAt: number
}

export interface DesktopMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tokens?: number
}

export interface DesktopAgent {
  id: string
  name: string
  description: string
  icon: string
  model: string
  systemPrompt: string
  category: 'general' | 'coding' | 'writing' | 'analysis' | 'creative'
  isActive: boolean
}

export interface DesktopTool {
  id: string
  name: string
  description: string
  icon: string
  category: 'image' | 'code' | 'text' | 'data' | 'search'
  isAvailable: boolean
}

export interface SwarmAgent {
  id: string
  name: string
  role: string
  model: string
  status: 'idle' | 'thinking' | 'responding' | 'done'
  avatar: string
}

export interface DebateParticipant {
  id: string
  name: string
  position: 'for' | 'against' | 'moderator'
  model: string
  avatar: string
}

export interface DebateMessage {
  participantId: string
  content: string
  round: number
}
