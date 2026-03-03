import type { Meta, StoryObj } from '@storybook/react';
import AdminModelPricing from '@hchat/ui/admin/AdminModelPricing';

const meta: Meta<typeof AdminModelPricing> = {
  title: 'Admin/Enterprise/AdminModelPricing',
  component: AdminModelPricing,
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
type Story = StoryObj<typeof AdminModelPricing>;

export const Default: Story = {};
