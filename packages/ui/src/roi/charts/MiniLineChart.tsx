'use client';

import { useState } from 'react';

export interface MiniLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export default function MiniLineChart({ data, color = 'var(--roi-chart-1)', height = 200 }: MiniLineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 20 };
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * (100 - padding.left - padding.right);
  const getY = (v: number) => padding.top + (1 - (v - minVal) / range) * (height - padding.top - padding.bottom);

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  return (
    <div className="relative w-full" role="img" aria-label="라인 차트">
      <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + pct * (height - padding.top - padding.bottom);
          return <line key={pct} x1={padding.left} y1={y} x2={100 - padding.right} y2={y} stroke="var(--roi-divider)" strokeWidth="0.3" />;
        })}
        {/* Line */}
        <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} vectorEffect="non-scaling-stroke" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.value)}
            r={hovered === i ? 3 : 2}
            fill={color}
            stroke="var(--roi-card-bg)"
            strokeWidth="1"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {/* X axis labels */}
      <div className="flex justify-between px-1 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-[var(--roi-text-muted)]">{d.label}</span>
        ))}
      </div>
      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="absolute px-2 py-1 rounded text-xs font-medium bg-[var(--roi-text-primary)] text-[var(--roi-card-bg)] pointer-events-none whitespace-nowrap"
          style={{
            left: `${getX(hovered)}%`,
            top: getY(data[hovered].value) - 28,
            transform: 'translateX(-50%)',
          }}
        >
          {data[hovered].label}: {data[hovered].value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
