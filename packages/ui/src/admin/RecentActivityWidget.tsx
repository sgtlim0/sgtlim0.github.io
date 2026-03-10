export type ActivityEventType = 'login' | 'settings' | 'error' | 'user' | 'api' | 'deploy'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  message: string
  user: string
  timestamp: number
}

export interface RecentActivityWidgetProps {
  events?: ActivityEvent[]
  loading?: boolean
  error?: string
  maxItems?: number
}

const EVENT_CONFIG: Record<ActivityEventType, { icon: string; bg: string; text: string }> = {
  login: {
    icon: 'L',
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-600 dark:text-green-400',
  },
  settings: {
    icon: 'S',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
  },
  error: {
    icon: '!',
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-600 dark:text-red-400',
  },
  user: {
    icon: 'U',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-600 dark:text-purple-400',
  },
  api: {
    icon: 'A',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-600 dark:text-orange-400',
  },
  deploy: {
    icon: 'D',
    bg: 'bg-cyan-100 dark:bg-cyan-900/40',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
}

const DEFAULT_EVENTS: ActivityEvent[] = [
  { id: 'e1', type: 'login', message: '관리자 로그인', user: 'admin@hchat.ai', timestamp: Date.now() - 120_000 },
  { id: 'e2', type: 'settings', message: 'LLM 프로바이더 설정 변경', user: 'admin@hchat.ai', timestamp: Date.now() - 300_000 },
  { id: 'e3', type: 'error', message: 'Claude API 타임아웃 발생', user: 'system', timestamp: Date.now() - 600_000 },
  { id: 'e4', type: 'user', message: '신규 사용자 등록', user: 'hr@hchat.ai', timestamp: Date.now() - 900_000 },
  { id: 'e5', type: 'api', message: 'API 키 재발급', user: 'dev@hchat.ai', timestamp: Date.now() - 1_200_000 },
  { id: 'e6', type: 'deploy', message: 'v2.4.1 배포 완료', user: 'ci-bot', timestamp: Date.now() - 1_800_000 },
  { id: 'e7', type: 'login', message: '사용자 로그인', user: 'user01@hchat.ai', timestamp: Date.now() - 2_400_000 },
  { id: 'e8', type: 'error', message: 'Rate limit 초과', user: 'system', timestamp: Date.now() - 3_000_000 },
  { id: 'e9', type: 'settings', message: '프롬프트 라이브러리 업데이트', user: 'admin@hchat.ai', timestamp: Date.now() - 3_600_000 },
  { id: 'e10', type: 'api', message: 'Webhook 엔드포인트 등록', user: 'dev@hchat.ai', timestamp: Date.now() - 4_200_000 },
]

function formatRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function RecentActivityWidget({
  events = DEFAULT_EVENTS,
  loading = false,
  error,
  maxItems = 10,
}: RecentActivityWidgetProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">최근 활동</h3>
        <div className="text-sm text-red-500" role="alert">{error}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">최근 활동</h3>
        <div className="space-y-3" data-testid="recent-activity-loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const sortedEvents = [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems)

  return (
    <div className="rounded-xl border border-border bg-admin-bg-section p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">최근 활동</h3>
        <span className="text-xs text-text-secondary">최근 {sortedEvents.length}건</span>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-sm text-text-secondary text-center py-6">활동 내역이 없습니다</div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {sortedEvents.map((event) => {
            const config = EVENT_CONFIG[event.type]
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${config.bg} ${config.text}`}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary truncate">{event.message}</span>
                    <span className="text-xs text-text-secondary shrink-0 tabular-nums">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">{event.user}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
