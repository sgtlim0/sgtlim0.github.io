import type { Meta, StoryObj } from '@storybook/react';
import StatCard from '@hchat/ui/admin/StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Admin/Atoms/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const TotalConversations: Story = { args: { label: '총 대화 수', value: '1,247' } };
export const TotalTokens: Story = { args: { label: '총 토큰 사용량', value: '2.4M' } };
export const WithTrendUp: Story = { args: { label: '이번 달 비용', value: '₩127K', trend: '12% 전월 대비', trendUp: true } };
export const WithTrendDown: Story = { args: { label: '활성 사용자', value: '38', trend: '5% 감소', trendUp: false } };
