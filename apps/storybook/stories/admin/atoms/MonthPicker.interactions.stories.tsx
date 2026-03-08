import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import MonthPicker from '@hchat/ui/admin/MonthPicker'

const meta: Meta<typeof MonthPicker> = {
  title: 'Admin/Atoms/MonthPicker/Interactions',
  component: MonthPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MonthPicker>

export const ClickPrevMonth: Story = {
  args: { year: 2026, month: 3, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('2026년 3월')).toBeInTheDocument()

    const prevBtn = canvas.getByLabelText('이전 달')
    await userEvent.click(prevBtn)
    await expect(args.onChange).toHaveBeenCalledWith(2026, 2)
  },
}

export const ClickNextMonth: Story = {
  args: { year: 2026, month: 3, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const nextBtn = canvas.getByLabelText('다음 달')
    await userEvent.click(nextBtn)
    await expect(args.onChange).toHaveBeenCalledWith(2026, 4)
  },
}

export const JanuaryPrevWrapsToDecember: Story = {
  args: { year: 2026, month: 1, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const prevBtn = canvas.getByLabelText('이전 달')
    await userEvent.click(prevBtn)
    await expect(args.onChange).toHaveBeenCalledWith(2025, 12)
  },
}
