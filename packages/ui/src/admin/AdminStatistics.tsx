import StatCard from './StatCard';
import BarChartRow from './BarChartRow';

const MONTHLY_TREND = [
  { month: '10월', tokens: 320, cost: 160 },
  { month: '11월', tokens: 480, cost: 240 },
  { month: '12월', tokens: 640, cost: 320 },
  { month: '1월', tokens: 720, cost: 360 },
  { month: '2월', tokens: 640, cost: 320 },
  { month: '3월', tokens: 892, cost: 470 },
];

const MODEL_BREAKDOWN = [
  { label: 'Claude 3.5', value: 55, color: 'bg-admin-teal' },
  { label: 'GPT-4', value: 30, color: 'bg-admin-blue' },
  { label: 'Gemini', value: 10, color: 'bg-admin-accent' },
  { label: '기타', value: 5, color: 'bg-admin-green' },
];

const TOP_USERS = [
  { name: '김철수', tokens: '125,000' },
  { name: '이영희', tokens: '98,400' },
  { name: '박민수', tokens: '87,200' },
  { name: '최수진', tokens: '65,800' },
  { name: '김민호', tokens: '54,100' },
];

export default function AdminStatistics() {
  const maxTrend = Math.max(...MONTHLY_TREND.map((t) => t.tokens));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">사용 통계</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard label="이번 달 총 토큰" value="892K" trend="12% 증가" trendUp />
        <StatCard label="이번 달 총 비용" value="₩47K" trend="8% 증가" trendUp />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4 p-5 rounded-xl border border-border bg-admin-bg-section">
          <h2 className="text-lg font-semibold text-text-primary">월별 토큰/비용 추이</h2>
          {MONTHLY_TREND.map((t) => (
            <BarChartRow key={t.month} label={t.month} value={t.tokens} maxValue={maxTrend} color="bg-admin-teal" displayValue={`${t.tokens}K`} />
          ))}
        </div>

        <div className="lg:w-80 flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-admin-bg-section">
            <h2 className="text-lg font-semibold text-text-primary">모델별 사용 분석</h2>
            {MODEL_BREAKDOWN.map((m) => (
              <BarChartRow key={m.label} label={m.label} value={m.value} maxValue={100} color={m.color} displayValue={`${m.value}%`} />
            ))}
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-admin-bg-section">
            <h2 className="text-lg font-semibold text-text-primary">Top 5 사용자</h2>
            {TOP_USERS.map((u, i) => (
              <div key={u.name} className="flex items-center justify-between py-1">
                <span className="text-sm text-text-primary">{i + 1}. {u.name}</span>
                <span className="text-sm font-medium text-admin-teal tabular-nums">{u.tokens}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
