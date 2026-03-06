import type { Meta, StoryObj } from '@storybook/react'
import { NotificationPreferences } from '@hchat/ui/admin'
import type { NotificationPreference } from '@hchat/ui/admin/services/notificationTypes'

const mockPreferences: NotificationPreference[] = [
  { channel: 'push', enabled: true, types: ['info', 'warning', 'error', 'success'] },
  { channel: 'email', enabled: true, types: ['error', 'warning'] },
  { channel: 'slack', enabled: false, types: [] },
  { channel: 'teams', enabled: false, types: [] },
]

const meta: Meta<typeof NotificationPreferences> = {
  title: 'Admin/Notifications/NotificationPreferences',
  component: NotificationPreferences,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 20, maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    preferences: mockPreferences,
    onUpdate: () => {},
  },
}
