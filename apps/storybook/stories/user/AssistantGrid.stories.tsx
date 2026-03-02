import type { Meta, StoryObj } from '@storybook/react';
import AssistantGrid from '@hchat/ui/user/components/AssistantGrid';
import { mockAssistants } from '@hchat/ui/user/services/mockData';

const meta: Meta<typeof AssistantGrid> = {
  title: 'User/Organisms/AssistantGrid',
  component: AssistantGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof AssistantGrid>;

export const OfficialAll: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'official',
    activeCategory: '전체',
    onTabChange: (tab) => console.log('Tab changed:', tab),
    onCategoryChange: (category) => console.log('Category changed:', category),
    onSelectAssistant: (assistant) => console.log('Selected:', assistant.name),
  },
};

export const OfficialChatCategory: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'official',
    activeCategory: '채팅',
    onTabChange: (tab) => console.log('Tab changed:', tab),
    onCategoryChange: (category) => console.log('Category changed:', category),
    onSelectAssistant: (assistant) => console.log('Selected:', assistant.name),
  },
};

export const OfficialTranslateCategory: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'official',
    activeCategory: '번역',
    onTabChange: (tab) => console.log('Tab changed:', tab),
    onCategoryChange: (category) => console.log('Category changed:', category),
    onSelectAssistant: (assistant) => console.log('Selected:', assistant.name),
  },
};

export const CustomEmpty: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'custom',
    activeCategory: '전체',
    onTabChange: (tab) => console.log('Tab changed:', tab),
    onCategoryChange: (category) => console.log('Category changed:', category),
    onSelectAssistant: (assistant) => console.log('Selected:', assistant.name),
  },
};
