/**
 * Feedback Loop System types
 */

export type FeedbackType = 'thumbs_up' | 'thumbs_down' | 'rating' | 'comment'

export interface Feedback {
  readonly id: string
  readonly messageId: string
  readonly conversationId: string
  readonly userId: string
  readonly type: FeedbackType
  readonly rating?: number
  readonly comment?: string
  readonly modelId: string
  readonly promptId?: string
  readonly createdAt: string
}

export interface FeedbackSummary {
  readonly totalFeedback: number
  readonly positiveRate: number
  readonly avgRating: number
  readonly byModel: { modelId: string; modelName: string; avgRating: number; count: number }[]
  readonly trend: { date: string; positive: number; negative: number }[]
}

export interface FeedbackABTest {
  readonly id: string
  readonly name: string
  readonly promptA: string
  readonly promptB: string
  readonly modelId: string
  readonly trafficSplit: number
  readonly status: 'draft' | 'running' | 'completed'
  readonly totalResponses: number
  readonly positiveRateA: number
  readonly positiveRateB: number
  readonly winner?: 'A' | 'B'
  readonly startDate: string
  readonly endDate?: string
}

export interface PromptTuningSuggestion {
  readonly id: string
  readonly promptId: string
  readonly originalPrompt: string
  readonly suggestedPrompt: string
  readonly reason: string
  readonly expectedImprovement: number
  readonly basedOnFeedbackCount: number
}
