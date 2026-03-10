'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isSameMonth,
  isDateInRange,
  isBefore,
  isAfter,
  stripTime,
} from '../utils/dateUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DayInfo {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isDisabled: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

export interface UseDatePickerOptions {
  initialDate?: Date
  minDate?: Date
  maxDate?: Date
  mode?: 'single' | 'range'
}

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface UseDatePickerReturn {
  selectedDate: Date | null
  selectedRange: DateRange
  viewDate: Date
  days: DayInfo[]
  select: (date: Date) => void
  nextMonth: () => void
  prevMonth: () => void
  goToToday: () => void
  isSelected: (date: Date) => boolean
  isInRange: (date: Date) => boolean
  isDisabled: (date: Date) => boolean
  isToday: (date: Date) => boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CALENDAR_ROWS = 6
const DAYS_PER_WEEK = 7
const TOTAL_CELLS = CALENDAR_ROWS * DAYS_PER_WEEK

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const { initialDate, minDate, maxDate, mode = 'single' } = options

  const today = useMemo(() => stripTime(new Date()), [])

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? stripTime(initialDate) : null,
  )
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: initialDate ? stripTime(initialDate) : null,
    end: null,
  })
  const [viewDate, setViewDate] = useState<Date>(
    initialDate ? new Date(initialDate.getFullYear(), initialDate.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1),
  )

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  const checkDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && isBefore(date, minDate)) return true
      if (maxDate && isAfter(date, maxDate)) return true
      return false
    },
    [minDate, maxDate],
  )

  const checkSelected = useCallback(
    (date: Date): boolean => {
      if (mode === 'single') {
        return selectedDate !== null && isSameDay(date, selectedDate)
      }
      const { start, end } = selectedRange
      if (start && isSameDay(date, start)) return true
      if (end && isSameDay(date, end)) return true
      return false
    },
    [mode, selectedDate, selectedRange],
  )

  const checkInRange = useCallback(
    (date: Date): boolean => {
      if (mode !== 'range') return false
      const { start, end } = selectedRange
      if (!start || !end) return false
      return isDateInRange(date, start, end)
    },
    [mode, selectedRange],
  )

  const checkToday = useCallback(
    (date: Date): boolean => isSameDay(date, today),
    [today],
  )

  // -----------------------------------------------------------------------
  // Calendar grid
  // -----------------------------------------------------------------------

  const days: DayInfo[] = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Previous month fill
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    const result: DayInfo[] = []

    // Fill leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(prevYear, prevMonth, day)
      result.push(buildDayInfo(date, day, false))
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      result.push(buildDayInfo(date, day, true))
    }

    // Fill trailing days from next month
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    let nextDay = 1
    while (result.length < TOTAL_CELLS) {
      const date = new Date(nextYear, nextMonth, nextDay)
      result.push(buildDayInfo(date, nextDay, false))
      nextDay++
    }

    return result

    function buildDayInfo(date: Date, day: number, isCurrentMonth: boolean): DayInfo {
      const { start, end } = selectedRange
      return {
        date,
        day,
        isCurrentMonth,
        isToday: checkToday(date),
        isSelected: checkSelected(date),
        isInRange: checkInRange(date),
        isDisabled: checkDisabled(date),
        isRangeStart: mode === 'range' && start !== null && isSameDay(date, start),
        isRangeEnd: mode === 'range' && end !== null && isSameDay(date, end),
      }
    }
  }, [viewDate, checkToday, checkSelected, checkInRange, checkDisabled, mode, selectedRange])

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const select = useCallback(
    (date: Date) => {
      const stripped = stripTime(date)
      if (checkDisabled(stripped)) return

      if (mode === 'single') {
        setSelectedDate(stripped)
        if (!isSameMonth(stripped, viewDate)) {
          setViewDate(new Date(stripped.getFullYear(), stripped.getMonth(), 1))
        }
        return
      }

      // Range mode
      setSelectedRange((prev) => {
        const { start, end } = prev
        // No start yet, or both already set → start fresh
        if (!start || end) {
          return { start: stripped, end: null }
        }
        // Has start but no end → determine order
        if (isBefore(stripped, start)) {
          return { start: stripped, end: start }
        }
        return { start, end: stripped }
      })
    },
    [mode, checkDisabled, viewDate],
  )

  const nextMonth = useCallback(() => {
    setViewDate((prev) => {
      const m = prev.getMonth()
      const y = prev.getFullYear()
      return m === 11 ? new Date(y + 1, 0, 1) : new Date(y, m + 1, 1)
    })
  }, [])

  const prevMonth = useCallback(() => {
    setViewDate((prev) => {
      const m = prev.getMonth()
      const y = prev.getFullYear()
      return m === 0 ? new Date(y - 1, 11, 1) : new Date(y, m - 1, 1)
    })
  }, [])

  const goToToday = useCallback(() => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    if (mode === 'single') {
      setSelectedDate(today)
    }
  }, [today, mode])

  return {
    selectedDate,
    selectedRange,
    viewDate,
    days,
    select,
    nextMonth,
    prevMonth,
    goToToday,
    isSelected: checkSelected,
    isInRange: checkInRange,
    isDisabled: checkDisabled,
    isToday: checkToday,
  }
}
