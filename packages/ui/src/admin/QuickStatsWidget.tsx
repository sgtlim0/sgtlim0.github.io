export interface QuickStat {
  label: string
  value: number
  previousValue: number
  format?: 'number' | 'compact'
}

export interface QuickStatsWidgetProps {
  stats?: QuickStat[]
  loading?: boolean
  error?: string
}

const DEFAULT_STATS: QuickStat[] = [
  { label: '오늘 활성 사용자', value: 284, previousValue: 261 },
  { label: '오늘 대화 수', value: 1_523, previousValue: 1_401 },
  { label: '오늘 API 호출', value: 45_892, previousValue: 42_130, format: 'compact' },
  { label: '평균 응답 시간', value: 320, previousValue: 350 },
]

function formatValue(value: number, format?: 'number' | 'compact'): string {
  if (format === 'compact') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export default function QuickStatsWidget({
  stats = DEFAULT_STATS,
  loading = false,
  error,
}: QuickStatsWidgetProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">오늘의 현황</h3>
        <div className="text-sm text-red-500" role="alert">{error}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">오늘의 현황</h3>
        <div className="grid grid-cols-2 gap-4" data-testid="quick-stats-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-admin-bg-section p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">오늘의 현황</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const changePercent = calculateChangePercent(stat.value, stat.previousValue)
          const isPositive = changePercent > 0
          const isNegative = changePercent < 0

          return (
            <div
              key={stat.label}
              className="flex flex-col gap-1 p-3 rounded-lg bg-white/50 dark:bg-white/5"
            >
              <span className="text-xs text-text-secondary">{stat.label}</span>
              <span className="text-xl font-bold text-text-primary tabular-nums">
                {formatValue(stat.value, stat.format)}
              </span>
              <span
                className={`text-xs font-medium tabular-nums ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : isNegative
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-text-secondary'
                }`}
              >
                {isPositive ? '+' : ''}{changePercent.toFixed(1)}% 전일 대비
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
