import type { Meta, StoryObj } from '@storybook/react'
import StreamingIndicator from '@hchat/ui/user/components/StreamingIndicator'

const meta: Meta<typeof StreamingIndicator> = {
  title: 'User/Atoms/StreamingIndicator',
  component: StreamingIndicator,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof StreamingIndicator>

export const Active: Story = { args: { isStreaming: true } }
export const Inactive: Story = { args: { isStreaming: false } }
