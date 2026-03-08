import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  submitFeedback,
  getFeedback,
  getFeedbackSummary,
  getFeedbackABTests,
  getPromptTuningSuggestions,
  exportFeedback,
} from '../src/admin/services/feedbackService'

describe('feedbackService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('submitFeedback', () => {
    it('should create feedback with generated id and timestamp', async () => {
      const promise = submitFeedback({
        messageId: 'msg-1',
        conversationId: 'conv-1',
        userId: 'user-1',
        type: 'thumbs_up',
        rating: 5,
        modelId: 'gpt-4o',
      })
      vi.advanceTimersByTime(300)
      const feedback = await promise

      expect(feedback.id).toBeTruthy()
      expect(feedback.createdAt).toBeTruthy()
      expect(feedback.messageId).toBe('msg-1')
      expect(feedback.type).toBe('thumbs_up')
      expect(feedback.rating).toBe(5)
    })
  })

  describe('getFeedback', () => {
    it('should return feedback list with default limit', async () => {
      const promise = getFeedback()
      vi.advanceTimersByTime(300)
      const feedbacks = await promise

      expect(feedbacks.length).toBeLessThanOrEqual(20)
      expect(feedbacks.length).toBeGreaterThan(0)
      feedbacks.forEach((f) => {
        expect(f).toHaveProperty('id')
        expect(f).toHaveProperty('type')
        expect(f).toHaveProperty('rating')
        expect(f).toHaveProperty('modelId')
        expect(['thumbs_up', 'thumbs_down']).toContain(f.type)
      })
    })

    it('should respect custom limit', async () => {
      const promise = getFeedback(5)
      vi.advanceTimersByTime(300)
      const feedbacks = await promise

      expect(feedbacks).toHaveLength(5)
    })
  })

  describe('getFeedbackSummary', () => {
    it('should return summary with default 30d period', async () => {
      const promise = getFeedbackSummary()
      vi.advanceTimersByTime(300)
      const summary = await promise

      expect(summary).toHaveProperty('totalFeedback')
      expect(summary).toHaveProperty('positiveRate')
      expect(summary).toHaveProperty('avgRating')
      expect(summary).toHaveProperty('byModel')
      expect(summary).toHaveProperty('trend')
      expect(summary.positiveRate).toBeGreaterThan(0)
      expect(summary.positiveRate).toBeLessThanOrEqual(1)
      expect(summary.byModel.length).toBeGreaterThan(0)
    })

    it('should return lower total for 7d period', async () => {
      const promise7d = getFeedbackSummary('7d')
      vi.advanceTimersByTime(300)
      const summary7d = await promise7d

      const promise30d = getFeedbackSummary('30d')
      vi.advanceTimersByTime(300)
      const summary30d = await promise30d

      expect(summary7d.totalFeedback).toBeLessThan(summary30d.totalFeedback)
    })

    it('should include per-model breakdown', async () => {
      const promise = getFeedbackSummary()
      vi.advanceTimersByTime(300)
      const summary = await promise

      summary.byModel.forEach((m) => {
        expect(m).toHaveProperty('modelId')
        expect(m).toHaveProperty('modelName')
        expect(m).toHaveProperty('avgRating')
        expect(m).toHaveProperty('count')
        expect(m.avgRating).toBeGreaterThan(0)
      })
    })
  })

  describe('getFeedbackABTests', () => {
    it('should return A/B test list', async () => {
      const promise = getFeedbackABTests()
      vi.advanceTimersByTime(300)
      const tests = await promise

      expect(tests.length).toBeGreaterThan(0)
      tests.forEach((t) => {
        expect(t).toHaveProperty('id')
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('promptA')
        expect(t).toHaveProperty('promptB')
        expect(t).toHaveProperty('status')
        expect(t).toHaveProperty('positiveRateA')
        expect(t).toHaveProperty('positiveRateB')
      })
    })

    it('should include both completed and running tests', async () => {
      const promise = getFeedbackABTests()
      vi.advanceTimersByTime(300)
      const tests = await promise

      const statuses = tests.map((t) => t.status)
      expect(statuses).toContain('completed')
      expect(statuses).toContain('running')
    })
  })

  describe('getPromptTuningSuggestions', () => {
    it('should return tuning suggestions', async () => {
      const promise = getPromptTuningSuggestions()
      vi.advanceTimersByTime(400)
      const suggestions = await promise

      expect(suggestions.length).toBeGreaterThan(0)
      suggestions.forEach((s) => {
        expect(s).toHaveProperty('id')
        expect(s).toHaveProperty('originalPrompt')
        expect(s).toHaveProperty('suggestedPrompt')
        expect(s).toHaveProperty('reason')
        expect(s).toHaveProperty('expectedImprovement')
        expect(s).toHaveProperty('basedOnFeedbackCount')
        expect(s.expectedImprovement).toBeGreaterThan(0)
        expect(s.basedOnFeedbackCount).toBeGreaterThan(0)
      })
    })
  })

  describe('exportFeedback', () => {
    it('should return CSV export info', async () => {
      const promise = exportFeedback('csv')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('fileName')
      expect(result.fileName).toContain('.csv')
    })

    it('should return JSON export info', async () => {
      const promise = exportFeedback('json')
      vi.advanceTimersByTime(500)
      const result = await promise

      expect(result.fileName).toContain('.json')
    })
  })
})
