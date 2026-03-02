import type { Meta, StoryObj } from '@storybook/react';
import SSOConfigPanel from '@hchat/ui/admin/SSOConfigPanel';

const meta: Meta<typeof SSOConfigPanel> = {
  title: 'Admin/Enterprise/SSOConfigPanel',
  component: SSOConfigPanel,
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
type Story = StoryObj<typeof SSOConfigPanel>;

export const Default: Story = {};
