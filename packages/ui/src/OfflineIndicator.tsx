'use client'

import { useOfflineQueue } from './hooks/useOfflineQueue'
import type { UseOfflineQueueOptions } from './hooks/useOfflineQueue'

export interface OfflineIndicatorProps {
  /** Options forwarded to useOfflineQueue. */
  readonly queueOptions?: UseOfflineQueueOptions
  /** Additional CSS class for the banner container. */
  readonly className?: string
}

/**
 * Banner displayed at the top of the viewport when the browser is offline.
 *
 * Shows the number of pending queued requests and a manual "Retry" button.
 * Automatically hides once the browser comes back online and the queue is
 * drained.
 */
export function OfflineIndicator({
  queueOptions,
  className,
}: OfflineIndicatorProps) {
  const { isOnline, pendingCount, retryAll } = useOfflineQueue(queueOptions)

  // Nothing to show when online and queue is empty
  if (isOnline && pendingCount === 0) return null

  const handleRetry = () => {
    void retryAll()
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`hchat-offline-indicator${className ? ` ${className}` : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px 16px',
        backgroundColor: isOnline ? 'var(--color-warning-bg, #fef3c7)' : 'var(--color-error-bg, #fef2f2)',
        color: isOnline ? 'var(--color-warning-text, #92400e)' : 'var(--color-error-text, #991b1b)',
        fontSize: '14px',
        fontWeight: 500,
        borderBottom: `1px solid ${isOnline ? 'var(--color-warning-border, #fcd34d)' : 'var(--color-error-border, #fca5a5)'}`,
      }}
    >
      <span>
        {isOnline
          ? `${pendingCount}개 요청 재시도 중...`
          : `오프라인 상태${pendingCount > 0 ? ` — ${pendingCount}개 요청 대기 중` : ''}`}
      </span>

      {pendingCount > 0 && (
        <button
          type="button"
          onClick={handleRetry}
          style={{
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '4px',
            border: '1px solid currentColor',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          재시도
        </button>
      )}
    </div>
  )
}

export default OfflineIndicator
