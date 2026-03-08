import type { ModelUsage } from '../services/types'

export interface UsageTableProps {
  usage: ModelUsage[]
}

function formatCost(cost: number): string {
  return cost.toLocaleString('ko-KR')
}

export default function UsageTable({ usage }: UsageTableProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-user-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-user-border bg-user-bg-section">
              <th className="px-5 py-3 font-medium text-user-text-secondary">모델명</th>
              <th className="px-5 py-3 font-medium text-user-text-secondary">현재 사용량</th>
              <th className="px-5 py-3 text-right font-medium text-user-text-secondary">
                이용 요금 (원)
              </th>
            </tr>
          </thead>
          <tbody>
            {usage.map((item, index) => (
              <tr
                key={item.modelName}
                className={[
                  'border-b border-user-border last:border-b-0',
                  index % 2 === 1 ? 'bg-user-bg-section' : 'bg-user-bg',
                ].join(' ')}
              >
                <td className="px-5 py-3 font-medium text-user-text-primary">{item.modelName}</td>
                <td className="px-5 py-3 text-user-text-secondary">{item.currentUsage}</td>
                <td className="px-5 py-3 text-right text-user-text-primary">
                  {formatCost(item.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-user-text-muted">
        매 3시간 또는 매달 제공되는 사용분은 이월되지 않습니다.
      </p>
    </div>
  )
}
