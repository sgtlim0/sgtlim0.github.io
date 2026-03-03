import type { Meta, StoryObj } from '@storybook/react';
import PriceCell from '@hchat/ui/llm-router/PriceCell';

const meta: Meta<typeof PriceCell> = {
  title: 'LLM Router/Atoms/PriceCell',
  component: PriceCell,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PriceCell>;

export const LowPrice: Story = {
  args: { price: 200 },
};

export const MediumPrice: Story = {
  args: { price: 3300 },
};

export const HighPrice: Story = {
  args: { price: 19800 },
};

export const CustomUnit: Story = {
  args: { price: 52800, unit: '/ 이미지' },
};
