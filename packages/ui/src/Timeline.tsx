'use client'

import React, { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { TimelineStatus } from './hooks/useTimeline'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: Date | string | number
  icon?: ReactNode
  color?: string
  status?: TimelineStatus
}

export type TimelineOrientation = 'vertical' | 'horizontal'

export interface TimelineProps {
  items: TimelineItem[]
  orientation?: TimelineOrientation
  className?: string
}

export interface TimelineItemProps {
  item: TimelineItem
  orientation: TimelineOrientation
  isFirst: boolean
  isLast: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<TimelineStatus, { bg: string; border: string; text: string }> = {
  completed: {
    bg: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  current: {
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  upcoming: {
    bg: 'bg-transparent',
    border: 'border-gray-400 dark:border-gray-500',
    text: 'text-gray-500 dark:text-gray-400',
  },
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3 text-white"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function DotIcon() {
  return (
    <span className="block h-2 w-2 rounded-full bg-white" aria-hidden="true" />
  )
}

// ---------------------------------------------------------------------------
// Marker
// ---------------------------------------------------------------------------

function TimelineMarker({ item }: { item: TimelineItem }) {
  const status = item.status ?? 'upcoming'
  const colors = STATUS_COLORS[status]

  if (item.icon) {
    return (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg}`}
        style={item.color ? { backgroundColor: item.color, borderColor: item.color } : undefined}
        aria-hidden="true"
      >
        {item.icon}
      </span>
    )
  }

  if (status === 'completed') {
    return (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.bg}`}
        style={item.color ? { backgroundColor: item.color } : undefined}
        aria-hidden="true"
      >
        <CheckIcon />
      </span>
    )
  }

  if (status === 'current') {
    return (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.bg}`}
        style={item.color ? { backgroundColor: item.color } : undefined}
        aria-hidden="true"
      >
        <DotIcon />
      </span>
    )
  }

  // upcoming — hollow circle
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colors.border} bg-white dark:bg-gray-900`}
      style={item.color ? { borderColor: item.color } : undefined}
      aria-hidden="true"
    />
  )
}

// ---------------------------------------------------------------------------
// TimelineItemView (vertical)
// ---------------------------------------------------------------------------

function TimelineItemVertical({ item, isLast }: TimelineItemProps) {
  const status = item.status ?? 'upcoming'
  const colors = STATUS_COLORS[status]
  const formattedTime = useMemo(() => formatTimestamp(item.timestamp), [item.timestamp])

  return (
    <li className="relative flex gap-4">
      {/* Line + Marker column */}
      <div className="flex flex-col items-center">
        <TimelineMarker item={item} />
        {!isLast && (
          <div
            className="w-0.5 grow bg-gray-200 dark:bg-gray-700"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content column */}
      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
        <p className={`text-sm font-semibold ${colors.text}`}>
          {item.title}
        </p>
        {item.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {item.description}
          </p>
        )}
        <time
          className="mt-1 block text-xs text-gray-400 dark:text-gray-500"
          dateTime={
            item.timestamp instanceof Date
              ? item.timestamp.toISOString()
              : new Date(item.timestamp).toISOString()
          }
        >
          {formattedTime}
        </time>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// TimelineItemView (horizontal)
// ---------------------------------------------------------------------------

function TimelineItemHorizontal({ item, isLast }: TimelineItemProps) {
  const status = item.status ?? 'upcoming'
  const colors = STATUS_COLORS[status]
  const formattedTime = useMemo(() => formatTimestamp(item.timestamp), [item.timestamp])

  return (
    <li className="relative flex flex-col items-center">
      {/* Marker + Line row */}
      <div className="flex items-center">
        <TimelineMarker item={item} />
        {!isLast && (
          <div
            className="h-0.5 w-16 bg-gray-200 dark:bg-gray-700"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content below */}
      <div className="mt-3 text-center" style={{ maxWidth: '8rem' }}>
        <p className={`text-xs font-semibold ${colors.text}`}>
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
            {item.description}
          </p>
        )}
        <time
          className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500"
          dateTime={
            item.timestamp instanceof Date
              ? item.timestamp.toISOString()
              : new Date(item.timestamp).toISOString()
          }
        >
          {formattedTime}
        </time>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export function Timeline({
  items,
  orientation = 'vertical',
  className = '',
}: TimelineProps) {
  if (items.length === 0) {
    return null
  }

  const isVertical = orientation === 'vertical'
  const ItemComponent = isVertical ? TimelineItemVertical : TimelineItemHorizontal

  return (
    <ol
      role="list"
      aria-label="Timeline"
      className={
        isVertical
          ? `flex flex-col ${className}`
          : `flex flex-row flex-wrap items-start ${className}`
      }
    >
      {items.map((item, index) => (
        <ItemComponent
          key={item.id}
          item={item}
          orientation={orientation}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}
    </ol>
  )
}

export { TimelineMarker, formatTimestamp }
