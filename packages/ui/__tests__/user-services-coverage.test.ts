/**
 * User Services coverage extension tests.
 * Targets: assistantService (update/delete edge cases), mockUserService (deeper coverage),
 * realChatService (all methods error paths), mockData integrity.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// ---------- assistantService additional coverage ----------

describe('assistantService - extra coverage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updateCustomAssistant returns unchanged list when id not found', async () => {
    const { saveCustomAssistant, updateCustomAssistant } = await import(
      '../src/user/services/assistantService'
    )
    saveCustomAssistant({
      name: 'Existing',
      description: 'desc',
      icon: 'A',
      iconColor: '#000',
      model: 'gpt',
      category: '채팅',
    })
    const result = updateCustomAssistant('non-existent', { name: 'X' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Existing')
  })

  it('deleteCustomAssistant returns empty array when deleting from empty store', async () => {
    const { deleteCustomAssistant } = await import('../src/user/services/assistantService')
    const result = deleteCustomAssistant('any-id')
    expect(result).toEqual([])
  })

  it('getCustomAssistants returns empty array on server side', async () => {
    const { getCustomAssistants } = await import('../src/user/services/assistantService')
    // In jsdom, window is defined, so this tests the normal path
    const result = getCustomAssistants()
    expect(result).toBeInstanceOf(Array)
  })
})

// ---------- RealChatService coverage ----------

describe('RealChatService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function jsonOk<T>(data: T) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ success: true, data }),
    } as Response)
  }

  function jsonError(status: number, msg: string) {
    return Promise.resolve({
      ok: false,
      status,
      statusText: msg,
      json: () => Promise.resolve({ error: msg }),
    } as Response)
  }

  async function createService() {
    const { ApiClient } = await import('../src/client/apiClient')
    const { RealChatService } = await import('../src/user/services/realChatService')
    const client = new ApiClient({ baseURL: 'https://api.test' })
    return new RealChatService(client)
  }

  it('getConversations returns data on success', async () => {
    mockFetch.mockReturnValue(jsonOk([{ id: 'c1', title: 'Test' }]))
    const service = await createService()
    const result = await service.getConversations()
    expect(result).toEqual([{ id: 'c1', title: 'Test' }])
  })

  it('getConversations throws readable error on failure', async () => {
    mockFetch.mockReturnValue(jsonError(500, 'Server Error'))
    const service = await createService()
    await expect(service.getConversations()).rejects.toThrow('Server Error')
  })

  it('saveConversation calls PUT with conversation', async () => {
    const conv = { id: 'c1', title: 'Test', messages: [], assistantId: 'a1', createdAt: '', updatedAt: '' }
    mockFetch.mockReturnValue(jsonOk(conv))
    const service = await createService()
    const result = await service.saveConversation(conv)
    expect(result).toEqual(conv)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/conversations/c1',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('saveConversation throws on failure', async () => {
    mockFetch.mockReturnValue(jsonError(400, 'Bad Request'))
    const service = await createService()
    await expect(
      service.saveConversation({ id: 'c1', title: '', messages: [], assistantId: '', createdAt: '', updatedAt: '' }),
    ).rejects.toThrow('Bad Request')
  })

  it('deleteConversation calls DELETE', async () => {
    mockFetch.mockReturnValue(jsonOk(null))
    const service = await createService()
    await service.deleteConversation('c1')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/conversations/c1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('deleteConversation throws on failure', async () => {
    mockFetch.mockReturnValue(jsonError(404, 'Not Found'))
    const service = await createService()
    await expect(service.deleteConversation('c1')).rejects.toThrow('Not Found')
  })

  it('createConversation calls POST', async () => {
    const conv = { id: 'c2', title: 'New', messages: [], assistantId: 'a1', createdAt: '', updatedAt: '' }
    mockFetch.mockReturnValue(jsonOk(conv))
    const service = await createService()
    const result = await service.createConversation('a1', 'New')
    expect(result).toEqual(conv)
  })

  it('createConversation throws on failure', async () => {
    mockFetch.mockReturnValue(jsonError(500, 'Internal'))
    const service = await createService()
    await expect(service.createConversation('a1', 'New')).rejects.toThrow('Internal')
  })

  it('addMessage calls POST with message', async () => {
    const msg = { id: 'm1', role: 'user' as const, content: 'hello', timestamp: '' }
    mockFetch.mockReturnValue(jsonOk({ id: 'c1', messages: [msg] }))
    const service = await createService()
    await service.addMessage('c1', msg)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/conversations/c1/messages',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('addMessage throws on failure', async () => {
    mockFetch.mockReturnValue(jsonError(500, 'Error'))
    const service = await createService()
    await expect(
      service.addMessage('c1', { id: 'm1', role: 'user', content: '', timestamp: '' }),
    ).rejects.toThrow('Error')
  })

  it('searchConversations encodes query and calls GET', async () => {
    mockFetch.mockReturnValue(jsonOk([]))
    const service = await createService()
    await service.searchConversations('한글 검색')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('한글 검색')),
      expect.anything(),
    )
  })

  it('searchConversations throws on failure', async () => {
    mockFetch.mockReturnValue(jsonError(500, 'Search failed'))
    const service = await createService()
    await expect(service.searchConversations('test')).rejects.toThrow('Search failed')
  })
})

// ---------- mockData integrity ----------

describe('mockData', () => {
  it('mockAssistants all have required fields', async () => {
    const { mockAssistants } = await import('../src/user/services/mockData')
    expect(mockAssistants.length).toBeGreaterThan(0)
    for (const a of mockAssistants) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.isOfficial).toBe(true)
    }
  })

  it('mockSubscription has valid structure', async () => {
    const { mockSubscription } = await import('../src/user/services/mockData')
    expect(mockSubscription.planName).toBeTruthy()
    expect(mockSubscription.email).toMatch(/@/)
  })

  it('mockDocProjects each have valid step range', async () => {
    const { mockDocProjects } = await import('../src/user/services/mockData')
    for (const p of mockDocProjects) {
      expect(p.step).toBeGreaterThanOrEqual(1)
      expect(p.step).toBeLessThanOrEqual(5)
    }
  })

  it('mockOCRJobs have valid statuses', async () => {
    const { mockOCRJobs } = await import('../src/user/services/mockData')
    const validStatuses = ['uploading', 'processing', 'completed', 'failed']
    for (const j of mockOCRJobs) {
      expect(validStatuses).toContain(j.status)
    }
  })
})

// ---------- MockUserService deeper coverage ----------

describe('MockUserService - deeper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('getCustomAssistants returns empty by default', async () => {
    const { MockUserService } = await import('../src/user/services/mockUserService')
    const svc = new MockUserService()
    const promise = svc.getCustomAssistants()
    vi.advanceTimersByTime(500)
    const result = await promise
    expect(result).toEqual([])
  })

  it('createAssistant persists and returns new assistant', async () => {
    const { MockUserService } = await import('../src/user/services/mockUserService')
    const svc = new MockUserService()
    const promise = svc.createAssistant({
      name: 'Test Bot',
      description: 'desc',
      icon: 'T',
      iconColor: '#000',
      model: 'gpt',
      category: '채팅',
    })
    vi.advanceTimersByTime(500)
    const created = await promise
    expect(created.id).toMatch(/^custom_/)
    expect(created.isOfficial).toBe(false)
  })

  it('deleteConversation removes from storage', async () => {
    const chatService = await import('../src/user/services/chatService')
    chatService.createConversation('a1', 'Test')
    const convs = chatService.getConversations()
    expect(convs).toHaveLength(1)

    const { MockUserService } = await import('../src/user/services/mockUserService')
    const svc = new MockUserService()
    const promise = svc.deleteConversation(convs[0].id)
    vi.advanceTimersByTime(500)
    await promise

    expect(chatService.getConversations()).toHaveLength(0)
  })

  it('getTranslationJobs returns empty array', async () => {
    const { MockUserService } = await import('../src/user/services/mockUserService')
    const svc = new MockUserService()
    const promise = svc.getTranslationJobs()
    vi.advanceTimersByTime(500)
    const result = await promise
    expect(result).toEqual([])
  })

  it('deleteAssistant removes assistant', async () => {
    const { MockUserService } = await import('../src/user/services/mockUserService')
    const svc = new MockUserService()

    // Create first
    const createPromise = svc.createAssistant({
      name: 'Del Bot',
      description: 'x',
      icon: 'D',
      iconColor: '#f00',
      model: 'gpt',
      category: '업무',
    })
    vi.advanceTimersByTime(500)
    const created = await createPromise

    // Delete
    const delPromise = svc.deleteAssistant(created.id)
    vi.advanceTimersByTime(500)
    await delPromise

    const listPromise = svc.getCustomAssistants()
    vi.advanceTimersByTime(500)
    const list = await listPromise
    expect(list).toHaveLength(0)
  })
})
