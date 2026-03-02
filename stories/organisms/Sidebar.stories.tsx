import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/ThemeProvider';

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'wikiSidebar' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: 280, height: '100vh' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: 'Dark' },
  },
};
