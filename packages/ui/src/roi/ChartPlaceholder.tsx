export interface ChartPlaceholderProps {
  title: string;
  height?: number;
  description?: string;
}

export default function ChartPlaceholder({ title, height = 200, description }: ChartPlaceholderProps) {
  return (
    <div className="flex-1 min-w-0 p-5 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
      <h3 className="text-sm font-semibold text-[var(--roi-text-primary)] mb-3">{title}</h3>
      <div
        className="flex items-center justify-center rounded-lg bg-[var(--roi-body-bg)] text-[var(--roi-text-muted)] text-xs"
        style={{ height }}
      >
        {description ?? '차트 영역'}
      </div>
    </div>
  );
}
