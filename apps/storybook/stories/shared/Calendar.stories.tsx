import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Calendar } from '@hchat/ui'
import type { CalendarEvent } from '@hchat/ui/hooks/useCalendar'

const today = new Date()

const sampleEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Sprint Planning',
    start: new Date(today.getFullYear(), today.getMonth(), 10, 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), 10, 11, 0),
    color: '#3b82f6',
  },
  {
    id: 'evt-2',
    title: 'Code Review',
    start: new Date(today.getFullYear(), today.getMonth(), 15, 14, 0),
    end: new Date(today.getFullYear(), today.getMonth(), 15, 15, 0),
    color: '#10b981',
  },
  {
    id: 'evt-3',
    title: 'Team Lunch',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
    color: '#f59e0b',
    allDay: true,
  },
]

const meta: Meta<typeof Calendar> = {
  title: 'Shared/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Calendar>

export const MonthView: Story = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Calendar
        view="month"
        initialDate={today}
        events={sampleEvents}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Calendar group should render
    const calendarGroup = canvas.getByRole('group', { name: /캘린더/i })
    await expect(calendarGroup).toBeInTheDocument()

    // Month tab should be active
    const monthTab = canvas.getByRole('tab', { name: '월' })
    await expect(monthTab).toHaveAttribute('aria-selected', 'true')

    // Month grid should render with weekday headers
    const grid = canvas.getByRole('grid', { name: /월간 달력/i })
    await expect(grid).toBeInTheDocument()

    // Navigate to next month
    const nextBtn = canvas.getByLabelText('다음')
    await userEvent.click(nextBtn)

    // Navigate back
    const prevBtn = canvas.getByLabelText('이전')
    await userEvent.click(prevBtn)

    // "오늘" button should exist
    const todayBtn = canvas.getByLabelText('오늘로 이동')
    await expect(todayBtn).toBeInTheDocument()
  },
}

export const WeekView: Story = {
  render: () => (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Calendar
        view="week"
        initialDate={today}
        events={sampleEvents}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Week tab should be active
    const weekTab = canvas.getByRole('tab', { name: '주' })
    await expect(weekTab).toHaveAttribute('aria-selected', 'true')

    // Week grid should render
    const grid = canvas.getByRole('grid', { name: /주간 달력/i })
    await expect(grid).toBeInTheDocument()

    // Switch to month view
    const monthTab = canvas.getByRole('tab', { name: '월' })
    await userEvent.click(monthTab)

    await waitFor(() => {
      expect(monthTab).toHaveAttribute('aria-selected', 'true')
    })

    // Switch back to week view
    await userEvent.click(weekTab)

    await waitFor(() => {
      expect(weekTab).toHaveAttribute('aria-selected', 'true')
    })
  },
}
