import StatCard from './StatCard'

interface Agent {
  name: string
  status: 'running' | 'idle' | 'error'
  lastRun: string
  totalExecutions: number
  successRate: string
}

interface Execution {
  timestamp: string
  agentName: string
  task: string
  status: 'success' | 'failed' | 'running'
  duration: string
  tokenUsage: string
}

const AGENTS: Agent[] = [
  {
    name: 'Code Reviewer',
    status: 'running',
    lastRun: '2분 전',
    totalExecutions: 1247,
    successRate: '98.5%',
  },
  {
    name: 'TDD Guide',
    status: 'idle',
    lastRun: '15분 전',
    totalExecutions: 892,
    successRate: '96.8%',
  },
  {
    name: 'Build Resolver',
    status: 'idle',
    lastRun: '1시간 전',
    totalExecutions: 543,
    successRate: '94.2%',
  },
  {
    name: 'Security Reviewer',
    status: 'running',
    lastRun: '방금 전',
    totalExecutions: 678,
    successRate: '99.1%',
  },
  {
    name: 'E2E Runner',
    status: 'error',
    lastRun: '10분 전',
    totalExecutions: 324,
    successRate: '91.4%',
  },
]

const EXECUTIONS: Execution[] = [
  {
    timestamp: '2026-03-03 15:42',
    agentName: 'Code Reviewer',
    task: '코드 품질 분석',
    status: 'running',
    duration: '-',
    tokenUsage: '-',
  },
  {
    timestamp: '2026-03-03 15:40',
    agentName: 'Security Reviewer',
    task: '보안 취약점 스캔',
    status: 'success',
    duration: '8.2초',
    tokenUsage: '1,245',
  },
  {
    timestamp: '2026-03-03 15:38',
    agentName: 'TDD Guide',
    task: '단위 테스트 생성',
    status: 'success',
    duration: '12.4초',
    tokenUsage: '2,890',
  },
  {
    timestamp: '2026-03-03 15:30',
    agentName: 'E2E Runner',
    task: 'E2E 테스트 실행',
    status: 'failed',
    duration: '45.1초',
    tokenUsage: '3,422',
  },
  {
    timestamp: '2026-03-03 15:25',
    agentName: 'Build Resolver',
    task: '빌드 오류 해결',
    status: 'success',
    duration: '18.7초',
    tokenUsage: '4,105',
  },
  {
    timestamp: '2026-03-03 15:20',
    agentName: 'Code Reviewer',
    task: 'PR 리뷰',
    status: 'success',
    duration: '15.3초',
    tokenUsage: '3,678',
  },
  {
    timestamp: '2026-03-03 15:15',
    agentName: 'TDD Guide',
    task: '통합 테스트 검증',
    status: 'success',
    duration: '9.8초',
    tokenUsage: '1,987',
  },
  {
    timestamp: '2026-03-03 15:10',
    agentName: 'Security Reviewer',
    task: '의존성 취약점 검사',
    status: 'success',
    duration: '6.5초',
    tokenUsage: '1,123',
  },
]

const DAILY_TREND = [
  { time: '00:00', executions: 12 },
  { time: '03:00', executions: 8 },
  { time: '06:00', executions: 15 },
  { time: '09:00', executions: 42 },
  { time: '12:00', executions: 38 },
  { time: '15:00', executions: 52 },
  { time: '18:00', executions: 45 },
  { time: '21:00', executions: 28 },
]

const statusConfig = {
  running: {
    label: '실행 중',
    color: 'bg-[#10B981]',
    textColor: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]/10',
  },
  idle: {
    label: '대기',
    color: 'bg-[#3B82F6]',
    textColor: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
  },
  error: {
    label: '오류',
    color: 'bg-[#EF4444]',
    textColor: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
  },
}

const executionStatusConfig = {
  success: { color: 'text-[#10B981]', dot: 'bg-[#10B981]' },
  failed: { color: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  running: { color: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' },
}

export default function AdminAgentMonitoring() {
  const maxExecutions = Math.max(...DAILY_TREND.map((d) => d.executions))

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">에이전트 실행 모니터링</h1>
        <p className="text-sm text-text-secondary mt-1">실시간 에이전트/자동화 실행 상태</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="활성 에이전트" value="5개" />
        <StatCard label="오늘 실행" value="328건" trend="+12%" trendUp />
        <StatCard label="성공률" value="96.2%" trend="+2.1%" trendUp />
        <StatCard label="평균 실행 시간" value="12.4초" trend="-1.8초" trendUp />
      </div>

      {/* Active Agents Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const status = statusConfig[agent.status]
          return (
            <div
              key={agent.name}
              className="p-5 rounded-xl bg-admin-bg-card border border-admin-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-primary">{agent.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${status.textColor} ${status.bgColor}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${status.color} mr-1.5`} />
                  {status.label}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">마지막 실행</span>
                  <span className="font-medium text-text-secondary">{agent.lastRun}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">총 실행 횟수</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {agent.totalExecutions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">성공률</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {agent.successRate}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Executions Log */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h3 className="text-base font-bold text-text-primary">최근 실행 로그</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-admin-bg-section">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">
                  시간
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">
                  에이전트
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">
                  작업
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">
                  상태
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  실행 시간
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  토큰 사용
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {EXECUTIONS.map((exec, i) => {
                const execStatus = executionStatusConfig[exec.status]
                return (
                  <tr key={i} className="hover:bg-admin-bg-hover transition-colors">
                    <td className="py-3 px-4 text-sm text-text-secondary tabular-nums">
                      {exec.timestamp}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-text-primary">
                      {exec.agentName}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">{exec.task}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 ${execStatus.color} text-sm`}
                      >
                        <span className={`w-2 h-2 rounded-full ${execStatus.dot}`} />
                        {exec.status === 'success'
                          ? '성공'
                          : exec.status === 'failed'
                            ? '실패'
                            : '실행 중'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary text-right tabular-nums">
                      {exec.duration}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary text-right tabular-nums">
                      {exec.tokenUsage}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Execution Trend */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
        <h3 className="text-base font-bold text-text-primary mb-4">오늘 실행 추이 (시간별)</h3>
        <div className="flex flex-col gap-3">
          {DAILY_TREND.map((d) => {
            const pct = maxExecutions > 0 ? (d.executions / maxExecutions) * 100 : 0
            return (
              <div key={d.time} className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-16 shrink-0 tabular-nums">
                  {d.time}
                </span>
                <div className="flex-1 h-6 rounded-full overflow-hidden bg-admin-bg-section">
                  <div
                    className="h-full bg-admin-teal transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    title={`${d.executions}건`}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary w-12 text-right tabular-nums">
                  {d.executions}건
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
