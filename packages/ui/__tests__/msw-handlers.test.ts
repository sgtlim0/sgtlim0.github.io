import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '../src/mocks/handlers'
import { authHandlers } from '../src/mocks/handlers/auth'
import { adminHandlers } from '../src/mocks/handlers/admin'
import { chatHandlers } from '../src/mocks/handlers/chat'
import { modelHandlers } from '../src/mocks/handlers/models'
import { enterpriseHandlers } from '../src/mocks/handlers/enterprise'
import { aiEngineHandlers } from '../src/mocks/handlers/aiEngine'
import { collaborationHandlers } from '../src/mocks/handlers/collaboration'
import { aiAdvancedHandlers } from '../src/mocks/handlers/aiAdvanced'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ── handler array composition ────────────────────────────────────────────────

describe('handlers composition', () => {
  it('exports a flat array combining all handler modules', () => {
    const expectedLength =
      authHandlers.length +
      adminHandlers.length +
      chatHandlers.length +
      modelHandlers.length +
      enterpriseHandlers.length +
      aiEngineHandlers.length +
      collaborationHandlers.length +
      aiAdvancedHandlers.length

    expect(handlers).toBeInstanceOf(Array)
    expect(handlers.length).toBe(expectedLength)
  })

  it('each handler module exports a non-empty array', () => {
    expect(authHandlers.length).toBeGreaterThan(0)
    expect(adminHandlers.length).toBeGreaterThan(0)
    expect(chatHandlers.length).toBeGreaterThan(0)
    expect(modelHandlers.length).toBeGreaterThan(0)
    expect(enterpriseHandlers.length).toBeGreaterThan(0)
    expect(aiEngineHandlers.length).toBeGreaterThan(0)
    expect(collaborationHandlers.length).toBeGreaterThan(0)
    expect(aiAdvancedHandlers.length).toBeGreaterThan(0)
  })
})

// ── auth handlers ────────────────────────────────────────────────────────────

describe('MSW Auth Handlers', () => {
  it('should handle successful login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hchat.ai', password: 'test' }),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toMatch(/^mock-jwt-1-/)
    expect(data.data.user.email).toBe('admin@hchat.ai')
    expect(data.data.user.name).toBe('관리자')
    expect(data.data.user.role).toBe('admin')
    expect(data.data.user.organization).toBe('현대자동차그룹')
  })

  it('should handle invalid login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@test.com', password: 'wrong' }),
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should handle logout', async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should get current user with full shape', async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      id: '1',
      email: 'admin@hchat.ai',
      name: '관리자',
      role: 'admin',
      organization: '현대자동차그룹',
    })
  })

  it('should handle manager login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@hchat.ai', password: 'test' }),
    })
    const data = await res.json()
    expect(data.data.user.role).toBe('manager')
    expect(data.data.user.name).toBe('매니저')
    expect(data.data.token).toMatch(/^mock-jwt-2-/)
  })

  it('should handle viewer login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@hchat.ai', password: 'test' }),
    })
    const data = await res.json()
    expect(data.data.user.role).toBe('viewer')
    expect(data.data.user.name).toBe('뷰어')
    expect(data.data.token).toMatch(/^mock-jwt-3-/)
  })
})

// ── admin handlers ───────────────────────────────────────────────────────────

describe('MSW Admin Handlers', () => {
  it('should get dashboard with stats and modelUsage', async () => {
    const res = await fetch('/api/admin/dashboard')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.stats).toBeInstanceOf(Array)
    expect(data.data.stats.length).toBe(4)
    expect(data.data.stats[0]).toHaveProperty('label')
    expect(data.data.stats[0]).toHaveProperty('value')
    expect(data.data.modelUsage).toBeInstanceOf(Array)
    expect(data.data.modelUsage.length).toBe(2)
  })

  it('should get users with expected fields', async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(2)
    const user = data.data[0]
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('role')
    expect(user).toHaveProperty('status')
    expect(user).toHaveProperty('lastActive')
  })

  it('should get settings with all fields', async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    expect(data.data.defaultModel).toBe('claude-3.5-sonnet')
    expect(data.data.maxTokens).toBe(4096)
    expect(data.data.theme).toBe('system')
    expect(data.data.language).toBe('ko')
  })

  it('should update settings echoing request body', async () => {
    const payload = { theme: 'dark', maxTokens: 8192 }
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual(payload)
  })

  it('should get realtime metrics with numeric values', async () => {
    const res = await fetch('/api/admin/realtime/metrics')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(typeof data.data.activeUsers).toBe('number')
    expect(typeof data.data.requestsPerMinute).toBe('number')
    expect(typeof data.data.avgLatency).toBe('number')
    expect(typeof data.data.errorRate).toBe('number')
    expect(data.data.activeUsers).toBe(38)
    expect(data.data.errorRate).toBe(0.02)
  })

  it('should get notifications with full shape', async () => {
    const res = await fetch('/api/admin/notifications')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(1)
    const notif = data.data[0]
    expect(notif).toHaveProperty('id')
    expect(notif).toHaveProperty('title')
    expect(notif).toHaveProperty('type')
    expect(notif).toHaveProperty('read')
    expect(notif.read).toBe(false)
    expect(notif.type).toBe('info')
  })

  it('should get widgets layout structure', async () => {
    const res = await fetch('/api/admin/widgets/layout')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('layout')
    expect(data.data).toHaveProperty('widgets')
    expect(data.data.layout).toEqual([])
    expect(data.data.widgets).toEqual([])
  })

  it('should get workflows as empty array', async () => {
    const res = await fetch('/api/admin/workflows')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
})

// ── chat handlers ────────────────────────────────────────────────────────────

describe('MSW Chat Handlers', () => {
  it('should send message and get assistant response with echo', async () => {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: 'conv-1', content: '안녕하세요' }),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.role).toBe('assistant')
    expect(data.data.content).toContain('안녕하세요')
    expect(data.data.id).toMatch(/^msg_/)
    expect(data.data.timestamp).toBeTruthy()
  })

  it('should get chat history as empty array', async () => {
    const res = await fetch('/api/chat/history')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should get assistants with official flag', async () => {
    const res = await fetch('/api/assistants')
    const data = await res.json()
    expect(data.data.length).toBe(2)
    expect(data.data.every((a: { isOfficial: boolean }) => a.isOfficial)).toBe(true)
    expect(data.data[0]).toHaveProperty('id')
    expect(data.data[0]).toHaveProperty('name')
    expect(data.data[0]).toHaveProperty('model')
    expect(data.data[0]).toHaveProperty('description')
  })

  it('should get mobile chats as empty array', async () => {
    const res = await fetch('/api/mobile/chats')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })
})

// ── model handlers ───────────────────────────────────────────────────────────

describe('MSW Model Handlers', () => {
  it('should get all models without filter', async () => {
    const res = await fetch('/api/models')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(3)
    expect(data.data.map((m: { id: string }) => m.id)).toEqual([
      'claude-3.5-sonnet',
      'gpt-4o',
      'gemini-pro',
    ])
  })

  it('should filter models by provider=Anthropic', async () => {
    const res = await fetch('/api/models?provider=Anthropic')
    const data = await res.json()
    expect(data.data.length).toBe(1)
    expect(data.data[0].provider).toBe('Anthropic')
    expect(data.data[0].id).toBe('claude-3.5-sonnet')
  })

  it('should filter models by provider=Google', async () => {
    const res = await fetch('/api/models?provider=Google')
    const data = await res.json()
    expect(data.data.length).toBe(1)
    expect(data.data[0].contextWindow).toBe(1000000)
  })

  it('should return empty array for unknown provider', async () => {
    const res = await fetch('/api/models?provider=Unknown')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should get SSE stream from models/:id/stream', async () => {
    const res = await fetch('/api/models/claude-3.5-sonnet/stream')
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
    const text = await res.text()
    expect(text).toContain('data: {"token":"Hello"}')
    expect(text).toContain('data: [DONE]')
  })

  it('should get API keys with expected shape', async () => {
    const res = await fetch('/api/keys')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(1)
    expect(data.data[0]).toHaveProperty('id')
    expect(data.data[0]).toHaveProperty('name')
    expect(data.data[0]).toHaveProperty('prefix')
    expect(data.data[0]).toHaveProperty('createdAt')
  })

  it('models have correct pricing fields', async () => {
    const res = await fetch('/api/models')
    const data = await res.json()
    for (const model of data.data) {
      expect(typeof model.inputPrice).toBe('number')
      expect(typeof model.outputPrice).toBe('number')
      expect(typeof model.contextWindow).toBe('number')
      expect(model.inputPrice).toBeGreaterThan(0)
    }
  })
})

// ── enterprise handlers ──────────────────────────────────────────────────────

describe('MSW Enterprise Handlers', () => {
  it('should get tenants with full shape', async () => {
    const res = await fetch('/api/admin/tenants')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.length).toBe(3)
    const ids = data.data.map((t: { id: string }) => t.id)
    expect(ids).toContain('hyundai')
    expect(ids).toContain('kia')
    expect(ids).toContain('genesis')
    expect(data.data[0]).toHaveProperty('userCount')
    expect(data.data[0]).toHaveProperty('domain')
    expect(data.data[0]).toHaveProperty('status')
  })

  it('should get marketplace agents with rating and installs', async () => {
    const res = await fetch('/api/admin/marketplace/agents')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(2)
    expect(data.data.every((a: { status: string }) => a.status === 'published')).toBe(true)
    expect(typeof data.data[0].rating).toBe('number')
    expect(typeof data.data[0].installs).toBe('number')
  })

  it('should get roles with permissions', async () => {
    const res = await fetch('/api/admin/roles')
    const data = await res.json()
    expect(data.data.length).toBe(3)
    const adminRole = data.data.find((r: { id: string }) => r.id === 'admin')
    expect(adminRole.permissions).toContain('all')
    expect(adminRole.userCount).toBe(3)
  })

  it('should get permissions with group field', async () => {
    const res = await fetch('/api/admin/permissions')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(3)
    expect(data.data[0]).toHaveProperty('id')
    expect(data.data[0]).toHaveProperty('name')
    expect(data.data[0]).toHaveProperty('group')
  })

  it('should get SSO connections', async () => {
    const res = await fetch('/api/admin/sso/connections')
    const data = await res.json()
    expect(data.data.length).toBe(2)
    expect(data.data[0].provider).toBe('Okta')
    expect(data.data[1].provider).toBe('Azure AD')
    expect(data.data.every((c: { status: string }) => c.status === 'active')).toBe(true)
  })

  it('should test SSO returning valid=true', async () => {
    const res = await fetch('/api/admin/sso/test', { method: 'POST' })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.valid).toBe(true)
    expect(data.data.message).toBe('SSO 연결 성공')
  })
})

// ── aiEngine handlers ────────────────────────────────────────────────────────

describe('MSW AI Engine Handlers', () => {
  it('should get analytics with empty arrays', async () => {
    const res = await fetch('/api/admin/analytics')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ anomalies: [], predictions: [], insights: [] })
  })

  it('should search RAG with query echoed in snippet', async () => {
    const res = await fetch('/api/admin/rag/search?q=AI+검색')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.results).toBeInstanceOf(Array)
    expect(data.data.results.length).toBe(1)
    expect(data.data.results[0].snippet).toContain('AI 검색')
    expect(data.data.results[0].score).toBe(0.95)
    expect(data.data.total).toBe(1)
  })

  it('should search RAG without q param (fallback to empty string)', async () => {
    const res = await fetch('/api/admin/rag/search')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.results[0].snippet).toContain('"" 관련')
  })

  it('should get RAG documents all indexed', async () => {
    const res = await fetch('/api/admin/rag/documents')
    const data = await res.json()
    expect(data.data.length).toBe(2)
    expect(data.data.every((d: { status: string }) => d.status === 'indexed')).toBe(true)
    expect(data.data[0]).toHaveProperty('chunks')
  })

  it('should get prompt versions with version numbers', async () => {
    const res = await fetch('/api/admin/prompts/versions')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(2)
    expect(data.data[0]).toHaveProperty('version')
    expect(data.data[0]).toHaveProperty('status')
    expect(data.data.every((p: { status: string }) => p.status === 'active')).toBe(true)
  })

  it('should get ab-tests as empty array', async () => {
    const res = await fetch('/api/admin/prompts/ab-tests')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should get benchmarks with numeric fields', async () => {
    const res = await fetch('/api/admin/benchmarks')
    const data = await res.json()
    expect(data.data.length).toBe(2)
    for (const bench of data.data) {
      expect(typeof bench.accuracy).toBe('number')
      expect(typeof bench.latency).toBe('number')
      expect(typeof bench.cost).toBe('number')
    }
  })
})

// ── collaboration handlers ───────────────────────────────────────────────────

describe('MSW Collaboration Handlers', () => {
  it('should get alert rules all enabled', async () => {
    const res = await fetch('/api/admin/alert-rules')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(2)
    expect(data.data.every((r: { enabled: boolean }) => r.enabled)).toBe(true)
    expect(data.data[0]).toHaveProperty('condition')
    expect(data.data[0]).toHaveProperty('channels')
  })

  it('should get rooms with member counts', async () => {
    const res = await fetch('/api/admin/rooms')
    const data = await res.json()
    expect(data.data.length).toBe(2)
    expect(data.data[0]).toHaveProperty('memberCount')
    expect(data.data[0]).toHaveProperty('lastMessage')
    expect(data.data[0]).toHaveProperty('updatedAt')
    expect(typeof data.data[0].memberCount).toBe('number')
  })

  it('should get messages filtered by roomId', async () => {
    const res = await fetch('/api/admin/messages?roomId=room-1')
    const data = await res.json()
    expect(data.data.length).toBe(1)
    expect(data.data[0].roomId).toBe('room-1')
    expect(data.data[0]).toHaveProperty('content')
    expect(data.data[0]).toHaveProperty('sender')
    expect(data.data[0]).toHaveProperty('timestamp')
  })

  it('should get messages with null roomId when param missing', async () => {
    const res = await fetch('/api/admin/messages')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data[0].roomId).toBeNull()
  })
})

// ── aiAdvanced handlers ──────────────────────────────────────────────────────

describe('MSW AI Advanced Handlers', () => {
  it('should get finetune jobs with completed status', async () => {
    const res = await fetch('/api/admin/finetune/jobs')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(1)
    expect(data.data[0].status).toBe('completed')
    expect(data.data[0].model).toBe('claude-3.5-sonnet')
    expect(typeof data.data[0].loss).toBe('number')
    expect(data.data[0].improvement).toBe('+16.7%')
  })

  it('should get finetune datasets with records count', async () => {
    const res = await fetch('/api/admin/finetune/datasets')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBe(1)
    expect(data.data[0].format).toBe('jsonl')
    expect(data.data[0].records).toBe(5000)
  })

  it('should get charts with empty structures', async () => {
    const res = await fetch('/api/admin/charts')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ treemap: [], sankey: [], scatter: [] })
  })

  it('should get knowledge graph with nodes and edges', async () => {
    const res = await fetch('/api/admin/knowledge-graph')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.nodes).toBeInstanceOf(Array)
    expect(data.data.nodes.length).toBe(2)
    expect(data.data.edges).toBeInstanceOf(Array)
    expect(data.data.edges.length).toBe(1)
    expect(data.data.edges[0]).toEqual({ source: 'n1', target: 'n2', label: 'uses' })
  })

  it('should handle STT with Korean result', async () => {
    const res = await fetch('/api/admin/voice/stt', { method: 'POST' })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.text).toBeTruthy()
    expect(data.data.confidence).toBe(0.95)
    expect(data.data.language).toBe('ko')
  })

  it('should handle TTS with audio URL', async () => {
    const res = await fetch('/api/admin/voice/tts', { method: 'POST' })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.audioUrl).toMatch(/\.mp3$/)
    expect(typeof data.data.duration).toBe('number')
  })
})

// ── browser.ts worker export ─────────────────────────────────────────────────

describe('mocks/browser.ts', () => {
  it('exports worker created with setupWorker', async () => {
    vi.mock('msw/browser', () => ({
      setupWorker: vi.fn((...args: unknown[]) => ({
        _handlers: args,
        start: vi.fn(),
        stop: vi.fn(),
      })),
    }))

    const { worker } = await import('../src/mocks/browser')
    expect(worker).toBeDefined()
    expect(worker).toHaveProperty('start')
    expect(worker).toHaveProperty('stop')

    vi.restoreAllMocks()
  })
})

// ── mocks/index.ts re-exports ────────────────────────────────────────────────

describe('mocks/index.ts re-exports', () => {
  it('re-exports handlers from handlers.ts', async () => {
    const indexMod = await import('../src/mocks/index')
    expect(indexMod.handlers).toBeDefined()
    expect(indexMod.handlers).toBeInstanceOf(Array)
    expect(indexMod.handlers.length).toBe(handlers.length)
  })

  it('re-exports server from server.ts', async () => {
    const indexMod = await import('../src/mocks/index')
    expect(indexMod.server).toBeDefined()
    expect(indexMod.server).toHaveProperty('listen')
    expect(indexMod.server).toHaveProperty('close')
  })
})
