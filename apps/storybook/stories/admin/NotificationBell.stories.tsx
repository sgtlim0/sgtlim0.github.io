import type { Meta, StoryObj } from '@storybook/react'
import { NotificationBell } from '@hchat/ui/admin'

const meta: Meta<typeof NotificationBell> = {
  title: 'Admin/Notifications/NotificationBell',
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

export const Default: Story = {
  args: {
    unreadCount: 5,
    hasUrgent: false,
    onToggle: () => {},
  },
}

export const Urgent: Story = {
  args: {
    unreadCount: 3,
    hasUrgent: true,
    onToggle: () => {},
  },
}

export const NoNotifications: Story = {
  args: {
    unreadCount: 0,
    hasUrgent: false,
    onToggle: () => {},
  },
}
