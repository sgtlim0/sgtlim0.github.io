'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createWebhookManager,
} from '../utils/webhookService'
import type {
  WebhookConfig,
  WebhookDelivery,
  WebhookManager,
  WebhookResult,
} from '../utils/webhookService'

export interface UseWebhookReturn {
  readonly webhooks: readonly WebhookConfig[]
  readonly history: readonly WebhookDelivery[]
  readonly register: (config: Omit<WebhookConfig, 'id'>) => string
  readonly unregister: (id: string) => void
  readonly trigger: (event: string, data: Record<string, unknown>) => Promise<WebhookResult[]>
}

/**
 * React hook wrapping the WebhookManager.
 *
 * Provides register, unregister, and trigger with reactive state
 * for the webhook list and delivery history.
 *
 * SSR-safe — manager is lazily initialized on the client.
 */
export function useWebhook(): UseWebhookReturn {
  const managerRef = useRef<WebhookManager | null>(null)

  // Lazy-init on client side (SSR-safe)
  if (managerRef.current === null && typeof window !== 'undefined') {
    managerRef.current = createWebhookManager()
  }

  const [webhooks, setWebhooks] = useState<readonly WebhookConfig[]>([])
  const [history, setHistory] = useState<readonly WebhookDelivery[]>([])

  // Sync state from manager
  const syncState = useCallback(() => {
    if (!managerRef.current) return
    setWebhooks(managerRef.current.getWebhooks())
    setHistory(managerRef.current.getHistory())
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current = null
    }
  }, [])

  const register = useCallback(
    (config: Omit<WebhookConfig, 'id'>): string => {
      if (!managerRef.current) return ''
      const id = managerRef.current.register(config)
      syncState()
      return id
    },
    [syncState],
  )

  const unregister = useCallback(
    (id: string): void => {
      managerRef.current?.unregister(id)
      syncState()
    },
    [syncState],
  )

  const trigger = useCallback(
    async (event: string, data: Record<string, unknown>): Promise<WebhookResult[]> => {
      if (!managerRef.current) return []
      const results = await managerRef.current.trigger(event, data)
      syncState()
      return results
    },
    [syncState],
  )

  return { webhooks, history, register, unregister, trigger }
}
