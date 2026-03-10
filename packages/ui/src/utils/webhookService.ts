/**
 * Webhook Service
 *
 * Event-based notification system with HMAC-SHA256 signing,
 * exponential backoff retry, and delivery history tracking.
 *
 * SSR-safe — all browser APIs are guarded.
 */

const isBrowser = typeof window !== 'undefined'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookConfig {
  readonly id: string
  readonly url: string
  readonly events: readonly string[]
  readonly secret?: string
  readonly active: boolean
  readonly retryCount: number
}

export interface WebhookPayload {
  readonly event: string
  readonly timestamp: number
  readonly data: Record<string, unknown>
  readonly webhookId: string
}

export interface WebhookDelivery {
  readonly id: string
  readonly webhookId: string
  readonly event: string
  readonly payload: WebhookPayload
  readonly status: 'success' | 'failed'
  readonly statusCode: number | null
  readonly attempt: number
  readonly timestamp: number
  readonly error?: string
}

export interface WebhookResult {
  readonly webhookId: string
  readonly success: boolean
  readonly statusCode: number | null
  readonly error?: string
}

export type WebhookEventType =
  | 'chat.message'
  | 'user.login'
  | 'user.logout'
  | 'error.critical'
  | 'system.health'

export const WEBHOOK_EVENT_TYPES: readonly WebhookEventType[] = [
  'chat.message',
  'user.login',
  'user.logout',
  'error.critical',
  'system.health',
] as const

// ---------------------------------------------------------------------------
// HMAC Signing
// ---------------------------------------------------------------------------

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function signPayload(
  payload: string,
  secret: string,
): Promise<string> {
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is not available')
  }

  const encoder = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload) as BufferSource,
  )

  return bufferToHex(signature)
}

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

function generateId(): string {
  if (isBrowser && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// ---------------------------------------------------------------------------
// Delivery with retry
// ---------------------------------------------------------------------------

const DEFAULT_RETRY_COUNT = 3
const BASE_DELAY_MS = 1000

async function deliverWithRetry(
  url: string,
  payload: WebhookPayload,
  secret: string | undefined,
  maxRetries: number,
): Promise<{ success: boolean; statusCode: number | null; attempt: number; error?: string }> {
  const body = JSON.stringify(payload)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (secret) {
        const signature = await signPayload(body, secret)
        headers['X-Webhook-Signature'] = `sha256=${signature}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      })

      if (response.ok) {
        return { success: true, statusCode: response.status, attempt }
      }

      // Non-OK response — retry if attempts remain
      if (attempt === maxRetries) {
        return {
          success: false,
          statusCode: response.status,
          attempt,
          error: `HTTP ${response.status}`,
        }
      }
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          success: false,
          statusCode: null,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    // Exponential backoff before next retry
    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Should not reach here, but safeguard
  return { success: false, statusCode: null, attempt: maxRetries, error: 'Unknown error' }
}

// ---------------------------------------------------------------------------
// Webhook Manager
// ---------------------------------------------------------------------------

export interface WebhookManager {
  readonly register: (config: Omit<WebhookConfig, 'id'>) => string
  readonly unregister: (id: string) => void
  readonly trigger: (event: string, data: Record<string, unknown>) => Promise<WebhookResult[]>
  readonly getWebhooks: () => readonly WebhookConfig[]
  readonly getHistory: (webhookId?: string) => readonly WebhookDelivery[]
}

export function createWebhookManager(): WebhookManager {
  let webhooks: WebhookConfig[] = []
  let history: WebhookDelivery[] = []

  function register(config: Omit<WebhookConfig, 'id'>): string {
    const id = generateId()
    const webhook: WebhookConfig = {
      ...config,
      id,
    }
    webhooks = [...webhooks, webhook]
    return id
  }

  function unregister(id: string): void {
    webhooks = webhooks.filter((w) => w.id !== id)
  }

  async function trigger(
    event: string,
    data: Record<string, unknown>,
  ): Promise<WebhookResult[]> {
    const matching = webhooks.filter(
      (w) => w.active && w.events.includes(event),
    )

    const results = await Promise.all(
      matching.map(async (webhook) => {
        const payload: WebhookPayload = {
          event,
          timestamp: Date.now(),
          data,
          webhookId: webhook.id,
        }

        const retries = webhook.retryCount > 0 ? webhook.retryCount : DEFAULT_RETRY_COUNT
        const result = await deliverWithRetry(
          webhook.url,
          payload,
          webhook.secret,
          retries,
        )

        const delivery: WebhookDelivery = {
          id: generateId(),
          webhookId: webhook.id,
          event,
          payload,
          status: result.success ? 'success' : 'failed',
          statusCode: result.statusCode,
          attempt: result.attempt,
          timestamp: Date.now(),
          error: result.error,
        }

        history = [...history, delivery]

        return {
          webhookId: webhook.id,
          success: result.success,
          statusCode: result.statusCode,
          error: result.error,
        } satisfies WebhookResult
      }),
    )

    return results
  }

  function getWebhooks(): readonly WebhookConfig[] {
    return webhooks
  }

  function getHistory(webhookId?: string): readonly WebhookDelivery[] {
    if (webhookId) {
      return history.filter((d) => d.webhookId === webhookId)
    }
    return history
  }

  return { register, unregister, trigger, getWebhooks, getHistory }
}
