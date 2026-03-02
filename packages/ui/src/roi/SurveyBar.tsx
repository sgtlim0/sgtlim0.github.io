export interface SurveyBarProps {
  label: string;
  value: number;
}

export default function SurveyBar({ label, value }: SurveyBarProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[var(--roi-text-primary)] w-56 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-5 bg-[var(--roi-body-bg)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--roi-chart-1)] transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-[var(--roi-text-primary)] w-12 text-right tabular-nums">{value}%</span>
    </div>
  );
}
