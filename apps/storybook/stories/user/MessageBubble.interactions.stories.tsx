import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import MessageBubble from '@hchat/ui/user/components/MessageBubble'

const meta: Meta<typeof MessageBubble> = {
  title: 'User/Atoms/MessageBubble/Interactions',
  component: MessageBubble,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MessageBubble>

export const RendersUserMessage: Story = {
  args: {
    message: {
      id: 'm1',
      role: 'user',
      content: '오늘 기획 회의 내용 정리해줘',
      timestamp: '2026-03-03T09:00:00Z',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('오늘 기획 회의 내용 정리해줘')).toBeInTheDocument()
  },
}

export const RendersAssistantMessage: Story = {
  args: {
    message: {
      id: 'm2',
      role: 'assistant',
      content: '네, 회의 내용을 정리해드리겠습니다.',
      timestamp: '2026-03-03T09:00:05Z',
      assistantId: 'a1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/회의 내용을 정리해드리겠습니다/)).toBeInTheDocument()
  },
}
