import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  subscribeMetrics,
  subscribeTimeSeries,
  subscribeActivities,
  subscribeStats,
} from '../src/admin/services/realtimeService'
import type {
  RealtimeMetric,
  RealtimeDataPoint,
  RealtimeActivity,
  RealtimeStats,
} from '../src/admin/services/realtimeTypes'

describe('realtimeService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscribeMetrics', () => {
    it('calls callback immediately with 4 metrics', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 2000)

      expect(callback).toHaveBeenCalledTimes(1)
      const metrics: RealtimeMetric[] = callback.mock.calls[0][0]
      expect(metrics).toHaveLength(4)

      sub.unsubscribe()
    })

    it('each metric has all required fields', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 2000)

      const metrics: RealtimeMetric[] = callback.mock.calls[0][0]
      for (const metric of metrics) {
        expect(metric).toHaveProperty('id')
        expect(metric).toHaveProperty('label')
        expect(metric).toHaveProperty('value')
        expect(metric).toHaveProperty('previousValue')
        expect(metric).toHaveProperty('unit')
        expect(metric).toHaveProperty('trend')
        expect(metric).toHaveProperty('changePercent')
        expect(['up', 'down', 'stable']).toContain(metric.trend)
        expect(typeof metric.value).toBe('number')
        expect(typeof metric.changePercent).toBe('number')
      }

      sub.unsubscribe()
    })

    it('calls callback again after interval', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 2000)

      expect(callback).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalledTimes(3)

      sub.unsubscribe()
    })

    it('stops calling after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeMetrics(callback, 2000)

      expect(callback).toHaveBeenCalledTimes(1)
      sub.unsubscribe()

      vi.advanceTimersByTime(10000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscribeTimeSeries', () => {
    it('calls callback immediately with a data point', () => {
      const callback = vi.fn()
      const sub = subscribeTimeSeries(callback, 3000)

      expect(callback).toHaveBeenCalledTimes(1)
      const point: RealtimeDataPoint = callback.mock.calls[0][0]
      expect(point).toHaveProperty('timestamp')
      expect(point).toHaveProperty('value')
      expect(typeof point.timestamp).toBe('number')
      expect(typeof point.value).toBe('number')

      sub.unsubscribe()
    })

    it('produces data points on interval', () => {
      const callback = vi.fn()
      const sub = subscribeTimeSeries(callback, 3000)

      vi.advanceTimersByTime(9000)
      expect(callback).toHaveBeenCalledTimes(4) // 1 immediate + 3 intervals

      sub.unsubscribe()
    })

    it('stops after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeTimeSeries(callback, 3000)

      sub.unsubscribe()
      vi.advanceTimersByTime(9000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscribeActivities', () => {
    it('calls callback immediately with an activity', () => {
      const callback = vi.fn()
      const sub = subscribeActivities(callback, 4000)

      expect(callback).toHaveBeenCalledTimes(1)
      const activity: RealtimeActivity = callback.mock.calls[0][0]
      expect(activity).toHaveProperty('id')
      expect(activity).toHaveProperty('type')
      expect(activity).toHaveProperty('user')
      expect(activity).toHaveProperty('message')
      expect(activity).toHaveProperty('timestamp')

      sub.unsubscribe()
    })

    it('activity type is valid', () => {
      const callback = vi.fn()
      const sub = subscribeActivities(callback, 4000)

      vi.advanceTimersByTime(40000) // get many activities
      for (const call of callback.mock.calls) {
        const activity: RealtimeActivity = call[0]
        expect(['query', 'login', 'error', 'model_switch', 'upload']).toContain(activity.type)
      }

      sub.unsubscribe()
    })

    it('stops after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeActivities(callback, 4000)

      sub.unsubscribe()
      vi.advanceTimersByTime(20000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscribeStats', () => {
    it('calls callback immediately with stats', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      expect(callback).toHaveBeenCalledTimes(1)
      const stats: RealtimeStats = callback.mock.calls[0][0]
      expect(stats).toHaveProperty('activeUsers')
      expect(stats).toHaveProperty('queriesPerMinute')
      expect(stats).toHaveProperty('avgResponseTime')
      expect(stats).toHaveProperty('errorRate')
      expect(stats).toHaveProperty('totalTokensUsed')
      expect(stats).toHaveProperty('modelDistribution')

      sub.unsubscribe()
    })

    it('modelDistribution has items', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      const stats: RealtimeStats = callback.mock.calls[0][0]
      expect(stats.modelDistribution.length).toBeGreaterThan(0)

      for (const item of stats.modelDistribution) {
        expect(item).toHaveProperty('model')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('percentage')
      }

      sub.unsubscribe()
    })

    it('distribution percentages sum approximately to 100', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      const stats: RealtimeStats = callback.mock.calls[0][0]
      const totalPercentage = stats.modelDistribution.reduce(
        (sum, item) => sum + item.percentage,
        0,
      )
      expect(totalPercentage).toBeGreaterThan(95)
      expect(totalPercentage).toBeLessThanOrEqual(105)

      sub.unsubscribe()
    })

    it('stops after unsubscribe', () => {
      const callback = vi.fn()
      const sub = subscribeStats(callback, 5000)

      sub.unsubscribe()
      vi.advanceTimersByTime(25000)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanup', () => {
    it('all subscriptions properly clean up with unsubscribe', () => {
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      const cb3 = vi.fn()
      const cb4 = vi.fn()

      const sub1 = subscribeMetrics(cb1, 1000)
      const sub2 = subscribeTimeSeries(cb2, 1000)
      const sub3 = subscribeActivities(cb3, 1000)
      const sub4 = subscribeStats(cb4, 1000)

      // Each called once immediately
      expect(cb1).toHaveBeenCalledTimes(1)
      expect(cb2).toHaveBeenCalledTimes(1)
      expect(cb3).toHaveBeenCalledTimes(1)
      expect(cb4).toHaveBeenCalledTimes(1)

      sub1.unsubscribe()
      sub2.unsubscribe()
      sub3.unsubscribe()
      sub4.unsubscribe()

      vi.advanceTimersByTime(10000)

      // No additional calls after unsubscribe
      expect(cb1).toHaveBeenCalledTimes(1)
      expect(cb2).toHaveBeenCalledTimes(1)
      expect(cb3).toHaveBeenCalledTimes(1)
      expect(cb4).toHaveBeenCalledTimes(1)
    })
  })
})
