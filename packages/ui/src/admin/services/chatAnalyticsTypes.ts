/**
 * Chat History Analytics types
 */

export interface ChatStats {
  readonly totalConversations: number
  readonly totalMessages: number
  readonly avgMessagesPerConversation: number
  readonly avgResponseTime: number
  readonly peakHour: number
  readonly topAssistant: string
}

export interface DailyUsage {
  readonly date: string
  readonly conversations: number
  readonly messages: number
  readonly uniqueUsers: number
}

export interface TopicCluster {
  readonly id: string
  readonly name: string
  readonly keywords: string[]
  readonly count: number
  readonly percentage: number
  readonly trend: 'up' | 'down' | 'stable'
}

export interface UserBehavior {
  readonly feature: string
  readonly usageCount: number
  readonly avgDuration: number
  readonly satisfactionRate: number
}

export interface HourlyDistribution {
  readonly hour: number
  readonly count: number
}

export interface ConversationQuality {
  readonly avgRating: number
  readonly responseTimeP50: number
  readonly responseTimeP95: number
  readonly errorRate: number
  readonly completionRate: number
}
