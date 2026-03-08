import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import ProviderBadge from '@hchat/ui/llm-router/ProviderBadge'

const meta: Meta<typeof ProviderBadge> = {
  title: 'LLM Router/Atoms/ProviderBadge/Interactions',
  component: ProviderBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ProviderBadge>

export const RendersProviderName: Story = {
  args: { provider: 'OpenAI', size: 'md' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('OpenAI')).toBeInTheDocument()
  },
}

export const RendersSmallSize: Story = {
  args: { provider: 'Anthropic', size: 'sm' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Anthropic')).toBeInTheDocument()
  },
}
