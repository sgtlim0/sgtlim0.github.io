import { describe, it, expect } from 'vitest'
import { aggregateAll } from '../src/roi/aggregateData'

const mockRecords = [
  {
    날짜: '2026-01-15',
    사용자ID: 'user1',
    모델: 'Claude',
    기능: 'AI 채팅',
    부서: '개발팀',
    직급: '대리',
    토큰수: 5000,
    절감시간_분: 30,
    만족도: 4.5,
  },
  {
    날짜: '2026-01-20',
    사용자ID: 'user2',
    모델: 'GPT-4',
    기능: '번역',
    부서: '마케팅팀',
    직급: '과장',
    토큰수: 3000,
    절감시간_분: 20,
    만족도: 4.0,
  },
  {
    날짜: '2026-02-10',
    사용자ID: 'user1',
    모델: 'Claude',
    기능: 'AI 채팅',
    부서: '개발팀',
    직급: '대리',
    토큰수: 8000,
    절감시간_분: 45,
    만족도: 5.0,
  },
  {
    날짜: '2026-02-15',
    사용자ID: 'user3',
    모델: 'Gemini',
    기능: '코드 리뷰',
    부서: '개발팀',
    직급: '차장',
    토큰수: 6000,
    절감시간_분: 35,
    만족도: 3.5,
  },
  {
    날짜: '2026-02-20',
    사용자ID: 'user2',
    모델: 'GPT-4',
    기능: '번역',
    부서: '마케팅팀',
    직급: '과장',
    토큰수: 4000,
    절감시간_분: 25,
    만족도: 4.2,
  },
]

describe('aggregateAll', () => {
  const result = aggregateAll(mockRecords)

  describe('overviewKPIs', () => {
    it('returns 4 KPIs', () => {
      expect(result.overviewKPIs).toHaveLength(4)
    })

    it('includes total saved hours', () => {
      const saved = result.overviewKPIs.find((k) => k.label === '총 절감 시간')
      expect(saved).toBeDefined()
      expect(saved!.value).toContain('h')
    })

    it('includes ROI', () => {
      const roi = result.overviewKPIs.find((k) => k.label === 'ROI')
      expect(roi).toBeDefined()
      expect(roi!.value).toContain('%')
    })
  })

  describe('monthlyTimeSavings', () => {
    it('groups by month', () => {
      expect(result.monthlyTimeSavings.length).toBeGreaterThan(0)
      expect(result.monthlyTimeSavings[0]).toHaveProperty('month')
      expect(result.monthlyTimeSavings[0]).toHaveProperty('hours')
    })
  })

  describe('modelCostEfficiency', () => {
    it('includes all models', () => {
      const modelNames = result.modelCostEfficiency.map((m) => m.name)
      expect(modelNames).toContain('Claude')
      expect(modelNames).toContain('GPT-4')
      expect(modelNames).toContain('Gemini')
    })

    it('values sum to ~100%', () => {
      const sum = result.modelCostEfficiency.reduce((s, m) => s + m.value, 0)
      expect(sum).toBeGreaterThanOrEqual(95)
      expect(sum).toBeLessThanOrEqual(105)
    })
  })

  describe('departmentRanking', () => {
    it('ranks departments', () => {
      expect(result.departmentRanking.length).toBeGreaterThan(0)
      expect(result.departmentRanking[0]).toHaveProperty('department')
      expect(result.departmentRanking[0]).toHaveProperty('roi')
    })
  })

  describe('userSegments', () => {
    it('returns 4 segments', () => {
      expect(result.userSegments).toHaveLength(4)
    })

    it('segments sum to ~100%', () => {
      const sum = result.userSegments.reduce((s, seg) => s + seg.value, 0)
      expect(sum).toBeGreaterThanOrEqual(95)
      expect(sum).toBeLessThanOrEqual(105)
    })
  })

  describe('featureAdoption', () => {
    it('lists used features', () => {
      expect(result.featureAdoption.length).toBeGreaterThan(0)
      expect(result.featureAdoption[0]).toHaveProperty('label')
      expect(result.featureAdoption[0]).toHaveProperty('value')
    })
  })

  describe('costBreakdown', () => {
    it('breaks down by model', () => {
      expect(result.costBreakdown.length).toBe(3)
      expect(result.costBreakdown[0]).toHaveProperty('model')
      expect(result.costBreakdown[0]).toHaveProperty('tokens')
      expect(result.costBreakdown[0]).toHaveProperty('cost')
      expect(result.costBreakdown[0]).toHaveProperty('roi')
    })
  })

  describe('heatmapData', () => {
    it('includes all departments', () => {
      const depts = result.heatmapData.map((h) => h.dept)
      expect(depts).toContain('개발팀')
      expect(depts).toContain('마케팅팀')
    })

    it('has heatmap levels', () => {
      const levels = result.heatmapData[0].levels
      expect(levels.length).toBe(4)
      levels.forEach((level) => {
        expect(['high', 'mid', 'low']).toContain(level)
      })
    })
  })

  describe('edge case: empty records', () => {
    it('handles empty array', () => {
      const empty = aggregateAll([])
      expect(empty.overviewKPIs).toHaveLength(4)
      expect(empty.monthlyTimeSavings).toEqual([])
      expect(empty.modelCostEfficiency).toEqual([])
    })
  })

  describe('npsHistory', () => {
    it('calculates NPS per month', () => {
      expect(result.npsHistory.length).toBeGreaterThan(0)
      result.npsHistory.forEach((entry) => {
        expect(entry).toHaveProperty('month')
        expect(entry).toHaveProperty('score')
        expect(typeof entry.score).toBe('number')
      })
    })
  })
})
