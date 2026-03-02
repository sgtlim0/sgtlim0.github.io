export interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, trend, trendUp }: StatCardProps) {
  return (
    <div className="flex-1 flex flex-col gap-2 p-5 rounded-xl bg-admin-bg-section border border-border">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-2xl font-bold text-text-primary tabular-nums">{value}</span>
      {trend && (
        <span className={`text-xs font-medium ${trendUp ? 'text-admin-status-success' : 'text-admin-status-error'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  );
}
