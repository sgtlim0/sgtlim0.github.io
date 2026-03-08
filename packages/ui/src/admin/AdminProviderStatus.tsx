import StatCard from './StatCard'

interface Provider {
  name: string
  status: 'online' | 'degraded' | 'offline'
  latency: string
  uptime: string
  models: string[]
  lastChecked: string
  region: string
}

const PROVIDERS: Provider[] = [
  {
    name: 'Amazon Bedrock',
    status: 'online',
    latency: '120ms',
    uptime: '99.97%',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Claude 3 Opus'],
    lastChecked: '2분 전',
    region: 'ap-northeast-2',
  },
  {
    name: 'OpenAI',
    status: 'online',
    latency: '180ms',
    uptime: '99.91%',
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4 Turbo'],
    lastChecked: '1분 전',
    region: 'US East',
  },
  {
    name: 'Google Gemini',
    status: 'degraded',
    latency: '350ms',
    uptime: '99.82%',
    models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash'],
    lastChecked: '3분 전',
    region: 'asia-northeast3',
  },
]

const INCIDENT_LOG = [
  {
    time: '2026-03-03 14:22',
    provider: 'Google Gemini',
    event: '응답 지연 발생 (>500ms)',
    severity: 'warning' as const,
  },
  {
    time: '2026-03-03 09:15',
    provider: 'Amazon Bedrock',
    event: '정상 복구',
    severity: 'success' as const,
  },
  {
    time: '2026-03-02 22:40',
    provider: 'Amazon Bedrock',
    event: '일시적 타임아웃 (5건)',
    severity: 'warning' as const,
  },
  {
    time: '2026-03-01 16:00',
    provider: 'OpenAI',
    event: 'Rate limit 임계치 도달 (80%)',
    severity: 'info' as const,
  },
]

const statusConfig = {
  online: {
    label: '정상',
    color: 'bg-[#10B981]',
    textColor: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]/10',
  },
  degraded: {
    label: '지연',
    color: 'bg-[#F59E0B]',
    textColor: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
  },
  offline: {
    label: '장애',
    color: 'bg-[#EF4444]',
    textColor: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
  },
}

const severityConfig = {
  success: { color: 'text-[#10B981]', dot: 'bg-[#10B981]' },
  warning: { color: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
  info: { color: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' },
}

export default function AdminProviderStatus() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI 제공자 상태</h1>
        <p className="text-sm text-text-secondary mt-1">실시간 AI 서비스 모니터링</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="전체 제공자" value="3개" />
        <StatCard label="정상 운영" value="2개" trend="66.7%" trendUp />
        <StatCard label="평균 응답 시간" value="217ms" trend="-15ms" trendUp />
        <StatCard label="평균 가동률" value="99.90%" trend="+0.02%" trendUp />
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROVIDERS.map((provider) => {
          const status = statusConfig[provider.status]
          return (
            <div
              key={provider.name}
              className="p-5 rounded-xl bg-admin-bg-card border border-admin-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-primary">{provider.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${status.textColor} ${status.bgColor}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${status.color} mr-1.5`} />
                  {status.label}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">응답 시간</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {provider.latency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">가동률 (30일)</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {provider.uptime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">리전</span>
                  <span className="font-medium text-text-primary">{provider.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">마지막 확인</span>
                  <span className="font-medium text-text-secondary">{provider.lastChecked}</span>
                </div>

                <div className="pt-3 border-t border-admin-border">
                  <span className="text-xs text-text-secondary">지원 모델</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {provider.models.map((model) => (
                      <span
                        key={model}
                        className="px-2 py-0.5 text-xs rounded bg-admin-bg-section text-text-secondary"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Incident Log */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h3 className="text-base font-bold text-text-primary">최근 이벤트 로그</h3>
        </div>
        <div className="divide-y divide-admin-border">
          {INCIDENT_LOG.map((log, i) => {
            const sev = severityConfig[log.severity]
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                <span className="text-xs text-text-secondary tabular-nums w-36 shrink-0">
                  {log.time}
                </span>
                <span className="text-sm font-medium text-text-primary w-32 shrink-0">
                  {log.provider}
                </span>
                <span className={`text-sm ${sev.color} flex-1`}>{log.event}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
