import StatCard from './StatCard'

interface Feature {
  name: string
  monthlyUsage: string
  changePercent: string
  changeUp: boolean
  activeUsers: string
  avgResponseTime: string
  satisfaction: string
  usagePercentage: number
}

const FEATURES: Feature[] = [
  {
    name: 'Chat',
    monthlyUsage: '19.0K',
    changePercent: '+8.5%',
    changeUp: true,
    activeUsers: '1,245',
    avgResponseTime: '1.2초',
    satisfaction: '4.7/5.0',
    usagePercentage: 42,
  },
  {
    name: 'Group Chat',
    monthlyUsage: '8.3K',
    changePercent: '+15.2%',
    changeUp: true,
    activeUsers: '542',
    avgResponseTime: '1.8초',
    satisfaction: '4.5/5.0',
    usagePercentage: 18,
  },
  {
    name: 'Tool Use',
    monthlyUsage: '7.1K',
    changePercent: '+22.1%',
    changeUp: true,
    activeUsers: '438',
    avgResponseTime: '2.4초',
    satisfaction: '4.6/5.0',
    usagePercentage: 16,
  },
  {
    name: 'Agent',
    monthlyUsage: '5.8K',
    changePercent: '+18.3%',
    changeUp: true,
    activeUsers: '321',
    avgResponseTime: '3.2초',
    satisfaction: '4.4/5.0',
    usagePercentage: 13,
  },
  {
    name: 'Debate',
    monthlyUsage: '3.2K',
    changePercent: '-5.2%',
    changeUp: false,
    activeUsers: '198',
    avgResponseTime: '4.1초',
    satisfaction: '4.2/5.0',
    usagePercentage: 7,
  },
  {
    name: 'Report',
    monthlyUsage: '1.8K',
    changePercent: '+12.4%',
    changeUp: true,
    activeUsers: '124',
    avgResponseTime: '5.3초',
    satisfaction: '4.3/5.0',
    usagePercentage: 4,
  },
]

const WEEKLY_TREND = [
  { week: 'W1', chat: 4.2, groupChat: 1.8, toolUse: 1.5, agent: 1.2, debate: 0.7, report: 0.4 },
  { week: 'W2', chat: 4.5, groupChat: 1.9, toolUse: 1.6, agent: 1.3, debate: 0.8, report: 0.4 },
  { week: 'W3', chat: 4.8, groupChat: 2.1, toolUse: 1.8, agent: 1.4, debate: 0.8, report: 0.5 },
  { week: 'W4', chat: 5.5, groupChat: 2.5, toolUse: 2.2, agent: 1.9, debate: 0.9, report: 0.5 },
]

const ADOPTION_RATE = [
  { name: 'Chat', rate: 89, color: 'bg-admin-teal' },
  { name: 'Group Chat', rate: 42, color: 'bg-[#3B82F6]' },
  { name: 'Tool Use', rate: 35, color: 'bg-[#8B5CF6]' },
  { name: 'Agent', rate: 28, color: 'bg-[#F59E0B]' },
  { name: 'Debate', rate: 18, color: 'bg-[#EF4444]' },
  { name: 'Report', rate: 12, color: 'bg-[#10B981]' },
]

export default function AdminFeatureUsage() {
  const totalUsage = FEATURES.reduce((sum, f) => {
    const num = parseFloat(f.monthlyUsage.replace('K', ''))
    return sum + num
  }, 0)
  const maxWeekly = Math.max(
    ...WEEKLY_TREND.map((w) => w.chat + w.groupChat + w.toolUse + w.agent + w.debate + w.report),
  )
  const topFeature = FEATURES[0]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">기능별 사용량</h1>
        <p className="text-sm text-text-secondary mt-1">AI 기능 사용 현황 및 트렌드 분석</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 기능" value="6개" />
        <StatCard label="이번 달 총 사용량" value={`${totalUsage.toFixed(1)}K건`} />
        <StatCard
          label="가장 인기 기능"
          value={topFeature.name}
          trend={`${topFeature.usagePercentage}%`}
          trendUp
        />
        <StatCard label="전월 대비" value="+12.8%" trend="5.2K건" trendUp />
      </div>

      {/* Feature Usage Table */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h3 className="text-base font-bold text-text-primary">기능별 상세 통계</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-admin-bg-section">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">
                  기능명
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  월간 사용량
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  전월 대비
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  활성 사용자
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">
                  평균 응답시간
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">
                  만족도
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {FEATURES.map((feature) => (
                <tr key={feature.name} className="hover:bg-admin-bg-hover transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-text-primary">
                    {feature.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary text-right tabular-nums">
                    {feature.monthlyUsage}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={`font-medium ${feature.changeUp ? 'text-admin-status-success' : 'text-admin-status-error'}`}
                    >
                      {feature.changeUp ? '↑' : '↓'} {feature.changePercent}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary text-right tabular-nums">
                    {feature.activeUsers}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary text-right tabular-nums">
                    {feature.avgResponseTime}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-admin-teal bg-admin-teal/10">
                      {feature.satisfaction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Usage Trend Chart */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
        <h3 className="text-base font-bold text-text-primary mb-4">주간 사용량 추이 (K건)</h3>
        <div className="flex flex-col gap-3">
          {WEEKLY_TREND.map((w) => {
            const total = w.chat + w.groupChat + w.toolUse + w.agent + w.debate + w.report
            return (
              <div key={w.week} className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-12 shrink-0 tabular-nums">
                  {w.week}
                </span>
                <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-admin-bg-section">
                  <div
                    className="h-full bg-admin-teal transition-all duration-500"
                    style={{ width: `${(w.chat / maxWeekly) * 100}%` }}
                    title={`Chat: ${w.chat}K건`}
                  />
                  <div
                    className="h-full bg-[#3B82F6] transition-all duration-500"
                    style={{ width: `${(w.groupChat / maxWeekly) * 100}%` }}
                    title={`Group Chat: ${w.groupChat}K건`}
                  />
                  <div
                    className="h-full bg-[#8B5CF6] transition-all duration-500"
                    style={{ width: `${(w.toolUse / maxWeekly) * 100}%` }}
                    title={`Tool Use: ${w.toolUse}K건`}
                  />
                  <div
                    className="h-full bg-[#F59E0B] transition-all duration-500"
                    style={{ width: `${(w.agent / maxWeekly) * 100}%` }}
                    title={`Agent: ${w.agent}K건`}
                  />
                  <div
                    className="h-full bg-[#EF4444] transition-all duration-500"
                    style={{ width: `${(w.debate / maxWeekly) * 100}%` }}
                    title={`Debate: ${w.debate}K건`}
                  />
                  <div
                    className="h-full bg-[#10B981] transition-all duration-500"
                    style={{ width: `${(w.report / maxWeekly) * 100}%` }}
                    title={`Report: ${w.report}K건`}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary w-16 text-right tabular-nums">
                  {total.toFixed(1)}K
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center flex-wrap gap-6 mt-4 pt-3 border-t border-admin-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-admin-teal" />
            <span className="text-xs text-text-secondary">Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#3B82F6]" />
            <span className="text-xs text-text-secondary">Group Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#8B5CF6]" />
            <span className="text-xs text-text-secondary">Tool Use</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#F59E0B]" />
            <span className="text-xs text-text-secondary">Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#EF4444]" />
            <span className="text-xs text-text-secondary">Debate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#10B981]" />
            <span className="text-xs text-text-secondary">Report</span>
          </div>
        </div>
      </div>

      {/* Feature Adoption Rate */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
        <h3 className="text-base font-bold text-text-primary mb-4">기능 도입률</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADOPTION_RATE.map((item) => (
            <div key={item.name} className="p-4 rounded-lg bg-admin-bg-section">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{item.name}</span>
                <span className="text-sm font-bold text-text-primary tabular-nums">
                  {item.rate}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-admin-bg-card overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
