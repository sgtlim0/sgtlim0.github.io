import type { Meta, StoryObj } from '@storybook/react';
import AssistantCard from '@hchat/ui/user/components/AssistantCard';
import { mockAssistants } from '@hchat/ui/user/services/mockData';

const meta: Meta<typeof AssistantCard> = {
  title: 'User/Atoms/AssistantCard',
  component: AssistantCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof AssistantCard>;

export const OfficialWithModel: Story = {
  args: {
    assistant: mockAssistants[0],
    onClick: (assistant) => console.log('Clicked:', assistant.name),
  },
};

export const OfficialWithoutModel: Story = {
  args: {
    assistant: mockAssistants[2],
    onClick: (assistant) => console.log('Clicked:', assistant.name),
  },
};

export const CustomAssistant: Story = {
  args: {
    assistant: {
      id: 'custom1',
      name: '나만의 영어 튜터',
      icon: '📚',
      iconColor: '#8b5cf6',
      model: '',
      description: '영어 회화 연습과 문법 교정을 도와주는 맞춤형 비서입니다.',
      category: '글쓰기',
      isOfficial: false,
    },
    onClick: (assistant) => console.log('Clicked:', assistant.name),
  },
};
