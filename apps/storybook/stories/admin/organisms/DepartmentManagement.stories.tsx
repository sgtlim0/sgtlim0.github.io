import type { Meta, StoryObj } from '@storybook/react';
import DepartmentManagement from '@hchat/ui/admin/DepartmentManagement';

const meta: Meta<typeof DepartmentManagement> = {
  title: 'Admin/Enterprise/DepartmentManagement',
  component: DepartmentManagement,
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
type Story = StoryObj<typeof DepartmentManagement>;

export const Default: Story = {};
