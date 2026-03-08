import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getBenchmarkTests', () => {
    it('should return list of benchmark tests', () => {
      const tests = getBenchmarkTests()
      expect(tests.length).toBeGreaterThan(0)
      tests.forEach((t) => {
        expect(t).toHaveProperty('id')
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('description')
        expect(t).toHaveProperty('category')
        expect(t).toHaveProperty('prompts')
      })
    })

    it('should include all four categories', () => {
      const tests = getBenchmarkTests()
      const categories = tests.map((t) => t.category)
      expect(categories).toContain('quality')
      expect(categories).toContain('speed')
      expect(categories).toContain('cost')
      expect(categories).toContain('safety')
    })
  })

  describe('getLatestResults', () => {
    it('should return ranked benchmark results', async () => {
      const promise = getLatestResults()
      vi.advanceTimersByTime(300)
      const results = await promise

      expect(results.length).toBeGreaterThan(0)
      results.forEach((r) => {
        expect(r).toHaveProperty('modelId')
        expect(r).toHaveProperty('modelName')
        expect(r).toHaveProperty('provider')
        expect(r).toHaveProperty('scores')
        expect(r).toHaveProperty('overallScore')
        expect(r).toHaveProperty('rank')
        expect(r.scores).toHaveProperty('quality')
        expect(r.scores).toHaveProperty('speed')
        expect(r.scores).toHaveProperty('cost')
        expect(r.scores).toHaveProperty('safety')
      })
    })

    it('should have results sorted by rank', async () => {
      const promise = getLatestResults()
      vi.advanceTimersByTime(300)
      const results = await promise

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].rank).toBeLessThan(results[i + 1].rank)
      }
    })
  })

  describe('getResultByModel', () => {
    it('should return result for existing model', async () => {
      const promise = getResultByModel('gpt-4o')
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).not.toBeNull()
      expect(result?.modelId).toBe('gpt-4o')
      expect(result?.modelName).toBe('GPT-4o')
    })

    it('should return null for non-existent model', async () => {
      const promise = getResultByModel('non-existent-model')
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toBeNull()
    })
  })

  describe('runBenchmark', () => {
    it('should return a new benchmark run', async () => {
      const promise = runBenchmark(['gpt-4o', 'claude-3.5-sonnet'], ['test-quality'])
      vi.advanceTimersByTime(600)
      const run = await promise

      expect(run).toHaveProperty('id')
      expect(run.models).toEqual(['gpt-4o', 'claude-3.5-sonnet'])
      expect(run.tests).toEqual(['test-quality'])
      expect(run.status).toBe('running')
      expect(run.progress).toBe(0)
      expect(run.results).toEqual([])
      expect(run).toHaveProperty('startedAt')
    })
  })

  describe('getBenchmarkHistory', () => {
    it('should return history for a model', async () => {
      const promise = getBenchmarkHistory('gpt-4o', 30)
      vi.advanceTimersByTime(300)
      const history = await promise

      expect(history.length).toBeGreaterThan(0)
      history.forEach((h) => {
        expect(h).toHaveProperty('date')
        expect(h).toHaveProperty('modelId')
        expect(h).toHaveProperty('overallScore')
        expect(h.modelId).toBe('gpt-4o')
      })
    })

    it('should default to 30 days', async () => {
      const promise = getBenchmarkHistory('gpt-4o')
      vi.advanceTimersByTime(300)
      const history = await promise

      expect(history.length).toBeGreaterThan(0)
    })
  })

  describe('getRecommendations', () => {
    it('should return use case recommendations', async () => {
      const promise = getRecommendations()
      vi.advanceTimersByTime(300)
      const recs = await promise

      expect(recs.length).toBeGreaterThan(0)
      recs.forEach((r) => {
        expect(r).toHaveProperty('useCase')
        expect(r).toHaveProperty('recommendedModel')
        expect(r).toHaveProperty('reason')
        expect(r).toHaveProperty('confidence')
        expect(r.confidence).toBeGreaterThan(0)
        expect(r.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should include alternative models', async () => {
      const promise = getRecommendations()
      vi.advanceTimersByTime(300)
      const recs = await promise

      recs.forEach((r) => {
        expect(r).toHaveProperty('alternativeModels')
        expect(r.alternativeModels!.length).toBeGreaterThan(0)
      })
    })
  })

  describe('compareModels', () => {
    it('should return results for requested model IDs', () => {
      const results = compareModels(['gpt-4o', 'gemini-pro'])
      expect(results).toHaveLength(2)
      expect(results[0].modelId).toBe('gpt-4o')
      expect(results[1].modelId).toBe('gemini-pro')
    })

    it('should return empty for non-existent models', () => {
      const results = compareModels(['non-existent'])
      expect(results).toHaveLength(0)
    })

    it('should filter correctly with mixed valid and invalid IDs', () => {
      const results = compareModels(['gpt-4o', 'invalid', 'claude-3.5-sonnet'])
      expect(results).toHaveLength(2)
    })
  })
})
