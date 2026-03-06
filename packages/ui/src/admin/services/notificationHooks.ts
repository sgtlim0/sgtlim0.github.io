'use client'

/**
 * Notification Hooks
 *
 * React hooks that wrap the notification service subscriptions.
 * Each hook manages subscription lifecycle and provides immutable state updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationPreference,
  NotificationChannel,
} from './notificationTypes'
import {
  subscribeNotifications,
  getNotifications,
  markAsRead as serviceMarkAsRead,
  markAllAsRead as serviceMarkAllAsRead,
  getNotificationStats,
  getPreferences,
  updatePreference as serviceUpdatePreference,
} from './notificationService'

/**
 * Hook for real-time notification feed with filtering and actions
 *
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 * @param maxItems - Maximum notifications to retain in state (default: 50)
 * @param filter - Optional filter to apply to notifications
 * @returns Notifications state and action handlers
 */
export function useNotifications(
  intervalMs: number = 5000,
  maxItems: number = 50,
  filter?: NotificationFilter,
) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: { info: 0, warning: 0, error: 0, success: 0 },
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
  })
  const [preferences, setPreferences] = useState<NotificationPreference[]>(() => getPreferences())

  useEffect(() => {
    const subscription = subscribeNotifications((notification) => {
      setNotifications((prev) => {
        const next = [notification, ...prev]
        return next.length > maxItems ? next.slice(0, maxItems) : next
      })
      setStats(getNotificationStats())
    }, intervalMs)

    return () => subscription.unsubscribe()
  }, [intervalMs, maxItems])

  const filteredNotifications = useMemo(() => {
    if (!filter) return notifications

    return notifications.filter((n) => {
      if (filter.types && !filter.types.includes(n.type)) return false
      if (filter.priorities && !filter.priorities.includes(n.priority)) return false
      if (filter.read !== undefined && n.read !== filter.read) return false
      if (filter.source && n.source !== filter.source) return false
      if (filter.from && n.timestamp < filter.from) return false
      if (filter.to && n.timestamp > filter.to) return false
      return true
    })
  }, [notifications, filter])

  const markRead = useCallback((id: string) => {
    serviceMarkAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setStats(getNotificationStats())
  }, [])

  const markAllRead = useCallback(() => {
    serviceMarkAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setStats(getNotificationStats())
  }, [])

  const updatePref = useCallback(
    (channel: NotificationChannel, update: Partial<Omit<NotificationPreference, 'channel'>>) => {
      serviceUpdatePreference(channel, update)
      setPreferences(getPreferences())
    },
    [],
  )

  return {
    notifications: filteredNotifications,
    stats,
    preferences,
    markRead,
    markAllRead,
    updatePref,
  }
}

/**
 * Lightweight hook for notification badge (unread count + urgency indicator)
 *
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 * @returns Unread count and urgency flag
 */
export function useNotificationBadge(intervalMs: number = 5000) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasUrgent, setHasUrgent] = useState(false)

  useEffect(() => {
    const subscription = subscribeNotifications(() => {
      const stats = getNotificationStats()
      setUnreadCount(stats.unread)

      const urgentUnread = getNotifications({
        read: false,
        priorities: ['critical', 'high'],
      })
      setHasUrgent(urgentUnread.length > 0)
    }, intervalMs)

    return () => subscription.unsubscribe()
  }, [intervalMs])

  return { unreadCount, hasUrgent }
}
