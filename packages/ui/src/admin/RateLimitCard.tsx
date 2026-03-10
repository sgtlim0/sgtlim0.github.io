'use client'

export interface RateLimitEndpoint {
  /** Endpoint identifier (e.g., 'login', 'chat') */
  name: string
  /** Display label */
  label: string
  /** Maximum requests allowed per window */
  limit: number
  /** Current usage count */
  current: number
  /** Window duration in milliseconds */
  windowMs: number
  /** Timestamp when the window resets */
  resetAt: number
}

export interface RateLimitCardProps {
  endpoint: RateLimitEndpoint
}

function formatResetTime(resetAt: number): string {
  const remaining = Math.max(0, resetAt - Date.now())
  const seconds = Math.ceil(remaining / 1000)
  if (seconds <= 0) return '리셋 완료'
  if (seconds < 60) return `${seconds}초 후 리셋`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes}분 후 리셋`
}

function getUsageLevel(current: number, limit: number): 'normal' | 'warning' | 'danger' {
  const ratio = current / limit
  if (ratio >= 1) return 'danger'
  if (ratio >= 0.7) return 'warning'
  return 'normal'
}

const levelConfig = {
  normal: {
    bar: 'bg-[#10B981]',
    text: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    label: '정상',
  },
  warning: {
    bar: 'bg-[#F59E0B]',
    text: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    label: '주의',
  },
  danger: {
    bar: 'bg-[#EF4444]',
    text: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    label: '초과',
  },
}

export default function RateLimitCard({ endpoint }: RateLimitCardProps) {
  const { label, limit, current, windowMs } = endpoint
  const remaining = Math.max(0, limit - current)
  const percentage = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0
  const level = getUsageLevel(current, limit)
  const config = levelConfig[level]
  const windowLabel = windowMs >= 60_000 ? `${windowMs / 60_000}분` : `${windowMs / 1000}초`

  return (
    <div className="p-5 rounded-xl bg-admin-bg-card border border-admin-border" data-testid={`rate-limit-card-${endpoint.name}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-text-primary">{label}</h3>
          <span className="text-xs text-text-secondary">{windowLabel}당 최대 {limit}회</span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${config.text} ${config.bg}`}
          data-testid="rate-limit-status"
        >
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-secondary">사용량</span>
          <span className="text-text-primary font-medium tabular-nums">
            {current} / {limit}
          </span>
        </div>
        <div className="h-3 bg-bg-hover rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full ${config.bar} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-text-secondary tabular-nums">{percentage}%</span>
          <span className={`font-medium tabular-nums ${config.text}`}>
            {formatResetTime(endpoint.resetAt)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 pt-3 border-t border-admin-border">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-text-primary tabular-nums">{remaining}</div>
          <div className="text-xs text-text-secondary">남은 요청</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-text-primary tabular-nums">{percentage}%</div>
          <div className="text-xs text-text-secondary">사용률</div>
        </div>
      </div>
    </div>
  )
}
