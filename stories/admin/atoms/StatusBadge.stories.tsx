import type { Meta, StoryObj } from '@storybook/react';
import StatusBadge from '@/components/admin/StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Admin/Atoms/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['success', 'error', 'pending'] },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Success: Story = { args: { status: 'success' } };
export const Error: Story = { args: { status: 'error' } };
export const Pending: Story = { args: { status: 'pending' } };
export const CustomLabel: Story = { args: { status: 'success', label: '승인됨' } };
