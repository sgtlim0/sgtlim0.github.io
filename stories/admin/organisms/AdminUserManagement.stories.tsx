import type { Meta, StoryObj } from '@storybook/react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';

const meta: Meta<typeof AdminUserManagement> = {
  title: 'Admin/Organisms/AdminUserManagement',
  component: AdminUserManagement,
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
type Story = StoryObj<typeof AdminUserManagement>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
