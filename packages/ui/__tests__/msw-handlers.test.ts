import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MSW Auth Handlers', () => {
  it('should handle successful login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hchat.ai', password: 'test' }),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeDefined()
    expect(data.data.user.email).toBe('admin@hchat.ai')
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
  })

  it('should handle logout', async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should get current user', async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    expect(data.data.email).toBe('admin@hchat.ai')
    expect(data.data.role).toBe('admin')
  })

  it('should handle manager login', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@hchat.ai', password: 'test' }),
    })
    const data = await res.json()
    expect(data.data.user.role).toBe('manager')
  })
})

describe('MSW Admin Handlers', () => {
  it('should get dashboard', async () => {
    const res = await fetch('/api/admin/dashboard')
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.stats).toBeInstanceOf(Array)
    expect(data.data.stats.length).toBeGreaterThan(0)
  })

  it('should get users', async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get settings', async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    expect(data.data.defaultModel).toBeDefined()
  })

  it('should update settings', async () => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'dark' }),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should get realtime metrics', async () => {
    const res = await fetch('/api/admin/realtime/metrics')
    const data = await res.json()
    expect(data.data.activeUsers).toBeDefined()
  })

  it('should get notifications', async () => {
    const res = await fetch('/api/admin/notifications')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get widgets layout', async () => {
    const res = await fetch('/api/admin/widgets/layout')
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should get workflows', async () => {
    const res = await fetch('/api/admin/workflows')
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})

describe('MSW Chat Handlers', () => {
  it('should send message', async () => {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: 'conv-1', content: '안녕하세요' }),
    })
    const data = await res.json()
    expect(data.data.role).toBe('assistant')
    expect(data.data.content).toContain('안녕하세요')
  })

  it('should get chat history', async () => {
    const res = await fetch('/api/chat/history')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get assistants', async () => {
    const res = await fetch('/api/assistants')
    const data = await res.json()
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('should get mobile chats', async () => {
    const res = await fetch('/api/mobile/chats')
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})

describe('MSW Model Handlers', () => {
  it('should get all models', async () => {
    const res = await fetch('/api/models')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('should filter models by provider', async () => {
    const res = await fetch('/api/models?provider=Anthropic')
    const data = await res.json()
    expect(data.data.every((m: { provider: string }) => m.provider === 'Anthropic')).toBe(true)
  })

  it('should get API keys', async () => {
    const res = await fetch('/api/keys')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })
})

describe('MSW Enterprise Handlers', () => {
  it('should get tenants', async () => {
    const res = await fetch('/api/admin/tenants')
    const data = await res.json()
    expect(data.data.length).toBe(3)
  })

  it('should get marketplace agents', async () => {
    const res = await fetch('/api/admin/marketplace/agents')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get roles', async () => {
    const res = await fetch('/api/admin/roles')
    const data = await res.json()
    expect(data.data.length).toBe(3)
  })

  it('should get permissions', async () => {
    const res = await fetch('/api/admin/permissions')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get SSO connections', async () => {
    const res = await fetch('/api/admin/sso/connections')
    const data = await res.json()
    expect(data.data.length).toBe(2)
  })

  it('should test SSO', async () => {
    const res = await fetch('/api/admin/sso/test', { method: 'POST' })
    const data = await res.json()
    expect(data.data.valid).toBe(true)
  })
})

describe('MSW AI Engine Handlers', () => {
  it('should get analytics', async () => {
    const res = await fetch('/api/admin/analytics')
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should search RAG', async () => {
    const res = await fetch('/api/admin/rag/search?q=test')
    const data = await res.json()
    expect(data.data.results).toBeInstanceOf(Array)
  })

  it('should get RAG documents', async () => {
    const res = await fetch('/api/admin/rag/documents')
    const data = await res.json()
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('should get prompt versions', async () => {
    const res = await fetch('/api/admin/prompts/versions')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get benchmarks', async () => {
    const res = await fetch('/api/admin/benchmarks')
    const data = await res.json()
    expect(data.data.length).toBeGreaterThan(0)
  })
})

describe('MSW Collaboration Handlers', () => {
  it('should get alert rules', async () => {
    const res = await fetch('/api/admin/alert-rules')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get rooms', async () => {
    const res = await fetch('/api/admin/rooms')
    const data = await res.json()
    expect(data.data.length).toBe(2)
  })

  it('should get messages', async () => {
    const res = await fetch('/api/admin/messages?roomId=room-1')
    const data = await res.json()
    expect(data.data[0].roomId).toBe('room-1')
  })
})

describe('MSW AI Advanced Handlers', () => {
  it('should get finetune jobs', async () => {
    const res = await fetch('/api/admin/finetune/jobs')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get finetune datasets', async () => {
    const res = await fetch('/api/admin/finetune/datasets')
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should get charts', async () => {
    const res = await fetch('/api/admin/charts')
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('should get knowledge graph', async () => {
    const res = await fetch('/api/admin/knowledge-graph')
    const data = await res.json()
    expect(data.data.nodes).toBeInstanceOf(Array)
    expect(data.data.edges).toBeInstanceOf(Array)
  })

  it('should handle STT', async () => {
    const res = await fetch('/api/admin/voice/stt', { method: 'POST' })
    const data = await res.json()
    expect(data.data.text).toBeDefined()
    expect(data.data.confidence).toBeGreaterThan(0)
  })

  it('should handle TTS', async () => {
    const res = await fetch('/api/admin/voice/tts', { method: 'POST' })
    const data = await res.json()
    expect(data.data.audioUrl).toBeDefined()
  })
})
