import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiClient, ApiSdkError } from '../src/client/apiSdk'
import type { HChatApiClient } from '../src/client/apiSdk'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function wrappedResponse<T>(data: T, status = 200): Response {
  return jsonResponse({ success: true, data }, status)
}

function errorResponse(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function sseResponse(chunks: string[]): Response {
  const body = chunks.join('')
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('createApiClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let client: HChatApiClient

  beforeEach(() => {
    mockFetch = vi.fn()
    client = createApiClient({
      baseUrl: 'http://localhost:3003',
      fetch: mockFetch,
    })
  })

  // ─────────────────────────────────────────
  // Factory
  // ─────────────────────────────────────────

  it('creates a client with all namespaces', () => {
    expect(client.chat).toBeDefined()
    expect(client.analyze).toBeDefined()
    expect(client.research).toBeDefined()
    expect(client.health).toBeDefined()
    expect(client.csrf).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.admin).toBeDefined()
    expect(client.enterprise).toBeDefined()
    expect(client.aiEngine).toBeDefined()
    expect(client.collaboration).toBeDefined()
    expect(client.advanced).toBeDefined()
    expect(client.models).toBeDefined()
  })

  // ─────────────────────────────────────────
  // Headers
  // ─────────────────────────────────────────

  it('includes Authorization header when getToken returns a value', async () => {
    const authedClient = createApiClient({
      baseUrl: 'http://localhost:3003',
      getToken: () => 'test-jwt-token',
      fetch: mockFetch,
    })
    mockFetch.mockResolvedValueOnce(wrappedResponse({ status: 'ok' }))

    await authedClient.health.check()

    const [, init] = mockFetch.mock.calls[0]
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer test-jwt-token')
  })

  it('omits Authorization header when getToken returns null', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ status: 'ok' }))

    await client.health.check()

    const [, init] = mockFetch.mock.calls[0]
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('includes X-CSRF-Token header on POST requests', async () => {
    const csrfClient = createApiClient({
      baseUrl: 'http://localhost:3003',
      getCsrfToken: () => 'csrf-abc',
      fetch: mockFetch,
    })
    mockFetch.mockResolvedValueOnce(jsonResponse({ response: 'hi' }))

    await csrfClient.chat.send({ message: 'hello' })

    const [, init] = mockFetch.mock.calls[0]
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBe('csrf-abc')
  })

  it('omits X-CSRF-Token on GET requests', async () => {
    const csrfClient = createApiClient({
      baseUrl: 'http://localhost:3003',
      getCsrfToken: () => 'csrf-abc',
      fetch: mockFetch,
    })
    mockFetch.mockResolvedValueOnce(wrappedResponse({ status: 'ok' }))

    await csrfClient.health.check()

    const [, init] = mockFetch.mock.calls[0]
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBeUndefined()
  })

  // ─────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────

  it('throws ApiSdkError on HTTP error response', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse('Not found', 404))

    await expect(client.health.check()).rejects.toThrow(ApiSdkError)
    await mockFetch.mockResolvedValueOnce(errorResponse('Not found', 404))
    try {
      await client.health.check()
    } catch (err) {
      expect(err).toBeInstanceOf(ApiSdkError)
      expect((err as ApiSdkError).status).toBe(404)
      expect((err as ApiSdkError).message).toBe('Not found')
    }
  })

  it('throws ApiSdkError on wrapped failure response', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: false, error: 'Validation failed' }),
    )

    await expect(client.health.check()).rejects.toThrow('Validation failed')
  })

  it('handles non-JSON error body gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 }),
    )

    await expect(client.health.check()).rejects.toThrow(ApiSdkError)
  })

  // ─────────────────────────────────────────
  // Chat Namespace
  // ─────────────────────────────────────────

  it('chat.send posts to /api/chat', async () => {
    const body = { message: 'Hello', history: [], use_compression: true }
    const resp = { response: 'Hi there', stats: { compressed: false, original_tokens: 5, compressed_tokens: 5, compression_ratio: 1.0 } }
    mockFetch.mockResolvedValueOnce(jsonResponse(resp))

    const result = await client.chat.send(body)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/chat',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(body) }),
    )
    expect(result.response).toBe('Hi there')
  })

  it('chat.stream yields SSE tokens and done event', async () => {
    const sseData = 'data: Hello\n\ndata:  world\n\ndata: [DONE]\n\n'
    mockFetch.mockResolvedValueOnce(sseResponse([sseData]))

    const events: import('../src/client/apiTypes').ChatStreamEvent[] = []
    for await (const event of client.chat.stream({ message: 'hi' })) {
      events.push(event)
    }

    expect(events).toEqual([
      { type: 'token', data: 'Hello' },
      { type: 'token', data: 'world' },
      { type: 'done' },
    ])
  })

  it('chat.stream yields error event on [ERROR]', async () => {
    const sseData = 'data: partial\n\ndata: [ERROR] Something went wrong\n\n'
    mockFetch.mockResolvedValueOnce(sseResponse([sseData]))

    const events: import('../src/client/apiTypes').ChatStreamEvent[] = []
    for await (const event of client.chat.stream({ message: 'hi' })) {
      events.push(event)
    }

    expect(events).toEqual([
      { type: 'token', data: 'partial' },
      { type: 'error', message: 'Something went wrong' },
    ])
  })

  it('chat.stream throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse('Forbidden', 403))

    const iter = client.chat.stream({ message: 'hi' })
    await expect(async () => {
      for await (const _ of iter) {
        // should not reach here
      }
    }).rejects.toThrow(ApiSdkError)
  })

  it('chat.stream throws when no body', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    )

    const iter = client.chat.stream({ message: 'hi' })
    await expect(async () => {
      for await (const _ of iter) {
        // should throw
      }
    }).rejects.toThrow('No stream body')
  })

  it('chat.sendMessage posts to /api/chat/send', async () => {
    const body = { conversationId: 'c1', content: 'hello' }
    const resp = { id: 'm1', role: 'assistant' as const, content: 'reply', timestamp: '2026-01-01T00:00:00Z' }
    mockFetch.mockResolvedValueOnce(wrappedResponse(resp))

    const result = await client.chat.sendMessage(body)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/chat/send',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.content).toBe('reply')
  })

  it('chat.getHistory fetches /api/chat/history', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.chat.getHistory()
    expect(result).toEqual([])
  })

  it('chat.getAssistants fetches /api/assistants', async () => {
    const assistants = [{ id: 'a1', name: 'Test', description: 'Desc', model: 'gpt-4', isOfficial: true }]
    mockFetch.mockResolvedValueOnce(wrappedResponse(assistants))

    const result = await client.chat.getAssistants()
    expect(result[0].name).toBe('Test')
  })

  // ─────────────────────────────────────────
  // Analyze Namespace
  // ─────────────────────────────────────────

  it('analyze.analyze posts to /api/analyze', async () => {
    const body = { text: 'Some text', mode: 'summarize' as const }
    const resp = { result: 'Summary here', mode: 'summarize' }
    mockFetch.mockResolvedValueOnce(jsonResponse(resp))

    const result = await client.analyze.analyze(body)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/analyze',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.result).toBe('Summary here')
  })

  // ─────────────────────────────────────────
  // Research Namespace
  // ─────────────────────────────────────────

  it('research.search posts to /api/research', async () => {
    const body = { query: 'AI trends', num_sources: 3 }
    const resp = { query: 'AI trends', summary: 'Result', sources: [], num_sources_used: 3 }
    mockFetch.mockResolvedValueOnce(jsonResponse(resp))

    const result = await client.research.search(body)

    expect(result.summary).toBe('Result')
  })

  // ─────────────────────────────────────────
  // Health Namespace
  // ─────────────────────────────────────────

  it('health.check fetches /api/health', async () => {
    const resp = { status: 'ok', aiCore: true, proxy: true }
    mockFetch.mockResolvedValueOnce(jsonResponse(resp))

    const result = await client.health.check()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/health',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result.status).toBe('ok')
  })

  // ─────────────────────────────────────────
  // CSRF Namespace
  // ─────────────────────────────────────────

  it('csrf.getToken fetches /api/csrf', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ csrfToken: 'abc.123.hmac' }))

    const result = await client.csrf.getToken()

    expect(result.csrfToken).toBe('abc.123.hmac')
  })

  // ─────────────────────────────────────────
  // Auth Namespace
  // ─────────────────────────────────────────

  it('auth.login posts to /api/auth/login', async () => {
    const loginResp = { token: 'jwt-abc', user: { id: '1', email: 'admin@hchat.ai', name: 'Admin', role: 'admin', organization: 'HMG' } }
    mockFetch.mockResolvedValueOnce(wrappedResponse(loginResp))

    const result = await client.auth.login({ email: 'admin@hchat.ai', password: 'Admin123!' })

    expect(result.token).toBe('jwt-abc')
    expect(result.user.role).toBe('admin')
  })

  it('auth.logout posts to /api/auth/logout', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse(undefined))
    await client.auth.logout()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('auth.me fetches /api/auth/me', async () => {
    const user = { id: '1', email: 'admin@hchat.ai', name: 'Admin', role: 'admin', organization: 'HMG' }
    mockFetch.mockResolvedValueOnce(wrappedResponse(user))

    const result = await client.auth.me()
    expect(result.email).toBe('admin@hchat.ai')
  })

  // ─────────────────────────────────────────
  // Admin Namespace
  // ─────────────────────────────────────────

  it('admin.getDashboard fetches /api/admin/dashboard', async () => {
    const data = { stats: [{ label: 'Users', value: '100' }], modelUsage: [] }
    mockFetch.mockResolvedValueOnce(wrappedResponse(data))

    const result = await client.admin.getDashboard()
    expect(result.stats[0].label).toBe('Users')
  })

  it('admin.getUsers fetches /api/admin/users', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([{ id: 'u1', name: 'User 1' }]))
    const result = await client.admin.getUsers()
    expect(result[0].id).toBe('u1')
  })

  it('admin.getSettings fetches /api/admin/settings', async () => {
    const settings = { defaultModel: 'gpt-4', maxTokens: 4096, theme: 'dark', language: 'ko' }
    mockFetch.mockResolvedValueOnce(wrappedResponse(settings))

    const result = await client.admin.getSettings()
    expect(result.theme).toBe('dark')
  })

  it('admin.updateSettings puts to /api/admin/settings', async () => {
    const update = { theme: 'light' }
    mockFetch.mockResolvedValueOnce(wrappedResponse({ ...update, defaultModel: 'gpt-4', maxTokens: 4096, language: 'ko' }))

    await client.admin.updateSettings(update)

    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual(update)
  })

  it('admin.getRealtimeMetrics fetches /api/admin/realtime/metrics', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ activeUsers: 42, requestsPerMinute: 100, avgLatency: 200, errorRate: 0.01 }))
    const result = await client.admin.getRealtimeMetrics()
    expect(result.activeUsers).toBe(42)
  })

  it('admin.getNotifications fetches /api/admin/notifications', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.admin.getNotifications()
    expect(result).toEqual([])
  })

  it('admin.getWidgetLayout fetches /api/admin/widgets/layout', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ layout: [], widgets: [] }))
    const result = await client.admin.getWidgetLayout()
    expect(result.layout).toEqual([])
  })

  it('admin.getWorkflows fetches /api/admin/workflows', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.admin.getWorkflows()
    expect(result).toEqual([])
  })

  // ─────────────────────────────────────────
  // Enterprise Namespace
  // ─────────────────────────────────────────

  it('enterprise.getTenants fetches /api/admin/tenants', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([{ id: 't1', name: 'Tenant A', domain: 'a.com', status: 'active', userCount: 10 }]))
    const result = await client.enterprise.getTenants()
    expect(result[0].name).toBe('Tenant A')
  })

  it('enterprise.getMarketplaceAgents fetches /api/admin/marketplace/agents', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.enterprise.getMarketplaceAgents()
    expect(result).toEqual([])
  })

  it('enterprise.getRoles fetches /api/admin/roles', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([{ id: 'r1', name: 'Admin', permissions: ['all'], userCount: 5 }]))
    const result = await client.enterprise.getRoles()
    expect(result[0].permissions).toContain('all')
  })

  it('enterprise.getPermissions fetches /api/admin/permissions', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.enterprise.getPermissions()
    expect(result).toEqual([])
  })

  it('enterprise.getSsoConnections fetches /api/admin/sso/connections', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.enterprise.getSsoConnections()
    expect(result).toEqual([])
  })

  it('enterprise.testSsoConnection posts to /api/admin/sso/test', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ valid: true, message: 'OK' }))
    const result = await client.enterprise.testSsoConnection()
    expect(result.valid).toBe(true)
  })

  // ─────────────────────────────────────────
  // AI Engine Namespace
  // ─────────────────────────────────────────

  it('aiEngine.getAnalytics fetches /api/admin/analytics', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ anomalies: [], predictions: [], insights: [] }))
    const result = await client.aiEngine.getAnalytics()
    expect(result.anomalies).toEqual([])
  })

  it('aiEngine.ragSearch encodes query parameter', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ results: [], total: 0 }))
    await client.aiEngine.ragSearch('hello world')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/admin/rag/search?q=hello%20world',
      expect.anything(),
    )
  })

  it('aiEngine.getRagDocuments fetches /api/admin/rag/documents', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.aiEngine.getRagDocuments()
    expect(result).toEqual([])
  })

  it('aiEngine.getPromptVersions fetches /api/admin/prompts/versions', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.aiEngine.getPromptVersions()
    expect(result).toEqual([])
  })

  it('aiEngine.getPromptAbTests fetches /api/admin/prompts/ab-tests', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.aiEngine.getPromptAbTests()
    expect(result).toEqual([])
  })

  it('aiEngine.getBenchmarks fetches /api/admin/benchmarks', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([{ model: 'gpt-4', accuracy: 0.95, latency: 120, cost: 30 }]))
    const result = await client.aiEngine.getBenchmarks()
    expect(result[0].accuracy).toBe(0.95)
  })

  // ─────────────────────────────────────────
  // Collaboration Namespace
  // ─────────────────────────────────────────

  it('collaboration.getAlertRules fetches /api/admin/alert-rules', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.collaboration.getAlertRules()
    expect(result).toEqual([])
  })

  it('collaboration.getChatRooms fetches /api/admin/rooms', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.collaboration.getChatRooms()
    expect(result).toEqual([])
  })

  it('collaboration.getRoomMessages encodes roomId', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    await client.collaboration.getRoomMessages('room-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/admin/messages?roomId=room-1',
      expect.anything(),
    )
  })

  // ─────────────────────────────────────────
  // Advanced Namespace
  // ─────────────────────────────────────────

  it('advanced.getFinetuneJobs fetches /api/admin/finetune/jobs', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.advanced.getFinetuneJobs()
    expect(result).toEqual([])
  })

  it('advanced.getFinetuneDatasets fetches /api/admin/finetune/datasets', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    const result = await client.advanced.getFinetuneDatasets()
    expect(result).toEqual([])
  })

  it('advanced.getCharts fetches /api/admin/charts', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ treemap: [], sankey: [], scatter: [] }))
    const result = await client.advanced.getCharts()
    expect(result.treemap).toEqual([])
  })

  it('advanced.getKnowledgeGraph fetches /api/admin/knowledge-graph', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ nodes: [], edges: [] }))
    const result = await client.advanced.getKnowledgeGraph()
    expect(result.nodes).toEqual([])
  })

  it('advanced.speechToText posts to /api/admin/voice/stt', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ text: 'Hello', confidence: 0.98, language: 'en' }))
    const result = await client.advanced.speechToText()
    expect(result.text).toBe('Hello')
  })

  it('advanced.textToSpeech posts to /api/admin/voice/tts', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ audioUrl: 'https://example.com/audio.mp3', duration: 2.5 }))
    const result = await client.advanced.textToSpeech()
    expect(result.duration).toBe(2.5)
  })

  // ─────────────────────────────────────────
  // Models Namespace
  // ─────────────────────────────────────────

  it('models.list fetches /api/models without provider', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    await client.models.list()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/models',
      expect.anything(),
    )
  })

  it('models.list appends provider query param', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([]))
    await client.models.list('Anthropic')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3003/api/models?provider=Anthropic',
      expect.anything(),
    )
  })

  it('models.getApiKeys fetches /api/keys', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse([{ id: 'k1', name: 'Key 1', prefix: 'hc-****', createdAt: '2026-01-01' }]))
    const result = await client.models.getApiKeys()
    expect(result[0].prefix).toBe('hc-****')
  })

  it('models.streamOutput yields SSE events', async () => {
    const sseData = 'data: token1\n\ndata: token2\n\ndata: [DONE]\n\n'
    mockFetch.mockResolvedValueOnce(sseResponse([sseData]))

    const events: import('../src/client/apiTypes').ChatStreamEvent[] = []
    for await (const event of client.models.streamOutput('model-1')) {
      events.push(event)
    }

    expect(events).toHaveLength(3)
    expect(events[0]).toEqual({ type: 'token', data: 'token1' })
    expect(events[2]).toEqual({ type: 'done' })
  })

  // ─────────────────────────────────────────
  // ApiSdkError
  // ─────────────────────────────────────────

  it('ApiSdkError has correct name and properties', () => {
    const err = new ApiSdkError(422, 'Validation failed', { field: 'email' })
    expect(err.name).toBe('ApiSdkError')
    expect(err.status).toBe(422)
    expect(err.message).toBe('Validation failed')
    expect(err.details).toEqual({ field: 'email' })
    expect(err).toBeInstanceOf(Error)
  })

  // ─────────────────────────────────────────
  // Unwrapped vs Wrapped Responses
  // ─────────────────────────────────────────

  it('handles unwrapped (non-success-wrapped) responses', async () => {
    // Some endpoints return raw data without { success, data } wrapper
    const raw = { response: 'Direct response', stats: null }
    mockFetch.mockResolvedValueOnce(jsonResponse(raw))

    const result = await client.chat.send({ message: 'hello' })
    expect(result.response).toBe('Direct response')
  })

  it('handles wrapped response with success: true', async () => {
    mockFetch.mockResolvedValueOnce(wrappedResponse({ status: 'ok', aiCore: true, proxy: true }))
    const result = await client.health.check()
    expect(result.status).toBe('ok')
  })
})
