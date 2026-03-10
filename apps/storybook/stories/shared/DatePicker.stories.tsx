import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { DatePicker } from '@hchat/ui'

const meta: Meta<typeof DatePicker> = {
  title: 'Shared/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof DatePicker>

export const SingleSelect: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-6">
      <DatePicker mode="single" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render calendar grid
    const grid = canvas.getByRole('grid', { name: '달력' })
    expect(grid).toBeTruthy()

    // Navigate months
    const prevBtn = canvas.getByLabelText('이전 달')
    await userEvent.click(prevBtn)

    // Click "오늘" button to return
    const todayBtn = canvas.getByLabelText('오늘로 이동')
    await userEvent.click(todayBtn)

    // Select a day cell
    const dayCells = canvasElement.querySelectorAll('[data-day]')
    expect(dayCells.length).toBeGreaterThan(0)

    // Click a day in the middle of the month
    const middleDay = dayCells[15]
    if (middleDay) {
      await userEvent.click(middleDay)

      await waitFor(() => {
        expect(middleDay.getAttribute('aria-selected')).toBe('true')
      })
    }
  },
}

export const RangeSelect: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-6">
      <DatePicker mode="range" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render calendar
    expect(canvas.getByRole('grid', { name: '달력' })).toBeTruthy()

    // Select two days for a range
    const dayCells = canvasElement.querySelectorAll('[data-day]')
    expect(dayCells.length).toBeGreaterThan(0)

    // Click first day (range start)
    const startDay = dayCells[10]
    if (startDay) {
      await userEvent.click(startDay)

      await waitFor(() => {
        expect(startDay.getAttribute('aria-selected')).toBe('true')
      })
    }

    // Click second day (range end)
    const endDay = dayCells[16]
    if (endDay) {
      await userEvent.click(endDay)

      await waitFor(() => {
        expect(endDay.getAttribute('aria-selected')).toBe('true')
      })
    }
  },
}
