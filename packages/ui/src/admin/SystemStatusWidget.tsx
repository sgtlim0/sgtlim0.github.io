export type SystemHealth = 'healthy' | 'degraded' | 'unhealthy'

export interface SystemStatusItem {
  name: string
  status: SystemHealth
  responseTime: number
  uptime: number
  lastChecked: string
}

export interface SystemStatusWidgetProps {
  items?: SystemStatusItem[]
  loading?: boolean
  error?: string
}

const DEFAULT_ITEMS: SystemStatusItem[] = [
  { name: 'API Gateway', status: 'healthy', responseTime: 42, uptime: 99.98, lastChecked: '2026-03-10 14:30:00' },
  { name: 'Auth Service', status: 'healthy', responseTime: 18, uptime: 99.99, lastChecked: '2026-03-10 14:30:00' },
  { name: 'LLM Proxy', status: 'degraded', responseTime: 890, uptime: 98.50, lastChecked: '2026-03-10 14:29:55' },
  { name: 'Database', status: 'healthy', responseTime: 5, uptime: 99.99, lastChecked: '2026-03-10 14:30:00' },
  { name: 'Redis Cache', status: 'unhealthy', responseTime: 0, uptime: 95.20, lastChecked: '2026-03-10 14:28:00' },
]

const STATUS_CONFIG: Record<SystemHealth, { label: string; dot: string; text: string }> = {
  healthy: {
    label: '정상',
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  degraded: {
    label: '지연',
    dot: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  unhealthy: {
    label: '장애',
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
}

function formatUptime(uptime: number): string {
  return `${uptime.toFixed(2)}%`
}

function formatResponseTime(ms: number): string {
  if (ms === 0) return '-'
  return `${ms}ms`
}

function formatLastChecked(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export default function SystemStatusWidget({
  items = DEFAULT_ITEMS,
  loading = false,
  error,
}: SystemStatusWidgetProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">시스템 상태</h3>
        <div className="text-sm text-red-500" role="alert">{error}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">시스템 상태</h3>
        <div className="space-y-3" data-testid="system-status-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const overallStatus: SystemHealth = items.some((i) => i.status === 'unhealthy')
    ? 'unhealthy'
    : items.some((i) => i.status === 'degraded')
      ? 'degraded'
      : 'healthy'

  const overallConfig = STATUS_CONFIG[overallStatus]

  return (
    <div className="rounded-xl border border-border bg-admin-bg-section p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">시스템 상태</h3>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${overallConfig.text}`}>
          <span className={`w-2 h-2 rounded-full ${overallConfig.dot}`} />
          {overallConfig.label}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status]
          return (
            <div
              key={item.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/50 dark:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                <span className="text-sm text-text-primary">{item.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary tabular-nums">
                <span>{formatResponseTime(item.responseTime)}</span>
                <span>{formatUptime(item.uptime)}</span>
                <span>{formatLastChecked(item.lastChecked)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
