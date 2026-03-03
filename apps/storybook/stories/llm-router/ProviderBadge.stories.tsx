import type { Meta, StoryObj } from '@storybook/react';
import ProviderBadge from '@hchat/ui/llm-router/ProviderBadge';

const meta: Meta<typeof ProviderBadge> = {
  title: 'LLM Router/Atoms/ProviderBadge',
  component: ProviderBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ProviderBadge>;

export const OpenAI: Story = { args: { provider: 'OpenAI', size: 'md' } };
export const Anthropic: Story = { args: { provider: 'Anthropic', size: 'md' } };
export const Google: Story = { args: { provider: 'Google', size: 'md' } };
export const Meta: Story = { args: { provider: 'Meta', size: 'md' } };
export const Mistral: Story = { args: { provider: 'Mistral', size: 'md' } };
export const DeepSeek: Story = { args: { provider: 'DeepSeek', size: 'md' } };
export const SmallSize: Story = { args: { provider: 'OpenAI', size: 'sm' } };
export const Unknown: Story = { args: { provider: 'Custom Provider', size: 'md' } };
