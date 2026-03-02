import StatCard from './StatCard';
import DataTable from './DataTable';
import BarChartRow from './BarChartRow';

const RECENT_USAGE = [
  { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' as const },
  { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' as const },
  { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' as const },
];

const MODEL_USAGE = [
  { label: 'Claude 3.5', value: 45, color: 'bg-admin-teal' },
  { label: 'GPT-4', value: 30, color: 'bg-admin-blue' },
  { label: 'Gemini', value: 15, color: 'bg-admin-accent' },
  { label: '기타', value: 10, color: 'bg-admin-green' },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">관리자 대시보드</h1>
          <p className="text-sm text-text-secondary mt-1">2026년 3월 2일 기준 사용 현황 요약</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-white bg-admin-teal rounded-lg hover:opacity-90 transition-opacity">
            전체 내역 보기
          </button>
          <button className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors">
            리포트 다운로드
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        <StatCard label="총 대화 수" value="1,247" />
        <StatCard label="총 토큰 사용량" value="2.4M" />
        <StatCard label="활성 사용자" value="38" />
        <StatCard label="이번 달 비용" value="₩127K" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">최근 사용내역</h2>
          <DataTable rows={RECENT_USAGE} />
        </div>
        <div className="w-80 flex flex-col gap-3 p-5 rounded-xl border border-border bg-admin-bg-section">
          <h2 className="text-lg font-semibold text-text-primary">모델별 사용 비율</h2>
          {MODEL_USAGE.map((m) => (
            <BarChartRow key={m.label} label={m.label} value={m.value} maxValue={100} color={m.color} displayValue={`${m.value}%`} />
          ))}
        </div>
      </div>
    </div>
  );
}
