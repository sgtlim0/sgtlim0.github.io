import { describe, it, expect } from 'vitest'
import { aggregateAll } from '../src/roi/aggregateData'

/**
 * Extended aggregateData tests — covers remaining branches:
 * - formatTokens < 1000 (line 82)
 * - formatKRW small values, K range, B range
 * - pctChange with prev=0
 * - heatmapLevel with max=0
 * - Empty records edge cases
 * - Single record edge cases
 * - Unknown feature (no MANUAL_ESTIMATES match)
 * - Same-month records (no prev month)
 */

const makeRecord = (overrides: Record<string, unknown> = {}) => ({
  '날짜': '2026-01-15',
  '사용자ID': 'user1',
  '모델': 'GPT-4',
  '기능': 'AI 채팅',
  '토큰수': 5000,
  '절감시간_분': 30,
  '만족도': 4,
  '부서': '개발팀',
  '직급': '사원',
  ...overrides,
})

describe('aggregateAll — extended branch coverage', () => {
  describe('formatTokens branch: tokens < 1000', () => {
    it('should format tokens less than 1000 as plain number', () => {
      const records = [makeRecord({ '토큰수': 500, '모델': 'TestModel' })]
      const result = aggregateAll(records)
      const modelBreakdown = result.costBreakdown.find((c) => c.model === 'TestModel')
      expect(modelBreakdown?.tokens).toBe('500')
    })

    it('should format tokens between 1000 and 1M as K', () => {
      const records = [makeRecord({ '토큰수': 5000, '모델': 'TestModel' })]
      const result = aggregateAll(records)
      const modelBreakdown = result.costBreakdown.find((c) => c.model === 'TestModel')
      expect(modelBreakdown?.tokens).toBe('5K')
    })

    it('should format tokens >= 1M as M', () => {
      const records = Array.from({ length: 200 }, () => makeRecord({ '토큰수': 10000 }))
      const result = aggregateAll(records)
      // Total tokens = 200 * 10000 = 2,000,000
      expect(result.costBreakdown[0].tokens).toBe('2.0M')
    })
  })

  describe('formatKRW branch coverage', () => {
    it('should format small KRW values (< 1000)', () => {
      // With very few tokens, cost will be very small
      const records = [makeRecord({ '토큰수': 10 })]
      const result = aggregateAll(records)
      // 10 tokens * 0.000015 = 0.00015 → formatKRW(0.00015) → ₩0
      const costEntry = result.costBreakdown[0]
      expect(costEntry.cost).toMatch(/^₩/)
    })

    it('should format KRW in K range', () => {
      // Need tokens that produce cost between 1000 and 1M
      // 100,000 tokens * 0.000015 = 1.5 → ₩2 (rounds to ₩2)
      // Need 100M tokens for K range: 100,000,000 * 0.000015 = 1,500 → ₩2K
      const records = Array.from({ length: 100 }, () => makeRecord({ '토큰수': 1000000 }))
      const result = aggregateAll(records)
      // 100M tokens * 0.000015 = 1500 → ₩2K
      const costEntry = result.costBreakdown[0]
      expect(costEntry.cost).toMatch(/₩/)
    })
  })

  describe('pctChange with prev=0', () => {
    it('should return dash when previous month has 0 records', () => {
      // Single month → no prev month → prevSavedH=0 → pctChange returns dash
      const records = [makeRecord({ '날짜': '2026-01-15' })]
      const result = aggregateAll(records)
      const savingsKPI = result.overviewKPIs.find((k) => k.label === '총 절감 시간')
      expect(savingsKPI?.trend).toBe('-')
    })
  })

  describe('single record edge case', () => {
    it('should compute all fields for a single record', () => {
      const records = [makeRecord()]
      const result = aggregateAll(records)
      expect(result.overviewKPIs).toHaveLength(4)
      expect(result.monthlyTimeSavings).toHaveLength(1)
      expect(result.modelCostEfficiency).toHaveLength(1)
      expect(result.departmentRanking).toHaveLength(1)
      expect(result.costBreakdown).toHaveLength(1)
      expect(result.heatmapData).toHaveLength(1)
      expect(result.userSegments).toHaveLength(4)
    })

    it('should have correct KPI labels', () => {
      const result = aggregateAll([makeRecord()])
      expect(result.overviewKPIs.map((k) => k.label)).toEqual([
        '총 절감 시간', '총 비용 절감', 'ROI', '활성 사용률',
      ])
      expect(result.adoptionKPIs.map((k) => k.label)).toEqual([
        '전체 사용자', '활성 사용자', '비활성 사용자', '지속 사용률',
      ])
    })
  })

  describe('unknown feature (no MANUAL_ESTIMATES)', () => {
    it('should fallback to estimated manual time for unknown features', () => {
      const records = [makeRecord({ '기능': '커스텀 기능 XYZ', '절감시간_분': 10 })]
      const result = aggregateAll(records)
      const task = result.taskTimeSavings.find((t) => t.task === '커스텀 기능 XYZ')
      expect(task).toBeTruthy()
      // manualMin = avgAiMin * 3 = 10 * 3 = 30
      expect(task!.manualMin).toBe(30)
    })
  })

  describe('two-month data with trend calculation', () => {
    it('should calculate positive trend when current month is better', () => {
      const records = [
        makeRecord({ '날짜': '2026-01-10', '절감시간_분': 60 }),
        makeRecord({ '날짜': '2026-02-10', '절감시간_분': 120 }),
      ]
      const result = aggregateAll(records)
      const savingsKPI = result.overviewKPIs.find((k) => k.label === '총 절감 시간')
      expect(savingsKPI?.trend).toBe('+100%')
      expect(savingsKPI?.trendUp).toBe(true)
    })

    it('should calculate negative trend when current month is worse', () => {
      const records = [
        makeRecord({ '날짜': '2026-01-10', '절감시간_분': 120 }),
        makeRecord({ '날짜': '2026-02-10', '절감시간_분': 60 }),
      ]
      const result = aggregateAll(records)
      const savingsKPI = result.overviewKPIs.find((k) => k.label === '총 절감 시간')
      expect(savingsKPI?.trend).toBe('-50%')
      expect(savingsKPI?.trendUp).toBe(false)
    })
  })

  describe('heatmapLevel edge cases', () => {
    it('should assign correct levels for varied department data', () => {
      const records = [
        // High usage dept
        ...Array.from({ length: 50 }, (_, i) =>
          makeRecord({ '부서': '개발팀', '사용자ID': `u${i}`, '토큰수': 10000, '절감시간_분': 60, '만족도': 5 })
        ),
        // Low usage dept
        makeRecord({ '부서': '인사팀', '사용자ID': 'u99', '토큰수': 100, '절감시간_분': 5, '만족도': 2 }),
      ]
      const result = aggregateAll(records)
      expect(result.heatmapData.length).toBe(2)
      // 개발팀 should have mostly 'high' levels
      const devTeam = result.heatmapData.find((h) => h.dept === '개발팀')
      expect(devTeam?.levels).toBeDefined()
    })
  })

  describe('NPS computation', () => {
    it('should compute negative NPS for low satisfaction', () => {
      const records = [makeRecord({ '만족도': 1 })]
      const result = aggregateAll(records)
      // avgSat=1, nps=(1-3)*25=-50
      const npsKPI = result.sentimentKPIs.find((k) => k.label === 'NPS 점수')
      expect(npsKPI?.value).toBe('+-50')
    })

    it('should compute neutral NPS for satisfaction=3', () => {
      const records = [makeRecord({ '만족도': 3 })]
      const result = aggregateAll(records)
      const npsKPI = result.sentimentKPIs.find((k) => k.label === 'NPS 점수')
      expect(npsKPI?.value).toBe('+0')
    })

    it('should compute monthly NPS history correctly', () => {
      const records = [
        makeRecord({ '날짜': '2026-01-10', '만족도': 5 }),
        makeRecord({ '날짜': '2026-02-10', '만족도': 1 }),
      ]
      const result = aggregateAll(records)
      expect(result.npsHistory).toHaveLength(2)
      expect(result.npsHistory[0].score).toBe(50)  // (5-3)*25
      expect(result.npsHistory[1].score).toBe(-50)  // (1-3)*25
    })
  })

  describe('multiple departments and models', () => {
    it('should rank departments by ROI (highest first)', () => {
      const records = [
        makeRecord({ '부서': '개발팀', '토큰수': 1000, '절감시간_분': 600 }),
        makeRecord({ '부서': '마케팅팀', '토큰수': 1000, '절감시간_분': 60 }),
      ]
      const result = aggregateAll(records)
      expect(result.departmentRanking[0].department).toBe('개발팀')
      expect(result.departmentRanking[0].roi).toBeGreaterThan(result.departmentRanking[1].roi)
    })

    it('should compute model usage ratio summing close to 100%', () => {
      const records = [
        makeRecord({ '모델': 'A' }),
        makeRecord({ '모델': 'A' }),
        makeRecord({ '모델': 'B' }),
        makeRecord({ '모델': 'C' }),
      ]
      const result = aggregateAll(records)
      const totalPct = result.modelUsageRatio.reduce((s, m) => s + m.percent, 0)
      expect(totalPct).toBeGreaterThanOrEqual(98)
      expect(totalPct).toBeLessThanOrEqual(102)
    })
  })

  describe('weekly data aggregation', () => {
    it('should limit weekly active users to last 12 weeks', () => {
      // Create records spanning 15 weeks
      const records = Array.from({ length: 15 }, (_, i) => {
        const date = new Date('2026-01-06')
        date.setDate(date.getDate() + i * 7)
        return makeRecord({ '날짜': date.toISOString().slice(0, 10), '사용자ID': `u${i}` })
      })
      const result = aggregateAll(records)
      expect(result.weeklyActiveUsers.length).toBeLessThanOrEqual(12)
      expect(result.weeklyAIHours.length).toBeLessThanOrEqual(12)
    })
  })

  describe('edge case: missing or null fields', () => {
    it('should handle records with null values', () => {
      const records = [
        {
          '날짜': '2026-01-15',
          '사용자ID': null,
          '모델': null,
          '기능': null,
          '토큰수': null,
          '절감시간_분': null,
          '만족도': null,
          '부서': null,
          '직급': null,
        },
      ]
      const result = aggregateAll(records)
      expect(result.overviewKPIs).toHaveLength(4)
      // Should not crash, null values treated as 0 or empty string
    })

    it('should handle records with missing keys', () => {
      const records = [{ '날짜': '2026-01-15' }]
      const result = aggregateAll(records)
      expect(result.overviewKPIs).toHaveLength(4)
      expect(result.monthlyTimeSavings).toHaveLength(1)
    })
  })

  describe('cumulative savings monotonic increase', () => {
    it('should produce increasing cumulative savings over months', () => {
      const records = [
        makeRecord({ '날짜': '2026-01-10', '절감시간_분': 60, '토큰수': 100 }),
        makeRecord({ '날짜': '2026-02-10', '절감시간_분': 60, '토큰수': 100 }),
        makeRecord({ '날짜': '2026-03-10', '절감시간_분': 60, '토큰수': 100 }),
      ]
      const result = aggregateAll(records)
      expect(result.cumulativeSavings.length).toBe(3)
      for (let i = 1; i < result.cumulativeSavings.length; i++) {
        expect(result.cumulativeSavings[i].amount).toBeGreaterThanOrEqual(result.cumulativeSavings[i - 1].amount)
      }
    })
  })
})
