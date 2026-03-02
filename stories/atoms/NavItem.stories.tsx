import type { Meta, StoryObj } from '@storybook/react';
import { MessageSquare, HelpCircle } from 'lucide-react';
import NavItem from '@/components/NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'Atoms/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    href: { control: 'text' },
    active: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: { title: 'AI 채팅', icon: MessageSquare, href: '/chat/ai-chat' },
};

export const Active: Story = {
  args: { title: 'AI 채팅', icon: MessageSquare, href: '/chat/ai-chat', active: true },
};

export const NoIcon: Story = {
  args: { title: 'FAQ', href: '/faq' },
};
