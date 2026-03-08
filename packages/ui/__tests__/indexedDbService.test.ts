import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import FDBFactory from 'fake-indexeddb/lib/FDBFactory'
import type { Conversation } from '../src/user/services/types'

function createConversation(id: string, updatedAt: string): Conversation {
  return {
    id,
    title: `Conv ${id}`,
    messages: [],
    assistantId: 'ast-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
  }
}

async function loadModule() {
  return await import('../src/user/services/indexedDbService')
}

describe('indexedDbService', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    globalThis.indexedDB = new FDBFactory()
  })

  describe('CRUD', () => {
    it('빈 DB에서 getAllConversations 호출 시 빈 배열 반환', async () => {
      const mod = await loadModule()
      const result = await mod.getAllConversations()
      expect(result).toEqual([])
    })

    it('saveConversation 후 getAllConversations 호출 시 1개 반환', async () => {
      const mod = await loadModule()
      const conv = createConversation('c1', '2026-01-01T00:00:00.000Z')

      await mod.saveConversation(conv)
      const result = await mod.getAllConversations()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(conv)
    })

    it('saveAllConversations로 여러 대화 저장', async () => {
      const mod = await loadModule()
      const convs = [
        createConversation('c1', '2026-01-01T00:00:00.000Z'),
        createConversation('c2', '2026-01-02T00:00:00.000Z'),
        createConversation('c3', '2026-01-03T00:00:00.000Z'),
      ]

      await mod.saveAllConversations(convs)
      const result = await mod.getAllConversations()

      expect(result).toHaveLength(3)
    })

    it('saveAllConversations 호출 시 기존 데이터 교체', async () => {
      const mod = await loadModule()
      const old = [
        createConversation('old-1', '2026-01-01T00:00:00.000Z'),
        createConversation('old-2', '2026-01-02T00:00:00.000Z'),
      ]
      await mod.saveAllConversations(old)

      const newer = [createConversation('new-1', '2026-02-01T00:00:00.000Z')]
      await mod.saveAllConversations(newer)

      const result = await mod.getAllConversations()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('new-1')
    })

    it('getConversationById로 존재하는 ID 조회', async () => {
      const mod = await loadModule()
      const conv = createConversation('c1', '2026-01-01T00:00:00.000Z')
      await mod.saveConversation(conv)

      const result = await mod.getConversationById('c1')
      expect(result).toEqual(conv)
    })

    it('getConversationById로 없는 ID 조회 시 undefined 반환', async () => {
      const mod = await loadModule()

      const result = await mod.getConversationById('nonexistent')
      expect(result).toBeUndefined()
    })

    it('deleteConversationById로 대화 삭제', async () => {
      const mod = await loadModule()
      const conv = createConversation('c1', '2026-01-01T00:00:00.000Z')
      await mod.saveConversation(conv)

      await mod.deleteConversationById('c1')
      const result = await mod.getConversationById('c1')

      expect(result).toBeUndefined()
    })

    it('getAllConversations는 updatedAt 역순 정렬 반환', async () => {
      const mod = await loadModule()
      const convs = [
        createConversation('c1', '2026-01-01T00:00:00.000Z'),
        createConversation('c3', '2026-01-03T00:00:00.000Z'),
        createConversation('c2', '2026-01-02T00:00:00.000Z'),
      ]
      await mod.saveAllConversations(convs)

      const result = await mod.getAllConversations()

      expect(result[0].id).toBe('c3')
      expect(result[1].id).toBe('c2')
      expect(result[2].id).toBe('c1')
    })

    it('saveConversation으로 기존 대화 업데이트 (같은 ID)', async () => {
      const mod = await loadModule()
      const conv = createConversation('c1', '2026-01-01T00:00:00.000Z')
      await mod.saveConversation(conv)

      const updated: Conversation = {
        ...conv,
        title: '수정된 제목',
        updatedAt: '2026-02-01T00:00:00.000Z',
      }
      await mod.saveConversation(updated)

      const result = await mod.getAllConversations()
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('수정된 제목')
      expect(result[0].updatedAt).toBe('2026-02-01T00:00:00.000Z')
    })
  })

  describe('마이그레이션', () => {
    it('localStorage 데이터를 IndexedDB로 이전', async () => {
      const convs = [
        createConversation('c1', '2026-01-01T00:00:00.000Z'),
        createConversation('c2', '2026-01-02T00:00:00.000Z'),
      ]
      localStorage.setItem('hchat-conversations', JSON.stringify(convs))

      const mod = await loadModule()
      const result = await mod.migrateFromLocalStorage()

      expect(result).toHaveLength(2)
      expect(localStorage.getItem('hchat-idb-migrated')).toBe('true')

      const stored = await mod.getAllConversations()
      expect(stored).toHaveLength(2)
    })

    it('마이그레이션 플래그가 이미 있으면 IndexedDB에서 읽기', async () => {
      const mod = await loadModule()
      const conv = createConversation('c1', '2026-01-01T00:00:00.000Z')
      await mod.saveConversation(conv)
      localStorage.setItem('hchat-idb-migrated', 'true')
      localStorage.setItem(
        'hchat-conversations',
        JSON.stringify([createConversation('ls-1', '2026-03-01T00:00:00.000Z')]),
      )

      const result = await mod.migrateFromLocalStorage()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('c1')
    })

    it('IndexedDB에 이미 데이터가 있으면 마이그레이션 스킵', async () => {
      const mod = await loadModule()
      const existingConv = createConversation('existing', '2026-01-01T00:00:00.000Z')
      await mod.saveConversation(existingConv)

      localStorage.setItem(
        'hchat-conversations',
        JSON.stringify([createConversation('ls-1', '2026-03-01T00:00:00.000Z')]),
      )

      const result = await mod.migrateFromLocalStorage()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('existing')
      expect(localStorage.getItem('hchat-idb-migrated')).toBe('true')
    })

    it('localStorage가 비어있으면 빈 배열 반환', async () => {
      const mod = await loadModule()

      const result = await mod.migrateFromLocalStorage()

      expect(result).toEqual([])
      expect(localStorage.getItem('hchat-idb-migrated')).toBe('true')
    })

    it('localStorage JSON 파싱 실패 시 빈 배열 반환', async () => {
      localStorage.setItem('hchat-conversations', '{invalid json!!!')

      const mod = await loadModule()
      const result = await mod.migrateFromLocalStorage()

      expect(result).toEqual([])
      expect(localStorage.getItem('hchat-idb-migrated')).toBe('true')
    })
  })

  describe('엣지 케이스', () => {
    it('메시지가 있는 대화 저장/조회 시 데이터 무결성 유지', async () => {
      const mod = await loadModule()
      const conv: Conversation = {
        id: 'c-msg',
        title: '메시지 테스트',
        messages: [
          {
            id: 'm1',
            role: 'user',
            content: '안녕하세요',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 'm2',
            role: 'assistant',
            content: '반갑습니다!',
            timestamp: '2026-01-01T00:00:01.000Z',
            assistantId: 'ast-1',
          },
        ],
        assistantId: 'ast-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:01.000Z',
      }

      await mod.saveConversation(conv)
      const result = await mod.getConversationById('c-msg')

      expect(result).toBeDefined()
      expect(result!.messages).toHaveLength(2)
      expect(result!.messages[0].content).toBe('안녕하세요')
      expect(result!.messages[1].content).toBe('반갑습니다!')
      expect(result!.messages[0].role).toBe('user')
      expect(result!.messages[1].role).toBe('assistant')
    })

    it('여러 대화 삭제 후 남은 대화 확인', async () => {
      const mod = await loadModule()
      const convs = [
        createConversation('c1', '2026-01-01T00:00:00.000Z'),
        createConversation('c2', '2026-01-02T00:00:00.000Z'),
        createConversation('c3', '2026-01-03T00:00:00.000Z'),
        createConversation('c4', '2026-01-04T00:00:00.000Z'),
      ]
      await mod.saveAllConversations(convs)

      await mod.deleteConversationById('c1')
      await mod.deleteConversationById('c3')

      const result = await mod.getAllConversations()
      expect(result).toHaveLength(2)

      const ids = result.map((c) => c.id)
      expect(ids).toContain('c2')
      expect(ids).toContain('c4')
      expect(ids).not.toContain('c1')
      expect(ids).not.toContain('c3')
    })
  })
})
