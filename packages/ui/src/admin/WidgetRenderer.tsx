import type { WidgetType } from './services/widgetTypes'

interface WidgetRendererProps {
  type: WidgetType
  settings?: Record<string, string | number | boolean>
}

function MetricCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <span className="text-3xl font-bold text-text-primary tabular-nums">12,847</span>
      <span className="text-xs font-medium text-admin-status-success">↑ 12.3%</span>
    </div>
  )
}

function LineChart() {
  return (
    <div className="flex flex-col h-full">
      <span className="text-xs text-text-secondary mb-2">실시간 차트</span>
      <svg viewBox="0 0 200 80" className="flex-1 w-full" preserveAspectRatio="none">
        <polyline
          points="0,60 30,45 60,55 90,30 120,40 150,20 180,35 200,15"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,60 30,45 60,55 90,30 120,40 150,20 180,35 200,15"
          fill="url(#lineGrad)"
          stroke="none"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function BarChart() {
  const bars = [
    { label: 'GPT-4', value: 85 },
    { label: 'Claude', value: 65 },
    { label: 'Gemini', value: 40 },
  ]
  return (
    <div className="flex items-end gap-3 h-full pt-2">
      {bars.map((bar) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-primary/70" style={{ height: `${bar.value}%` }} />
          <span className="text-[10px] text-text-secondary">{bar.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart() {
  const r = 32
  const stroke = 8
  const circumference = 2 * Math.PI * r
  const segments = [
    { pct: 0.45, color: 'var(--primary)' },
    { pct: 0.3, color: 'var(--success, #10B981)' },
    { pct: 0.25, color: 'var(--admin-status-warning, #F59E0B)' },
  ]
  let offset = 0

  return (
    <div className="flex items-center justify-center h-full">
      <svg width="80" height="80" viewBox="0 0 80 80">
        {segments.map((seg, i) => {
          const dashArray = `${seg.pct * circumference} ${circumference}`
          const el = (
            <circle
              key={i}
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              transform="rotate(-90 40 40)"
            />
          )
          offset += seg.pct * circumference
          return el
        })}
      </svg>
    </div>
  )
}

function ActivityFeed() {
  const items = [
    { time: '2분 전', text: 'admin@hchat.ai 로그인' },
    { time: '5분 전', text: 'GPT-4o 모델 사용량 급증 알림' },
    { time: '12분 전', text: '신규 사용자 3명 등록' },
  ]
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs">
          <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
          <div>
            <span className="text-text-primary">{item.text}</span>
            <span className="ml-2 text-text-secondary">{item.time}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ModelDistribution() {
  const models = [
    { name: 'GPT-4o', pct: 45 },
    { name: 'Claude 3.5', pct: 30 },
    { name: 'Gemini Pro', pct: 15 },
    { name: '기타', pct: 10 },
  ]
  return (
    <div className="flex flex-col gap-2">
      {models.map((m) => (
        <div key={m.name} className="flex items-center gap-2">
          <span className="text-xs text-text-secondary w-20 shrink-0">{m.name}</span>
          <div className="flex-1 h-2 rounded-full bg-admin-bg-section overflow-hidden">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${m.pct}%` }} />
          </div>
          <span className="text-xs text-text-primary tabular-nums w-8 text-right">{m.pct}%</span>
        </div>
      ))}
    </div>
  )
}

function NotificationSummary() {
  const counts = [
    { label: '긴급', count: 2, color: 'text-admin-status-error' },
    { label: '경고', count: 5, color: 'text-admin-status-warning' },
    { label: '정보', count: 12, color: 'text-primary' },
    { label: '완료', count: 8, color: 'text-admin-status-success' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {counts.map((c) => (
        <div
          key={c.label}
          className="flex flex-col items-center justify-center rounded-lg bg-admin-bg-section p-2"
        >
          <span className={`text-lg font-bold tabular-nums ${c.color}`}>{c.count}</span>
          <span className="text-[10px] text-text-secondary">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function UserStats() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-admin-status-success tabular-nums">1,247</span>
          <span className="text-[10px] text-text-secondary">활성</span>
        </div>
        <div className="w-px h-8 bg-admin-border" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-text-secondary tabular-nums">83</span>
          <span className="text-[10px] text-text-secondary">비활성</span>
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = ['사용자 추가', '모델 설정', '리포트 생성', '로그 확인']
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className="rounded-lg border border-admin-border bg-admin-bg-section px-2 py-3 text-xs font-medium text-text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  )
}

function StatusOverview() {
  const statuses = [
    { name: 'API 서버', ok: true },
    { name: 'DB 클러스터', ok: true },
    { name: '캐시 서버', ok: false },
  ]
  return (
    <div className="flex flex-col gap-2">
      {statuses.map((s) => (
        <div key={s.name} className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${s.ok ? 'bg-admin-status-success' : 'bg-admin-status-error'}`}
          />
          <span className="text-xs text-text-primary">{s.name}</span>
          <span
            className={`ml-auto text-[10px] font-medium ${s.ok ? 'text-admin-status-success' : 'text-admin-status-error'}`}
          >
            {s.ok ? '정상' : '장애'}
          </span>
        </div>
      ))}
    </div>
  )
}

const RENDERERS: Record<WidgetType, React.FC> = {
  'metric-card': MetricCard,
  'line-chart': LineChart,
  'bar-chart': BarChart,
  'donut-chart': DonutChart,
  'activity-feed': ActivityFeed,
  'model-distribution': ModelDistribution,
  'notification-summary': NotificationSummary,
  'user-stats': UserStats,
  'quick-actions': QuickActions,
  'status-overview': StatusOverview,
}

export default function WidgetRenderer({ type }: WidgetRendererProps) {
  const Renderer = RENDERERS[type]
  if (!Renderer) {
    return <div className="text-xs text-text-secondary">Unknown widget: {type}</div>
  }
  return <Renderer />
}
