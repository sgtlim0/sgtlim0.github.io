import type { Meta, StoryObj } from '@storybook/react';
import AdminFeatureUsage from '@hchat/ui/admin/AdminFeatureUsage';

const meta: Meta<typeof AdminFeatureUsage> = {
  title: 'Admin/Enterprise/AdminFeatureUsage',
  component: AdminFeatureUsage,
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
type Story = StoryObj<typeof AdminFeatureUsage>;

export const Default: Story = {};
