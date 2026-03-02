'use client';

import { DonutChart } from './charts';
import { heatmapData, gradeUsage, modelUsageRatio } from './mockData';

const levelColors = {
  high: 'bg-[var(--roi-heatmap-high)]/15 text-[var(--roi-heatmap-high)]',
  mid: 'bg-[var(--roi-heatmap-mid)]/15 text-[var(--roi-heatmap-mid)]',
  low: 'bg-[var(--roi-heatmap-low)]/15 text-[var(--roi-heatmap-low)]',
};

export default function ROIOrganization() {
  const donutSegments = modelUsageRatio.map((d) => ({ label: d.name, value: d.percent, color: d.color }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">조직 분석</h1>

      {/* Heatmap Table */}
      <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">부서별 히트맵</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--roi-divider)]">
              <th className="text-left py-2 px-4 text-xs font-medium text-[var(--roi-text-secondary)]">부서</th>
              <th className="text-center py-2 px-4 text-xs font-medium text-[var(--roi-text-secondary)]">사용률</th>
              <th className="text-center py-2 px-4 text-xs font-medium text-[var(--roi-text-secondary)]">절감시간</th>
              <th className="text-center py-2 px-4 text-xs font-medium text-[var(--roi-text-secondary)]">ROI</th>
              <th className="text-center py-2 px-4 text-xs font-medium text-[var(--roi-text-secondary)]">만족도</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row) => (
              <tr key={row.dept} className="border-b border-[var(--roi-divider)]/50">
                <td className="py-3 px-4 text-sm font-medium text-[var(--roi-text-primary)]">{row.dept}</td>
                {[row.usage, row.time, row.roi, row.satisfaction].map((val, i) => (
                  <td key={i} className="py-2 px-2">
                    <span className={`block mx-auto w-fit px-4 py-2 rounded text-sm font-medium ${levelColors[row.levels[i]]}`}>
                      {val}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Grade Usage */}
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">직급별 활용도</h3>
          <div className="flex flex-col gap-3">
            {gradeUsage.map((g) => (
              <div key={g.label} className="flex items-center gap-4">
                <span className="text-sm text-[var(--roi-text-primary)] w-16 shrink-0">{g.label}</span>
                <div className="flex-1 h-5 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--roi-chart-1)]"
                    style={{ width: `${g.value}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--roi-text-primary)] w-12 text-right tabular-nums">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">모델별 사용 비율</h3>
          <DonutChart segments={donutSegments} />
        </div>
      </div>
    </div>
  );
}
