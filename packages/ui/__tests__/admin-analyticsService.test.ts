import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  detectAnomalies,
  predictFuture,
  generateInsights,
  getMockAnalyticsData,
  getAnalyticsSummary,
} from '../src/admin/services/analyticsService'
import type { TimeSeriesPoint } from '../src/admin/services/analyticsTypes'

describe('analyticsService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('detectAnomalies', () => {
    it('should return data with no anomalies for uniform data', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 100 },
        { date: '2026-03-03', value: 100 },
        { date: '2026-03-04', value: 100 },
      ]

      const results = detectAnomalies(data)
      expect(results).toHaveLength(4)
      results.forEach((r) => {
        expect(r.isAnomaly).toBe(false)
        expect(r.type).toBe('normal')
        expect(r.zscore).toBe(0)
      })
    })

    it('should detect spike anomaly for high outlier', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 100 },
        { date: '2026-03-03', value: 100 },
        { date: '2026-03-04', value: 100 },
        { date: '2026-03-05', value: 100 },
        { date: '2026-03-06', value: 100 },
        { date: '2026-03-07', value: 100 },
        { date: '2026-03-08', value: 100 },
        { date: '2026-03-09', value: 100 },
        { date: '2026-03-10', value: 1000 },
      ]

      const results = detectAnomalies(data)
      const spikeResult = results.find((r) => r.date === '2026-03-10')
      expect(spikeResult?.isAnomaly).toBe(true)
      expect(spikeResult?.type).toBe('spike')
      expect(spikeResult?.zscore).toBeGreaterThan(2)
    })

    it('should detect drop anomaly for low outlier', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 1000 },
        { date: '2026-03-02', value: 1000 },
        { date: '2026-03-03', value: 1000 },
        { date: '2026-03-04', value: 1000 },
        { date: '2026-03-05', value: 1000 },
        { date: '2026-03-06', value: 1000 },
        { date: '2026-03-07', value: 1000 },
        { date: '2026-03-08', value: 1000 },
        { date: '2026-03-09', value: 1000 },
        { date: '2026-03-10', value: 0 },
      ]

      const results = detectAnomalies(data)
      const dropResult = results.find((r) => r.date === '2026-03-10')
      expect(dropResult?.isAnomaly).toBe(true)
      expect(dropResult?.type).toBe('drop')
      expect(dropResult?.zscore).toBeLessThan(-2)
    })

    it('should handle data with fewer than 3 points', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 200 },
      ]

      const results = detectAnomalies(data)
      expect(results).toHaveLength(2)
      results.forEach((r) => {
        expect(r.isAnomaly).toBe(false)
        expect(r.zscore).toBe(0)
      })
    })

    it('should accept custom threshold', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 105 },
        { date: '2026-03-03', value: 95 },
        { date: '2026-03-04', value: 130 },
      ]

      const looseResults = detectAnomalies(data, 3.0)
      const strictResults = detectAnomalies(data, 0.5)
      const looseAnomalies = looseResults.filter((r) => r.isAnomaly)
      const strictAnomalies = strictResults.filter((r) => r.isAnomaly)
      expect(strictAnomalies.length).toBeGreaterThanOrEqual(looseAnomalies.length)
    })

    it('should include expected value based on mean', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 10 },
        { date: '2026-03-02', value: 20 },
        { date: '2026-03-03', value: 30 },
      ]

      const results = detectAnomalies(data)
      results.forEach((r) => {
        expect(r.expected).toBe(20) // mean of [10, 20, 30]
      })
    })
  })

  describe('predictFuture', () => {
    it('should predict future values with linear trend', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 110 },
        { date: '2026-03-03', value: 120 },
        { date: '2026-03-04', value: 130 },
      ]

      const predictions = predictFuture(data, 3)
      expect(predictions).toHaveLength(3)
      predictions.forEach((p) => {
        expect(p).toHaveProperty('date')
        expect(p).toHaveProperty('predicted')
        expect(p).toHaveProperty('lowerBound')
        expect(p).toHaveProperty('upperBound')
        expect(p.predicted).toBeGreaterThanOrEqual(0)
        expect(p.lowerBound).toBeLessThanOrEqual(p.predicted)
        expect(p.upperBound).toBeGreaterThanOrEqual(p.predicted)
      })
    })

    it('should return increasing predictions for upward trend', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 110 },
        { date: '2026-03-03', value: 120 },
        { date: '2026-03-04', value: 130 },
      ]

      const predictions = predictFuture(data, 3)
      expect(predictions[0].predicted).toBeGreaterThan(130)
    })

    it('should return empty for less than 2 data points', () => {
      const data: TimeSeriesPoint[] = [{ date: '2026-03-01', value: 100 }]
      const predictions = predictFuture(data)
      expect(predictions).toHaveLength(0)
    })

    it('should default to 7 periods', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 110 },
      ]

      const predictions = predictFuture(data)
      expect(predictions).toHaveLength(7)
    })

    it('should produce dates after the last data point', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 110 },
      ]

      const predictions = predictFuture(data, 3)
      predictions.forEach((p) => {
        expect(new Date(p.date).getTime()).toBeGreaterThan(new Date('2026-03-02').getTime())
      })
    })

    it('should not return negative predicted values', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 10 },
        { date: '2026-03-02', value: 5 },
        { date: '2026-03-03', value: 2 },
      ]

      const predictions = predictFuture(data, 10)
      predictions.forEach((p) => {
        expect(p.predicted).toBeGreaterThanOrEqual(0)
        expect(p.lowerBound).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('generateInsights', () => {
    it('should return empty for data with fewer than 7 points', () => {
      const data: TimeSeriesPoint[] = [
        { date: '2026-03-01', value: 100 },
        { date: '2026-03-02', value: 110 },
      ]

      const insights = generateInsights(data, 'API 호출')
      expect(insights).toHaveLength(0)
    })

    it('should detect sharp increase', () => {
      const data: TimeSeriesPoint[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        value: i < 7 ? 100 : 200,
      }))

      const insights = generateInsights(data, 'API 호출')
      const trendInsight = insights.find((i) => i.title.includes('급증'))
      expect(trendInsight).toBeDefined()
      expect(trendInsight?.severity).toMatch(/warning|critical/)
    })

    it('should detect sharp decrease', () => {
      const data: TimeSeriesPoint[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        value: i < 7 ? 200 : 100,
      }))

      const insights = generateInsights(data, '토큰')
      const declineInsight = insights.find((i) => i.title.includes('급감'))
      expect(declineInsight).toBeDefined()
    })

    it('should detect stable trend', () => {
      const data: TimeSeriesPoint[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        value: 100,
      }))

      const insights = generateInsights(data, '사용량')
      const stableInsight = insights.find((i) => i.title.includes('안정'))
      expect(stableInsight).toBeDefined()
      expect(stableInsight?.severity).toBe('info')
      expect(stableInsight?.actionable).toBe(false)
    })

    it('should include metric name in insight title', () => {
      const data: TimeSeriesPoint[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        value: 100,
      }))

      const insights = generateInsights(data, '커스텀지표')
      insights.forEach((insight) => {
        expect(insight.title).toContain('커스텀지표')
      })
    })

    it('should provide actionable suggestions for increase', () => {
      const data: TimeSeriesPoint[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        value: i < 7 ? 100 : 250,
      }))

      const insights = generateInsights(data, 'API')
      const trendInsight = insights.find((i) => i.title.includes('급증'))
      expect(trendInsight?.actionable).toBe(true)
      expect(trendInsight?.suggestion).toBeDefined()
    })
  })

  describe('getMockAnalyticsData', () => {
    it('should return all four metric categories', async () => {
      const promise = getMockAnalyticsData()
      vi.advanceTimersByTime(400)
      const data = await promise

      expect(data).toHaveProperty('apiCalls')
      expect(data).toHaveProperty('tokenUsage')
      expect(data).toHaveProperty('activeUsers')
      expect(data).toHaveProperty('costData')
      expect(data.apiCalls.length).toBeGreaterThan(0)
      expect(data.tokenUsage.length).toBeGreaterThan(0)
    })

    it('should return TimeSeriesPoint format', async () => {
      const promise = getMockAnalyticsData()
      vi.advanceTimersByTime(400)
      const data = await promise

      data.apiCalls.forEach((point) => {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('value')
        expect(typeof point.date).toBe('string')
        expect(typeof point.value).toBe('number')
      })
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should return summary with required fields', async () => {
      const promise = getAnalyticsSummary()
      vi.advanceTimersByTime(300)
      const summary = await promise

      expect(summary).toHaveProperty('anomalyCount')
      expect(summary).toHaveProperty('criticalInsights')
      expect(summary).toHaveProperty('predictionAccuracy')
      expect(summary).toHaveProperty('lastAnalyzed')
      expect(typeof summary.anomalyCount).toBe('number')
      expect(summary.predictionAccuracy).toBeGreaterThanOrEqual(85)
      expect(summary.predictionAccuracy).toBeLessThan(100)
    })
  })
})
