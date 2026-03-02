import type { Meta, StoryObj } from '@storybook/react';
import ChatSidebar from '@hchat/ui/user/components/ChatSidebar';
import { mockConversations } from '@hchat/ui/user/services/mockData';

const meta: Meta<typeof ChatSidebar> = {
  title: 'User/Molecules/ChatSidebar',
  component: ChatSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatSidebar>;

export const WithConversations: Story = {
  args: {
    conversations: mockConversations,
    activeConversationId: 'c1',
    onSelectConversation: (id: string) => console.log('Selected:', id),
    onNewChat: () => console.log('New chat'),
  },
};

export const EmptyState: Story = {
  args: {
    conversations: [],
    onSelectConversation: (id: string) => console.log('Selected:', id),
    onNewChat: () => console.log('New chat'),
  },
};

export const NoActiveConversation: Story = {
  args: {
    conversations: mockConversations,
    onSelectConversation: (id: string) => console.log('Selected:', id),
    onNewChat: () => console.log('New chat'),
  },
};
