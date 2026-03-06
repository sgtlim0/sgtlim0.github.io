'use client'

export interface MobileHeaderProps {
  title?: string
  unreadCount?: number
  onNotification?: () => void
  onProfile?: () => void
}

export default function MobileHeader({
  title = 'H Chat',
  unreadCount = 0,
  onNotification,
  onProfile,
}: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
      {/* App title */}
      <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          type="button"
          onClick={onNotification}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="알림"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--danger)] text-white text-[10px] font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile avatar */}
        <button
          type="button"
          onClick={onProfile}
          className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity"
          aria-label="프로필"
        >
          U
        </button>
      </div>
    </header>
  )
}
