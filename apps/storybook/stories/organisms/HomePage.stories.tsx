import type { Meta, StoryObj } from '@storybook/react';
import HomePage from '@/components/HomePage';

const meta: Meta<typeof HomePage> = {
  title: 'Organisms/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'wikiContent' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 1160, height: 900, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: 'Dark' },
  },
};
