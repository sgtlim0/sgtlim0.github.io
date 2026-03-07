import { describe, it, expect } from 'vitest'
import {
  detectAnomalies,
  predictFuture,
  generateInsights,
  getAnalyticsSummary,
  getMockAnalyticsData,
} from '../src/admin/services/analyticsService'
import type { TimeSeriesPoint } from '../src/admin/services/analyticsTypes'

function makeData(values: number[]): TimeSeriesPoint[] {
  return values.map((v, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    value: v,
  }))
}

describe('analyticsService', () => {
  describe('detectAnomalies', () => {
    it('should return no anomalies for stable data', () => {
      const data = makeData([100, 102, 98, 101, 99, 100, 103])
      const results = detectAnomalies(data)
      const anomalies = results.filter((r) => r.isAnomaly)
      expect(anomalies.length).toBe(0)
    })

    it('should detect spike anomaly', () => {
      const data = makeData([100, 100, 100, 100, 100, 500, 100])
      const results = detectAnomalies(data)
      const anomalies = results.filter((r) => r.isAnomaly)
      expect(anomalies.length).toBeGreaterThan(0)
      expect(anomalies.some((a) => a.type === 'spike')).toBe(true)
    })

    it('should detect drop anomaly', () => {
      const data = makeData([500, 500, 500, 500, 500, 50, 500])
      const results = detectAnomalies(data)
      const anomalies = results.filter((r) => r.isAnomaly)
      expect(anomalies.some((a) => a.type === 'drop')).toBe(true)
    })

    it('should return zscore for each point', () => {
      const data = makeData([10, 20, 30])
      const results = detectAnomalies(data)
      results.forEach((r) => {
        expect(typeof r.zscore).toBe('number')
      })
    })

    it('should handle small datasets', () => {
      const data = makeData([10, 20])
      const results = detectAnomalies(data)
      expect(results.length).toBe(2)
    })

    it('should respect custom threshold', () => {
      const data = makeData([100, 100, 100, 150, 100])
      const lowThreshold = detectAnomalies(data, 1.0)
      const highThreshold = detectAnomalies(data, 3.0)

      const lowAnomalies = lowThreshold.filter((r) => r.isAnomaly).length
      const highAnomalies = highThreshold.filter((r) => r.isAnomaly).length
      expect(lowAnomalies).toBeGreaterThanOrEqual(highAnomalies)
    })
  })

  describe('predictFuture', () => {
    it('should predict specified number of periods', () => {
      const data = makeData([100, 110, 120, 130, 140])
      const predictions = predictFuture(data, 5)
      expect(predictions.length).toBe(5)
    })

    it('should predict increasing trend for increasing data', () => {
      const data = makeData([100, 120, 140, 160, 180, 200])
      const predictions = predictFuture(data, 3)
      expect(predictions[0].predicted).toBeGreaterThan(200)
    })

    it('should include confidence bounds', () => {
      const data = makeData([100, 110, 120, 130])
      const predictions = predictFuture(data, 3)
      predictions.forEach((p) => {
        expect(p.lowerBound).toBeLessThanOrEqual(p.predicted)
        expect(p.upperBound).toBeGreaterThanOrEqual(p.predicted)
      })
    })

    it('should not predict negative values', () => {
      const data = makeData([10, 8, 6, 4, 2])
      const predictions = predictFuture(data, 10)
      predictions.forEach((p) => {
        expect(p.predicted).toBeGreaterThanOrEqual(0)
        expect(p.lowerBound).toBeGreaterThanOrEqual(0)
      })
    })

    it('should return empty for insufficient data', () => {
      const data = makeData([100])
      const predictions = predictFuture(data, 3)
      expect(predictions.length).toBe(0)
    })

    it('should generate valid dates', () => {
      const data = makeData([100, 200, 300])
      const predictions = predictFuture(data, 2)
      predictions.forEach((p) => {
        expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })
  })

  describe('generateInsights', () => {
    it('should generate trend insight for significant change', () => {
      const data = makeData([100, 100, 100, 100, 100, 100, 100, 200, 200, 200, 200, 200, 200, 200])
      const insights = generateInsights(data, 'API 호출')
      expect(insights.some((i) => i.category === 'usage')).toBe(true)
    })

    it('should generate stability insight for flat data', () => {
      const data = makeData([100, 101, 99, 100, 102, 98, 100, 100, 101, 99, 100, 102, 98, 100])
      const insights = generateInsights(data, '사용자 수')
      expect(insights.some((i) => i.title.includes('안정'))).toBe(true)
    })

    it('should return empty for too short data', () => {
      const data = makeData([100, 200, 300])
      const insights = generateInsights(data, 'test')
      expect(insights.length).toBe(0)
    })

    it('should include actionable suggestions', () => {
      const data = makeData([100, 100, 100, 100, 100, 100, 100, 300, 300, 300, 300, 300, 300, 300])
      const insights = generateInsights(data, '비용')
      const actionable = insights.filter((i) => i.actionable)
      actionable.forEach((i) => {
        expect(i.suggestion).toBeDefined()
      })
    })

    it('should detect anomalies in insights', () => {
      const data = makeData([100, 100, 100, 100, 100, 100, 100, 100, 100, 500, 100, 100, 100, 100])
      const insights = generateInsights(data, '토큰')
      expect(insights.some((i) => i.category === 'anomaly')).toBe(true)
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should return summary data', async () => {
      const summary = await getAnalyticsSummary()
      expect(summary).toHaveProperty('anomalyCount')
      expect(summary).toHaveProperty('criticalInsights')
      expect(summary).toHaveProperty('predictionAccuracy')
      expect(summary.predictionAccuracy).toBeGreaterThanOrEqual(85)
    })
  })

  describe('getMockAnalyticsData', () => {
    it('should return 4 time series datasets', async () => {
      const data = await getMockAnalyticsData()
      expect(data.apiCalls.length).toBeGreaterThan(0)
      expect(data.tokenUsage.length).toBeGreaterThan(0)
      expect(data.activeUsers.length).toBeGreaterThan(0)
      expect(data.costData.length).toBeGreaterThan(0)
    })
  })
})
