/**
 * Tests for DatePicker — dateUtils, useDatePicker hook, DatePicker component
 *
 * Covers:
 * - dateUtils: getDaysInMonth, getFirstDayOfMonth, formatDate, isSameDay,
 *   isSameMonth, isDateInRange, stripTime, isBefore, isAfter
 * - useDatePicker: single/range mode, month navigation, today, min/max, days grid
 * - DatePicker component: rendering, 한국어 요일, click, keyboard, aria attributes
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDate,
  isSameDay,
  isSameMonth,
  isDateInRange,
  stripTime,
  isBefore,
  isAfter,
  WEEKDAY_LABELS_KO,
  MONTH_LABELS_KO,
} from '../src/utils/dateUtils'

import { useDatePicker } from '../src/hooks/useDatePicker'
import type { DayInfo } from '../src/hooks/useDatePicker'
import { DatePicker } from '../src/DatePicker'

// ===========================================================================
// dateUtils
// ===========================================================================

describe('dateUtils', () => {
  describe('getDaysInMonth', () => {
    it('returns 31 for January (month 0)', () => {
      expect(getDaysInMonth(2026, 0)).toBe(31)
    })

    it('returns 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2025, 1)).toBe(28)
    })

    it('returns 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29)
    })

    it('returns 30 for April', () => {
      expect(getDaysInMonth(2026, 3)).toBe(30)
    })

    it('returns 31 for December (month 11)', () => {
      expect(getDaysInMonth(2026, 11)).toBe(31)
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('returns correct day of week for known date', () => {
      // 2026-03-01 is a Sunday → 0
      expect(getFirstDayOfMonth(2026, 2)).toBe(0)
    })

    it('returns 0-6 range', () => {
      const result = getFirstDayOfMonth(2026, 0)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(6)
    })
  })

  describe('formatDate', () => {
    const date = new Date(2026, 2, 10) // 2026-03-10

    it('formats YYYY-MM-DD', () => {
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-03-10')
    })

    it('formats yyyy/mm/dd', () => {
      expect(formatDate(date, 'yyyy/mm/dd')).toBe('2026/03/10')
    })

    it('formats YYYY년 MM월 DD일', () => {
      expect(formatDate(date, 'YYYY년 MM월 DD일')).toBe('2026년 03월 10일')
    })

    it('pads single-digit month and day', () => {
      const d = new Date(2026, 0, 5) // 2026-01-05
      expect(formatDate(d, 'YYYY-MM-DD')).toBe('2026-01-05')
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day different times', () => {
      const a = new Date(2026, 2, 10, 8, 30)
      const b = new Date(2026, 2, 10, 22, 15)
      expect(isSameDay(a, b)).toBe(true)
    })

    it('returns false for different days', () => {
      const a = new Date(2026, 2, 10)
      const b = new Date(2026, 2, 11)
      expect(isSameDay(a, b)).toBe(false)
    })

    it('returns false for same day different month', () => {
      const a = new Date(2026, 2, 10)
      const b = new Date(2026, 3, 10)
      expect(isSameDay(a, b)).toBe(false)
    })
  })

  describe('isSameMonth', () => {
    it('returns true for same year and month', () => {
      expect(isSameMonth(new Date(2026, 2, 1), new Date(2026, 2, 28))).toBe(true)
    })

    it('returns false for different months', () => {
      expect(isSameMonth(new Date(2026, 2, 1), new Date(2026, 3, 1))).toBe(false)
    })
  })

  describe('isDateInRange', () => {
    const start = new Date(2026, 2, 5)
    const end = new Date(2026, 2, 15)

    it('returns true for date within range', () => {
      expect(isDateInRange(new Date(2026, 2, 10), start, end)).toBe(true)
    })

    it('returns true for start boundary', () => {
      expect(isDateInRange(new Date(2026, 2, 5), start, end)).toBe(true)
    })

    it('returns true for end boundary', () => {
      expect(isDateInRange(new Date(2026, 2, 15), start, end)).toBe(true)
    })

    it('returns false for date before range', () => {
      expect(isDateInRange(new Date(2026, 2, 4), start, end)).toBe(false)
    })

    it('returns false for date after range', () => {
      expect(isDateInRange(new Date(2026, 2, 16), start, end)).toBe(false)
    })
  })

  describe('stripTime', () => {
    it('removes time portion', () => {
      const d = new Date(2026, 2, 10, 14, 30, 45)
      const stripped = stripTime(d)
      expect(stripped.getHours()).toBe(0)
      expect(stripped.getMinutes()).toBe(0)
      expect(stripped.getSeconds()).toBe(0)
      expect(stripped.getDate()).toBe(10)
    })

    it('returns new Date instance', () => {
      const d = new Date(2026, 2, 10)
      const stripped = stripTime(d)
      expect(stripped).not.toBe(d)
    })
  })

  describe('isBefore', () => {
    it('returns true when date is before target', () => {
      expect(isBefore(new Date(2026, 2, 9), new Date(2026, 2, 10))).toBe(true)
    })

    it('returns false when same day', () => {
      expect(isBefore(new Date(2026, 2, 10), new Date(2026, 2, 10))).toBe(false)
    })

    it('returns false when after', () => {
      expect(isBefore(new Date(2026, 2, 11), new Date(2026, 2, 10))).toBe(false)
    })
  })

  describe('isAfter', () => {
    it('returns true when date is after target', () => {
      expect(isAfter(new Date(2026, 2, 11), new Date(2026, 2, 10))).toBe(true)
    })

    it('returns false when same day', () => {
      expect(isAfter(new Date(2026, 2, 10), new Date(2026, 2, 10))).toBe(false)
    })
  })

  describe('constants', () => {
    it('has 7 Korean weekday labels', () => {
      expect(WEEKDAY_LABELS_KO).toHaveLength(7)
      expect(WEEKDAY_LABELS_KO[0]).toBe('일')
      expect(WEEKDAY_LABELS_KO[6]).toBe('토')
    })

    it('has 12 Korean month labels', () => {
      expect(MONTH_LABELS_KO).toHaveLength(12)
      expect(MONTH_LABELS_KO[0]).toBe('1월')
      expect(MONTH_LABELS_KO[11]).toBe('12월')
    })
  })
})

// ===========================================================================
// useDatePicker hook
// ===========================================================================

describe('useDatePicker', () => {
  const fixedDate = new Date(2026, 2, 10) // 2026-03-10

  describe('initial state', () => {
    it('starts with no selection when no initialDate', () => {
      const { result } = renderHook(() => useDatePicker())
      expect(result.current.selectedDate).toBeNull()
      expect(result.current.selectedRange.start).toBeNull()
      expect(result.current.selectedRange.end).toBeNull()
    })

    it('uses initialDate when provided', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      expect(result.current.selectedDate).not.toBeNull()
      expect(isSameDay(result.current.selectedDate!, fixedDate)).toBe(true)
    })

    it('sets viewDate to initialDate month', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      expect(result.current.viewDate.getFullYear()).toBe(2026)
      expect(result.current.viewDate.getMonth()).toBe(2)
    })
  })

  describe('days grid', () => {
    it('generates 42 day cells (6 rows x 7 columns)', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      expect(result.current.days).toHaveLength(42)
    })

    it('marks current month days correctly', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      const currentMonthDays = result.current.days.filter((d) => d.isCurrentMonth)
      // March 2026 has 31 days
      expect(currentMonthDays).toHaveLength(31)
    })

    it('marks today correctly', () => {
      const today = new Date()
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: today }),
      )
      const todayCell = result.current.days.find((d) => d.isToday)
      expect(todayCell).toBeDefined()
      expect(todayCell!.day).toBe(today.getDate())
    })

    it('marks selected date', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      const selected = result.current.days.filter((d) => d.isSelected)
      expect(selected.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('single mode selection', () => {
    it('selects a date', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      const newDate = new Date(2026, 2, 15)

      act(() => {
        result.current.select(newDate)
      })

      expect(result.current.selectedDate).not.toBeNull()
      expect(isSameDay(result.current.selectedDate!, newDate)).toBe(true)
    })

    it('does not select disabled date', () => {
      const { result } = renderHook(() =>
        useDatePicker({
          initialDate: fixedDate,
          minDate: new Date(2026, 2, 5),
          maxDate: new Date(2026, 2, 20),
        }),
      )

      act(() => {
        result.current.select(new Date(2026, 2, 1)) // before min
      })

      // Should still be the initial date
      expect(isSameDay(result.current.selectedDate!, fixedDate)).toBe(true)
    })
  })

  describe('range mode', () => {
    it('selects start then end', () => {
      const { result } = renderHook(() =>
        useDatePicker({ mode: 'range' }),
      )

      act(() => {
        result.current.select(new Date(2026, 2, 5))
      })
      expect(result.current.selectedRange.start).not.toBeNull()
      expect(result.current.selectedRange.end).toBeNull()

      act(() => {
        result.current.select(new Date(2026, 2, 15))
      })
      expect(result.current.selectedRange.start).not.toBeNull()
      expect(result.current.selectedRange.end).not.toBeNull()
    })

    it('auto-orders range when end < start', () => {
      const { result } = renderHook(() =>
        useDatePicker({ mode: 'range' }),
      )

      act(() => {
        result.current.select(new Date(2026, 2, 15))
      })
      act(() => {
        result.current.select(new Date(2026, 2, 5))
      })

      expect(isSameDay(result.current.selectedRange.start!, new Date(2026, 2, 5))).toBe(true)
      expect(isSameDay(result.current.selectedRange.end!, new Date(2026, 2, 15))).toBe(true)
    })

    it('resets range on third selection', () => {
      const { result } = renderHook(() =>
        useDatePicker({ mode: 'range' }),
      )

      act(() => { result.current.select(new Date(2026, 2, 5)) })
      act(() => { result.current.select(new Date(2026, 2, 15)) })
      act(() => { result.current.select(new Date(2026, 2, 20)) })

      // Should start a new range
      expect(isSameDay(result.current.selectedRange.start!, new Date(2026, 2, 20))).toBe(true)
      expect(result.current.selectedRange.end).toBeNull()
    })

    it('marks days in range', () => {
      const { result } = renderHook(() =>
        useDatePicker({ mode: 'range' }),
      )

      // Navigate to March 2026 first
      // Start fresh with no initialDate so selectedRange starts empty
      act(() => { result.current.select(new Date(2026, 2, 5)) })
      act(() => { result.current.select(new Date(2026, 2, 15)) })

      // View might not be March, so check via isInRange helper
      expect(result.current.isInRange(new Date(2026, 2, 10))).toBe(true)
      expect(result.current.isInRange(new Date(2026, 2, 5))).toBe(true)
      expect(result.current.isInRange(new Date(2026, 2, 15))).toBe(true)
      expect(result.current.isInRange(new Date(2026, 2, 4))).toBe(false)
      expect(result.current.isInRange(new Date(2026, 2, 16))).toBe(false)
    })
  })

  describe('month navigation', () => {
    it('moves to next month', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )

      act(() => { result.current.nextMonth() })

      expect(result.current.viewDate.getMonth()).toBe(3) // April
      expect(result.current.viewDate.getFullYear()).toBe(2026)
    })

    it('wraps December to January of next year', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: new Date(2026, 11, 1) }),
      )

      act(() => { result.current.nextMonth() })

      expect(result.current.viewDate.getMonth()).toBe(0) // January
      expect(result.current.viewDate.getFullYear()).toBe(2027)
    })

    it('moves to previous month', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )

      act(() => { result.current.prevMonth() })

      expect(result.current.viewDate.getMonth()).toBe(1) // February
    })

    it('wraps January to December of previous year', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: new Date(2026, 0, 1) }),
      )

      act(() => { result.current.prevMonth() })

      expect(result.current.viewDate.getMonth()).toBe(11)
      expect(result.current.viewDate.getFullYear()).toBe(2025)
    })
  })

  describe('goToToday', () => {
    it('moves view to current month', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: new Date(2020, 0, 1) }),
      )
      const today = new Date()

      act(() => { result.current.goToToday() })

      expect(result.current.viewDate.getMonth()).toBe(today.getMonth())
      expect(result.current.viewDate.getFullYear()).toBe(today.getFullYear())
    })

    it('selects today in single mode', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: new Date(2020, 0, 1) }),
      )

      act(() => { result.current.goToToday() })

      const today = new Date()
      expect(result.current.selectedDate).not.toBeNull()
      expect(isSameDay(result.current.selectedDate!, today)).toBe(true)
    })
  })

  describe('min/max date', () => {
    it('marks dates before minDate as disabled', () => {
      const { result } = renderHook(() =>
        useDatePicker({
          initialDate: fixedDate,
          minDate: new Date(2026, 2, 10),
        }),
      )

      const disabledBefore = result.current.days.filter(
        (d) => d.isCurrentMonth && d.day < 10 && d.isDisabled,
      )
      expect(disabledBefore.length).toBe(9) // days 1-9
    })

    it('marks dates after maxDate as disabled', () => {
      const { result } = renderHook(() =>
        useDatePicker({
          initialDate: fixedDate,
          maxDate: new Date(2026, 2, 20),
        }),
      )

      const disabledAfter = result.current.days.filter(
        (d) => d.isCurrentMonth && d.day > 20 && d.isDisabled,
      )
      expect(disabledAfter.length).toBe(11) // days 21-31
    })

    it('isDisabled returns correct value', () => {
      const { result } = renderHook(() =>
        useDatePicker({
          minDate: new Date(2026, 2, 5),
          maxDate: new Date(2026, 2, 25),
        }),
      )

      expect(result.current.isDisabled(new Date(2026, 2, 1))).toBe(true)
      expect(result.current.isDisabled(new Date(2026, 2, 10))).toBe(false)
      expect(result.current.isDisabled(new Date(2026, 2, 30))).toBe(true)
    })
  })

  describe('helper methods', () => {
    it('isToday identifies today', () => {
      const { result } = renderHook(() => useDatePicker())
      expect(result.current.isToday(new Date())).toBe(true)
      expect(result.current.isToday(new Date(2020, 0, 1))).toBe(false)
    })

    it('isSelected checks single mode selection', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: fixedDate }),
      )
      expect(result.current.isSelected(fixedDate)).toBe(true)
      expect(result.current.isSelected(new Date(2026, 2, 20))).toBe(false)
    })

    it('isInRange checks range mode', () => {
      const { result } = renderHook(() =>
        useDatePicker({ mode: 'range' }),
      )

      act(() => { result.current.select(new Date(2026, 2, 5)) })
      act(() => { result.current.select(new Date(2026, 2, 15)) })

      expect(result.current.isInRange(new Date(2026, 2, 10))).toBe(true)
      expect(result.current.isInRange(new Date(2026, 2, 20))).toBe(false)
    })
  })
})

// ===========================================================================
// DatePicker component
// ===========================================================================

describe('DatePicker component', () => {
  const initialDate = new Date(2026, 2, 10)

  it('renders without crashing', () => {
    render(<DatePicker initialDate={initialDate} />)
    expect(screen.getByRole('group', { name: '날짜 선택' })).toBeDefined()
  })

  it('displays Korean weekday headers', () => {
    render(<DatePicker initialDate={initialDate} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(7)
    expect(headers[0]).toHaveTextContent('일')
    expect(headers[1]).toHaveTextContent('월')
    expect(headers[6]).toHaveTextContent('토')
  })

  it('displays year and month title', () => {
    render(<DatePicker initialDate={initialDate} />)
    expect(screen.getByText('2026년 3월')).toBeDefined()
  })

  it('has calendar grid with role=grid', () => {
    render(<DatePicker initialDate={initialDate} />)
    expect(screen.getByRole('grid', { name: '달력' })).toBeDefined()
  })

  it('renders 42 day cells', () => {
    render(<DatePicker initialDate={initialDate} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(42)
  })

  it('marks initial date as selected (aria-selected)', () => {
    render(<DatePicker initialDate={initialDate} />)
    const selected = screen.getAllByRole('gridcell').filter(
      (el) => el.getAttribute('aria-selected') === 'true',
    )
    expect(selected.length).toBeGreaterThanOrEqual(1)
  })

  describe('navigation', () => {
    it('navigates to next month on click', () => {
      render(<DatePicker initialDate={initialDate} />)
      fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
      expect(screen.getByText('2026년 4월')).toBeDefined()
    })

    it('navigates to previous month on click', () => {
      render(<DatePicker initialDate={initialDate} />)
      fireEvent.click(screen.getByRole('button', { name: '이전 달' }))
      expect(screen.getByText('2026년 2월')).toBeDefined()
    })

    it('has today button', () => {
      render(<DatePicker initialDate={initialDate} />)
      expect(screen.getByRole('button', { name: '오늘로 이동' })).toBeDefined()
    })
  })

  describe('date selection', () => {
    it('calls onSelect when a day is clicked', () => {
      const onSelect = vi.fn()
      render(<DatePicker initialDate={initialDate} onSelect={onSelect} />)

      // Click day 15
      const day15 = screen.getByRole('gridcell', { name: /2026년 3월 15일/ })
      fireEvent.click(day15)

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(isSameDay(onSelect.mock.calls[0][0], new Date(2026, 2, 15))).toBe(true)
    })

    it('does not call onSelect for disabled dates', () => {
      const onSelect = vi.fn()
      render(
        <DatePicker
          initialDate={initialDate}
          minDate={new Date(2026, 2, 10)}
          onSelect={onSelect}
        />,
      )

      // Day 5 should be disabled
      const day5 = screen.getByRole('gridcell', { name: /2026년 3월 5일/ })
      fireEvent.click(day5)

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('keyboard navigation', () => {
    it('supports Enter key to select', () => {
      const onSelect = vi.fn()
      render(<DatePicker initialDate={initialDate} onSelect={onSelect} />)

      const day15 = screen.getByRole('gridcell', { name: /2026년 3월 15일/ })
      fireEvent.keyDown(day15, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('supports Space key to select', () => {
      const onSelect = vi.fn()
      render(<DatePicker initialDate={initialDate} onSelect={onSelect} />)

      const day15 = screen.getByRole('gridcell', { name: /2026년 3월 15일/ })
      fireEvent.keyDown(day15, { key: ' ' })

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('supports arrow key navigation', () => {
      render(<DatePicker initialDate={initialDate} />)

      const day15 = screen.getByRole('gridcell', { name: /2026년 3월 15일/ })
      // ArrowRight should not throw
      fireEvent.keyDown(day15, { key: 'ArrowRight' })
      fireEvent.keyDown(day15, { key: 'ArrowLeft' })
      fireEvent.keyDown(day15, { key: 'ArrowDown' })
      fireEvent.keyDown(day15, { key: 'ArrowUp' })
    })
  })

  describe('accessibility', () => {
    it('has aria-label on day cells', () => {
      render(<DatePicker initialDate={initialDate} />)
      const cell = screen.getByRole('gridcell', { name: /2026년 3월 10일/ })
      expect(cell).toBeDefined()
    })

    it('marks disabled dates with aria-disabled', () => {
      render(
        <DatePicker
          initialDate={initialDate}
          minDate={new Date(2026, 2, 10)}
        />,
      )

      const day5 = screen.getByRole('gridcell', { name: /2026년 3월 5일/ })
      expect(day5.getAttribute('aria-disabled')).toBe('true')
    })

    it('uses aria-current=date for today', () => {
      const today = new Date()
      render(<DatePicker initialDate={today} />)

      const cells = screen.getAllByRole('gridcell')
      const todayCell = cells.find(
        (el) => el.getAttribute('aria-current') === 'date',
      )
      expect(todayCell).toBeDefined()
    })
  })

  describe('range mode component', () => {
    it('renders in range mode', () => {
      render(<DatePicker mode="range" initialDate={initialDate} />)
      expect(screen.getByRole('group', { name: '날짜 선택' })).toBeDefined()
    })

    it('calls onRangeSelect when range is complete', () => {
      const onRangeSelect = vi.fn()
      // No initialDate so selectedRange starts empty
      render(
        <DatePicker
          mode="range"
          onRangeSelect={onRangeSelect}
        />,
      )

      // Navigate to March 2026 — find and click prev/next as needed
      // Instead, select dates in the current view month
      const today = new Date()
      const day5Label = `${today.getFullYear()}년 ${today.getMonth() + 1}월 5일`
      const day15Label = `${today.getFullYear()}년 ${today.getMonth() + 1}월 15일`

      const day5 = screen.getByRole('gridcell', { name: new RegExp(day5Label) })
      const day15 = screen.getByRole('gridcell', { name: new RegExp(day15Label) })

      fireEvent.click(day5)
      fireEvent.click(day15)

      expect(onRangeSelect).toHaveBeenCalledTimes(1)
      const call = onRangeSelect.mock.calls[0][0]
      expect(call.start.getDate()).toBe(5)
      expect(call.end.getDate()).toBe(15)
    })
  })

  describe('className prop', () => {
    it('passes className to container', () => {
      const { container } = render(
        <DatePicker initialDate={initialDate} className="my-picker" />,
      )
      const el = container.querySelector('.my-picker')
      expect(el).not.toBeNull()
    })
  })
})
