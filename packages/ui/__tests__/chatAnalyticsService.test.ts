import { describe, it, expect } from 'vitest'
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
  describe('getChatStats', () => {
    it('should return stats for 7d period', async () => {
      const stats = await getChatStats('7d')
      expect(stats.totalConversations).toBeGreaterThan(0)
      expect(stats.totalMessages).toBeGreaterThan(0)
      expect(stats.avgMessagesPerConversation).toBeGreaterThan(0)
      expect(stats.peakHour).toBeGreaterThanOrEqual(0)
      expect(stats.peakHour).toBeLessThanOrEqual(23)
    })

    it('should return larger numbers for 30d vs 7d', async () => {
      const stats7d = await getChatStats('7d')
      const stats30d = await getChatStats('30d')
      expect(stats30d.totalConversations).toBeGreaterThan(stats7d.totalConversations)
    })

    it('should include top assistant', async () => {
      const stats = await getChatStats()
      expect(stats.topAssistant).toBeDefined()
      expect(stats.topAssistant.length).toBeGreaterThan(0)
    })
  })

  describe('getDailyUsage', () => {
    it('should return data for specified days', async () => {
      const data = await getDailyUsage(7)
      expect(data.length).toBe(8) // 0 to 7 inclusive
    })

    it('should include all required fields', async () => {
      const data = await getDailyUsage(3)
      data.forEach((d) => {
        expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(d.conversations).toBeGreaterThanOrEqual(0)
        expect(d.messages).toBeGreaterThanOrEqual(0)
        expect(d.uniqueUsers).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('getTopicClusters', () => {
    it('should return clusters with percentages', async () => {
      const clusters = await getTopicClusters()
      expect(clusters.length).toBeGreaterThan(0)
      const totalPct = clusters.reduce((sum, c) => sum + c.percentage, 0)
      expect(totalPct).toBe(100)
    })

    it('should include keywords', async () => {
      const clusters = await getTopicClusters()
      clusters.forEach((c) => {
        expect(c.keywords.length).toBeGreaterThan(0)
        expect(c.trend).toMatch(/up|down|stable/)
      })
    })
  })

  describe('getUserBehaviors', () => {
    it('should return behavior data', async () => {
      const behaviors = await getUserBehaviors()
      expect(behaviors.length).toBeGreaterThan(0)
      behaviors.forEach((b) => {
        expect(b.feature).toBeDefined()
        expect(b.usageCount).toBeGreaterThan(0)
        expect(b.satisfactionRate).toBeGreaterThanOrEqual(0)
        expect(b.satisfactionRate).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('getHourlyDistribution', () => {
    it('should return 24 hours', async () => {
      const dist = await getHourlyDistribution()
      expect(dist.length).toBe(24)
      dist.forEach((d) => {
        expect(d.hour).toBeGreaterThanOrEqual(0)
        expect(d.hour).toBeLessThanOrEqual(23)
      })
    })
  })

  describe('getConversationQuality', () => {
    it('should return quality metrics', async () => {
      const quality = await getConversationQuality()
      expect(quality.avgRating).toBeGreaterThan(0)
      expect(quality.responseTimeP50).toBeLessThan(quality.responseTimeP95)
      expect(quality.errorRate).toBeGreaterThanOrEqual(0)
      expect(quality.completionRate).toBeGreaterThan(0)
    })
  })

  describe('exportChatData', () => {
    it('should return download url and filename', async () => {
      const result = await exportChatData('csv', '30d')
      expect(result.url).toBeDefined()
      expect(result.fileName).toContain('.csv')
    })

    it('should support pdf format', async () => {
      const result = await exportChatData('pdf', '7d')
      expect(result.fileName).toContain('.pdf')
    })
  })
})
