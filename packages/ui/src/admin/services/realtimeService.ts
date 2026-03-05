/**
 * Mock Real-time Service
 *
 * Simulates WebSocket-like data streaming using setInterval.
 * Provides realistic Korean enterprise dashboard data with smooth fluctuations.
 */

import type {
  RealtimeMetric,
  RealtimeDataPoint,
  RealtimeActivity,
  RealtimeStats,
  RealtimeSubscription,
} from './realtimeTypes'

// ============= Constants =============

const KOREAN_NAMES = [
  '김민수',
  '이서연',
  '박지훈',
  '최유진',
  '정도현',
  '강소영',
  '조현우',
  '윤지은',
  '임태호',
  '한예린',
  '오승민',
  '서하늘',
  '신동욱',
  '류미래',
  '배준서',
] as const

const MODEL_NAMES = [
  'GPT-4o',
  'Claude 3.5 Sonnet',
  'Gemini Pro',
  'GPT-4o mini',
  'Claude 3 Haiku',
  'Gemini Flash',
] as const

const ACTIVITY_TEMPLATES: Record<string, readonly string[]> = {
  query: ['문서 요약 요청', '코드 리뷰 질의', '번역 요청', '데이터 분석 질의', '회의록 작성 요청'],
  login: ['대시보드 접속', '모바일 로그인', 'SSO 인증 완료'],
  error: ['토큰 한도 초과', 'API 타임아웃', '모델 응답 실패'],
  model_switch: ['GPT-4o → Claude 3.5', 'Gemini Pro → GPT-4o', 'Claude 3 Haiku → Gemini Flash'],
  upload: ['PDF 문서 업로드', 'Excel 데이터 업로드', '이미지 파일 업로드'],
} as const

// ============= Helpers =============

function fluctuate(base: number, percent: number): number {
  const range = base * (percent / 100)
  return Math.round(base + (Math.random() * 2 - 1) * range)
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function computeTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const change = ((current - previous) / previous) * 100
  if (change > 1) return 'up'
  if (change < -1) return 'down'
  return 'stable'
}

function computeChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ============= Metric Generators =============

function generateMetrics(baselines: Record<string, number>): RealtimeMetric[] {
  const activeUsers = fluctuate(baselines.activeUsers, 10)
  const prevActiveUsers = baselines.activeUsers

  const qpm = fluctuate(baselines.queriesPerMinute, 15)
  const prevQpm = baselines.queriesPerMinute

  const responseTime = fluctuate(baselines.avgResponseTime, 8)
  const prevResponseTime = baselines.avgResponseTime

  const errorRate = Math.round(fluctuate(baselines.errorRate * 100, 12)) / 100
  const prevErrorRate = baselines.errorRate

  return [
    {
      id: 'active-users',
      label: '활성 사용자',
      value: activeUsers,
      previousValue: prevActiveUsers,
      unit: '명',
      trend: computeTrend(activeUsers, prevActiveUsers),
      changePercent: computeChangePercent(activeUsers, prevActiveUsers),
    },
    {
      id: 'queries-per-minute',
      label: '분당 질의 수',
      value: qpm,
      previousValue: prevQpm,
      unit: '건/분',
      trend: computeTrend(qpm, prevQpm),
      changePercent: computeChangePercent(qpm, prevQpm),
    },
    {
      id: 'avg-response-time',
      label: '평균 응답 시간',
      value: responseTime,
      previousValue: prevResponseTime,
      unit: 'ms',
      trend: computeTrend(responseTime, prevResponseTime),
      changePercent: computeChangePercent(responseTime, prevResponseTime),
    },
    {
      id: 'error-rate',
      label: '오류율',
      value: errorRate,
      previousValue: prevErrorRate,
      unit: '%',
      trend: computeTrend(errorRate, prevErrorRate),
      changePercent: computeChangePercent(errorRate, prevErrorRate),
    },
  ]
}

function generateDataPoint(): RealtimeDataPoint {
  return {
    timestamp: Date.now(),
    value: fluctuate(42, 15),
  }
}

function generateActivity(): RealtimeActivity {
  const types = ['query', 'login', 'error', 'model_switch', 'upload'] as const
  const weights = [50, 20, 5, 15, 10]
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  let type: RealtimeActivity['type'] = 'query'

  for (let i = 0; i < types.length; i++) {
    roll -= weights[i]
    if (roll <= 0) {
      type = types[i]
      break
    }
  }

  return {
    id: generateId(),
    type,
    user: pickRandom(KOREAN_NAMES),
    message: pickRandom(ACTIVITY_TEMPLATES[type]),
    timestamp: Date.now(),
  }
}

function generateStats(): RealtimeStats {
  const models = MODEL_NAMES.map((model) => ({
    model,
    count: fluctuate(150, 15),
    percentage: 0,
  }))

  const totalCount = models.reduce((sum, m) => sum + m.count, 0)
  const distribution = models.map((m) => ({
    ...m,
    percentage: Math.round((m.count / totalCount) * 1000) / 10,
  }))

  return {
    activeUsers: fluctuate(38, 10),
    queriesPerMinute: fluctuate(24, 15),
    avgResponseTime: fluctuate(320, 8),
    errorRate: Math.round(fluctuate(150, 12)) / 100,
    totalTokensUsed: fluctuate(2400000, 5),
    modelDistribution: distribution,
  }
}

// ============= Subscription Functions =============

const METRIC_BASELINES = {
  activeUsers: 38,
  queriesPerMinute: 24,
  avgResponseTime: 320,
  errorRate: 1.5,
}

export function subscribeMetrics(
  callback: (metrics: RealtimeMetric[]) => void,
  intervalMs: number = 2000,
): RealtimeSubscription {
  callback(generateMetrics(METRIC_BASELINES))
  const id = setInterval(() => callback(generateMetrics(METRIC_BASELINES)), intervalMs)
  return { unsubscribe: () => clearInterval(id) }
}

export function subscribeTimeSeries(
  callback: (point: RealtimeDataPoint) => void,
  intervalMs: number = 3000,
): RealtimeSubscription {
  callback(generateDataPoint())
  const id = setInterval(() => callback(generateDataPoint()), intervalMs)
  return { unsubscribe: () => clearInterval(id) }
}

export function subscribeActivities(
  callback: (activity: RealtimeActivity) => void,
  intervalMs: number = 4000,
): RealtimeSubscription {
  callback(generateActivity())
  const id = setInterval(() => callback(generateActivity()), intervalMs)
  return { unsubscribe: () => clearInterval(id) }
}

export function subscribeStats(
  callback: (stats: RealtimeStats) => void,
  intervalMs: number = 5000,
): RealtimeSubscription {
  callback(generateStats())
  const id = setInterval(() => callback(generateStats()), intervalMs)
  return { unsubscribe: () => clearInterval(id) }
}
