'use client'

import React, { useCallback, useRef } from 'react'
import { useDatePicker } from './hooks/useDatePicker'
import type { UseDatePickerOptions, DayInfo } from './hooks/useDatePicker'
import { WEEKDAY_LABELS_KO, MONTH_LABELS_KO } from './utils/dateUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DatePickerProps extends UseDatePickerOptions {
  /** 날짜 선택 콜백 */
  onSelect?: (date: Date) => void
  /** 범위 선택 완료 콜백 */
  onRangeSelect?: (range: { start: Date; end: Date }) => void
  /** 추가 className */
  className?: string
}

// ---------------------------------------------------------------------------
// Styles (inline objects — Tailwind-free for portability)
// ---------------------------------------------------------------------------

const styles = {
  container: {
    display: 'inline-block',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    border: '1px solid var(--dp-border, #e2e8f0)',
    borderRadius: '8px',
    padding: '16px',
    background: 'var(--dp-bg, #fff)',
    color: 'var(--dp-text, #1a202c)',
    userSelect: 'none' as const,
    minWidth: '280px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  navButton: {
    background: 'none',
    border: '1px solid var(--dp-border, #e2e8f0)',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '14px',
    color: 'inherit',
    lineHeight: 1,
  },
  title: {
    fontWeight: 600,
    fontSize: '15px',
  },
  todayButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--dp-accent, #3182ce)',
    textDecoration: 'underline' as const,
    padding: '2px 4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    textAlign: 'center' as const,
  },
  weekdayCell: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--dp-weekday, #718096)',
    padding: '4px 0',
  },
  dayCell: (info: DayInfo): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontSize: '13px',
      padding: '6px 0',
      borderRadius: '4px',
      cursor: info.isDisabled ? 'not-allowed' : 'pointer',
      border: 'none',
      background: 'transparent',
      color: 'inherit',
      lineHeight: 1.4,
      position: 'relative',
    }

    if (info.isDisabled) {
      return { ...base, opacity: 0.3 }
    }
    if (!info.isCurrentMonth) {
      return { ...base, color: 'var(--dp-muted, #a0aec0)' }
    }
    if (info.isSelected) {
      return {
        ...base,
        background: 'var(--dp-accent, #3182ce)',
        color: '#fff',
        fontWeight: 600,
      }
    }
    if (info.isInRange) {
      return {
        ...base,
        background: 'var(--dp-range, #ebf4ff)',
        color: 'var(--dp-range-text, #2b6cb0)',
      }
    }
    if (info.isToday) {
      return {
        ...base,
        border: '1px solid var(--dp-accent, #3182ce)',
        fontWeight: 600,
      }
    }

    return base
  },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DatePicker({
  initialDate,
  minDate,
  maxDate,
  mode = 'single',
  onSelect,
  onRangeSelect,
  className,
}: DatePickerProps) {
  const picker = useDatePicker({ initialDate, minDate, maxDate, mode })
  const gridRef = useRef<HTMLDivElement>(null)

  const year = picker.viewDate.getFullYear()
  const month = picker.viewDate.getMonth()
  const titleText = `${year}년 ${MONTH_LABELS_KO[month]}`

  const handleDayClick = useCallback(
    (info: DayInfo) => {
      if (info.isDisabled) return

      // Compute range completion BEFORE calling select (state update is async)
      let rangeCompleted = false
      let completedRange: { start: Date; end: Date } | null = null

      if (mode === 'range' && onRangeSelect) {
        const { start, end } = picker.selectedRange
        if (start && !end) {
          const clicked = info.date
          const newStart = clicked < start ? clicked : start
          const newEnd = clicked < start ? start : clicked
          rangeCompleted = true
          completedRange = { start: newStart, end: newEnd }
        }
      }

      picker.select(info.date)
      onSelect?.(info.date)

      if (rangeCompleted && completedRange) {
        onRangeSelect?.(completedRange)
      }
    },
    [picker, onSelect, onRangeSelect, mode],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, info: DayInfo, index: number) => {
      const cells = gridRef.current?.querySelectorAll<HTMLButtonElement>('[data-day]')
      if (!cells) return

      let targetIndex = -1

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          targetIndex = index + 1
          break
        case 'ArrowLeft':
          e.preventDefault()
          targetIndex = index - 1
          break
        case 'ArrowDown':
          e.preventDefault()
          targetIndex = index + 7
          break
        case 'ArrowUp':
          e.preventDefault()
          targetIndex = index - 7
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleDayClick(info)
          return
        case 'Home':
          e.preventDefault()
          targetIndex = 0
          break
        case 'End':
          e.preventDefault()
          targetIndex = cells.length - 1
          break
        default:
          return
      }

      if (targetIndex >= 0 && targetIndex < cells.length) {
        cells[targetIndex].focus()
      }
    },
    [handleDayClick],
  )

  return (
    <div
      className={className}
      style={styles.container}
      role="group"
      aria-label="날짜 선택"
    >
      {/* Header */}
      <div style={styles.header}>
        <button
          type="button"
          style={styles.navButton}
          onClick={picker.prevMonth}
          aria-label="이전 달"
        >
          &#8249;
        </button>
        <div>
          <span style={styles.title} aria-live="polite">
            {titleText}
          </span>
          <button
            type="button"
            style={styles.todayButton}
            onClick={picker.goToToday}
            aria-label="오늘로 이동"
          >
            오늘
          </button>
        </div>
        <button
          type="button"
          style={styles.navButton}
          onClick={picker.nextMonth}
          aria-label="다음 달"
        >
          &#8250;
        </button>
      </div>

      {/* Calendar grid */}
      <div ref={gridRef} style={styles.grid} role="grid" aria-label="달력">
        {/* Weekday headers */}
        {WEEKDAY_LABELS_KO.map((label) => (
          <div
            key={label}
            role="columnheader"
            style={styles.weekdayCell}
            aria-label={label}
          >
            {label}
          </div>
        ))}

        {/* Day cells */}
        {picker.days.map((info, index) => (
          <button
            key={`${info.date.getTime()}`}
            type="button"
            data-day={info.day}
            role="gridcell"
            tabIndex={info.isSelected ? 0 : -1}
            aria-selected={info.isSelected}
            aria-disabled={info.isDisabled}
            aria-label={`${info.date.getFullYear()}년 ${info.date.getMonth() + 1}월 ${info.day}일`}
            aria-current={info.isToday ? 'date' : undefined}
            style={styles.dayCell(info)}
            onClick={() => handleDayClick(info)}
            onKeyDown={(e) => handleKeyDown(e, info, index)}
          >
            {info.day}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DatePicker
