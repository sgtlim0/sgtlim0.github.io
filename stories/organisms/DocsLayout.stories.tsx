import type { Meta, StoryObj } from '@storybook/react';
import DocsLayout from '@/components/DocsLayout';
import { mockAIChatPage, mockChangelogPage, mockFAQPage, mockShortPage } from '../fixtures/pages';

const meta: Meta<typeof DocsLayout> = {
  title: 'Organisms/DocsLayout',
  component: DocsLayout,
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
type Story = StoryObj<typeof DocsLayout>;

export const AIChat: Story = {
  args: { page: mockAIChatPage },
};

export const Changelog: Story = {
  args: { page: mockChangelogPage },
};

export const NoBadges: Story = {
  args: { page: mockFAQPage },
};

export const ShortContent: Story = {
  args: { page: mockShortPage },
};
