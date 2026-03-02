import type { Meta, StoryObj } from '@storybook/react';
import MonthPicker from '@hchat/ui/admin/MonthPicker';

const meta: Meta<typeof MonthPicker> = {
  title: 'Admin/Atoms/MonthPicker',
  component: MonthPicker,
  tags: ['autodocs'],
  argTypes: {
    year: { control: 'number' },
    month: { control: { type: 'number', min: 1, max: 12 } },
  },
};

export default meta;
type Story = StoryObj<typeof MonthPicker>;

export const Default: Story = { args: { year: 2026, month: 3 } };
export const January: Story = { args: { year: 2026, month: 1 } };
export const December: Story = { args: { year: 2025, month: 12 } };
