/**
 * Mock Notification Service
 *
 * Simulates WebSocket-like push notification streaming using setInterval.
 * Provides realistic Korean enterprise notification data for the Admin dashboard.
 */

import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationFilter,
  NotificationStats,
  NotificationPreference,
  NotificationSubscription,
} from './notificationTypes'

// ============= Constants =============

const MAX_NOTIFICATIONS = 100

const NOTIFICATION_TEMPLATES: ReadonlyArray<Omit<Notification, 'id' | 'timestamp' | 'read'>> = [
  {
    type: 'error',
    priority: 'critical',
    title: '모델 응답 오류',
    message: 'GPT-4o 모델의 오류율이 5%를 초과했습니다',
    source: 'model',
    channels: ['push', 'email', 'slack'],
  },
  {
    type: 'warning',
    priority: 'high',
    title: 'API 사용량 경고',
    message: '일일 API 호출 한도의 80%에 도달했습니다',
    source: 'system',
    channels: ['push', 'email'],
  },
  {
    type: 'info',
    priority: 'medium',
    title: '새 모델 배포',
    message: 'Claude 4.5 Sonnet이 프로덕션에 배포되었습니다',
    source: 'model',
    channels: ['push'],
  },
  {
    type: 'success',
    priority: 'low',
    title: '백업 완료',
    message: '일일 데이터 백업이 성공적으로 완료되었습니다',
    source: 'system',
    channels: ['push'],
  },
  {
    type: 'warning',
    priority: 'high',
    title: '비정상 접근 탐지',
    message: '알 수 없는 IP에서 반복적인 로그인 시도가 감지되었습니다',
    source: 'security',
    channels: ['push', 'email', 'slack'],
  },
  {
    type: 'info',
    priority: 'medium',
    title: '사용자 가입',
    message: '새 사용자 3명이 등록했습니다',
    source: 'user',
    channels: ['push'],
  },
  {
    type: 'error',
    priority: 'high',
    title: '스트리밍 중단',
    message: 'SSE 스트리밍 연결이 일시적으로 중단되었습니다',
    source: 'system',
    channels: ['push', 'slack'],
  },
  {
    type: 'success',
    priority: 'medium',
    title: 'ROI 리포트 생성',
    message: '3월 ROI 분석 리포트가 생성되었습니다',
    source: 'system',
    channels: ['push', 'email'],
  },
  {
    type: 'warning',
    priority: 'medium',
    title: '토큰 사용량 급증',
    message: '지난 1시간 토큰 사용량이 평균 대비 200% 증가했습니다',
    source: 'model',
    channels: ['push'],
  },
  {
    type: 'info',
    priority: 'low',
    title: '시스템 점검 예정',
    message: '금일 23:00~01:00 정기 점검이 예정되어 있습니다',
    source: 'system',
    channels: ['push', 'email', 'teams'],
  },
  {
    type: 'error',
    priority: 'critical',
    title: '인증 서버 장애',
    message: 'SSO 인증 서버와의 연결이 끊어졌습니다',
    source: 'security',
    channels: ['push', 'email', 'slack', 'teams'],
  },
  {
    type: 'success',
    priority: 'low',
    title: '프롬프트 라이브러리 업데이트',
    message: '새 프롬프트 템플릿 5개가 추가되었습니다',
    source: 'system',
    channels: ['push'],
  },
  {
    type: 'warning',
    priority: 'high',
    title: '디스크 용량 부족',
    message: '로그 스토리지 사용량이 90%에 도달했습니다',
    source: 'system',
    channels: ['push', 'email'],
  },
  {
    type: 'info',
    priority: 'medium',
    title: '부서 변경 완료',
    message: 'AI혁신팀 → 디지털전환본부 조직 이동이 반영되었습니다',
    source: 'user',
    channels: ['push'],
  },
  {
    type: 'success',
    priority: 'medium',
    title: '모델 성능 개선',
    message: 'Gemini Pro 응답 속도가 15% 향상되었습니다',
    source: 'model',
    channels: ['push', 'email'],
  },
  {
    type: 'error',
    priority: 'high',
    title: '비용 한도 초과',
    message: '월간 API 비용이 설정된 한도를 초과했습니다',
    source: 'system',
    channels: ['push', 'email', 'slack'],
  },
  {
    type: 'info',
    priority: 'low',
    title: '감사 로그 내보내기',
    message: '2월 감사 로그 CSV 파일이 생성되었습니다',
    source: 'system',
    channels: ['push'],
  },
  {
    type: 'warning',
    priority: 'medium',
    title: '미승인 에이전트 감지',
    message: '등록되지 않은 에이전트 실행이 감지되었습니다',
    source: 'security',
    channels: ['push', 'slack'],
  },
]

// ============= Internal State =============

let _notifications: Notification[] = []

const _preferences: NotificationPreference[] = [
  { channel: 'push', enabled: true, types: ['info', 'warning', 'error', 'success'] },
  {
    channel: 'email',
    enabled: true,
    types: ['warning', 'error'],
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  { channel: 'slack', enabled: true, types: ['error'] },
  { channel: 'teams', enabled: false, types: [] },
]

// ============= Helpers =============

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function pickRandom<T>(arr: ReadonlyArray<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateNotification(): Notification {
  const template = pickRandom(NOTIFICATION_TEMPLATES)
  return {
    ...template,
    id: generateId(),
    timestamp: Date.now(),
    read: false,
  }
}

function applyFilter(
  notifications: ReadonlyArray<Notification>,
  filter?: NotificationFilter,
): Notification[] {
  if (!filter) return [...notifications]

  return notifications.filter((n) => {
    if (filter.types && !filter.types.includes(n.type)) return false
    if (filter.priorities && !filter.priorities.includes(n.priority)) return false
    if (filter.read !== undefined && n.read !== filter.read) return false
    if (filter.source && n.source !== filter.source) return false
    if (filter.from && n.timestamp < filter.from) return false
    if (filter.to && n.timestamp > filter.to) return false
    return true
  })
}

function computeStats(notifications: ReadonlyArray<Notification>): NotificationStats {
  const byType: Record<NotificationType, number> = { info: 0, warning: 0, error: 0, success: 0 }
  const byPriority: Record<NotificationPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }
  let unread = 0

  for (const n of notifications) {
    byType[n.type] += 1
    byPriority[n.priority] += 1
    if (!n.read) unread += 1
  }

  return {
    total: notifications.length,
    unread,
    byType,
    byPriority,
  }
}

// ============= Public API =============

export function subscribeNotifications(
  callback: (notification: Notification) => void,
  intervalMs: number = 5000,
): NotificationSubscription {
  const first = generateNotification()
  _notifications = [first, ..._notifications].slice(0, MAX_NOTIFICATIONS)
  callback(first)

  const id = setInterval(() => {
    const notification = generateNotification()
    _notifications = [notification, ..._notifications].slice(0, MAX_NOTIFICATIONS)
    callback(notification)
  }, intervalMs)

  return { unsubscribe: () => clearInterval(id) }
}

export function getNotifications(filter?: NotificationFilter): Notification[] {
  return applyFilter(_notifications, filter)
}

export function markAsRead(notificationId: string): void {
  _notifications = _notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
}

export function markAllAsRead(): void {
  _notifications = _notifications.map((n) => ({ ...n, read: true }))
}

export function getNotificationStats(): NotificationStats {
  return computeStats(_notifications)
}

export function getPreferences(): NotificationPreference[] {
  return [..._preferences]
}

export function updatePreference(
  channel: NotificationChannel,
  update: Partial<Omit<NotificationPreference, 'channel'>>,
): void {
  const idx = _preferences.findIndex((p) => p.channel === channel)
  if (idx !== -1) {
    _preferences[idx] = { ..._preferences[idx], ...update, channel }
  }
}
