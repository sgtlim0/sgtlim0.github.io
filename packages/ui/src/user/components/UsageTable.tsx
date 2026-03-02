'use client';

import type { ModelUsage } from '../services/types';

export interface UsageTableProps {
  usage: ModelUsage[];
}

function formatCost(cost: number): string {
  return cost.toLocaleString('ko-KR');
}

export default function UsageTable({ usage }: UsageTableProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-5 py-3 font-medium text-[#64748B]">모델명</th>
              <th className="px-5 py-3 font-medium text-[#64748B]">현재 사용량</th>
              <th className="px-5 py-3 text-right font-medium text-[#64748B]">
                이용 요금 (원)
              </th>
            </tr>
          </thead>
          <tbody>
            {usage.map((item, index) => (
              <tr
                key={item.modelName}
                className={[
                  'border-b border-[#E2E8F0] last:border-b-0',
                  index % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white',
                ].join(' ')}
              >
                <td className="px-5 py-3 font-medium text-[#1E293B]">
                  {item.modelName}
                </td>
                <td className="px-5 py-3 text-[#64748B]">
                  {item.currentUsage}
                </td>
                <td className="px-5 py-3 text-right text-[#1E293B]">
                  {formatCost(item.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#94A3B8]">
        매 3시간 또는 매달 제공되는 사용분은 이월되지 않습니다.
      </p>
    </div>
  );
}
