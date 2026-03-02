'use client';

export interface RadarChartProps {
  axes: string[];
  datasets: { label: string; values: number[]; color: string }[];
  size?: number;
}

export default function RadarChart({ axes, datasets, size = 200 }: RadarChartProps) {
  const cx = 50;
  const cy = 50;
  const maxR = 35;
  const n = axes.length;

  const getPoint = (i: number, pct: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = maxR * pct;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex items-center gap-4" role="img" aria-label="레이더 차트">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        {/* Grid polygons */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(' ');
          return <polygon key={level} points={pts} fill="none" stroke="var(--roi-divider)" strokeWidth="0.3" />;
        })}
        {/* Axis lines */}
        {axes.map((_, i) => {
          const p = getPoint(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--roi-divider)" strokeWidth="0.3" />;
        })}
        {/* Dataset polygons */}
        {datasets.map((ds) => {
          const pts = ds.values
            .map((v, i) => {
              const p = getPoint(i, v / 100);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={ds.label}
              points={pts}
              fill={ds.color}
              fillOpacity="0.15"
              stroke={ds.color}
              strokeWidth="0.8"
              className="transition-all duration-300"
            />
          );
        })}
        {/* Axis labels */}
        {axes.map((label, i) => {
          const p = getPoint(i, 1.2);
          return (
            <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-[var(--roi-text-secondary)]" fontSize="3.5">
              {label}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-col gap-2">
        {datasets.map((ds) => (
          <div key={ds.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ds.color }} />
            <span className="text-xs text-[var(--roi-text-secondary)]">{ds.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
