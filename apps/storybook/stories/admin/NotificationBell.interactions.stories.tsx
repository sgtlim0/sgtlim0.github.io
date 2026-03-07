import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import { NotificationBell } from '@hchat/ui/admin'

const meta: Meta<typeof NotificationBell> = {
  title: 'Admin/Notifications/NotificationBell/Interactions',
  component: NotificationBell,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 40 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const ClickToggle: Story = {
  args: {
    unreadCount: 5,
    hasUrgent: false,
    onToggle: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const bell = canvas.getByRole('button')

    await userEvent.click(bell)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}

export const ShowsBadgeCount: Story = {
  args: {
    unreadCount: 42,
    hasUrgent: false,
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('42')).toBeInTheDocument()
  },
}

export const HiddenBadgeWhenZero: Story = {
  args: {
    unreadCount: 0,
    hasUrgent: false,
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toHaveAccessibleName('알림')
  },
}

export const UrgentPulseAnimation: Story = {
  args: {
    unreadCount: 3,
    hasUrgent: true,
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('3')).toBeInTheDocument()
  },
}

export const OverflowCount: Story = {
  args: {
    unreadCount: 150,
    hasUrgent: false,
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('99+')).toBeInTheDocument()
  },
}
