'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  stripTime,
} from '../utils/dateUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  color?: string
  allDay?: boolean
}

export interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

export interface UseCalendarOptions {
  view?: 'month' | 'week'
  initialDate?: Date
  events?: CalendarEvent[]
}

export interface UseCalendarReturn {
  view: 'month' | 'week'
  setView: (v: 'month' | 'week') => void
  currentDate: Date
  days: CalendarDay[]
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => string
  removeEvent: (id: string) => void
  nextPeriod: () => void
  prevPeriod: () => void
  goToToday: () => void
  getEventsForDay: (date: Date) => CalendarEvent[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CALENDAR_ROWS = 6
const DAYS_PER_WEEK = 7
const TOTAL_CELLS = CALENDAR_ROWS * DAYS_PER_WEEK

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0

function generateId(): string {
  idCounter += 1
  return `cal-evt-${Date.now()}-${idCounter}`
}

/**
 * 해당 날짜에 이벤트가 속하는지 확인 (allDay 또는 start~end 범위)
 */
function isEventOnDay(event: CalendarEvent, date: Date): boolean {
  const dayStart = stripTime(date).getTime()
  const dayEnd = dayStart + 86400000 - 1 // 23:59:59.999

  const evtStart = stripTime(event.start).getTime()
  const evtEnd = event.end ? stripTime(event.end).getTime() : evtStart

  return evtStart <= dayEnd && evtEnd >= dayStart
}

/**
 * 주의 시작일(일요일) 반환
 */
function getWeekStart(date: Date): Date {
  const d = stripTime(date)
  const day = d.getDay()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
    view: initialView = 'month',
    initialDate,
    events: initialEvents = [],
  } = options

  const today = useMemo(() => stripTime(new Date()), [])

  const [view, setView] = useState<'month' | 'week'>(initialView)
  const [currentDate, setCurrentDate] = useState<Date>(
    initialDate ? stripTime(initialDate) : today,
  )
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  // -----------------------------------------------------------------------
  // Event helpers
  // -----------------------------------------------------------------------

  const getEventsForDay = useCallback(
    (date: Date): CalendarEvent[] => {
      return events.filter((evt) => isEventOnDay(evt, date))
    },
    [events],
  )

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, 'id'>): string => {
      const id = generateId()
      const newEvent: CalendarEvent = { ...event, id }
      setEvents((prev) => [...prev, newEvent])
      return id
    },
    [],
  )

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id))
  }, [])

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  const nextPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') {
        const m = prev.getMonth()
        const y = prev.getFullYear()
        return m === 11
          ? new Date(y + 1, 0, 1)
          : new Date(y, m + 1, 1)
      }
      // week: +7 days
      return new Date(
        prev.getFullYear(),
        prev.getMonth(),
        prev.getDate() + 7,
      )
    })
  }, [view])

  const prevPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') {
        const m = prev.getMonth()
        const y = prev.getFullYear()
        return m === 0
          ? new Date(y - 1, 11, 1)
          : new Date(y, m - 1, 1)
      }
      // week: -7 days
      return new Date(
        prev.getFullYear(),
        prev.getMonth(),
        prev.getDate() - 7,
      )
    })
  }, [view])

  const goToToday = useCallback(() => {
    setCurrentDate(today)
  }, [today])

  // -----------------------------------------------------------------------
  // Calendar grid
  // -----------------------------------------------------------------------

  const days: CalendarDay[] = useMemo(() => {
    if (view === 'week') {
      const weekStart = getWeekStart(currentDate)
      const result: CalendarDay[] = []
      for (let i = 0; i < DAYS_PER_WEEK; i++) {
        const date = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + i,
        )
        result.push({
          date,
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === currentDate.getMonth(),
          isToday: isSameDay(date, today),
          events: events.filter((evt) => isEventOnDay(evt, date)),
        })
      }
      return result
    }

    // Month view — 7x6 grid (same approach as useDatePicker)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    const result: CalendarDay[] = []

    // Fill leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(prevYear, prevMonth, day)
      result.push(buildDay(date, day, false))
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      result.push(buildDay(date, day, true))
    }

    // Fill trailing days from next month
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    let nextDay = 1
    while (result.length < TOTAL_CELLS) {
      const date = new Date(nextYear, nextMonth, nextDay)
      result.push(buildDay(date, nextDay, false))
      nextDay++
    }

    return result

    function buildDay(date: Date, day: number, isCurrentMonth: boolean): CalendarDay {
      return {
        date,
        day,
        isCurrentMonth,
        isToday: isSameDay(date, today),
        events: events.filter((evt) => isEventOnDay(evt, date)),
      }
    }
  }, [view, currentDate, today, events])

  return {
    view,
    setView,
    currentDate,
    days,
    events,
    addEvent,
    removeEvent,
    nextPeriod,
    prevPeriod,
    goToToday,
    getEventsForDay,
  }
}
