export interface InsightCardProps {
  type: 'positive' | 'warning' | 'cost';
  title: string;
  description: string;
}

const typeStyles = {
  positive: {
    bg: 'bg-[var(--roi-positive)]/10',
    border: 'border-[var(--roi-positive)]/30',
    icon: '💡',
    iconColor: 'text-[var(--roi-positive)]',
  },
  warning: {
    bg: 'bg-[var(--roi-chart-4)]/10',
    border: 'border-[var(--roi-chart-4)]/30',
    icon: '⚠️',
    iconColor: 'text-[var(--roi-chart-4)]',
  },
  cost: {
    bg: 'bg-[var(--roi-chart-5)]/10',
    border: 'border-[var(--roi-chart-5)]/30',
    icon: '💰',
    iconColor: 'text-[var(--roi-chart-5)]',
  },
};

export default function InsightCard({ type, title, description }: InsightCardProps) {
  const style = typeStyles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-lg ${style.bg} border ${style.border}`}>
      <span className="text-lg">{style.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--roi-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--roi-text-secondary)] mt-0.5">{description}</p>
      </div>
    </div>
  );
}
