/**
 * Chat History Analytics Service
 */

import type {
  ChatStats,
  DailyUsage,
  TopicCluster,
  UserBehavior,
  HourlyDistribution,
  ConversationQuality,
} from './chatAnalyticsTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getChatStats(period: '7d' | '30d' | '90d' = '30d'): Promise<ChatStats> {
  await delay(200)
  const multiplier = period === '7d' ? 1 : period === '30d' ? 4 : 12
  return {
    totalConversations: 1250 * multiplier,
    totalMessages: 8900 * multiplier,
    avgMessagesPerConversation: 7.1,
    avgResponseTime: 1.8,
    peakHour: 14,
    topAssistant: '번역 비서',
  }
}

export async function getDailyUsage(days: number = 30): Promise<DailyUsage[]> {
  await delay(250)
  const result: DailyUsage[] = []
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      conversations: 30 + Math.floor(Math.random() * 50),
      messages: 200 + Math.floor(Math.random() * 300),
      uniqueUsers: 20 + Math.floor(Math.random() * 30),
    })
  }
  return result
}

export async function getTopicClusters(): Promise<TopicCluster[]> {
  await delay(300)
  return [
    {
      id: 'tc-1',
      name: '기술 문의',
      keywords: ['API', '오류', '설정', '연동'],
      count: 450,
      percentage: 28,
      trend: 'up',
    },
    {
      id: 'tc-2',
      name: '번역 요청',
      keywords: ['번역', '영어', '일본어', '문서'],
      count: 380,
      percentage: 24,
      trend: 'stable',
    },
    {
      id: 'tc-3',
      name: '문서 작성',
      keywords: ['보고서', '이메일', '요약', '작성'],
      count: 290,
      percentage: 18,
      trend: 'up',
    },
    {
      id: 'tc-4',
      name: '데이터 분석',
      keywords: ['데이터', '차트', '통계', 'Excel'],
      count: 210,
      percentage: 13,
      trend: 'down',
    },
    {
      id: 'tc-5',
      name: '코드 관련',
      keywords: ['코드', '리뷰', '버그', 'TypeScript'],
      count: 180,
      percentage: 11,
      trend: 'up',
    },
    {
      id: 'tc-6',
      name: '기타',
      keywords: ['일반', '채팅', '질문'],
      count: 90,
      percentage: 6,
      trend: 'stable',
    },
  ]
}

export async function getUserBehaviors(): Promise<UserBehavior[]> {
  await delay(200)
  return [
    { feature: '일반 채팅', usageCount: 4500, avgDuration: 3.2, satisfactionRate: 0.87 },
    { feature: '번역', usageCount: 2800, avgDuration: 1.5, satisfactionRate: 0.92 },
    { feature: '문서 작성', usageCount: 1900, avgDuration: 8.5, satisfactionRate: 0.85 },
    { feature: 'OCR', usageCount: 800, avgDuration: 2.1, satisfactionRate: 0.78 },
    { feature: '코드 리뷰', usageCount: 650, avgDuration: 5.3, satisfactionRate: 0.91 },
  ]
}

export async function getHourlyDistribution(): Promise<HourlyDistribution[]> {
  await delay(150)
  const base = [
    2, 1, 1, 1, 2, 5, 15, 35, 55, 70, 80, 75, 60, 65, 85, 90, 80, 65, 45, 30, 20, 12, 8, 4,
  ]
  return base.map((count, hour) => ({
    hour,
    count: count + Math.floor(Math.random() * 10),
  }))
}

export async function getConversationQuality(): Promise<ConversationQuality> {
  await delay(200)
  return {
    avgRating: 4.3,
    responseTimeP50: 1.2,
    responseTimeP95: 4.8,
    errorRate: 0.023,
    completionRate: 0.94,
  }
}

export async function exportChatData(
  format: 'csv' | 'pdf',
  period: '7d' | '30d' | '90d',
): Promise<{ url: string; fileName: string }> {
  await delay(500)
  return {
    url: `#mock-download-${format}-${period}`,
    fileName: `chat-analytics-${period}.${format}`,
  }
}
