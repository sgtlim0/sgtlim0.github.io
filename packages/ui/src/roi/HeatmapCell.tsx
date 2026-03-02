export interface HeatmapCellProps {
  value: string;
  level: 'high' | 'mid' | 'low';
}

const levelColors = {
  high: 'bg-[var(--roi-heatmap-high)]/15 text-[var(--roi-heatmap-high)]',
  mid: 'bg-[var(--roi-heatmap-mid)]/15 text-[var(--roi-heatmap-mid)]',
  low: 'bg-[var(--roi-heatmap-low)]/15 text-[var(--roi-heatmap-low)]',
};

export default function HeatmapCell({ value, level }: HeatmapCellProps) {
  return (
    <td className={`px-4 py-3 text-center text-sm font-medium rounded ${levelColors[level]}`}>
      {value}
    </td>
  );
}
