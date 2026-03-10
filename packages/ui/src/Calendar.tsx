'use client'

import React, { useCallback } from 'react'
import { useCalendar } from './hooks/useCalendar'
import type { UseCalendarOptions, CalendarEvent, CalendarDay } from './hooks/useCalendar'
import { WEEKDAY_LABELS_KO, MONTH_LABELS_KO } from './utils/dateUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarProps extends UseCalendarOptions {
  /** 날짜 클릭 콜백 */
  onDayClick?: (date: Date) => void
  /** 이벤트 클릭 콜백 */
  onEventClick?: (event: CalendarEvent) => void
  /** 추가 className */
  className?: string
}

// ---------------------------------------------------------------------------
// Styles (inline — Tailwind-free for portability, CSS 변수 지원)
// ---------------------------------------------------------------------------

const HOUR_HEIGHT = 48
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    border: '1px solid var(--cal-border, #e2e8f0)',
    borderRadius: '8px',
    padding: '16px',
    background: 'var(--cal-bg, #fff)',
    color: 'var(--cal-text, #1a202c)',
    userSelect: 'none' as const,
    minWidth: '320px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navButton: {
    background: 'none',
    border: '1px solid var(--cal-border, #e2e8f0)',
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
    border: '1px solid var(--cal-border, #e2e8f0)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--cal-accent, #3182ce)',
    padding: '4px 8px',
  },
  viewTabs: {
    display: 'flex',
    gap: '4px',
  },
  viewTab: (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--cal-accent, #3182ce)' : 'transparent',
    color: active ? '#fff' : 'inherit',
    border: active ? 'none' : '1px solid var(--cal-border, #e2e8f0)',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: active ? 600 : 400,
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    textAlign: 'center' as const,
  },
  weekdayCell: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--cal-weekday, #718096)',
    padding: '4px 0',
  },
  dayCell: (day: CalendarDay): React.CSSProperties => {
    const base: React.CSSProperties = {
      minHeight: '72px',
      padding: '4px',
      border: '1px solid var(--cal-grid-border, #edf2f7)',
      cursor: 'pointer',
      textAlign: 'left',
      verticalAlign: 'top',
      background: 'transparent',
      color: 'inherit',
      fontSize: '12px',
      position: 'relative',
    }

    if (!day.isCurrentMonth) {
      return { ...base, color: 'var(--cal-muted, #a0aec0)', background: 'var(--cal-muted-bg, #f7fafc)' }
    }
    if (day.isToday) {
      return { ...base, background: 'var(--cal-today-bg, #ebf8ff)' }
    }
    return base
  },
  dayNumber: (isToday: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    fontSize: '13px',
    fontWeight: isToday ? 700 : 400,
    background: isToday ? 'var(--cal-accent, #3182ce)' : 'transparent',
    color: isToday ? '#fff' : 'inherit',
    marginBottom: '2px',
  }),
  eventBar: (color?: string): React.CSSProperties => ({
    display: 'block',
    fontSize: '10px',
    lineHeight: '16px',
    padding: '0 4px',
    borderRadius: '2px',
    marginBottom: '1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    background: color ?? 'var(--cal-event-bg, #3182ce)',
    color: '#fff',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
  }),
  // Week view
  weekContainer: {
    display: 'grid',
    gridTemplateColumns: '48px repeat(7, 1fr)',
    fontSize: '12px',
  },
  weekHeaderCell: (isToday: boolean): React.CSSProperties => ({
    textAlign: 'center',
    padding: '4px',
    fontWeight: isToday ? 700 : 400,
    borderBottom: '1px solid var(--cal-grid-border, #edf2f7)',
  }),
  timeLabel: {
    fontSize: '10px',
    color: 'var(--cal-weekday, #718096)',
    textAlign: 'right' as const,
    paddingRight: '4px',
    height: `${HOUR_HEIGHT}px`,
    lineHeight: `${HOUR_HEIGHT}px`,
    borderRight: '1px solid var(--cal-grid-border, #edf2f7)',
  },
  hourCell: {
    height: `${HOUR_HEIGHT}px`,
    borderBottom: '1px solid var(--cal-grid-border, #edf2f7)',
    borderRight: '1px solid var(--cal-grid-border, #edf2f7)',
    position: 'relative' as const,
  },
} as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MonthGrid({
  days,
  onDayClick,
  onEventClick,
}: {
  days: CalendarDay[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}) {
  const handleEventClick = useCallback(
    (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation()
      onEventClick?.(event)
    },
    [onEventClick],
  )

  return (
    <div style={styles.grid} role="grid" aria-label="월간 달력">
      {/* Weekday headers */}
      {WEEKDAY_LABELS_KO.map((label) => (
        <div key={label} role="columnheader" style={styles.weekdayCell} aria-label={label}>
          {label}
        </div>
      ))}

      {/* Day cells */}
      {days.map((day) => (
        <div
          key={day.date.getTime()}
          role="gridcell"
          aria-label={`${day.date.getFullYear()}년 ${day.date.getMonth() + 1}월 ${day.day}일`}
          aria-current={day.isToday ? 'date' : undefined}
          style={styles.dayCell(day)}
          onClick={() => onDayClick?.(day.date)}
        >
          <span style={styles.dayNumber(day.isToday)}>{day.day}</span>
          {day.events.slice(0, 3).map((evt) => (
            <button
              key={evt.id}
              type="button"
              style={styles.eventBar(evt.color)}
              onClick={(e) => handleEventClick(e, evt)}
              aria-label={evt.title}
            >
              {evt.title}
            </button>
          ))}
          {day.events.length > 3 && (
            <span style={{ fontSize: '10px', color: 'var(--cal-muted, #a0aec0)' }}>
              +{day.events.length - 3}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function WeekGrid({
  days,
  onDayClick,
  onEventClick,
}: {
  days: CalendarDay[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}) {
  return (
    <div style={styles.weekContainer} role="grid" aria-label="주간 달력">
      {/* Header row: empty corner + 7 day headers */}
      <div style={{ borderBottom: '1px solid var(--cal-grid-border, #edf2f7)' }} />
      {days.map((day) => (
        <div
          key={day.date.getTime()}
          role="columnheader"
          style={styles.weekHeaderCell(day.isToday)}
          aria-label={`${day.date.getMonth() + 1}월 ${day.day}일`}
        >
          <div>{WEEKDAY_LABELS_KO[day.date.getDay()]}</div>
          <div
            style={styles.dayNumber(day.isToday)}
            onClick={() => onDayClick?.(day.date)}
          >
            {day.day}
          </div>
        </div>
      ))}

      {/* Time slots: 24 rows x (1 time label + 7 columns) */}
      {HOURS.map((hour) => (
        <React.Fragment key={hour}>
          <div style={styles.timeLabel}>
            {String(hour).padStart(2, '0')}:00
          </div>
          {days.map((day) => {
            const hourEvents = day.events.filter((evt) => {
              if (evt.allDay) return false
              const h = evt.start.getHours()
              return h === hour
            })

            return (
              <div
                key={`${day.date.getTime()}-${hour}`}
                role="gridcell"
                style={styles.hourCell}
                onClick={() => onDayClick?.(day.date)}
              >
                {hourEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    style={styles.eventBar(evt.color)}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(evt)
                    }}
                    aria-label={evt.title}
                  >
                    {evt.title}
                  </button>
                ))}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Calendar Component
// ---------------------------------------------------------------------------

export function Calendar({
  view: initialView,
  initialDate,
  events: initialEvents,
  onDayClick,
  onEventClick,
  className,
}: CalendarProps) {
  const calendar = useCalendar({ view: initialView, initialDate, events: initialEvents })

  const year = calendar.currentDate.getFullYear()
  const month = calendar.currentDate.getMonth()

  const titleText = calendar.view === 'month'
    ? `${year}년 ${MONTH_LABELS_KO[month]}`
    : (() => {
        const first = calendar.days[0]
        const last = calendar.days[calendar.days.length - 1]
        if (!first || !last) return ''
        const fm = first.date.getMonth()
        const lm = last.date.getMonth()
        if (fm === lm) {
          return `${first.date.getFullYear()}년 ${MONTH_LABELS_KO[fm]} ${first.day}일 - ${last.day}일`
        }
        return `${MONTH_LABELS_KO[fm]} ${first.day}일 - ${MONTH_LABELS_KO[lm]} ${last.day}일`
      })()

  return (
    <div
      className={className}
      style={styles.container}
      role="group"
      aria-label="캘린더"
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            style={styles.navButton}
            onClick={calendar.prevPeriod}
            aria-label="이전"
          >
            &#8249;
          </button>
          <button
            type="button"
            style={styles.navButton}
            onClick={calendar.nextPeriod}
            aria-label="다음"
          >
            &#8250;
          </button>
          <span style={styles.title} aria-live="polite">
            {titleText}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            style={styles.todayButton}
            onClick={calendar.goToToday}
            aria-label="오늘로 이동"
          >
            오늘
          </button>
          <div style={styles.viewTabs} role="tablist" aria-label="뷰 선택">
            <button
              type="button"
              role="tab"
              aria-selected={calendar.view === 'month'}
              style={styles.viewTab(calendar.view === 'month')}
              onClick={() => calendar.setView('month')}
            >
              월
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={calendar.view === 'week'}
              style={styles.viewTab(calendar.view === 'week')}
              onClick={() => calendar.setView('week')}
            >
              주
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {calendar.view === 'month' ? (
        <MonthGrid
          days={calendar.days}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      ) : (
        <WeekGrid
          days={calendar.days}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      )}
    </div>
  )
}

export default Calendar
