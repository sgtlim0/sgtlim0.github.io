import type { Meta, StoryObj } from '@storybook/react';
import AdminStatistics from '@/components/admin/AdminStatistics';

const meta: Meta<typeof AdminStatistics> = {
  title: 'Admin/Organisms/AdminStatistics',
  component: AdminStatistics,
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
type Story = StoryObj<typeof AdminStatistics>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
