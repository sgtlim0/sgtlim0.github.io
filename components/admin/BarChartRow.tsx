export interface BarChartRowProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  displayValue?: string;
}

const DEFAULT_COLORS = [
  'bg-admin-teal',
  'bg-admin-blue',
  'bg-admin-accent',
  'bg-admin-green',
  'bg-admin-navy',
];

export default function BarChartRow({
  label,
  value,
  maxValue,
  color,
  displayValue,
}: BarChartRowProps) {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const barColor = color ?? DEFAULT_COLORS[0];

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-sm text-text-primary w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-6 bg-bg-hover rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-text-secondary w-16 text-right tabular-nums">
        {displayValue ?? `${percentage}%`}
      </span>
    </div>
  );
}
