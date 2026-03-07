/**
 * Team Collaboration Chat types
 */

export interface ChatRoom {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly type: 'group' | 'direct' | 'ai-shared'
  readonly members: ChatMember[]
  readonly createdAt: string
  readonly lastMessageAt: string
  readonly unreadCount: number
  readonly pinned: boolean
}

export interface ChatMember {
  readonly userId: string
  readonly name: string
  readonly avatar?: string
  readonly role: 'owner' | 'admin' | 'member'
  readonly status: 'online' | 'offline' | 'away'
  readonly joinedAt: string
}

export interface TeamMessage {
  readonly id: string
  readonly roomId: string
  readonly userId: string
  readonly userName: string
  readonly content: string
  readonly type: 'text' | 'file' | 'ai-response' | 'system'
  readonly threadId?: string
  readonly mentions: string[]
  readonly reactions: Reaction[]
  readonly attachments: Attachment[]
  readonly createdAt: string
  readonly editedAt?: string
}

export interface Reaction {
  readonly emoji: string
  readonly userIds: string[]
}

export interface Attachment {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly size: number
  readonly url: string
}

export interface ThreadSummary {
  readonly threadId: string
  readonly messageCount: number
  readonly lastReplyAt: string
  readonly participants: string[]
}
