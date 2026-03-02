import type { Meta, StoryObj } from '@storybook/react';
import NavGroupHeader from '@/components/NavGroupHeader';

const meta: Meta<typeof NavGroupHeader> = {
  title: 'Atoms/NavGroupHeader',
  component: NavGroupHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    isOpen: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof NavGroupHeader>;

export const Expanded: Story = {
  args: { title: 'AI 대화', isOpen: true },
};

export const Collapsed: Story = {
  args: { title: 'AI 대화', isOpen: false },
};
