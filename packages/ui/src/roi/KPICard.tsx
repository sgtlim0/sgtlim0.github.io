export interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}

export default function KPICard({ label, value, trend, trendUp = true }: KPICardProps) {
  return (
    <div className="flex-1 min-w-0 p-5 rounded-xl bg-[var(--roi-kpi-bg)] border border-[var(--roi-card-border)]">
      <p className="text-xs text-[var(--roi-text-secondary)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--roi-text-primary)] tabular-nums">{value}</p>
      <span
        className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          trendUp
            ? 'bg-[var(--roi-positive)]/10 text-[var(--roi-positive)]'
            : 'bg-[var(--roi-negative)]/10 text-[var(--roi-negative)]'
        }`}
      >
        {trendUp ? '▲' : '▼'} {trend}
      </span>
    </div>
  );
}
