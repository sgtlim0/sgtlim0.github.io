import type { Meta, StoryObj } from '@storybook/react';
import ThemeToggle from '@/components/ThemeToggle';
import ThemeProvider from '@/components/ThemeProvider';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Light: Story = {};
export const Dark: Story = {
  parameters: {
    themes: { themeOverride: 'Dark' },
  },
};
