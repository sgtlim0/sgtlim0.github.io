import type { Meta, StoryObj } from '@storybook/react';
import PillButton from '@hchat/ui/hmg/PillButton';

const meta: Meta<typeof PillButton> = {
  title: 'HMG/Atoms/PillButton',
  component: PillButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outline', 'navy', 'teal'] },
  },
};
export default meta;
type Story = StoryObj<typeof PillButton>;

export const Outline: Story = { args: { children: '자세히 보기', variant: 'outline' } };
export const Navy: Story = { args: { children: '빠른 시작 가이드', variant: 'navy' } };
export const Teal: Story = { args: { children: '문서 전체 보기', variant: 'teal' } };
