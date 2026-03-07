import { describe, it, expect } from 'vitest'
import {
  getBenchmarkTests,
  getLatestResults,
  getResultByModel,
  runBenchmark,
  getBenchmarkHistory,
  getRecommendations,
  compareModels,
} from '../src/admin/services/benchmarkService'

describe('benchmarkService', () => {
  describe('getBenchmarkTests', () => {
    it('should return test suites', () => {
      const tests = getBenchmarkTests()
      expect(tests.length).toBe(4)
      tests.forEach((t) => {
        expect(t.category).toMatch(/quality|speed|cost|safety/)
        expect(t.prompts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getLatestResults', () => {
    it('should return ranked results', async () => {
      const results = await getLatestResults()
      expect(results.length).toBeGreaterThan(0)

      for (let i = 1; i < results.length; i++) {
        expect(results[i].rank).toBeGreaterThan(results[i - 1].rank)
      }
    })

    it('should include all score categories', async () => {
      const results = await getLatestResults()
      results.forEach((r) => {
        expect(r.scores.quality).toBeDefined()
        expect(r.scores.speed).toBeDefined()
        expect(r.scores.cost).toBeDefined()
        expect(r.scores.safety).toBeDefined()
        expect(r.overallScore).toBeGreaterThan(0)
      })
    })

    it('should include cost info', async () => {
      const results = await getLatestResults()
      results.forEach((r) => {
        expect(r.costPer1kTokens).toBeGreaterThan(0)
        expect(r.avgResponseTime).toBeGreaterThan(0)
      })
    })
  })

  describe('getResultByModel', () => {
    it('should return result for valid model', async () => {
      const result = await getResultByModel('gpt-4o')
      expect(result).not.toBeNull()
      expect(result!.modelName).toBe('GPT-4o')
      expect(result!.rank).toBe(1)
    })

    it('should return null for invalid model', async () => {
      const result = await getResultByModel('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('runBenchmark', () => {
    it('should create a running benchmark', async () => {
      const run = await runBenchmark(['gpt-4o', 'claude-3.5-sonnet'], ['test-quality'])
      expect(run.status).toBe('running')
      expect(run.models.length).toBe(2)
      expect(run.progress).toBe(0)
    })
  })

  describe('getBenchmarkHistory', () => {
    it('should return history for model', async () => {
      const history = await getBenchmarkHistory('gpt-4o', 30)
      expect(history.length).toBeGreaterThan(0)
      history.forEach((h) => {
        expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(h.overallScore).toBeGreaterThan(0)
      })
    })
  })

  describe('getRecommendations', () => {
    it('should return use case recommendations', async () => {
      const recs = await getRecommendations()
      expect(recs.length).toBeGreaterThan(0)
      recs.forEach((r) => {
        expect(r.useCase).toBeDefined()
        expect(r.recommendedModel).toBeDefined()
        expect(r.reason).toBeDefined()
        expect(r.confidence).toBeGreaterThan(0)
        expect(r.confidence).toBeLessThanOrEqual(1)
        expect(r.alternativeModels.length).toBeGreaterThan(0)
      })
    })

    it('should include coding use case', async () => {
      const recs = await getRecommendations()
      expect(recs.some((r) => r.useCase.includes('코드'))).toBe(true)
    })
  })

  describe('compareModels', () => {
    it('should return results for selected models', () => {
      const results = compareModels(['gpt-4o', 'claude-3.5-sonnet'])
      expect(results.length).toBe(2)
      expect(results.map((r) => r.modelId)).toContain('gpt-4o')
      expect(results.map((r) => r.modelId)).toContain('claude-3.5-sonnet')
    })

    it('should return empty for no matches', () => {
      const results = compareModels(['nonexistent'])
      expect(results.length).toBe(0)
    })
  })
})
