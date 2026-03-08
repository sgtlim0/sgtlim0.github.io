import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getChatStats,
  getDailyUsage,
  getTopicClusters,
  getUserBehaviors,
  getHourlyDistribution,
  getConversationQuality,
  exportChatData,
} from '../src/admin/services/chatAnalyticsService'

describe('chatAnalyticsService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getChatStats', () => {
    it('should return chat stats with default 30d period', async () => {
      const promise = getChatStats()
      vi.advanceTimersByTime(300)
      const stats = await promise

      expect(stats).toHaveProperty('totalConversations')
      expect(stats).toHaveProperty('totalMessages')
      expect(stats).toHaveProperty('avgMessagesPerConversation')
      expect(stats).toHaveProperty('avgResponseTime')
      expect(stats).toHaveProperty('peakHour')
      expect(stats).toHaveProperty('topAssistant')
      expect(stats.peakHour).toBe(14)
    })

    it('should return lower values for 7d period', async () => {
      const promise7d = getChatStats('7d')
      vi.advanceTimersByTime(300)
      const stats7d = await promise7d

      const promise30d = getChatStats('30d')
      vi.advanceTimersByTime(300)
      const stats30d = await promise30d

      expect(stats7d.totalConversations).toBeLessThan(stats30d.totalConversations)
      expect(stats7d.totalMessages).toBeLessThan(stats30d.totalMessages)
    })

    it('should return higher values for 90d period', async () => {
      const promise90d = getChatStats('90d')
      vi.advanceTimersByTime(300)
      const stats90d = await promise90d

      const promise30d = getChatStats('30d')
      vi.advanceTimersByTime(300)
      const stats30d = await promise30d

      expect(stats90d.totalConversations).toBeGreaterThan(stats30d.totalConversations)
    })
  })

  describe('getDailyUsage', () => {
    it('should return daily usage data', async () => {
      const promise = getDailyUsage(7)
      vi.advanceTimersByTime(300)
      const usage = await promise

      expect(usage.length).toBeGreaterThan(0)
      usage.forEach((u) => {
        expect(u).toHaveProperty('date')
        expect(u).toHaveProperty('conversations')
        expect(u).toHaveProperty('messages')
        expect(u).toHaveProperty('uniqueUsers')
        expect(u.conversations).toBeGreaterThanOrEqual(0)
      })
    })

    it('should default to 30 days', async () => {
      const promise = getDailyUsage()
      vi.advanceTimersByTime(300)
      const usage = await promise

      expect(usage.length).toBe(31) // 30 days + today
    })
  })

  describe('getTopicClusters', () => {
    it('should return topic clusters', async () => {
      const promise = getTopicClusters()
      vi.advanceTimersByTime(400)
      const clusters = await promise

      expect(clusters.length).toBeGreaterThan(0)
      clusters.forEach((c) => {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('name')
        expect(c).toHaveProperty('keywords')
        expect(c).toHaveProperty('count')
        expect(c).toHaveProperty('percentage')
        expect(c).toHaveProperty('trend')
        expect(['up', 'down', 'stable']).toContain(c.trend)
      })
    })

    it('should have percentages that roughly sum to 100', async () => {
      const promise = getTopicClusters()
      vi.advanceTimersByTime(400)
      const clusters = await promise

      const totalPercent = clusters.reduce((sum, c) => sum + c.percentage, 0)
      expect(totalPercent).toBe(100)
    })
  })

  describe('getUserBehaviors', () => {
    it('should return user behavior data', async () => {
      const promise = getUserBehaviors()
      vi.advanceTimersByTime(300)
      const behaviors = await promise

      expect(behaviors.length).toBeGreaterThan(0)
      behaviors.forEach((b) => {
        expect(b).toHaveProperty('feature')
        expect(b).toHaveProperty('usageCount')
        expect(b).toHaveProperty('avgDuration')
        expect(b).toHaveProperty('satisfactionRate')
        expect(b.satisfactionRate).toBeGreaterThanOrEqual(0)
        expect(b.satisfactionRate).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('getHourlyDistribution', () => {
    it('should return 24 hour entries', async () => {
      const promise = getHourlyDistribution()
      vi.advanceTimersByTime(200)
      const distribution = await promise

      expect(distribution).toHaveLength(24)
      distribution.forEach((d) => {
        expect(d).toHaveProperty('hour')
        expect(d).toHaveProperty('count')
        expect(d.hour).toBeGreaterThanOrEqual(0)
        expect(d.hour).toBeLessThanOrEqual(23)
      })
    })

    it('should have peak hours during business hours', async () => {
      const promise = getHourlyDistribution()
      vi.advanceTimersByTime(200)
      const distribution = await promise

      const peakHour = distribution.reduce(
        (max, d) => (d.count > max.count ? d : max),
        distribution[0],
      )
      expect(peakHour.hour).toBeGreaterThanOrEqual(9)
      expect(peakHour.hour).toBeLessThanOrEqual(16)
    })
  })

  describe('getConversationQuality', () => {
    it('should return quality metrics', async () => {
      const promise = getConversationQuality()
      vi.advanceTimersByTime(300)
      const quality = await promise

      expect(quality).toHaveProperty('avgRating')
      expect(quality).toHaveProperty('responseTimeP50')
      expect(quality).toHaveProperty('responseTimeP95')
      expect(quality).toHaveProperty('errorRate')
      expect(quality).toHaveProperty('completionRate')
      expect(quality.avgRating).toBeGreaterThan(0)
      expect(quality.responseTimeP50).toBeLessThan(quality.responseTimeP95)
    })
  })

  describe('exportChatData', () => {
    it('should return download info for CSV', async () => {
      const promise = exportChatData('csv', '30d')
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('fileName')
      expect(result.fileName).toContain('.csv')
      expect(result.fileName).toContain('30d')
    })

    it('should return download info for PDF', async () => {
      const promise = exportChatData('pdf', '7d')
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result.fileName).toContain('.pdf')
      expect(result.fileName).toContain('7d')
    })
  })
})
