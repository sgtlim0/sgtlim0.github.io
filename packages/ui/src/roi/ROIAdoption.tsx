'use client';

import { useState } from 'react';
import KPICard from './KPICard';
import DateFilter from './DateFilter';
import { MiniLineChart } from './charts';
import { adoptionKPIs, userSegments, featureAdoption, weeklyActiveUsers } from './mockData';

export default function ROIAdoption() {
  const [date, setDate] = useState('2026.02');

  const lineData = weeklyActiveUsers.map((d) => ({ label: d.week, value: d.count }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">도입 현황</h1>
        <DateFilter value={date} onChange={setDate} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {adoptionKPIs.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* User Segmentation */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">사용자 세분화</h3>
        <div className="flex flex-col gap-3">
          {userSegments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-4">
              <span className="text-sm text-[var(--roi-text-primary)] w-48 shrink-0">{seg.label}</span>
              <div className="flex-1 h-5 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--roi-chart-1)] transition-all duration-500"
                  style={{ width: `${seg.value}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--roi-text-primary)] w-12 text-right tabular-nums">{seg.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Adoption */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">기능별 도입률</h3>
        <div className="flex flex-col gap-3">
          {featureAdoption.map((feat) => (
            <div key={feat.label} className="flex items-center gap-4">
              <span className="text-sm text-[var(--roi-text-primary)] w-40 shrink-0">{feat.label}</span>
              <div className="flex-1 h-5 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--roi-chart-2)] transition-all duration-500"
                  style={{ width: `${feat.value}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--roi-text-primary)] w-12 text-right tabular-nums">{feat.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Users Chart */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">활성 사용자 추이 (12주)</h3>
        <MiniLineChart data={lineData} height={220} color="var(--roi-chart-2)" />
      </div>
    </div>
  );
}
