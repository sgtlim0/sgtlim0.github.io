import { describe, it, expect } from 'vitest'
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
  it('should return rooms', async () => {
    const rooms = await getRooms()
    expect(rooms.length).toBe(3)
    expect(rooms[0].name).toBe('AI 프로젝트')
  })

  it('should get room by id', async () => {
    const room = await getRoomById('room-1')
    expect(room).not.toBeNull()
    expect(room!.members.length).toBeGreaterThan(0)
  })

  it('should return null for invalid room', async () => {
    const room = await getRoomById('nonexistent')
    expect(room).toBeNull()
  })

  it('should create a room', async () => {
    const room = await createRoom('새 채팅방', '테스트', 'group', ['u1', 'u2'])
    expect(room.name).toBe('새 채팅방')
    expect(room.type).toBe('group')
    expect(room.unreadCount).toBe(0)
  })

  it('should get messages for room', async () => {
    const messages = await getMessages('room-1')
    expect(messages.length).toBeGreaterThan(0)
    messages.forEach((m) => {
      expect(m.roomId).toBe('room-1')
    })
  })

  it('should send a message', async () => {
    const msg = await sendMessage('room-1', '안녕하세요!', ['u2'])
    expect(msg.content).toBe('안녕하세요!')
    expect(msg.mentions).toContain('u2')
    expect(msg.roomId).toBe('room-1')
  })

  it('should add reaction', async () => {
    const result = await addReaction('m1', '👍')
    expect(result).toBe(true)
  })

  it('should get thread messages', async () => {
    const thread = await getThreadMessages('m1')
    expect(thread.length).toBeGreaterThan(0)
    thread.forEach((m) => {
      expect(m.threadId).toBe('m1')
    })
  })

  it('should search messages', async () => {
    const results = await searchMessages('room-1', '벤치마크')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should return empty for no search match', async () => {
    const results = await searchMessages('room-1', 'xyznonexistent')
    expect(results.length).toBe(0)
  })
})
