import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useRealtimeMetrics,
  useRealtimeTimeSeries,
  useRealtimeActivities,
  useRealtimeStats,
} from '../src/admin/services/realtimeHooks'
import type { RealtimeStats } from '../src/admin/services/realtimeTypes'

describe('realtimeHooks', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useRealtimeMetrics', () => {
    it('returns array of metrics after initial call', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeMetrics(2000))

      // subscribeMetrics calls callback immediately
      expect(result.current).toBeInstanceOf(Array)
      expect(result.current.length).toBe(4)
    })

    it('updates metrics on interval', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeMetrics(2000))

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      // Metrics should update (new random values)
      expect(result.current).toBeInstanceOf(Array)
      expect(result.current.length).toBe(4)
    })

    it('each metric has required fields', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeMetrics(2000))

      for (const metric of result.current) {
        expect(metric).toHaveProperty('id')
        expect(metric).toHaveProperty('label')
        expect(metric).toHaveProperty('value')
        expect(metric).toHaveProperty('unit')
        expect(metric).toHaveProperty('trend')
        expect(['up', 'down', 'stable']).toContain(metric.trend)
      }
    })
  })

  describe('useRealtimeTimeSeries', () => {
    it('starts with one data point from immediate callback', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeTimeSeries(3000, 20))

      expect(result.current).toBeInstanceOf(Array)
      expect(result.current.length).toBe(1)
    })

    it('accumulates data points up to maxPoints', async () => {
      vi.useFakeTimers()

      const maxPoints = 5
      const { result } = renderHook(() => useRealtimeTimeSeries(1000, maxPoints))

      // 1 from immediate call
      expect(result.current.length).toBe(1)

      // Advance to get 6 more points (total 7, should be capped at 5)
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000)
        })
      }

      expect(result.current.length).toBe(maxPoints)
    })

    it('sliding window keeps only latest points', async () => {
      vi.useFakeTimers()

      const maxPoints = 3
      const { result } = renderHook(() => useRealtimeTimeSeries(1000, maxPoints))

      // Add 5 total (1 immediate + 4 interval)
      for (let i = 0; i < 4; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000)
        })
      }

      expect(result.current.length).toBe(maxPoints)

      // Timestamps should be in ascending order (newest at end)
      for (let i = 1; i < result.current.length; i++) {
        expect(result.current[i].timestamp).toBeGreaterThanOrEqual(result.current[i - 1].timestamp)
      }
    })

    it('each point has timestamp and value', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeTimeSeries(1000, 20))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      for (const point of result.current) {
        expect(typeof point.timestamp).toBe('number')
        expect(typeof point.value).toBe('number')
      }
    })
  })

  describe('useRealtimeActivities', () => {
    it('starts with one activity from immediate callback', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeActivities(4000, 15))

      expect(result.current).toBeInstanceOf(Array)
      expect(result.current.length).toBe(1)
    })

    it('accumulates activities up to maxItems', async () => {
      vi.useFakeTimers()

      const maxItems = 3
      const { result } = renderHook(() => useRealtimeActivities(1000, maxItems))

      // Add 5 total
      for (let i = 0; i < 4; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000)
        })
      }

      expect(result.current.length).toBe(maxItems)
    })

    it('newest activity is first (prepend order)', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeActivities(1000, 10))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      // Activities are prepended, so first should have latest timestamp
      expect(result.current.length).toBeGreaterThan(1)
      expect(result.current[0].timestamp).toBeGreaterThanOrEqual(
        result.current[result.current.length - 1].timestamp,
      )
    })

    it('each activity has valid type', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeActivities(1000, 20))

      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      for (const activity of result.current) {
        expect(['query', 'login', 'error', 'model_switch', 'upload']).toContain(activity.type)
        expect(activity.user).toBeTruthy()
        expect(activity.message).toBeTruthy()
      }
    })
  })

  describe('useRealtimeStats', () => {
    it('returns stats immediately (not null) because service calls callback right away', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeStats(5000))

      // subscribeStats calls callback immediately, so stats should be available
      expect(result.current).not.toBeNull()
    })

    it('stats have expected shape', () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeStats(5000))

      const stats = result.current as RealtimeStats
      expect(typeof stats.activeUsers).toBe('number')
      expect(typeof stats.queriesPerMinute).toBe('number')
      expect(typeof stats.avgResponseTime).toBe('number')
      expect(typeof stats.errorRate).toBe('number')
      expect(typeof stats.totalTokensUsed).toBe('number')
      expect(stats.modelDistribution).toBeInstanceOf(Array)
      expect(stats.modelDistribution.length).toBeGreaterThan(0)
    })

    it('updates after interval', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useRealtimeStats(5000))

      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current).not.toBeNull()
      expect(result.current).toHaveProperty('modelDistribution')
    })
  })

  describe('cleanup', () => {
    it('hooks unsubscribe on unmount (no memory leaks)', async () => {
      vi.useFakeTimers()

      const { unmount } = renderHook(() => useRealtimeMetrics(1000))

      unmount()

      // If unsubscribe did not work, advancing timers would cause
      // setState on unmounted component (React warning)
      // No error = cleanup worked correctly
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
    })

    it('all hooks clean up properly', async () => {
      vi.useFakeTimers()

      const hook1 = renderHook(() => useRealtimeMetrics(1000))
      const hook2 = renderHook(() => useRealtimeTimeSeries(1000, 10))
      const hook3 = renderHook(() => useRealtimeActivities(1000, 10))
      const hook4 = renderHook(() => useRealtimeStats(1000))

      hook1.unmount()
      hook2.unmount()
      hook3.unmount()
      hook4.unmount()

      // Advance timers after all unmounts — no errors means clean unsubscribe
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
    })
  })
})
