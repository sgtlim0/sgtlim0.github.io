import type { Meta, StoryObj } from '@storybook/react';
import AdminAgentMonitoring from '@hchat/ui/admin/AdminAgentMonitoring';

const meta: Meta<typeof AdminAgentMonitoring> = {
  title: 'Admin/Enterprise/AdminAgentMonitoring',
  component: AdminAgentMonitoring,
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
type Story = StoryObj<typeof AdminAgentMonitoring>;

export const Default: Story = {};
