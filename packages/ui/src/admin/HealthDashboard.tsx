'use client'

import MiniLineChart from '../roi/charts/MiniLineChart'
import type { HealthStatus, ServiceHealth } from '../utils/healthCheck'
import type { HealthHistoryEntry, OverallHealth } from '../hooks/useHealthMonitor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthDashboardProps {
  /** Current health snapshot */
  current: HealthStatus | null
  /** Overall system health */
  overallStatus: OverallHealth
  /** Historical snapshots for charts */
  history: readonly HealthHistoryEntry[]
  /** Loading state */
  isLoading?: boolean
  /** Manual refresh handler */
  onRefresh?: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<OverallHealth, { label: string; dot: string; text: string; bg: string }> = {
  healthy: {
    label: '정상',
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  degraded: {
    label: '지연',
    dot: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  unhealthy: {
    label: '장애',
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
}

const SERVICE_STATUS_CONFIG: Record<ServiceHealth['status'], { label: string; dot: string; text: string }> = {
  up: { label: '정상', dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  degraded: { label: '지연', dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  down: { label: '장애', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
}

function formatLatency(ms?: number): string {
  if (ms === undefined || ms === 0) return '-'
  return `${ms}ms`
}

function computeUptime(history: readonly HealthHistoryEntry[], serviceName: string): number {
  if (history.length === 0) return 100
  const entries = history.filter((h) => h.services.some((s) => s.name === serviceName))
  if (entries.length === 0) return 100
  const upCount = entries.filter((h) => {
    const svc = h.services.find((s) => s.name === serviceName)
    return svc && svc.status !== 'down'
  }).length
  return Math.round((upCount / entries.length) * 10000) / 100
}

function buildLatencyChartData(
  history: readonly HealthHistoryEntry[],
  serviceName: string,
): { label: string; value: number }[] {
  const relevant = history.filter((h) => h.services.some((s) => s.name === serviceName))
  const recent = relevant.slice(-12)
  return recent.map((h) => {
    const svc = h.services.find((s) => s.name === serviceName)
    const date = new Date(h.timestamp)
    const label = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    return { label, value: svc?.latency ?? 0 }
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HealthDashboard({
  current,
  overallStatus,
  history,
  isLoading = false,
  onRefresh,
}: HealthDashboardProps) {
  if (isLoading || !current) {
    return (
      <div className="space-y-4" data-testid="health-dashboard-loading">
        <div className="rounded-xl border border-border bg-admin-bg-section p-5">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const overallConfig = STATUS_CONFIG[overallStatus]
  const servicesUp = current.services.filter((s) => s.status === 'up').length
  const totalServices = current.services.length

  return (
    <div className="space-y-6" data-testid="health-dashboard">
      {/* Overall Status Banner */}
      <div className={`rounded-xl border border-border p-5 ${overallConfig.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${overallConfig.dot}`} />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                시스템 상태: <span className={overallConfig.text}>{overallConfig.label}</span>
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {servicesUp}/{totalServices} 서비스 정상 운영 중
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 text-sm rounded-lg border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-text-primary"
              data-testid="health-refresh-btn"
            >
              새로고침
            </button>
          )}
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {current.services.map((service) => {
          const config = SERVICE_STATUS_CONFIG[service.status]
          const uptime = computeUptime(history, service.name)
          const chartData = buildLatencyChartData(history, service.name)

          return (
            <div
              key={service.name}
              className="rounded-xl border border-border bg-admin-bg-section p-4"
              data-testid={`service-card-${service.name}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">{service.name}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  {config.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold tabular-nums text-text-primary">
                  {formatLatency(service.latency)}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">응답 시간</p>

              <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
                <span>가동률</span>
                <span className="font-medium tabular-nums">{uptime}%</span>
              </div>

              {/* Mini latency chart */}
              {chartData.length >= 2 && (
                <div className="mt-2">
                  <MiniLineChart
                    data={chartData}
                    color={service.status === 'down' ? 'var(--danger, #ef4444)' : service.status === 'degraded' ? 'var(--warning, #eab308)' : 'var(--success, #22c55e)'}
                    height={80}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
