/**
 * Team Chat Service — rooms, messages, threads, mentions
 */

import type { ChatRoom, TeamMessage, ChatMember } from './teamChatTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_MEMBERS: ChatMember[] = [
  { userId: 'u1', name: '홍길동', role: 'owner', status: 'online', joinedAt: '2025-06-01' },
  { userId: 'u2', name: '김철수', role: 'admin', status: 'online', joinedAt: '2025-06-01' },
  { userId: 'u3', name: '이영희', role: 'member', status: 'away', joinedAt: '2025-07-15' },
  { userId: 'u4', name: '박대리', role: 'member', status: 'offline', joinedAt: '2025-08-01' },
]

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    name: 'AI 프로젝트',
    description: 'AI 서비스 개발팀',
    type: 'group',
    members: MOCK_MEMBERS,
    createdAt: '2025-06-01',
    lastMessageAt: '2026-03-07T10:30:00Z',
    unreadCount: 3,
    pinned: true,
  },
  {
    id: 'room-2',
    name: '번역 리뷰',
    description: '번역 결과 공유 및 리뷰',
    type: 'ai-shared',
    members: MOCK_MEMBERS.slice(0, 3),
    createdAt: '2026-01-10',
    lastMessageAt: '2026-03-07T09:15:00Z',
    unreadCount: 0,
    pinned: false,
  },
  {
    id: 'room-3',
    name: '홍길동 × 김철수',
    description: '',
    type: 'direct',
    members: MOCK_MEMBERS.slice(0, 2),
    createdAt: '2025-08-01',
    lastMessageAt: '2026-03-06T18:00:00Z',
    unreadCount: 1,
    pinned: false,
  },
]

const MOCK_MESSAGES: TeamMessage[] = [
  {
    id: 'm1',
    roomId: 'room-1',
    userId: 'u1',
    userName: '홍길동',
    content: 'AI 모델 벤치마크 결과 공유합니다.',
    type: 'text',
    mentions: [],
    reactions: [{ emoji: '👍', userIds: ['u2', 'u3'] }],
    attachments: [],
    createdAt: '2026-03-07T10:30:00Z',
  },
  {
    id: 'm2',
    roomId: 'room-1',
    userId: 'u2',
    userName: '김철수',
    content: '@홍길동 GPT-4o 결과가 인상적이네요!',
    type: 'text',
    threadId: 'm1',
    mentions: ['u1'],
    reactions: [],
    attachments: [],
    createdAt: '2026-03-07T10:35:00Z',
  },
  {
    id: 'm3',
    roomId: 'room-1',
    userId: 'u3',
    userName: '이영희',
    content: '보고서 첨부합니다.',
    type: 'file',
    mentions: [],
    reactions: [],
    attachments: [
      { id: 'a1', name: 'benchmark-report.pdf', type: 'application/pdf', size: 2500000, url: '#' },
    ],
    createdAt: '2026-03-07T10:40:00Z',
  },
  {
    id: 'm4',
    roomId: 'room-1',
    userId: 'ai',
    userName: 'H Chat AI',
    content: '벤치마크 결과 요약: GPT-4o가 품질 92점으로 1위입니다.',
    type: 'ai-response',
    mentions: [],
    reactions: [{ emoji: '🤖', userIds: ['u1'] }],
    attachments: [],
    createdAt: '2026-03-07T10:42:00Z',
  },
]

export async function getRooms(): Promise<ChatRoom[]> {
  await delay(200)
  return MOCK_ROOMS
}

export async function getRoomById(id: string): Promise<ChatRoom | null> {
  await delay(100)
  return MOCK_ROOMS.find((r) => r.id === id) ?? null
}

export async function createRoom(
  name: string,
  description: string,
  type: ChatRoom['type'],
  memberIds: string[],
): Promise<ChatRoom> {
  await delay(300)
  return {
    id: `room-${Date.now()}`,
    name,
    description,
    type,
    members: MOCK_MEMBERS.filter((m) => memberIds.includes(m.userId)),
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    pinned: false,
  }
}

export async function getMessages(roomId: string, limit: number = 50): Promise<TeamMessage[]> {
  await delay(200)
  return MOCK_MESSAGES.filter((m) => m.roomId === roomId).slice(0, limit)
}

export async function sendMessage(
  roomId: string,
  content: string,
  mentions: string[] = [],
): Promise<TeamMessage> {
  await delay(150)
  return {
    id: `m-${Date.now()}`,
    roomId,
    userId: 'current-user',
    userName: '나',
    content,
    type: 'text',
    mentions,
    reactions: [],
    attachments: [],
    createdAt: new Date().toISOString(),
  }
}

export async function addReaction(messageId: string, emoji: string): Promise<boolean> {
  await delay(100)
  return true
}

export async function getThreadMessages(threadId: string): Promise<TeamMessage[]> {
  await delay(150)
  return MOCK_MESSAGES.filter((m) => m.threadId === threadId)
}

export async function searchMessages(roomId: string, query: string): Promise<TeamMessage[]> {
  await delay(200)
  const q = query.toLowerCase()
  return MOCK_MESSAGES.filter((m) => m.roomId === roomId && m.content.toLowerCase().includes(q))
}
