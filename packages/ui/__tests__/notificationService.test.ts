import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  subscribeNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  getPreferences,
  updatePreference,
} from '../src/admin/services/notificationService'
import type { Notification } from '../src/admin/services/notificationTypes'

describe('notificationService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscribeNotifications', () => {
    it('calls callback immediately with a notification', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      const notification: Notification = callback.mock.calls[0][0]
      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('type')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('message')
      expect(notification).toHaveProperty('timestamp')
      expect(notification.read).toBe(false)

      sub.unsubscribe()
    })

    it('calls callback again after interval', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(5000)
      expect(callback).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(5000)
      expect(callback).toHaveBeenCalledTimes(3)

      sub.unsubscribe()
    })

    it('stops calling after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      sub.unsubscribe()

      vi.advanceTimersByTime(30000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('getNotifications', () => {
    it('returns all notifications without filter', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      const all = getNotifications()
      expect(all).toBeInstanceOf(Array)
      expect(all.length).toBeGreaterThan(0)

      sub.unsubscribe()
    })

    it('filters by type', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 1000)

      // Generate several notifications
      vi.advanceTimersByTime(20000)

      const all = getNotifications()
      if (all.length === 0) {
        sub.unsubscribe()
        return
      }

      const targetType = all[0].type
      const filtered = getNotifications({ types: [targetType] })
      expect(filtered.every((n) => n.type === targetType)).toBe(true)

      sub.unsubscribe()
    })
  })

  describe('markAsRead', () => {
    it('marks a specific notification as read', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      const notification: Notification = callback.mock.calls[0][0]
      markAsRead(notification.id)

      const all = getNotifications()
      const updated = all.find((n) => n.id === notification.id)
      expect(updated?.read).toBe(true)

      sub.unsubscribe()
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 1000)

      vi.advanceTimersByTime(5000)

      markAllAsRead()

      const all = getNotifications()
      expect(all.every((n) => n.read === true)).toBe(true)

      sub.unsubscribe()
    })
  })

  describe('getNotificationStats', () => {
    it('returns correct stats structure', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      const stats = getNotificationStats()
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('unread')
      expect(stats).toHaveProperty('byType')
      expect(stats).toHaveProperty('byPriority')
      expect(typeof stats.total).toBe('number')
      expect(typeof stats.unread).toBe('number')
      expect(stats.total).toBeGreaterThan(0)

      sub.unsubscribe()
    })
  })

  describe('getPreferences', () => {
    it('returns default preferences', () => {
      const prefs = getPreferences()
      expect(prefs).toBeInstanceOf(Array)
      expect(prefs.length).toBe(4)

      const channels = prefs.map((p) => p.channel)
      expect(channels).toContain('push')
      expect(channels).toContain('email')
      expect(channels).toContain('slack')
      expect(channels).toContain('teams')
    })
  })

  describe('updatePreference', () => {
    it('updates a preference', () => {
      const before = getPreferences()
      const teamsPref = before.find((p) => p.channel === 'teams')
      expect(teamsPref?.enabled).toBe(false)

      updatePreference('teams', { enabled: true })

      const after = getPreferences()
      const updated = after.find((p) => p.channel === 'teams')
      expect(updated?.enabled).toBe(true)
    })
  })
})
