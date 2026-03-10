import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createWebhookManager,
  signPayload,
  WEBHOOK_EVENT_TYPES,
} from '../src/utils/webhookService'
import type {
  WebhookConfig,
  WebhookManager,
} from '../src/utils/webhookService'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(
  overrides: Partial<Omit<WebhookConfig, 'id'>> = {},
): Omit<WebhookConfig, 'id'> {
  return {
    url: 'https://example.com/webhook',
    events: ['chat.message'],
    active: true,
    retryCount: 3,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('webhookService', () => {
  let manager: WebhookManager

  beforeEach(() => {
    manager = createWebhookManager()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------

  describe('WEBHOOK_EVENT_TYPES', () => {
    it('contains all expected event types', () => {
      expect(WEBHOOK_EVENT_TYPES).toContain('chat.message')
      expect(WEBHOOK_EVENT_TYPES).toContain('user.login')
      expect(WEBHOOK_EVENT_TYPES).toContain('user.logout')
      expect(WEBHOOK_EVENT_TYPES).toContain('error.critical')
      expect(WEBHOOK_EVENT_TYPES).toContain('system.health')
      expect(WEBHOOK_EVENT_TYPES).toHaveLength(5)
    })
  })

  // -------------------------------------------------------------------------
  // Registration / Unregistration
  // -------------------------------------------------------------------------

  describe('register', () => {
    it('returns a unique id', () => {
      const id1 = manager.register(makeConfig())
      const id2 = manager.register(makeConfig())

      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('adds the webhook to the list', () => {
      manager.register(makeConfig({ url: 'https://a.com/hook' }))
      manager.register(makeConfig({ url: 'https://b.com/hook' }))

      const webhooks = manager.getWebhooks()
      expect(webhooks).toHaveLength(2)
      expect(webhooks[0].url).toBe('https://a.com/hook')
      expect(webhooks[1].url).toBe('https://b.com/hook')
    })

    it('preserves all config fields', () => {
      const config = makeConfig({
        url: 'https://x.com/wh',
        events: ['user.login', 'user.logout'],
        secret: 'my-secret',
        active: false,
        retryCount: 5,
      })
      const id = manager.register(config)

      const webhook = manager.getWebhooks().find((w) => w.id === id)
      expect(webhook).toBeDefined()
      expect(webhook!.url).toBe('https://x.com/wh')
      expect(webhook!.events).toEqual(['user.login', 'user.logout'])
      expect(webhook!.secret).toBe('my-secret')
      expect(webhook!.active).toBe(false)
      expect(webhook!.retryCount).toBe(5)
    })
  })

  describe('unregister', () => {
    it('removes the webhook by id', () => {
      const id = manager.register(makeConfig())
      expect(manager.getWebhooks()).toHaveLength(1)

      manager.unregister(id)
      expect(manager.getWebhooks()).toHaveLength(0)
    })

    it('does nothing when id does not exist', () => {
      manager.register(makeConfig())
      manager.unregister('nonexistent-id')

      expect(manager.getWebhooks()).toHaveLength(1)
    })

    it('only removes the targeted webhook', () => {
      const id1 = manager.register(makeConfig({ url: 'https://a.com' }))
      manager.register(makeConfig({ url: 'https://b.com' }))

      manager.unregister(id1)

      const remaining = manager.getWebhooks()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].url).toBe('https://b.com')
    })
  })

  // -------------------------------------------------------------------------
  // Trigger
  // -------------------------------------------------------------------------

  describe('trigger', () => {
    it('sends POST to matching webhooks', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ url: 'https://a.com/wh', events: ['chat.message'] }))

      const results = await manager.trigger('chat.message', { text: 'hello' })

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(results[0].statusCode).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://a.com/wh',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      )
    })

    it('skips inactive webhooks', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ active: false }))

      const results = await manager.trigger('chat.message', {})
      expect(results).toHaveLength(0)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('skips webhooks not matching the event', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ events: ['user.login'] }))

      const results = await manager.trigger('chat.message', {})
      expect(results).toHaveLength(0)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('triggers multiple matching webhooks in parallel', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ url: 'https://a.com/wh' }))
      manager.register(makeConfig({ url: 'https://b.com/wh' }))

      const results = await manager.trigger('chat.message', { msg: 'hi' })

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.success)).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('includes correct payload structure in the request body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      const id = manager.register(makeConfig())
      await manager.trigger('chat.message', { key: 'value' })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.event).toBe('chat.message')
      expect(body.webhookId).toBe(id)
      expect(body.data).toEqual({ key: 'value' })
      expect(typeof body.timestamp).toBe('number')
    })
  })

  // -------------------------------------------------------------------------
  // HMAC Signature
  // -------------------------------------------------------------------------

  describe('HMAC signature', () => {
    it('adds X-Webhook-Signature header when secret is set', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ secret: 'test-secret' }))
      await manager.trigger('chat.message', { data: 'signed' })

      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers['X-Webhook-Signature']).toBeDefined()
      expect(headers['X-Webhook-Signature']).toMatch(/^sha256=[a-f0-9]+$/)
    })

    it('omits X-Webhook-Signature header when no secret', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ secret: undefined }))
      await manager.trigger('chat.message', {})

      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers['X-Webhook-Signature']).toBeUndefined()
    })

    it('signPayload produces a consistent hex hash', async () => {
      const sig1 = await signPayload('test-payload', 'secret')
      const sig2 = await signPayload('test-payload', 'secret')

      expect(sig1).toBe(sig2)
      expect(sig1).toMatch(/^[a-f0-9]{64}$/)
    })

    it('signPayload produces different hashes for different secrets', async () => {
      const sig1 = await signPayload('payload', 'secret-a')
      const sig2 = await signPayload('payload', 'secret-b')

      expect(sig1).not.toBe(sig2)
    })

    it('signPayload produces different hashes for different payloads', async () => {
      const sig1 = await signPayload('payload-a', 'secret')
      const sig2 = await signPayload('payload-b', 'secret')

      expect(sig1).not.toBe(sig2)
    })
  })

  // -------------------------------------------------------------------------
  // Retry logic
  // -------------------------------------------------------------------------

  describe('retry', () => {
    it('retries on fetch failure and succeeds on second attempt', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 3 }))
      const results = await manager.trigger('chat.message', {})

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('retries on non-OK response and succeeds on retry', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 3 }))
      const results = await manager.trigger('chat.message', {})

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('returns failure after exhausting all retries', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Persistent failure'))
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 2 }))
      const results = await manager.trigger('chat.message', {})

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toBe('Persistent failure')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('returns HTTP error after exhausting retries on non-OK response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 3 }))
      const results = await manager.trigger('chat.message', {})

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].statusCode).toBe(500)
      expect(results[0].error).toBe('HTTP 500')
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('defaults to 3 retries when retryCount is 0', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('fail'))
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 0 }))
      const results = await manager.trigger('chat.message', {})

      expect(results[0].success).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  // -------------------------------------------------------------------------
  // Delivery history
  // -------------------------------------------------------------------------

  describe('delivery history', () => {
    it('records successful deliveries', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig())
      await manager.trigger('chat.message', { text: 'hello' })

      const history = manager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].status).toBe('success')
      expect(history[0].statusCode).toBe(200)
      expect(history[0].event).toBe('chat.message')
      expect(history[0].payload.data).toEqual({ text: 'hello' })
    })

    it('records failed deliveries', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('timeout'))
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig({ retryCount: 1 }))
      await manager.trigger('chat.message', {})

      const history = manager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].status).toBe('failed')
      expect(history[0].error).toBe('timeout')
    })

    it('filters history by webhookId', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      const id1 = manager.register(makeConfig({ url: 'https://a.com' }))
      manager.register(makeConfig({ url: 'https://b.com' }))
      await manager.trigger('chat.message', {})

      const allHistory = manager.getHistory()
      expect(allHistory).toHaveLength(2)

      const filtered = manager.getHistory(id1)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].webhookId).toBe(id1)
    })

    it('accumulates history across multiple triggers', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig())
      await manager.trigger('chat.message', { n: 1 })
      await manager.trigger('chat.message', { n: 2 })

      expect(manager.getHistory()).toHaveLength(2)
    })

    it('returns empty array when no deliveries exist', () => {
      expect(manager.getHistory()).toHaveLength(0)
    })

    it('returns empty array when filtering by unknown webhookId', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      manager.register(makeConfig())
      await manager.trigger('chat.message', {})

      expect(manager.getHistory('unknown-id')).toHaveLength(0)
    })

    it('delivery records have correct structure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', mockFetch)

      const whId = manager.register(makeConfig())
      await manager.trigger('chat.message', { key: 'val' })

      const delivery = manager.getHistory()[0]
      expect(delivery.id).toBeTruthy()
      expect(delivery.webhookId).toBe(whId)
      expect(delivery.event).toBe('chat.message')
      expect(delivery.attempt).toBe(1)
      expect(typeof delivery.timestamp).toBe('number')
      expect(delivery.payload.webhookId).toBe(whId)
      expect(delivery.payload.event).toBe('chat.message')
      expect(delivery.payload.data).toEqual({ key: 'val' })
    })
  })

  // -------------------------------------------------------------------------
  // getWebhooks immutability
  // -------------------------------------------------------------------------

  describe('getWebhooks', () => {
    it('returns empty array initially', () => {
      expect(manager.getWebhooks()).toHaveLength(0)
    })

    it('returns a snapshot (not mutated by later register/unregister)', () => {
      manager.register(makeConfig())
      const snapshot = manager.getWebhooks()
      expect(snapshot).toHaveLength(1)

      manager.register(makeConfig())
      // Snapshot should still be length 1
      expect(snapshot).toHaveLength(1)
      // Fresh call shows 2
      expect(manager.getWebhooks()).toHaveLength(2)
    })
  })
})
