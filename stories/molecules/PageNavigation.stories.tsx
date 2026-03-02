import type { Meta, StoryObj } from '@storybook/react';
import PageNavigation from '@/components/PageNavigation';

const meta: Meta<typeof PageNavigation> = {
  title: 'Molecules/PageNavigation',
  component: PageNavigation,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 700 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof PageNavigation>;

export const BothLinks: Story = {
  args: {
    prev: { slug: 'quickstart', title: '빠른 시작' },
    next: { slug: 'chat/group-chat', title: '그룹 채팅' },
  },
};

export const FirstPage: Story = {
  args: {
    prev: null,
    next: { slug: 'quickstart', title: '빠른 시작' },
  },
};

export const LastPage: Story = {
  args: {
    prev: { slug: 'settings/usage', title: '사용량 추적' },
    next: null,
  },
};
