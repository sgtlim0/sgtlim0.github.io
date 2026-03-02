'use client';

import { useState } from 'react';
import KPICard from './KPICard';
import SurveyBar from './SurveyBar';
import DateFilter from './DateFilter';
import DepartmentFilter from './DepartmentFilter';
import { MiniLineChart } from './charts';
import { RadarChart } from './charts';
import { useROIData } from './ROIDataContext';
import {
  sentimentKPIs as mockSentimentKPIs,
  surveyItems,
  improvementRequests,
  npsHistory as mockNpsHistory,
  deptSatisfaction as mockDeptSatisfaction,
  satisfactionAxes,
} from './mockData';

const rankColors = [
  'bg-[var(--roi-chart-1)]',
  'bg-[var(--roi-chart-2)]',
  'bg-[var(--roi-chart-3)]',
  'bg-[var(--roi-chart-4)]',
  'bg-[var(--roi-chart-5)]',
];

const deptColors = [
  'var(--roi-chart-1)',
  'var(--roi-chart-2)',
  'var(--roi-chart-3)',
  'var(--roi-chart-4)',
  'var(--roi-chart-5)',
];

export default function ROISentiment() {
  const [date, setDate] = useState('2026.02');
  const [dept, setDept] = useState('전체 부서');
  const { hasData, aggregated } = useROIData();

  const kpis = hasData && aggregated ? aggregated.sentimentKPIs : mockSentimentKPIs;
  const npsData = hasData && aggregated
    ? aggregated.npsHistory.map((d) => ({ label: d.month, value: d.score }))
    : mockNpsHistory.map((d) => ({ label: d.month, value: d.score }));
  const deptSat = hasData && aggregated ? aggregated.deptSatisfaction : mockDeptSatisfaction;

  const radarDatasets = deptSat.map((d, i) => ({
    label: d.dept,
    values: d.values,
    color: deptColors[i % deptColors.length],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">만족도 분석</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilter value={date} onChange={setDate} />
          <DepartmentFilter value={dept} onChange={setDept} />
        </div>
      </div>

      {hasData && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--roi-positive)]/10 border border-[var(--roi-positive)]/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-[var(--roi-positive)]" />
          <span className="text-xs font-medium text-[var(--roi-positive)]">업로드 데이터 반영 중</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Survey Results */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">설문 항목별 결과</h3>
        <div className="flex flex-col gap-3">
          {surveyItems.map((item) => (
            <SurveyBar key={item.label} {...item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">NPS 추이 (6개월)</h3>
          <MiniLineChart data={npsData} height={160} color="var(--roi-chart-3)" />
        </div>
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">부서별 만족도 비교</h3>
          <RadarChart axes={satisfactionAxes} datasets={radarDatasets} size={180} />
        </div>
      </div>

      {/* Improvement Requests TOP 5 */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">개선 요청 TOP 5</h3>
        <div className="flex flex-col gap-3">
          {improvementRequests.map((req) => (
            <div key={req.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full ${rankColors[req.rank - 1]} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>
                {req.rank}
              </span>
              <span className="text-sm text-[var(--roi-text-primary)] flex-1">{req.text}</span>
              <span className="text-sm font-semibold text-[var(--roi-chart-1)] tabular-nums">{req.count}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
