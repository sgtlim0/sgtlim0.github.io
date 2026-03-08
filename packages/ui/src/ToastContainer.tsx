'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { ToastMessage } from './hooks/useToastQueue'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
  onPauseTimer: (id: string) => void
  onResumeTimer: (id: string, remainingMs: number) => void
}

const TYPE_COLORS: Record<ToastMessage['type'], string> = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#2563EB',
}

const TYPE_ICONS: Record<ToastMessage['type'], string> = {
  success: '\u2713',
  error: '\u2715',
  warning: '\u26A0',
  info: '\u2139',
}

export function ToastContainer({ toasts, onRemove, onPauseTimer, onResumeTimer }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2"
      role="region"
      aria-label="Notifications"
      style={{ maxWidth: '420px', pointerEvents: 'none' }}
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          onPauseTimer={onPauseTimer}
          onResumeTimer={onResumeTimer}
        />
      ))}
    </div>
  )
}

interface ToastCardProps {
  toast: ToastMessage
  onRemove: (id: string) => void
  onPauseTimer: (id: string) => void
  onResumeTimer: (id: string, remainingMs: number) => void
}

function ToastCard({ toast, onRemove, onPauseTimer, onResumeTimer }: ToastCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const startTimeRef = useRef(Date.now())
  const remainingRef = useRef(toast.duration ?? 5000)
  const color = TYPE_COLORS[toast.type]
  const icon = TYPE_ICONS[toast.type]
  const duration = toast.duration ?? 5000

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [onRemove, toast.id])

  const handleMouseEnter = useCallback(() => {
    if (duration > 0) {
      const elapsed = Date.now() - startTimeRef.current
      remainingRef.current = Math.max(0, duration - elapsed)
      onPauseTimer(toast.id)
    }
  }, [duration, onPauseTimer, toast.id])

  const handleMouseLeave = useCallback(() => {
    if (duration > 0 && remainingRef.current > 0) {
      startTimeRef.current = Date.now()
      onResumeTimer(toast.id, remainingRef.current)
    }
  }, [duration, onResumeTimer, toast.id])

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      data-testid={`toast-${toast.id}`}
      className="rounded-lg shadow-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: `1px solid ${color}`,
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #6B7280)' }}>
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              className="text-xs font-semibold mt-1.5 hover:underline"
              style={{ color }}
              onClick={toast.action.onClick}
              data-testid={`toast-action-${toast.id}`}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        {toast.dismissible !== false && (
          <button
            type="button"
            className="flex-shrink-0 text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-secondary, #6B7280)' }}
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            data-testid={`toast-dismiss-${toast.id}`}
          >
            \u2715
          </button>
        )}
      </div>
      {duration > 0 && (
        <div
          className="h-0.5"
          style={{ backgroundColor: `${color}20` }}
        >
          <div
            data-testid={`toast-progress-${toast.id}`}
            className="h-full"
            style={{
              backgroundColor: color,
              animation: `toast-progress ${duration}ms linear forwards`,
              width: '100%',
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
