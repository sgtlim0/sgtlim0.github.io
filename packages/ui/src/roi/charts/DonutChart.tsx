'use client';

export interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}

export default function DonutChart({ segments, size = 160 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex items-center gap-6" role="img" aria-label="도넛 차트">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--roi-body-bg)" strokeWidth="12" />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const dashOffset = -accumulated * circumference;
          accumulated += pct;
          return (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          );
        })}
        {/* Center text */}
        <text x="50" y="48" textAnchor="middle" className="fill-[var(--roi-text-primary)]" fontSize="10" fontWeight="bold">
          {total.toLocaleString()}
        </text>
        <text x="50" y="58" textAnchor="middle" className="fill-[var(--roi-text-muted)]" fontSize="5">
          합계
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-col gap-2">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={seg.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-[var(--roi-text-secondary)]">{seg.label}</span>
              <span className="text-xs font-semibold text-[var(--roi-text-primary)] tabular-nums ml-auto">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
