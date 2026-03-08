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

describe('notificationService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscribeNotifications', () => {
    it('should immediately deliver first notification', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      const notification = callback.mock.calls[0][0]
      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('type')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('message')
      expect(notification).toHaveProperty('timestamp')
      expect(notification.read).toBe(false)

      sub.unsubscribe()
    })

    it('should deliver notifications at specified interval', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 2000)

      expect(callback).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalledTimes(3)

      sub.unsubscribe()
    })

    it('should stop delivering after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 1000)

      expect(callback).toHaveBeenCalledTimes(1)
      sub.unsubscribe()

      vi.advanceTimersByTime(5000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('getNotifications', () => {
    it('should return notifications after subscription', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 10000)

      const notifications = getNotifications()
      expect(notifications.length).toBeGreaterThan(0)

      sub.unsubscribe()
    })

    it('should filter by type', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 500)
      vi.advanceTimersByTime(5000)

      const errors = getNotifications({ types: ['error'] })
      errors.forEach((n) => {
        expect(n.type).toBe('error')
      })

      sub.unsubscribe()
    })

    it('should filter by priority', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 500)
      vi.advanceTimersByTime(5000)

      const critical = getNotifications({ priorities: ['critical'] })
      critical.forEach((n) => {
        expect(n.priority).toBe('critical')
      })

      sub.unsubscribe()
    })

    it('should filter by read status', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 10000)

      const unread = getNotifications({ read: false })
      unread.forEach((n) => {
        expect(n.read).toBe(false)
      })

      sub.unsubscribe()
    })

    it('should return all without filter', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 500)
      vi.advanceTimersByTime(2000)

      const all = getNotifications()
      expect(all.length).toBeGreaterThan(0)

      sub.unsubscribe()
    })
  })

  describe('markAsRead', () => {
    it('should mark a single notification as read', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 10000)

      const notifications = getNotifications()
      expect(notifications.length).toBeGreaterThan(0)

      const targetId = notifications[0].id
      markAsRead(targetId)

      const updated = getNotifications()
      const readNotif = updated.find((n) => n.id === targetId)
      expect(readNotif?.read).toBe(true)

      sub.unsubscribe()
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 500)
      vi.advanceTimersByTime(2000)

      markAllAsRead()

      const notifications = getNotifications()
      notifications.forEach((n) => {
        expect(n.read).toBe(true)
      })

      sub.unsubscribe()
    })
  })

  describe('getNotificationStats', () => {
    it('should return stats summary', () => {
      const callback = vi.fn()
      const sub = subscribeNotifications(callback, 500)
      vi.advanceTimersByTime(2000)

      const stats = getNotificationStats()
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('unread')
      expect(stats).toHaveProperty('byType')
      expect(stats).toHaveProperty('byPriority')
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.byType).toHaveProperty('info')
      expect(stats.byType).toHaveProperty('warning')
      expect(stats.byType).toHaveProperty('error')
      expect(stats.byType).toHaveProperty('success')

      sub.unsubscribe()
    })
  })

  describe('getPreferences', () => {
    it('should return notification preferences for all channels', () => {
      const prefs = getPreferences()

      expect(prefs.length).toBeGreaterThan(0)
      prefs.forEach((p) => {
        expect(p).toHaveProperty('channel')
        expect(p).toHaveProperty('enabled')
        expect(p).toHaveProperty('types')
      })

      const channels = prefs.map((p) => p.channel)
      expect(channels).toContain('push')
      expect(channels).toContain('email')
    })
  })

  describe('updatePreference', () => {
    it('should update preference for a channel', () => {
      updatePreference('push', { enabled: false })

      const prefs = getPreferences()
      const pushPref = prefs.find((p) => p.channel === 'push')
      expect(pushPref?.enabled).toBe(false)

      // Restore
      updatePreference('push', { enabled: true })
    })

    it('should update types for a channel', () => {
      updatePreference('slack', { types: ['error', 'warning'] })

      const prefs = getPreferences()
      const slackPref = prefs.find((p) => p.channel === 'slack')
      expect(slackPref?.types).toEqual(['error', 'warning'])

      // Restore
      updatePreference('slack', { types: ['error'] })
    })
  })
})
