import type { Meta, StoryObj } from '@storybook/react';
import AdminDashboard from '@hchat/ui/admin/AdminDashboard';

const meta: Meta<typeof AdminDashboard> = {
  title: 'Admin/Organisms/AdminDashboard',
  component: AdminDashboard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 1280, minHeight: 800, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminDashboard>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
