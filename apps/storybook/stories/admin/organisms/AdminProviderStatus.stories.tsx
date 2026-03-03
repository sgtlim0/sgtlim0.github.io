import type { Meta, StoryObj } from '@storybook/react';
import AdminProviderStatus from '@hchat/ui/admin/AdminProviderStatus';

const meta: Meta<typeof AdminProviderStatus> = {
  title: 'Admin/Enterprise/AdminProviderStatus',
  component: AdminProviderStatus,
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
type Story = StoryObj<typeof AdminProviderStatus>;

export const Default: Story = {};
