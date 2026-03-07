/**
 * Feedback Loop Service
 */

import type {
  Feedback,
  FeedbackSummary,
  FeedbackABTest,
  PromptTuningSuggestion,
} from './feedbackTypes'

const STORAGE_KEY = 'hchat-feedback'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_FEEDBACK: Feedback[] = Array.from({ length: 50 }, (_, i) => ({
  id: `fb-${i}`,
  messageId: `msg-${i}`,
  conversationId: `conv-${i % 10}`,
  userId: `user-${i % 8}`,
  type: i % 3 === 0 ? ('thumbs_down' as const) : ('thumbs_up' as const),
  rating: 3 + Math.floor(Math.random() * 3),
  modelId: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-pro'][i % 3],
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}))

export async function submitFeedback(
  feedback: Omit<Feedback, 'id' | 'createdAt'>,
): Promise<Feedback> {
  await delay(200)
  return {
    ...feedback,
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
}

export async function getFeedback(limit: number = 20): Promise<Feedback[]> {
  await delay(200)
  return MOCK_FEEDBACK.slice(0, limit)
}

export async function getFeedbackSummary(period: '7d' | '30d' = '30d'): Promise<FeedbackSummary> {
  await delay(250)
  const multiplier = period === '7d' ? 1 : 4
  return {
    totalFeedback: 250 * multiplier,
    positiveRate: 0.78,
    avgRating: 4.2,
    byModel: [
      { modelId: 'gpt-4o', modelName: 'GPT-4o', avgRating: 4.5, count: 120 * multiplier },
      {
        modelId: 'claude-3.5-sonnet',
        modelName: 'Claude 3.5 Sonnet',
        avgRating: 4.6,
        count: 80 * multiplier,
      },
      { modelId: 'gemini-pro', modelName: 'Gemini Pro', avgRating: 4.1, count: 50 * multiplier },
    ],
    trend: Array.from({ length: period === '7d' ? 7 : 30 }, (_, i) => ({
      date: new Date(Date.now() - (period === '7d' ? 7 - i : 30 - i) * 86400000)
        .toISOString()
        .split('T')[0],
      positive: 15 + Math.floor(Math.random() * 10),
      negative: 2 + Math.floor(Math.random() * 5),
    })),
  }
}

export async function getFeedbackABTests(): Promise<FeedbackABTest[]> {
  await delay(200)
  return [
    {
      id: 'fab-1',
      name: '번역 프롬프트 개선',
      promptA: '번역해주세요',
      promptB: '전문 용어를 포함하여 정확하게 번역해주세요',
      modelId: 'gpt-4o',
      trafficSplit: 50,
      status: 'completed',
      totalResponses: 500,
      positiveRateA: 0.72,
      positiveRateB: 0.85,
      winner: 'B',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
    },
    {
      id: 'fab-2',
      name: '요약 길이 최적화',
      promptA: '요약해주세요',
      promptB: '3문장으로 핵심을 요약해주세요',
      modelId: 'claude-3.5-sonnet',
      trafficSplit: 50,
      status: 'running',
      totalResponses: 200,
      positiveRateA: 0.68,
      positiveRateB: 0.75,
      startDate: '2026-03-06',
    },
  ]
}

export async function getPromptTuningSuggestions(): Promise<PromptTuningSuggestion[]> {
  await delay(300)
  return [
    {
      id: 'pts-1',
      promptId: 'prompt-translate',
      originalPrompt: '번역해주세요',
      suggestedPrompt:
        '다음 텍스트를 정확하고 자연스럽게 번역해주세요. 전문 용어는 원어를 병기하세요.',
      reason: '부정적 피드백 분석: "번역이 너무 직역적" 코멘트 반복',
      expectedImprovement: 18,
      basedOnFeedbackCount: 45,
    },
    {
      id: 'pts-2',
      promptId: 'prompt-summary',
      originalPrompt: '요약해주세요',
      suggestedPrompt: '핵심 포인트 3가지와 액션 아이템을 구분하여 요약해주세요.',
      reason: '사용자들이 구조화된 요약을 선호 (피드백 데이터 기반)',
      expectedImprovement: 12,
      basedOnFeedbackCount: 32,
    },
  ]
}

export async function exportFeedback(
  format: 'csv' | 'json',
): Promise<{ url: string; fileName: string }> {
  await delay(400)
  return {
    url: `#mock-feedback-export-${format}`,
    fileName: `feedback-export.${format}`,
  }
}
