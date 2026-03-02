import type { Meta, StoryObj } from '@storybook/react';
import AdminSettings from '@/components/admin/AdminSettings';

const meta: Meta<typeof AdminSettings> = {
  title: 'Admin/Organisms/AdminSettings',
  component: AdminSettings,
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
type Story = StoryObj<typeof AdminSettings>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
