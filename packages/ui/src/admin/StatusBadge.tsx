export type StatusType = 'success' | 'error' | 'pending';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const STATUS_CONFIG: Record<StatusType, { defaultLabel: string; className: string }> = {
  success: {
    defaultLabel: '완료',
    className: 'bg-admin-status-success/15 text-admin-status-success',
  },
  error: {
    defaultLabel: '실패',
    className: 'bg-admin-status-error/15 text-admin-status-error',
  },
  pending: {
    defaultLabel: '진행중',
    className: 'bg-admin-status-pending/15 text-admin-status-pending',
  },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {label ?? config.defaultLabel}
    </span>
  );
}
