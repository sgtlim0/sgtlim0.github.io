import type { Meta, StoryObj } from '@storybook/react';
import Badge from '@/components/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const V2: Story = { args: { label: 'v2' } };
export const V3: Story = { args: { label: 'v3' } };
export const CoreFeature: Story = { args: { label: '핵심 기능' } };
export const BeginnerGuide: Story = { args: { label: '초보자 가이드' } };
