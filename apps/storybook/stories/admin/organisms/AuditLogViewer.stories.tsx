import type { Meta, StoryObj } from '@storybook/react';
import AuditLogViewer from '@hchat/ui/admin/AuditLogViewer';

const meta: Meta<typeof AuditLogViewer> = {
  title: 'Admin/Enterprise/AuditLogViewer',
  component: AuditLogViewer,
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
type Story = StoryObj<typeof AuditLogViewer>;

export const Default: Story = {};
