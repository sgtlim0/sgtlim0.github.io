import StatusBadge, { type StatusType } from './StatusBadge';

export interface UsageRow {
  date: string;
  user: string;
  type: string;
  model: string;
  tokens: string;
  cost: string;
  status: StatusType;
}

export interface DataTableProps {
  rows: UsageRow[];
  onViewDetail?: (index: number) => void;
}

export default function DataTable({ rows, onViewDetail }: DataTableProps) {
  const columns = ['날짜', '사용자', '유형', '모델', '토큰', '비용(₩)', '상태', ''];

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="p-12 text-center text-text-secondary text-sm">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-admin-bg-section border-b border-border">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-border-light hover:bg-admin-table-hover transition-colors ${
                i % 2 === 1 ? 'bg-admin-table-stripe' : ''
              }`}
            >
              <td className="px-4 py-3 text-text-secondary">{row.date}</td>
              <td className="px-4 py-3 text-text-primary font-medium">{row.user}</td>
              <td className="px-4 py-3 text-text-secondary">{row.type}</td>
              <td className="px-4 py-3 text-text-primary">{row.model}</td>
              <td className="px-4 py-3 text-text-primary tabular-nums">{row.tokens}</td>
              <td className="px-4 py-3 text-text-primary tabular-nums">{row.cost}</td>
              <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onViewDetail?.(i)}
                  aria-label={`${row.user} ${row.date} 상세 보기`}
                  className="text-xs text-admin-teal hover:underline"
                >
                  상세
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
