'use client'

import type { HealthEvent } from '../hooks/useHealthMonitor'
import type { ServiceHealth } from '../utils/healthCheck'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthTimelineProps {
  /** Status change events (newest first) */
  events: readonly HealthEvent[]
  /** Maximum events to display (default 20) */
  maxDisplay?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EVENT_STATUS_CONFIG: Record<ServiceHealth['status'], { label: string; icon: string; color: string }> = {
  up: { label: '복구', icon: '\u2714', color: 'text-green-600 dark:text-green-400' },
  degraded: { label: '지연', icon: '\u26A0', color: 'text-yellow-600 dark:text-yellow-400' },
  down: { label: '장애', icon: '\u2716', color: 'text-red-600 dark:text-red-400' },
}

const DOT_CONFIG: Record<ServiceHealth['status'], string> = {
  up: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}:${seconds}`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function buildDescription(event: HealthEvent): string {
  const prev = event.previousStatus
  const curr = event.currentStatus
  const prevLabel = prev ? EVENT_STATUS_CONFIG[prev].label : '알 수 없음'
  const currLabel = EVENT_STATUS_CONFIG[curr].label

  return `${event.service}: ${prevLabel} \u2192 ${currLabel}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HealthTimeline({ events, maxDisplay = 20 }: HealthTimelineProps) {
  const displayEvents = [...events].reverse().slice(0, maxDisplay)

  if (displayEvents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-admin-bg-section p-5" data-testid="health-timeline">
        <h3 className="text-sm font-semibold text-text-primary mb-3">상태 변경 타임라인</h3>
        <p className="text-sm text-text-secondary">상태 변경 이벤트가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-admin-bg-section p-5" data-testid="health-timeline">
      <h3 className="text-sm font-semibold text-text-primary mb-4">상태 변경 타임라인</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {displayEvents.map((event) => {
            const config = EVENT_STATUS_CONFIG[event.currentStatus]
            const dotColor = DOT_CONFIG[event.currentStatus]

            return (
              <div key={event.id} className="relative flex items-start gap-3 pl-0" data-testid={`timeline-event-${event.id}`}>
                {/* Dot */}
                <div className={`relative z-10 w-[15px] h-[15px] rounded-full border-2 border-white dark:border-gray-900 ${dotColor} flex-shrink-0 mt-0.5`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xs text-text-secondary tabular-nums">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    {event.duration !== undefined && (
                      <span className="text-xs text-text-secondary">
                        ({formatDuration(event.duration)})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary mt-0.5">{buildDescription(event)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
