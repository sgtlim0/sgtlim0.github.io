'use client'

/**
 * NotificationBell
 *
 * Bell icon button with unread count badge.
 * Shows a red pulse animation when urgent notifications exist.
 */

export interface NotificationBellProps {
  unreadCount: number
  hasUrgent?: boolean
  onToggle: () => void
}

function formatCount(count: number): string {
  if (count <= 0) return ''
  if (count > 99) return '99+'
  return String(count)
}

export default function NotificationBell({
  unreadCount,
  hasUrgent = false,
  onToggle,
}: NotificationBellProps) {
  const displayCount = formatCount(unreadCount)

  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      style={{ color: 'var(--text-primary)' }}
      aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}건 미읽음)` : ''}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2C7.24 2 5 4.24 5 7V10.5L3.5 13V14H16.5V13L15 10.5V7C15 4.24 12.76 2 10 2Z"
          fill="currentColor"
          opacity={0.85}
        />
        <path d="M8 15C8 16.1 8.9 17 10 17C11.1 17 12 16.1 12 15H8Z" fill="currentColor" />
      </svg>

      {unreadCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white ${
            hasUrgent ? 'notification-bell-pulse' : ''
          }`}
          style={{
            backgroundColor: hasUrgent ? 'var(--danger, #ef4444)' : 'var(--admin-teal, #0d9488)',
          }}
        >
          {displayCount}
        </span>
      )}

      <style>{`
        @keyframes notification-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        .notification-bell-pulse {
          animation: notification-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </button>
  )
}
