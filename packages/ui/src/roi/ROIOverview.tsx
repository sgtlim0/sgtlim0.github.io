'use client';

import { useState } from 'react';
import KPICard from './KPICard';
import InsightCard from './InsightCard';
import DateFilter from './DateFilter';
import DepartmentFilter from './DepartmentFilter';
import { MiniLineChart } from './charts';
import { DonutChart } from './charts';
import { useROIData } from './ROIDataContext';
import {
  overviewKPIs as mockOverviewKPIs,
  departmentRanking as mockDeptRanking,
  insights,
  monthlyTimeSavings as mockTimeSavings,
  modelCostEfficiency as mockModelEfficiency,
} from './mockData';

export default function ROIOverview() {
  const [date, setDate] = useState('2026.02');
  const [dept, setDept] = useState('전체 부서');
  const { hasData, aggregated } = useROIData();

  const kpis = hasData && aggregated ? aggregated.overviewKPIs : mockOverviewKPIs;
  const timeSavings = hasData && aggregated ? aggregated.monthlyTimeSavings : mockTimeSavings;
  const modelEfficiency = hasData && aggregated ? aggregated.modelCostEfficiency : mockModelEfficiency;
  const deptRanking = hasData && aggregated ? aggregated.departmentRanking : mockDeptRanking;

  const lineData = timeSavings.map((d) => ({ label: d.month, value: d.hours }));
  const donutSegments = modelEfficiency.map((d) => ({ label: d.name, value: d.value, color: d.color }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">ROI 대시보드</h1>
          <p className="text-sm text-[var(--roi-text-secondary)] mt-0.5">
            {hasData ? '업로드된 데이터 기반 분석' : 'AI 도입 효과를 한눈에 확인하세요'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter value={date} onChange={setDate} />
          <DepartmentFilter value={dept} onChange={setDept} />
        </div>
      </div>

      {/* Data Source Badge */}
      {hasData && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--roi-positive)]/10 border border-[var(--roi-positive)]/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-[var(--roi-positive)]" />
          <span className="text-xs font-medium text-[var(--roi-positive)]">업로드 데이터 반영 중</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">시간 절감 추이 (6개월)</h3>
          <MiniLineChart data={lineData} height={200} />
        </div>
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">모델별 비용 효율</h3>
          <DonutChart segments={donutSegments} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Department ROI Ranking */}
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">부서별 ROI 순위</h3>
          <div className="flex flex-col gap-3">
            {deptRanking.map((d) => {
              const pct = d.maxRoi > 0 ? Math.round((d.roi / d.maxRoi) * 100) : 0;
              return (
                <div key={d.department} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--roi-text-primary)] w-20 shrink-0">{d.department}</span>
                  <div className="flex-1 h-5 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--roi-chart-2)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--roi-text-primary)] w-14 text-right tabular-nums">
                    {d.roi}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">AI 인사이트</h3>
          <div className="flex flex-col gap-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
