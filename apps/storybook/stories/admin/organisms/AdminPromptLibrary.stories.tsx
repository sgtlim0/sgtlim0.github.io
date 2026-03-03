import type { Meta, StoryObj } from '@storybook/react';
import AdminPromptLibrary from '@hchat/ui/admin/AdminPromptLibrary';

const meta: Meta<typeof AdminPromptLibrary> = {
  title: 'Admin/Enterprise/AdminPromptLibrary',
  component: AdminPromptLibrary,
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
type Story = StoryObj<typeof AdminPromptLibrary>;

export const Default: Story = {};
