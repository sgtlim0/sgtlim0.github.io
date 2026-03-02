import type { Meta, StoryObj } from '@storybook/react';
import DataTable from '@/components/admin/DataTable';

const sampleRows = [
  { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' as const },
  { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' as const },
  { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' as const },
  { date: '2026-03-01', user: 'user05', type: 'AI 채팅', model: 'Claude 3.5', tokens: '5,300', cost: '₩27', status: 'success' as const },
  { date: '2026-02-28', user: 'user01', type: '에이전트', model: 'GPT-4', tokens: '12,400', cost: '₩62', status: 'pending' as const },
];

const meta: Meta<typeof DataTable> = {
  title: 'Admin/Molecules/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const UsageHistory: Story = { args: { rows: sampleRows } };
export const EmptyState: Story = { args: { rows: [] } };
export const SingleRow: Story = { args: { rows: [sampleRows[0]] } };
