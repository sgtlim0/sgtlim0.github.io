import type { Meta, StoryObj } from '@storybook/react';
import UserCard from '@/components/admin/UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Admin/Molecules/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Active: Story = {
  args: {
    name: '김철수',
    userId: 'user01',
    department: 'AI혁신팀',
    totalConversations: 245,
    monthlyTokens: '125,000',
    status: 'active',
  },
};

export const Inactive: Story = {
  args: {
    name: '이영희',
    userId: 'user04',
    department: '마케팅팀',
    totalConversations: 12,
    monthlyTokens: '3,200',
    status: 'inactive',
  },
};

export const Suspended: Story = {
  args: {
    name: '박민수',
    userId: 'user06',
    department: '인사팀',
    totalConversations: 89,
    monthlyTokens: '0',
    status: 'suspended',
  },
};
