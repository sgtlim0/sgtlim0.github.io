import type { Meta, StoryObj } from '@storybook/react'
import ChatSearchPanel from '@hchat/ui/user/components/ChatSearchPanel'
import { mockConversations } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof ChatSearchPanel> = {
  title: 'User/Molecules/ChatSearchPanel',
  component: ChatSearchPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 360, height: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ChatSearchPanel>

export const WithConversations: Story = {
  args: {
    conversations: mockConversations,
    onSelectConversation: (id: string) => {},
    onClose: () => {},
  },
}

export const Empty: Story = {
  args: {
    conversations: [],
    onSelectConversation: (id: string) => {},
    onClose: () => {},
  },
}
