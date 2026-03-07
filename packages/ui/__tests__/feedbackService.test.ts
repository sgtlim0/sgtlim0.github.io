import { describe, it, expect } from 'vitest'
import {
  submitFeedback,
  getFeedback,
  getFeedbackSummary,
  getFeedbackABTests,
  getPromptTuningSuggestions,
  exportFeedback,
} from '../src/admin/services/feedbackService'

describe('feedbackService', () => {
  it('should submit feedback', async () => {
    const fb = await submitFeedback({
      messageId: 'msg-1',
      conversationId: 'conv-1',
      userId: 'u1',
      type: 'thumbs_up',
      modelId: 'gpt-4o',
    })
    expect(fb.id).toBeDefined()
    expect(fb.type).toBe('thumbs_up')
  })

  it('should get feedback list', async () => {
    const list = await getFeedback(10)
    expect(list.length).toBeLessThanOrEqual(10)
    list.forEach((f) => {
      expect(f.modelId).toBeDefined()
    })
  })

  it('should get summary with model breakdown', async () => {
    const summary = await getFeedbackSummary('30d')
    expect(summary.totalFeedback).toBeGreaterThan(0)
    expect(summary.positiveRate).toBeGreaterThan(0)
    expect(summary.byModel.length).toBeGreaterThan(0)
    expect(summary.trend.length).toBeGreaterThan(0)
  })

  it('should get AB tests', async () => {
    const tests = await getFeedbackABTests()
    expect(tests.length).toBe(2)
    expect(tests[0].winner).toBe('B')
  })

  it('should get prompt tuning suggestions', async () => {
    const suggestions = await getPromptTuningSuggestions()
    expect(suggestions.length).toBeGreaterThan(0)
    suggestions.forEach((s) => {
      expect(s.expectedImprovement).toBeGreaterThan(0)
    })
  })

  it('should export feedback', async () => {
    const result = await exportFeedback('csv')
    expect(result.fileName).toContain('.csv')
  })
})
