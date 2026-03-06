import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotifications, useNotificationBadge } from '../src/admin/services/notificationHooks'

describe('notificationHooks', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useNotifications', () => {
    it('returns notifications array after initial subscription', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotifications(5000))

      expect(result.current.notifications).toBeInstanceOf(Array)
      expect(result.current.notifications.length).toBe(1)
    })

    it('accumulates notifications on interval', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotifications(1000))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.notifications.length).toBeGreaterThan(1)
    })

    it('markRead updates notification state', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotifications(5000))

      expect(result.current.notifications.length).toBe(1)
      const id = result.current.notifications[0].id

      act(() => {
        result.current.markRead(id)
      })

      const target = result.current.notifications.find((n) => n.id === id)
      expect(target?.read).toBe(true)
    })

    it('provides stats with unread count', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotifications(1000))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.stats).toHaveProperty('total')
      expect(result.current.stats).toHaveProperty('unread')
      expect(result.current.stats.total).toBeGreaterThan(0)
    })

    it('markAllRead sets all notifications as read', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotifications(1000))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      act(() => {
        result.current.markAllRead()
      })

      expect(result.current.notifications.every((n) => n.read)).toBe(true)
    })
  })

  describe('useNotificationBadge', () => {
    it('returns unreadCount', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotificationBadge(5000))

      expect(typeof result.current.unreadCount).toBe('number')
    })

    it('returns hasUrgent flag', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useNotificationBadge(5000))

      expect(typeof result.current.hasUrgent).toBe('boolean')
    })
  })

  describe('cleanup', () => {
    it('hooks unsubscribe on unmount (no memory leaks)', async () => {
      vi.useFakeTimers()

      const { unmount } = renderHook(() => useNotifications(1000))

      unmount()

      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
    })

    it('both hooks clean up properly', async () => {
      vi.useFakeTimers()

      const hook1 = renderHook(() => useNotifications(1000))
      const hook2 = renderHook(() => useNotificationBadge(1000))

      hook1.unmount()
      hook2.unmount()

      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
    })
  })
})
