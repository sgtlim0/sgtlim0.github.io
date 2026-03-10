/**
 * Tests for Calendar — useCalendar hook + Calendar component
 *
 * Covers:
 * - useCalendar: month/week view, event CRUD, navigation, goToToday, getEventsForDay
 * - Calendar component: month grid rendering, week grid, view switching, Korean labels,
 *   event display, day click, event click, today highlight, aria attributes
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'

import { useCalendar } from '../src/hooks/useCalendar'
import type { CalendarEvent } from '../src/hooks/useCalendar'
import { Calendar } from '../src/Calendar'
import { isSameDay } from '../src/utils/dateUtils'

// ===========================================================================
// useCalendar hook
// ===========================================================================

describe('useCalendar', () => {
  const fixedDate = new Date(2026, 2, 10) // 2026-03-10 (Tuesday)

  describe('initialization', () => {
    it('defaults to month view', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      expect(result.current.view).toBe('month')
    })

    it('accepts initial view as week', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      expect(result.current.view).toBe('week')
    })

    it('uses current date when no initialDate', () => {
      const { result } = renderHook(() => useCalendar())
      const today = new Date()
      expect(result.current.currentDate.getFullYear()).toBe(today.getFullYear())
      expect(result.current.currentDate.getMonth()).toBe(today.getMonth())
      expect(result.current.currentDate.getDate()).toBe(today.getDate())
    })

    it('stores initial events', () => {
      const events: CalendarEvent[] = [
        { id: 'e1', title: 'Meeting', start: fixedDate },
      ]
      const { result } = renderHook(() => useCalendar({ events }))
      expect(result.current.events).toHaveLength(1)
      expect(result.current.events[0].title).toBe('Meeting')
    })
  })

  describe('month view grid', () => {
    it('returns 42 days (7x6)', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      expect(result.current.days).toHaveLength(42)
    })

    it('marks current month days correctly', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      const marchDays = result.current.days.filter((d) => d.isCurrentMonth)
      expect(marchDays).toHaveLength(31) // March has 31 days
    })

    it('includes previous and next month filler days', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      const fillers = result.current.days.filter((d) => !d.isCurrentMonth)
      expect(fillers.length).toBeGreaterThan(0)
    })

    it('marks today correctly', () => {
      const today = new Date()
      const { result } = renderHook(() => useCalendar({ initialDate: today }))
      const todayCell = result.current.days.find((d) => d.isToday)
      expect(todayCell).toBeDefined()
      expect(todayCell!.day).toBe(today.getDate())
    })
  })

  describe('week view grid', () => {
    it('returns 7 days', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      expect(result.current.days).toHaveLength(7)
    })

    it('starts on Sunday', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      expect(result.current.days[0].date.getDay()).toBe(0) // Sunday
    })

    it('contains 7 consecutive days', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      for (let i = 1; i < 7; i++) {
        const diff = result.current.days[i].date.getTime() - result.current.days[i - 1].date.getTime()
        expect(diff).toBe(86400000) // 1 day in ms
      }
    })
  })

  describe('view switching', () => {
    it('switches from month to week', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      expect(result.current.view).toBe('month')

      act(() => {
        result.current.setView('week')
      })

      expect(result.current.view).toBe('week')
      expect(result.current.days).toHaveLength(7)
    })

    it('switches from week to month', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))

      act(() => {
        result.current.setView('month')
      })

      expect(result.current.view).toBe('month')
      expect(result.current.days).toHaveLength(42)
    })
  })

  describe('navigation — month', () => {
    it('nextPeriod advances to next month', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))
      expect(result.current.currentDate.getMonth()).toBe(2) // March

      act(() => {
        result.current.nextPeriod()
      })

      expect(result.current.currentDate.getMonth()).toBe(3) // April
    })

    it('prevPeriod goes to previous month', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))

      act(() => {
        result.current.prevPeriod()
      })

      expect(result.current.currentDate.getMonth()).toBe(1) // February
    })

    it('wraps December → January on nextPeriod', () => {
      const dec = new Date(2025, 11, 15) // December
      const { result } = renderHook(() => useCalendar({ initialDate: dec }))

      act(() => {
        result.current.nextPeriod()
      })

      expect(result.current.currentDate.getMonth()).toBe(0) // January
      expect(result.current.currentDate.getFullYear()).toBe(2026)
    })

    it('wraps January → December on prevPeriod', () => {
      const jan = new Date(2026, 0, 15) // January
      const { result } = renderHook(() => useCalendar({ initialDate: jan }))

      act(() => {
        result.current.prevPeriod()
      })

      expect(result.current.currentDate.getMonth()).toBe(11) // December
      expect(result.current.currentDate.getFullYear()).toBe(2025)
    })
  })

  describe('navigation — week', () => {
    it('nextPeriod advances by 7 days', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      const before = result.current.currentDate.getDate()

      act(() => {
        result.current.nextPeriod()
      })

      expect(result.current.currentDate.getDate()).toBe(before + 7)
    })

    it('prevPeriod goes back by 7 days', () => {
      const { result } = renderHook(() => useCalendar({ view: 'week', initialDate: fixedDate }))
      const before = result.current.currentDate.getDate()

      act(() => {
        result.current.prevPeriod()
      })

      expect(result.current.currentDate.getDate()).toBe(before - 7)
    })
  })

  describe('goToToday', () => {
    it('navigates back to today', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: new Date(2025, 5, 1) }))

      act(() => {
        result.current.goToToday()
      })

      const today = new Date()
      expect(result.current.currentDate.getDate()).toBe(today.getDate())
      expect(result.current.currentDate.getMonth()).toBe(today.getMonth())
    })
  })

  describe('event management', () => {
    it('addEvent returns a string id', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))

      let id = ''
      act(() => {
        id = result.current.addEvent({ title: 'Test', start: fixedDate })
      })

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('addEvent appends to events list', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))

      act(() => {
        result.current.addEvent({ title: 'Event A', start: fixedDate })
        result.current.addEvent({ title: 'Event B', start: fixedDate })
      })

      expect(result.current.events).toHaveLength(2)
      expect(result.current.events[0].title).toBe('Event A')
      expect(result.current.events[1].title).toBe('Event B')
    })

    it('removeEvent removes by id', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate }))

      let id = ''
      act(() => {
        id = result.current.addEvent({ title: 'To remove', start: fixedDate })
      })

      expect(result.current.events).toHaveLength(1)

      act(() => {
        result.current.removeEvent(id)
      })

      expect(result.current.events).toHaveLength(0)
    })

    it('removeEvent with invalid id does nothing', () => {
      const { result } = renderHook(() => useCalendar({
        initialDate: fixedDate,
        events: [{ id: 'e1', title: 'Keep', start: fixedDate }],
      }))

      act(() => {
        result.current.removeEvent('nonexistent')
      })

      expect(result.current.events).toHaveLength(1)
    })
  })

  describe('getEventsForDay', () => {
    const events: CalendarEvent[] = [
      { id: 'e1', title: 'Morning', start: new Date(2026, 2, 10, 9, 0) },
      { id: 'e2', title: 'Afternoon', start: new Date(2026, 2, 10, 14, 0) },
      { id: 'e3', title: 'Other day', start: new Date(2026, 2, 11) },
    ]

    it('returns events matching the day', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate, events }))
      const march10 = result.current.getEventsForDay(new Date(2026, 2, 10))
      expect(march10).toHaveLength(2)
    })

    it('returns empty array when no events', () => {
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate, events }))
      const march15 = result.current.getEventsForDay(new Date(2026, 2, 15))
      expect(march15).toHaveLength(0)
    })

    it('matches multi-day events', () => {
      const multiDay: CalendarEvent[] = [
        { id: 'md1', title: 'Trip', start: new Date(2026, 2, 10), end: new Date(2026, 2, 12) },
      ]
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate, events: multiDay }))

      expect(result.current.getEventsForDay(new Date(2026, 2, 10))).toHaveLength(1)
      expect(result.current.getEventsForDay(new Date(2026, 2, 11))).toHaveLength(1)
      expect(result.current.getEventsForDay(new Date(2026, 2, 12))).toHaveLength(1)
      expect(result.current.getEventsForDay(new Date(2026, 2, 13))).toHaveLength(0)
    })
  })

  describe('events in day grid', () => {
    it('attaches events to the correct day cells', () => {
      const events: CalendarEvent[] = [
        { id: 'e1', title: 'Stand-up', start: new Date(2026, 2, 10) },
      ]
      const { result } = renderHook(() => useCalendar({ initialDate: fixedDate, events }))

      const march10 = result.current.days.find(
        (d) => d.isCurrentMonth && d.day === 10,
      )
      expect(march10?.events).toHaveLength(1)
      expect(march10?.events[0].title).toBe('Stand-up')

      const march11 = result.current.days.find(
        (d) => d.isCurrentMonth && d.day === 11,
      )
      expect(march11?.events).toHaveLength(0)
    })
  })
})

// ===========================================================================
// Calendar Component
// ===========================================================================

describe('Calendar component', () => {
  const fixedDate = new Date(2026, 2, 10)
  const sampleEvents: CalendarEvent[] = [
    { id: 'e1', title: 'Team Sync', start: new Date(2026, 2, 10), color: '#e53e3e' },
    { id: 'e2', title: 'Lunch', start: new Date(2026, 2, 10) },
    { id: 'e3', title: 'Review', start: new Date(2026, 2, 15) },
  ]

  describe('month view rendering', () => {
    it('renders with role="group" and aria-label', () => {
      const { container } = render(<Calendar initialDate={fixedDate} />)
      const group = container.querySelector('[role="group"]')
      expect(group).not.toBeNull()
      expect(group?.getAttribute('aria-label')).toBe('캘린더')
    })

    it('displays Korean month/year title', () => {
      render(<Calendar initialDate={fixedDate} />)
      expect(screen.getByText('2026년 3월')).toBeDefined()
    })

    it('shows Korean weekday headers', () => {
      render(<Calendar initialDate={fixedDate} />)
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(7)
      const labels = headers.map((h) => h.textContent)
      expect(labels).toEqual(['일', '월', '화', '수', '목', '금', '토'])
    })

    it('renders 42 gridcells in month view', () => {
      render(<Calendar initialDate={fixedDate} />)
      const cells = screen.getAllByRole('gridcell')
      expect(cells).toHaveLength(42)
    })

    it('shows event titles on matching days', () => {
      render(<Calendar initialDate={fixedDate} events={sampleEvents} />)
      expect(screen.getByText('Team Sync')).toBeDefined()
      expect(screen.getByText('Lunch')).toBeDefined()
      expect(screen.getByText('Review')).toBeDefined()
    })
  })

  describe('today highlight', () => {
    it('marks today with aria-current="date"', () => {
      const today = new Date()
      render(<Calendar initialDate={today} />)
      const todayCells = screen.getAllByRole('gridcell').filter(
        (el) => el.getAttribute('aria-current') === 'date',
      )
      expect(todayCells.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('navigation', () => {
    it('prev button navigates to previous month', () => {
      render(<Calendar initialDate={fixedDate} />)
      expect(screen.getByText('2026년 3월')).toBeDefined()

      fireEvent.click(screen.getByLabelText('이전'))
      expect(screen.getByText('2026년 2월')).toBeDefined()
    })

    it('next button navigates to next month', () => {
      render(<Calendar initialDate={fixedDate} />)

      fireEvent.click(screen.getByLabelText('다음'))
      expect(screen.getByText('2026년 4월')).toBeDefined()
    })

    it('오늘 button navigates to current month', () => {
      render(<Calendar initialDate={new Date(2025, 0, 1)} />)
      expect(screen.getByText('2025년 1월')).toBeDefined()

      fireEvent.click(screen.getByLabelText('오늘로 이동'))

      const today = new Date()
      const expectedTitle = `${today.getFullYear()}년 ${today.getMonth() + 1}월`
      expect(screen.getByText(expectedTitle)).toBeDefined()
    })
  })

  describe('view switching', () => {
    it('renders view tabs with role="tablist"', () => {
      render(<Calendar initialDate={fixedDate} />)
      const tablist = screen.getByRole('tablist')
      expect(tablist).toBeDefined()
    })

    it('month tab is selected by default', () => {
      render(<Calendar initialDate={fixedDate} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(2)
      expect(tabs[0].getAttribute('aria-selected')).toBe('true')  // month
      expect(tabs[1].getAttribute('aria-selected')).toBe('false') // week
    })

    it('switches to week view on tab click', () => {
      render(<Calendar initialDate={fixedDate} />)

      const weekTab = screen.getAllByRole('tab')[1]
      fireEvent.click(weekTab)

      // Week view should have a different grid
      expect(weekTab.getAttribute('aria-selected')).toBe('true')
      // Week grid has aria-label="주간 달력"
      expect(screen.getByLabelText('주간 달력')).toBeDefined()
    })

    it('switches back to month view', () => {
      render(<Calendar initialDate={fixedDate} view="week" />)
      expect(screen.getByLabelText('주간 달력')).toBeDefined()

      const monthTab = screen.getAllByRole('tab')[0]
      fireEvent.click(monthTab)

      expect(screen.getByLabelText('월간 달력')).toBeDefined()
    })
  })

  describe('week view rendering', () => {
    it('shows 7 columnheaders in week view', () => {
      render(<Calendar initialDate={fixedDate} view="week" />)
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(7)
    })

    it('renders time slots', () => {
      const { container } = render(<Calendar initialDate={fixedDate} view="week" />)
      // Check for at least some hour labels
      expect(container.textContent).toContain('00:00')
      expect(container.textContent).toContain('12:00')
      expect(container.textContent).toContain('23:00')
    })
  })

  describe('day click callback', () => {
    it('calls onDayClick with the clicked date', () => {
      const onDayClick = vi.fn()
      render(<Calendar initialDate={fixedDate} onDayClick={onDayClick} />)

      // Click on a gridcell with aria-label containing "10일"
      const cell = screen.getByLabelText('2026년 3월 10일')
      fireEvent.click(cell)

      expect(onDayClick).toHaveBeenCalledTimes(1)
      const clickedDate = onDayClick.mock.calls[0][0]
      expect(clickedDate.getDate()).toBe(10)
      expect(clickedDate.getMonth()).toBe(2)
    })
  })

  describe('event click callback', () => {
    it('calls onEventClick when an event bar is clicked', () => {
      const onEventClick = vi.fn()
      render(
        <Calendar
          initialDate={fixedDate}
          events={sampleEvents}
          onEventClick={onEventClick}
        />,
      )

      const eventButton = screen.getByLabelText('Team Sync')
      fireEvent.click(eventButton)

      expect(onEventClick).toHaveBeenCalledTimes(1)
      expect(onEventClick.mock.calls[0][0].id).toBe('e1')
    })

    it('does not propagate event click to day click', () => {
      const onDayClick = vi.fn()
      const onEventClick = vi.fn()
      render(
        <Calendar
          initialDate={fixedDate}
          events={sampleEvents}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />,
      )

      const eventButton = screen.getByLabelText('Team Sync')
      fireEvent.click(eventButton)

      expect(onEventClick).toHaveBeenCalledTimes(1)
      // onDayClick should NOT be called because of stopPropagation
      expect(onDayClick).not.toHaveBeenCalled()
    })
  })

  describe('overflow events', () => {
    it('shows +N indicator when more than 3 events on a day', () => {
      const manyEvents: CalendarEvent[] = [
        { id: 'a', title: 'A', start: new Date(2026, 2, 10) },
        { id: 'b', title: 'B', start: new Date(2026, 2, 10) },
        { id: 'c', title: 'C', start: new Date(2026, 2, 10) },
        { id: 'd', title: 'D', start: new Date(2026, 2, 10) },
        { id: 'e', title: 'E', start: new Date(2026, 2, 10) },
      ]
      render(<Calendar initialDate={fixedDate} events={manyEvents} />)
      expect(screen.getByText('+2')).toBeDefined()
    })
  })

  describe('custom className', () => {
    it('applies className to container', () => {
      const { container } = render(
        <Calendar initialDate={fixedDate} className="my-calendar" />,
      )
      expect(container.querySelector('.my-calendar')).not.toBeNull()
    })
  })
})
