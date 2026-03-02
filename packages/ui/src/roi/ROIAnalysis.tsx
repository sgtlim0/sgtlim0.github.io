'use client';

import { useState } from 'react';
import { MiniLineChart } from './charts';
import { AreaChart } from './charts';
import { roiFlowData, costBreakdown, monthlyROI, cumulativeSavings } from './mockData';

const AVG_SAVED_HOURS_PER_USER = 8.75;

export default function ROIAnalysis() {
  const [users, setUsers] = useState(280);
  const [hourlyCost, setHourlyCost] = useState(45000);
  const [monthlyCost, setMonthlyCost] = useState(37000000);

  const savedValue = users * hourlyCost * AVG_SAVED_HOURS_PER_USER;
  const netBenefit = savedValue - monthlyCost;
  const simulatedROI = monthlyCost > 0 ? Math.round((netBenefit / monthlyCost) * 100) : 0;

  const lineData = monthlyROI.map((d) => ({ label: d.month, value: d.roi }));
  const areaData = cumulativeSavings.map((d) => ({ label: d.month, value: d.amount }));

  const formatKRW = (n: number) => {
    if (n >= 1_000_000_000) return `₩${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `₩${Math.round(n / 1_000_000)}M`;
    return `₩${n.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">ROI 분석</h1>

      {/* ROI Flow Banner */}
      <div className="p-6 rounded-xl bg-[var(--roi-chart-1)] text-white">
        <h3 className="text-sm font-medium mb-4 opacity-80">ROI 계산 흐름</h3>
        <div className="flex items-center justify-between gap-4">
          {[
            { label: 'AI 비용', value: roiFlowData.aiCost },
            { label: '절감 가치', value: roiFlowData.savedValue },
            { label: '순이익', value: roiFlowData.netBenefit },
            { label: 'ROI', value: roiFlowData.roiPercent },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-4">
              {i > 0 && <span className="text-2xl opacity-50">→</span>}
              <div className="text-center">
                <p className="text-xs opacity-70">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown + Simulator */}
      <div className="grid grid-cols-5 gap-4">
        {/* Cost Table */}
        <div className="col-span-3 p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">모델별 비용 분석</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--roi-divider)]">
                <th className="text-left py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">모델</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">토큰</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">비용</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">절감</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-[var(--roi-text-secondary)]">ROI</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.map((row) => (
                <tr key={row.model} className="border-b border-[var(--roi-divider)]/50">
                  <td className="py-3 px-3 text-sm font-medium text-[var(--roi-text-primary)]">{row.model}</td>
                  <td className="py-3 px-3 text-sm text-[var(--roi-text-secondary)] text-right tabular-nums">{row.tokens}</td>
                  <td className="py-3 px-3 text-sm text-[var(--roi-text-secondary)] text-right tabular-nums">{row.cost}</td>
                  <td className="py-3 px-3 text-sm text-[var(--roi-positive)] text-right tabular-nums">{row.savings}</td>
                  <td className="py-3 px-3 text-sm font-medium text-[var(--roi-text-primary)] text-right tabular-nums">{row.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ROI Simulator */}
        <div className="col-span-2 p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-4">ROI 시뮬레이터</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--roi-text-secondary)]">사용자 수</label>
              <input
                type="number"
                value={users}
                onChange={(e) => setUsers(Number(e.target.value) || 0)}
                aria-label="사용자 수"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--roi-divider)] bg-[var(--roi-body-bg)] text-[var(--roi-text-primary)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--roi-text-secondary)]">시간당 평균 인건비 (₩)</label>
              <input
                type="number"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value) || 0)}
                aria-label="시간당 평균 인건비"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--roi-divider)] bg-[var(--roi-body-bg)] text-[var(--roi-text-primary)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--roi-text-secondary)]">월 AI 비용 (₩)</label>
              <input
                type="number"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(Number(e.target.value) || 0)}
                aria-label="월 AI 비용"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--roi-divider)] bg-[var(--roi-body-bg)] text-[var(--roi-text-primary)]"
              />
            </div>
            <div className="mt-2 p-4 rounded-lg bg-[var(--roi-chart-1)]/5 border border-[var(--roi-chart-1)]/20">
              <p className="text-xs text-[var(--roi-text-secondary)]">시뮬레이션 결과</p>
              <p className="text-2xl font-bold text-[var(--roi-chart-1)] mt-1">ROI {simulatedROI}%</p>
              <p className="text-xs text-[var(--roi-text-secondary)] mt-1">순이익 {formatKRW(netBenefit)} / 월</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">월별 ROI 추이</h3>
          <MiniLineChart data={lineData} height={200} color="var(--roi-chart-2)" />
        </div>
        <div className="p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
          <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">누적 절감 금액</h3>
          <AreaChart data={areaData} height={200} />
        </div>
      </div>
    </div>
  );
}
