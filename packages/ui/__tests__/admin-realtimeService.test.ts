import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  subscribeMetrics,
  subscribeTimeSeries,
  subscribeActivities,
  subscribeStats,
} from '../src/admin/services/realtimeService'

describe('realtimeService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscribeMetrics', () => {
    it('should deliver initial metrics immediately', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      const metrics = callback.mock.calls[0][0]
      expect(metrics).toBeInstanceOf(Array)
      expect(metrics.length).toBe(4)

      sub.unsubscribe()
    })

    it('should deliver metric objects with required fields', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 5000)

      const metrics = callback.mock.calls[0][0]
      metrics.forEach((m: Record<string, unknown>) => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('label')
        expect(m).toHaveProperty('value')
        expect(m).toHaveProperty('unit')
        expect(m).toHaveProperty('trend')
        expect(m).toHaveProperty('changePercent')
        expect(['up', 'down', 'stable']).toContain(m.trend)
      })

      sub.unsubscribe()
    })

    it('should deliver at intervals', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 2000)

      vi.advanceTimersByTime(4000)
      expect(callback).toHaveBeenCalledTimes(3) // initial + 2

      sub.unsubscribe()
    })

    it('should stop after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 1000)
      sub.unsubscribe()

      vi.advanceTimersByTime(5000)
      expect(callback).toHaveBeenCalledTimes(1) // only initial
    })
  })

  describe('subscribeTimeSeries', () => {
    it('should deliver initial data point', () => {
      const callback = vi.fn()
      const sub = subscribeTimeSeries(callback, 3000)

      expect(callback).toHaveBeenCalledTimes(1)
      const point = callback.mock.calls[0][0]
      expect(point).toHaveProperty('timestamp')
      expect(point).toHaveProperty('value')
      expect(typeof point.timestamp).toBe('number')
      expect(typeof point.value).toBe('number')

      sub.unsubscribe()
    })

    it('should deliver at intervals', () => {
      const callback = vi.fn()
      const sub = subscribeTimeSeries(callback, 1000)

      vi.advanceTimersByTime(3000)
      expect(callback).toHaveBeenCalledTimes(4) // initial + 3

      sub.unsubscribe()
    })
  })

  describe('subscribeActivities', () => {
    it('should deliver initial activity', () => {
      const callback = vi.fn()
      const sub = subscribeActivities(callback, 4000)

      expect(callback).toHaveBeenCalledTimes(1)
      const activity = callback.mock.calls[0][0]
      expect(activity).toHaveProperty('id')
      expect(activity).toHaveProperty('type')
      expect(activity).toHaveProperty('user')
      expect(activity).toHaveProperty('message')
      expect(activity).toHaveProperty('timestamp')
      expect(['query', 'login', 'error', 'model_switch', 'upload']).toContain(activity.type)

      sub.unsubscribe()
    })

    it('should stop after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeActivities(callback, 1000)
      sub.unsubscribe()

      vi.advanceTimersByTime(5000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscribeStats', () => {
    it('should deliver initial stats', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      const stats = callback.mock.calls[0][0]
      expect(stats).toHaveProperty('activeUsers')
      expect(stats).toHaveProperty('queriesPerMinute')
      expect(stats).toHaveProperty('avgResponseTime')
      expect(stats).toHaveProperty('errorRate')
      expect(stats).toHaveProperty('totalTokensUsed')
      expect(stats).toHaveProperty('modelDistribution')
      expect(stats.modelDistribution).toBeInstanceOf(Array)

      sub.unsubscribe()
    })

    it('should have model distribution with percentages', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      const stats = callback.mock.calls[0][0]
      stats.modelDistribution.forEach((m: Record<string, unknown>) => {
        expect(m).toHaveProperty('model')
        expect(m).toHaveProperty('count')
        expect(m).toHaveProperty('percentage')
        expect(typeof m.percentage).toBe('number')
      })

      sub.unsubscribe()
    })

    it('should deliver at intervals', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 2000)

      vi.advanceTimersByTime(4000)
      expect(callback).toHaveBeenCalledTimes(3)

      sub.unsubscribe()
    })
  })
})
