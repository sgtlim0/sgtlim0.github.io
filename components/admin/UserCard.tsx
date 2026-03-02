export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserCardProps {
  name: string;
  userId: string;
  department: string;
  totalConversations: number;
  monthlyTokens: string;
  status: UserStatus;
  avatarColor?: string;
  onViewDetail?: () => void;
  onManagePermission?: () => void;
}

const STATUS_LABELS: Record<UserStatus, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-admin-status-success/15 text-admin-status-success' },
  inactive: { label: '비활성', className: 'bg-bg-hover text-text-tertiary' },
  suspended: { label: '정지', className: 'bg-admin-status-error/15 text-admin-status-error' },
};

const AVATAR_COLORS = ['bg-admin-teal', 'bg-admin-blue', 'bg-admin-accent', 'bg-admin-green', 'bg-admin-navy', 'bg-accent-purple'];

export default function UserCard({
  name,
  userId,
  department,
  totalConversations,
  monthlyTokens,
  status,
  avatarColor,
  onViewDetail,
  onManagePermission,
}: UserCardProps) {
  const statusConfig = STATUS_LABELS[status];
  const bgColor = avatarColor ?? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-admin-bg-card hover:border-admin-teal/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-bold`}>
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary truncate">{name}</span>
            <span className="text-xs text-text-tertiary">({userId})</span>
          </div>
          <span className="text-xs text-text-secondary">{department}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-text-secondary">
        <span>총 대화: <strong className="text-text-primary">{totalConversations}회</strong></span>
        <span>이번 달: <strong className="text-text-primary">{monthlyTokens}</strong></span>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onViewDetail} aria-label={`${name} 상세 보기`} className="text-xs text-admin-teal hover:underline">상세 보기</button>
        <button onClick={onManagePermission} aria-label={`${name} 권한 설정`} className="text-xs text-text-secondary hover:underline">권한 설정</button>
      </div>
    </div>
  );
}
