'use client';

import { useState } from 'react';

export interface MiniBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export default function MiniBarChart({ data, color = 'var(--roi-chart-2)', height = 200 }: MiniBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div role="img" aria-label="바 차트">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === i && (
                <div className="absolute -top-6 px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--roi-text-primary)] text-[var(--roi-card-bg)] whitespace-nowrap z-10">
                  {d.value.toLocaleString()}
                </div>
              )}
              <div
                className="w-full rounded-t transition-all duration-300 cursor-pointer"
                style={{
                  height: `${pct}%`,
                  backgroundColor: color,
                  opacity: hovered === i ? 1 : 0.8,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* X labels — show every other for space */}
      <div className="flex justify-between mt-1.5">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[9px] text-[var(--roi-text-muted)]"
            style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
