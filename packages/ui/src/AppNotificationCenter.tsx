'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { Notification, UseNotificationCenterOptions } from './hooks/useNotificationCenter'
import { useNotificationCenter } from './hooks/useNotificationCenter'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<Notification['type'], { dot: string; bg: string }> = {
  info: { dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  success: { dot: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  warning: { dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  error: { dot: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return '방금 전'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

/* ------------------------------------------------------------------ */
/*  Bell Icon                                                         */
/* ------------------------------------------------------------------ */

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Notification Item                                                 */
/* ------------------------------------------------------------------ */

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRead, onRemove }: NotificationItemProps) {
  const style = TYPE_STYLES[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove(notification.id)
  }

  return (
    <div
      role="listitem"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        cursor: notification.actionUrl ? 'pointer' : 'default',
        backgroundColor: notification.read ? 'transparent' : style.bg,
        borderBottom: '1px solid var(--border-color, #e5e7eb)',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Unread dot */}
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: notification.read ? 'transparent' : style.dot,
          flexShrink: 0,
          marginTop: 5,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: notification.read ? 400 : 600,
            fontSize: 14,
            color: 'var(--text-primary, #111827)',
            lineHeight: 1.4,
          }}
        >
          {notification.title}
        </div>
        {notification.body && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary, #6b7280)',
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {notification.body}
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary, #9ca3af)',
            marginTop: 4,
            display: 'flex',
            gap: 8,
          }}
        >
          <span>{formatRelativeTime(notification.timestamp)}</span>
          {notification.source && <span>· {notification.source}</span>}
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`알림 삭제: ${notification.title}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: 'var(--text-tertiary, #9ca3af)',
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AppNotificationCenter                                             */
/* ------------------------------------------------------------------ */

export interface AppNotificationCenterProps {
  /** Options forwarded to useNotificationCenter. */
  options?: UseNotificationCenterOptions
  /** Additional CSS class for the root wrapper. */
  className?: string
}

/**
 * Shared notification hub: bell icon with unread badge + dropdown panel.
 *
 * Uses the `useNotificationCenter` hook internally. To add notifications
 * programmatically, retrieve the hook instance via the exported
 * `useNotificationCenter` hook in the same tree.
 *
 * Named `AppNotificationCenter` to avoid collision with the admin-specific
 * `NotificationCenter` component.
 */
export default function AppNotificationCenter({
  options,
  className,
}: AppNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotificationCenter(options)

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      role="region"
      aria-label="알림 센터"
    >
      {/* Bell trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={
          unreadCount > 0
            ? `알림 ${unreadCount}건 읽지 않음`
            : '알림'
        }
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          color: 'var(--text-primary, #111827)',
          borderRadius: 8,
        }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="알림 목록"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: 380,
            maxHeight: 480,
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid var(--border-color, #e5e7eb)',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary, #111827)',
              }}
            >
              알림
              {unreadCount > 0 && (
                <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 6, color: 'var(--text-secondary, #6b7280)' }}>
                  {unreadCount}건 읽지 않음
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--primary, #3b82f6)',
                    padding: '4px 8px',
                    borderRadius: 6,
                  }}
                >
                  모두 읽음
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-tertiary, #9ca3af)',
                    padding: '4px 8px',
                    borderRadius: 6,
                  }}
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div role="list" aria-live="polite" style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 14px',
                  textAlign: 'center',
                  color: 'var(--text-tertiary, #9ca3af)',
                  fontSize: 14,
                }}
              >
                알림이 없습니다
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onRemove={remove}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
