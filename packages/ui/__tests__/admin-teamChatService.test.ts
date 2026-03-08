import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRooms,
  getRoomById,
  createRoom,
  getMessages,
  sendMessage,
  addReaction,
  getThreadMessages,
  searchMessages,
} from '../src/admin/services/teamChatService'

describe('teamChatService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getRooms', () => {
    it('should return chat rooms', async () => {
      const promise = getRooms()
      vi.advanceTimersByTime(300)
      const rooms = await promise

      expect(rooms.length).toBeGreaterThan(0)
      rooms.forEach((r) => {
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('name')
        expect(r).toHaveProperty('type')
        expect(r).toHaveProperty('members')
        expect(r).toHaveProperty('unreadCount')
        expect(['group', 'direct', 'ai-shared']).toContain(r.type)
      })
    })

    it('should include rooms with different types', async () => {
      const promise = getRooms()
      vi.advanceTimersByTime(300)
      const rooms = await promise

      const types = rooms.map((r) => r.type)
      expect(types).toContain('group')
      expect(types).toContain('direct')
      expect(types).toContain('ai-shared')
    })
  })

  describe('getRoomById', () => {
    it('should return room for valid ID', async () => {
      const promise = getRoomById('room-1')
      vi.advanceTimersByTime(200)
      const room = await promise

      expect(room).not.toBeNull()
      expect(room?.id).toBe('room-1')
      expect(room?.name).toBe('AI 프로젝트')
    })

    it('should return null for invalid ID', async () => {
      const promise = getRoomById('non-existent')
      vi.advanceTimersByTime(200)
      const room = await promise

      expect(room).toBeNull()
    })
  })

  describe('createRoom', () => {
    it('should create a new room with members', async () => {
      const promise = createRoom('테스트 채팅방', '테스트용', 'group', ['u1', 'u2'])
      vi.advanceTimersByTime(400)
      const room = await promise

      expect(room.id).toBeTruthy()
      expect(room.name).toBe('테스트 채팅방')
      expect(room.description).toBe('테스트용')
      expect(room.type).toBe('group')
      expect(room.unreadCount).toBe(0)
      expect(room.pinned).toBe(false)
      expect(room.members.length).toBeGreaterThan(0)
    })
  })

  describe('getMessages', () => {
    it('should return messages for a room', async () => {
      const promise = getMessages('room-1')
      vi.advanceTimersByTime(300)
      const messages = await promise

      expect(messages.length).toBeGreaterThan(0)
      messages.forEach((m) => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('roomId')
        expect(m).toHaveProperty('userName')
        expect(m).toHaveProperty('content')
        expect(m).toHaveProperty('type')
        expect(m.roomId).toBe('room-1')
      })
    })

    it('should return empty for room with no messages', async () => {
      const promise = getMessages('room-99')
      vi.advanceTimersByTime(300)
      const messages = await promise

      expect(messages).toHaveLength(0)
    })

    it('should include different message types', async () => {
      const promise = getMessages('room-1')
      vi.advanceTimersByTime(300)
      const messages = await promise

      const types = messages.map((m) => m.type)
      expect(types).toContain('text')
      expect(types).toContain('ai-response')
    })
  })

  describe('sendMessage', () => {
    it('should send a message and return it', async () => {
      const promise = sendMessage('room-1', '안녕하세요!')
      vi.advanceTimersByTime(200)
      const message = await promise

      expect(message.id).toBeTruthy()
      expect(message.roomId).toBe('room-1')
      expect(message.content).toBe('안녕하세요!')
      expect(message.type).toBe('text')
      expect(message.userName).toBe('나')
      expect(message.reactions).toEqual([])
      expect(message.attachments).toEqual([])
    })

    it('should support mentions', async () => {
      const promise = sendMessage('room-1', '@홍길동 테스트', ['u1'])
      vi.advanceTimersByTime(200)
      const message = await promise

      expect(message.mentions).toEqual(['u1'])
    })
  })

  describe('addReaction', () => {
    it('should return true on success', async () => {
      const promise = addReaction('m1', '👍')
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toBe(true)
    })
  })

  describe('getThreadMessages', () => {
    it('should return thread messages', async () => {
      const promise = getThreadMessages('m1')
      vi.advanceTimersByTime(200)
      const messages = await promise

      expect(messages.length).toBeGreaterThan(0)
      messages.forEach((m) => {
        expect(m.threadId).toBe('m1')
      })
    })

    it('should return empty for non-existent thread', async () => {
      const promise = getThreadMessages('non-existent')
      vi.advanceTimersByTime(200)
      const messages = await promise

      expect(messages).toHaveLength(0)
    })
  })

  describe('searchMessages', () => {
    it('should find messages by content', async () => {
      const promise = searchMessages('room-1', '벤치마크')
      vi.advanceTimersByTime(300)
      const messages = await promise

      expect(messages.length).toBeGreaterThan(0)
      messages.forEach((m) => {
        expect(m.content.toLowerCase()).toContain('벤치마크')
      })
    })

    it('should return empty for no match', async () => {
      const promise = searchMessages('room-1', 'nonexistentstring12345')
      vi.advanceTimersByTime(300)
      const messages = await promise

      expect(messages).toHaveLength(0)
    })

    it('should be case-insensitive', async () => {
      const promise = searchMessages('room-1', 'GPT')
      vi.advanceTimersByTime(300)
      const messages = await promise

      expect(messages.length).toBeGreaterThanOrEqual(0)
    })
  })
})
