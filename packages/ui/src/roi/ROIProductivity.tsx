'use client';

import KPICard from './KPICard';
import { MiniBarChart } from './charts';
import { DonutChart } from './charts';
import { useROIData } from './ROIDataContext';
import {
  productivityKPIs as mockProductivityKPIs,
  taskTimeSavings as mockTaskSavings,
  weeklyAIHours as mockWeeklyHours,
  featureSavingsRatio as mockFeatureRatio,
} from './mockData';

export default function ROIProductivity() {
  const { hasData, aggregated } = useROIData();

  const kpis = hasData && aggregated ? aggregated.productivityKPIs : mockProductivityKPIs;
  const taskSavings = hasData && aggregated ? aggregated.taskTimeSavings : mockTaskSavings;
  const weeklyHours = hasData && aggregated ? aggregated.weeklyAIHours : mockWeeklyHours;
  const featureRatio = hasData && aggregated ? aggregated.featureSavingsRatio : mockFeatureRatio;

  const barData = weeklyHours.map((d) => ({ label: d.week, value: d.hours }));
  const donutSegments = featureRatio.map((d) => ({ label: d.name, value: d.percent, color: d.color }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">생산성 효과</h1>

      {hasData && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--roi-positive)]/10 border border-[var(--roi-positive)]/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-[var(--roi-positive)]" />
          <span className="text-xs font-medium text-[var(--roi-positive)]">업로드 데이터 반영 중</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Task Time Savings Table */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">작업별 시간 절감</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--roi-divider)]">
              <th className="text-left py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">작업</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">수동 처리</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">AI 지원</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">절감률</th>
              <th className="py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)] w-40">비율</th>
            </tr>
          </thead>
          <tbody>
            {taskSavings.map((row) => (
              <tr key={row.task} className="border-b border-[var(--roi-divider)]/50">
                <td className="py-3 px-3 text-sm text-[var(--roi-text-primary)]">{row.task}</td>
                <td className="py-3 px-3 text-sm text-[var(--roi-text-secondary)] text-right tabular-nums">{row.manualMin}분</td>
                <td className="py-3 px-3 text-sm text-[var(--roi-text-secondary)] text-right tabular-nums">{row.aiMin}분</td>
                <td className="py-3 px-3 text-sm font-medium text-[var(--roi-positive)] text-right tabular-nums">{row.savedPercent}%</td>
                <td className="py-3 px-3">
                  <div className="h-4 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--roi-chart-3)]"
                      style={{ width: `${row.savedPercent}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">주간 AI 지원 시간 추이</h3>
          <MiniBarChart data={barData} height={200} />
        </div>
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">기능별 시간 절감 비중</h3>
          <DonutChart segments={donutSegments} />
        </div>
      </div>
    </div>
  );
}
