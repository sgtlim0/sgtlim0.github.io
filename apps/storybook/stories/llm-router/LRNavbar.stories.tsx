import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@hchat/ui';
import LRNavbar from '@hchat/ui/llm-router/LRNavbar';

const meta: Meta<typeof LRNavbar> = {
  title: 'LLM Router/Organisms/LRNavbar',
  component: LRNavbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LRNavbar>;

export const LoggedOut: Story = {
  args: { isAuthenticated: false },
};

export const LoggedIn: Story = {
  args: { isAuthenticated: true },
};
