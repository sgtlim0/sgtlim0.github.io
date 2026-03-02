import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from '@/components/Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Molecules/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const TwoLevels: Story = {
  args: {
    items: [
      { label: '홈', href: '/' },
      { label: '빠른 시작', href: '/quickstart' },
    ],
  },
};

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: '홈', href: '/' },
      { label: 'AI 대화', href: '#' },
      { label: 'AI 채팅', href: '/chat/ai-chat' },
    ],
  },
};

export const HomeOnly: Story = {
  args: {
    items: [{ label: '홈', href: '/' }],
  },
};
