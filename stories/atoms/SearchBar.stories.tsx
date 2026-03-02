import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from '@/components/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Atoms/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    shortcut: { control: 'text' },
  },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: { placeholder: '문서 검색...' },
};

export const CustomShortcut: Story = {
  args: { placeholder: 'Search docs...', shortcut: 'Ctrl+K' },
};
