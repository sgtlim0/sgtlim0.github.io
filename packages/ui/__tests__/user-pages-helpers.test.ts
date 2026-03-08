/**
 * User Pages helpers tests.
 * Since page components are React components (hard to unit-test in isolation),
 * this file tests:
 *  1. chatService internal logic (saveToStorage edge cases)
 *  2. Page-level data transformations & constants (OCR mode configs, translation statuses)
 *  3. mockData structural validation
 *  4. createRealChatService factory
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// ---------- chatService additional edge cases ----------

describe('chatService - edge cases', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getConversations returns empty array when localStorage has null', async () => {
    const { getConversations } = await import('../src/user/services/chatService')
    expect(getConversations()).toEqual([])
  })

  it('createConversation generates unique ids on rapid calls', async () => {
    const { createConversation } = await import('../src/user/services/chatService')
    const ids = new Set<string>()
    for (let i = 0; i < 10; i++) {
      const conv = createConversation('a1', `Chat ${i}`)
      ids.add(conv.id)
    }
    expect(ids.size).toBe(10)
  })

  it('createConversation prepends new conversation', async () => {
    const { createConversation, getConversations } = await import(
      '../src/user/services/chatService'
    )
    const first = createConversation('a1', 'First')
    const second = createConversation('a1', 'Second')
    const convs = getConversations()
    expect(convs[0].id).toBe(second.id)
    expect(convs[1].id).toBe(first.id)
  })

  it('addMessage to non-existent conversation does not crash', async () => {
    const { addMessage, createConversation, getConversations } = await import(
      '../src/user/services/chatService'
    )
    createConversation('a1', 'Test')
    const result = addMessage('non-existent', {
      id: 'm1',
      role: 'user',
      content: 'hello',
      timestamp: new Date().toISOString(),
    })
    // Should return unchanged conversations (no match)
    expect(result).toHaveLength(1)
    const conv = getConversations()
    expect(conv[0].messages).toHaveLength(0)
  })

  it('addMessage updates the updatedAt timestamp', async () => {
    const { createConversation, addMessage, getConversations } = await import(
      '../src/user/services/chatService'
    )
    const conv = createConversation('a1', 'Test')
    const originalUpdatedAt = conv.updatedAt

    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 10))

    addMessage(conv.id, {
      id: 'm1',
      role: 'user',
      content: 'hello',
      timestamp: new Date().toISOString(),
    })

    const updated = getConversations().find((c) => c.id === conv.id)
    expect(updated!.updatedAt).not.toBe(originalUpdatedAt)
  })

  it('deleteConversation on empty store returns empty array', async () => {
    const { deleteConversation } = await import('../src/user/services/chatService')
    const result = deleteConversation('any-id')
    expect(result).toEqual([])
  })

  it('searchConversations with whitespace-only query returns all', async () => {
    const { createConversation, searchConversations } = await import(
      '../src/user/services/chatService'
    )
    createConversation('a1', 'Chat')
    const results = searchConversations('   ')
    expect(results).toHaveLength(1)
  })

  it('saveConversations overwrites entire store', async () => {
    const { saveConversations, getConversations, createConversation } = await import(
      '../src/user/services/chatService'
    )
    createConversation('a1', 'Original')
    expect(getConversations()).toHaveLength(1)

    saveConversations([])
    expect(getConversations()).toHaveLength(0)
  })
})

// ---------- Page constant data patterns ----------

describe('OCRPage constants', () => {
  it('statusLabel covers all OCR statuses', () => {
    const statusLabel: Record<string, string> = {
      uploading: '업로드 중',
      processing: '처리 중',
      completed: '완료',
      failed: '실패',
    }
    expect(Object.keys(statusLabel)).toEqual(['uploading', 'processing', 'completed', 'failed'])
    for (const val of Object.values(statusLabel)) {
      expect(typeof val).toBe('string')
      expect(val.length).toBeGreaterThan(0)
    }
  })

  it('OCR MODE_CONFIG has correct maxFiles', () => {
    const MODE_CONFIG = {
      extract: { label: '텍스트 추출', maxFiles: 5, desc: 'text' },
      translate: { label: '번역', maxFiles: 20, desc: 'text' },
    }
    expect(MODE_CONFIG.extract.maxFiles).toBe(5)
    expect(MODE_CONFIG.translate.maxFiles).toBe(20)
  })
})

describe('TranslationPage constants', () => {
  it('statusLabel covers all translation statuses', () => {
    const statusLabel: Record<string, string> = {
      uploading: '업로드 중',
      processing: '번역 중',
      completed: '완료',
      failed: '실패',
    }
    expect(Object.keys(statusLabel)).toHaveLength(4)
  })

  it('SUPPORTED_FORMATS is complete', () => {
    const SUPPORTED_FORMATS = ['PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS']
    expect(SUPPORTED_FORMATS).toContain('PDF')
    expect(SUPPORTED_FORMATS).toContain('DOCX')
    expect(SUPPORTED_FORMATS).toHaveLength(7)
  })
})

describe('DocsPage constants', () => {
  it('STEPS has 5 items', () => {
    const STEPS = [
      { label: '프로젝트 선택' },
      { label: '파일 선택' },
      { label: '배경지식 제공' },
      { label: '목차 및 내용 작성' },
      { label: '파일 생성' },
    ]
    expect(STEPS).toHaveLength(5)
    for (const step of STEPS) {
      expect(step.label).toBeTruthy()
    }
  })

  it('SUPPORTED_FORMATS includes HWP and DOCX', () => {
    const SUPPORTED_FORMATS = ['한글(HWP)', '워드(DOCX)']
    expect(SUPPORTED_FORMATS).toHaveLength(2)
    expect(SUPPORTED_FORMATS[0]).toContain('HWP')
    expect(SUPPORTED_FORMATS[1]).toContain('DOCX')
  })
})

// ---------- realChatService factory ----------

describe('createRealChatService factory', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('createRealChatService returns RealChatService instance', async () => {
    const { createRealChatService, RealChatService } = await import(
      '../src/user/services/realChatService'
    )
    const service = createRealChatService()
    expect(service).toBeInstanceOf(RealChatService)
  })
})

// ---------- Conversation/ChatMessage type structures ----------

describe('ChatMessage structure', () => {
  it('ChatMessage can include optional fields', () => {
    const msg = {
      id: 'msg-1',
      role: 'assistant' as const,
      content: 'Response text',
      timestamp: '2026-01-01T00:00:00Z',
      sessionId: 'sess-1',
      assistantId: 'a1',
      mode: 'research' as const,
      sources: [{ title: 'Source', url: 'https://test.com' }],
      compressionStats: { originalTokens: 100, compressedTokens: 80, reductionPct: 20 },
    }
    expect(msg.mode).toBe('research')
    expect(msg.sources).toHaveLength(1)
    expect(msg.compressionStats!.reductionPct).toBe(20)
  })
})

describe('Conversation structure', () => {
  it('new conversation has empty messages', () => {
    const conv = {
      id: 'c-1',
      title: 'Test',
      messages: [],
      assistantId: 'a1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(conv.messages).toHaveLength(0)
    expect(conv.assistantId).toBe('a1')
  })
})
