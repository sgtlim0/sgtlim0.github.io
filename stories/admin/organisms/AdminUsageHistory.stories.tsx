import type { Meta, StoryObj } from '@storybook/react';
import AdminUsageHistory from '@/components/admin/AdminUsageHistory';

const meta: Meta<typeof AdminUsageHistory> = {
  title: 'Admin/Organisms/AdminUsageHistory',
  component: AdminUsageHistory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 1280, minHeight: 900, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminUsageHistory>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
