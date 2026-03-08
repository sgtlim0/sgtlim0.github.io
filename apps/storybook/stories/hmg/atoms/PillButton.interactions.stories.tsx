import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import PillButton from '@hchat/ui/hmg/PillButton'

const meta: Meta<typeof PillButton> = {
  title: 'HMG/Atoms/PillButton/Interactions',
  component: PillButton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PillButton>

export const ClickButton: Story = {
  args: { children: '자세히 보기', variant: 'outline', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const btn = canvas.getByText('자세히 보기')
    await userEvent.click(btn)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const RendersVariants: Story = {
  args: { children: '빠른 시작 가이드', variant: 'navy' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('빠른 시작 가이드')).toBeInTheDocument()
  },
}
