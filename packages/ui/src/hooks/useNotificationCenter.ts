'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface Notification {
  readonly id: string
  readonly title: string
  readonly body?: string
  readonly type: 'info' | 'success' | 'warning' | 'error'
  readonly timestamp: number
  readonly read: boolean
  readonly actionUrl?: string
  readonly source?: string
}

export interface UseNotificationCenterOptions {
  /** Maximum number of notifications to retain (default 100). */
  maxNotifications?: number
  /** localStorage key for persistence (default 'hchat-notifications'). */
  persistKey?: string
}

export interface UseNotificationCenterReturn {
  notifications: readonly Notification[]
  unreadCount: number
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadFromStorage(key: string): Notification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Notification[]
  } catch {
    return []
  }
}

function saveToStorage(key: string, notifications: readonly Notification[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(notifications))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * Manages a list of in-app notifications with localStorage persistence.
 *
 * Notifications are sorted newest-first, capped at `maxNotifications`, and
 * automatically persisted to localStorage under the given `persistKey`.
 */
export function useNotificationCenter(
  options: UseNotificationCenterOptions = {},
): UseNotificationCenterReturn {
  const { maxNotifications = 100, persistKey = 'hchat-notifications' } = options

  const [notifications, setNotifications] = useState<readonly Notification[]>(() =>
    loadFromStorage(persistKey),
  )

  const persistKeyRef = useRef(persistKey)
  const maxRef = useRef(maxNotifications)
  persistKeyRef.current = persistKey
  maxRef.current = maxNotifications

  // Persist whenever notifications change
  useEffect(() => {
    saveToStorage(persistKeyRef.current, notifications)
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const add = useCallback(
    (input: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
      const id = generateId()
      const notification: Notification = {
        ...input,
        id,
        timestamp: Date.now(),
        read: false,
      }

      setNotifications((prev) => {
        const next = [notification, ...prev]
        // Trim to max
        if (next.length > maxRef.current) {
          return next.slice(0, maxRef.current)
        }
        return next
      })

      return id
    },
    [],
  )

  const markAsRead = useCallback((id: string): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback((): void => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
  }, [])

  const remove = useCallback((id: string): void => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback((): void => {
    setNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    add,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  }
}
