
import { LiveMetricCard } from './LiveMetricCard'
import { LiveLineChart } from './LiveLineChart'
import { LiveActivityFeed } from './LiveActivityFeed'
import { LiveModelDistribution } from './LiveModelDistribution'
import {
  useRealtimeMetrics,
  useRealtimeTimeSeries,
  useRealtimeActivities,
  useRealtimeStats,
} from './services/realtimeHooks'

export default function AdminRealtimeDashboard() {
  const metrics = useRealtimeMetrics()
  const timeSeries = useRealtimeTimeSeries()
  const activities = useRealtimeActivities()
  const stats = useRealtimeStats()

  if (!stats) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">실시간 모니터링</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-admin-bg-card border border-admin-border animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-xl bg-admin-bg-card border border-admin-border animate-pulse" />
          <div className="h-64 rounded-xl bg-admin-bg-card border border-admin-border animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">실시간 모니터링</h1>
        <div className="flex items-center gap-2 ml-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]" />
          </span>
          <span className="text-sm font-medium text-[#10B981]">실시간</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <LiveMetricCard key={metric.label ?? metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Content: Chart + Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-admin-bg-card border border-admin-border p-5">
          <h3 className="text-base font-bold text-text-primary mb-4">분당 쿼리 수</h3>
          <LiveLineChart
            data={timeSeries}
            color="var(--primary)"
            height={240}
            label="Queries/min"
          />
        </div>
        <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
          <h3 className="text-base font-bold text-text-primary mb-4">모델 사용 분포</h3>
          <LiveModelDistribution distribution={stats.modelDistribution} />
        </div>
      </div>

      {/* Bottom Row: Response Time + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
          <h3 className="text-base font-bold text-text-primary mb-4">평균 응답 시간 추이</h3>
          <LiveLineChart
            data={timeSeries}
            color="var(--success)"
            height={200}
            label="Response Time (ms)"
          />
        </div>
        <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
          <h3 className="text-base font-bold text-text-primary mb-4">최근 활동</h3>
          <LiveActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
