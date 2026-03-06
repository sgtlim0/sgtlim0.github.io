'use client'

/**
 * NotificationCenter
 *
 * Full-page notification center combining the bell, panel,
 * and statistics summary. Acts as a container using hooks directly.
 */

import { useState } from 'react'
import { useNotifications } from './services/notificationHooks'
import NotificationBell from './NotificationBell'
import NotificationPanel from './NotificationPanel'
import type { NotificationType } from './services/notificationTypes'

const TYPE_LABELS: Record<NotificationType, { label: string; color: string }> = {
  info: { label: '정보', color: 'var(--info, #3b82f6)' },
  warning: { label: '경고', color: 'var(--warning, #f59e0b)' },
  error: { label: '오류', color: 'var(--danger, #ef4444)' },
  success: { label: '성공', color: 'var(--success, #22c55e)' },
}

export default function NotificationCenter() {
  const { notifications, stats, markRead, markAllRead } = useNotifications()
  const [showPanel, setShowPanel] = useState(true)

  const hasUrgent = notifications.some(
    (n) => !n.read && (n.priority === 'critical' || n.priority === 'high'),
  )

  return (
    <div className="flex gap-6" style={{ minHeight: 480 }}>
      {/* Left: Notification panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            알림 센터
          </h2>
          <NotificationBell
            unreadCount={stats.unread}
            hasUrgent={hasUrgent}
            onToggle={() => setShowPanel((prev) => !prev)}
          />
        </div>

        {showPanel && (
          <NotificationPanel
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        )}
      </div>

      {/* Right: Statistics summary */}
      <div className="w-64 shrink-0">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            알림 통계
          </h3>

          {/* Total / Unread */}
          <div
            className="flex justify-between mb-3 pb-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-center flex-1">
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {stats.total}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                전체
              </p>
            </div>
            <div className="text-center flex-1">
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--danger, #ef4444)' }}
              >
                {stats.unread}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                미읽음
              </p>
            </div>
          </div>

          {/* By type */}
          <div className="flex flex-col gap-2">
            {(Object.keys(TYPE_LABELS) as NotificationType[]).map((type) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: TYPE_LABELS[type].color }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {TYPE_LABELS[type].label}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stats.byType[type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
