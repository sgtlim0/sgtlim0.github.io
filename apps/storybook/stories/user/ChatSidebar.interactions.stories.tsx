import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import ChatSidebar from '@hchat/ui/user/components/ChatSidebar'
import { mockConversations } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof ChatSidebar> = {
  title: 'User/Molecules/ChatSidebar/Interactions',
  component: ChatSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatSidebar>

export const ClickNewChat: Story = {
  args: {
    conversations: mockConversations,
    activeConversationId: 'c1',
    onSelectConversation: fn(),
    onNewChat: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const newChatBtn = canvas.getByText('새 대화')
    await userEvent.click(newChatBtn)
    await expect(args.onNewChat).toHaveBeenCalledTimes(1)
  },
}

export const SelectConversation: Story = {
  args: {
    conversations: mockConversations,
    onSelectConversation: fn(),
    onNewChat: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const firstConv = canvas.getByText(mockConversations[0].title)
    await userEvent.click(firstConv)
    await expect(args.onSelectConversation).toHaveBeenCalledWith(mockConversations[0].id)
  },
}
