'use client'

/**
 * NotificationPanel
 *
 * Dropdown-style notification list with type filtering,
 * read/unread states, priority badges, and click-through navigation.
 */

import { useState, useMemo } from 'react'
import type { Notification, NotificationType } from './services/notificationTypes'

export interface NotificationPanelProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onNavigate?: (url: string) => void
}

const TYPE_CONFIG: Record<NotificationType, { icon: string; bg: string; text: string }> = {
  info: {
    icon: 'i',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: '!',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-400',
  },
  error: { icon: 'X', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400' },
  success: {
    icon: 'V',
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-600 dark:text-green-400',
  },
}

const FILTER_TABS: Array<{ key: NotificationType | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'info', label: '정보' },
  { key: 'warning', label: '경고' },
  { key: 'error', label: '오류' },
  { key: 'success', label: '성공' },
]

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

function formatRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onNavigate?: (url: string) => void
}) {
  const config = TYPE_CONFIG[notification.type]

  function handleClick() {
    if (!notification.read) {
      onMarkRead(notification.id)
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl)
    }
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-black/3 dark:hover:bg-white/5"
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: notification.read ? 'transparent' : 'var(--bg-hover, rgba(0,0,0,0.02))',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Unread left bar */}
      <div
        className="shrink-0 w-1 self-stretch rounded-full"
        style={{
          backgroundColor: notification.read ? 'transparent' : 'var(--info, #3b82f6)',
        }}
      />

      {/* Type icon */}
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${config.bg} ${config.text}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm truncate"
            style={{
              color: 'var(--text-primary)',
              fontWeight: notification.read ? 500 : 700,
            }}
          >
            {notification.title}
          </span>
          <span
            className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[notification.priority]}`}
          >
            {notification.priority}
          </span>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {formatRelativeTime(notification.timestamp)}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-hover, rgba(0,0,0,0.05))',
              color: 'var(--text-secondary)',
            }}
          >
            {notification.source}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}: NotificationPanelProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all')

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return notifications
    return notifications.filter((n) => n.type === activeFilter)
  }, [notifications, activeFilter])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            알림
          </h3>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--admin-teal, #0d9488)' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: 'var(--admin-teal, #0d9488)' }}
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 px-4 py-2 border-b overflow-x-auto"
        style={{ borderColor: 'var(--border)' }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={activeFilter !== tab.key ? { color: 'var(--text-secondary)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="40" height="40" viewBox="0 0 20 20" fill="none" className="mb-3 opacity-30">
              <path
                d="M10 2C7.24 2 5 4.24 5 7V10.5L3.5 13V14H16.5V13L15 10.5V7C15 4.24 12.76 2 10 2Z"
                fill="currentColor"
              />
              <path d="M8 15C8 16.1 8.9 17 10 17C11.1 17 12 16.1 12 15H8Z" fill="currentColor" />
            </svg>
            <span className="text-sm">새 알림이 없습니다</span>
          </div>
        ) : (
          filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </div>
  )
}
