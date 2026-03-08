import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import AssistantCard from '@hchat/ui/user/components/AssistantCard'
import { mockAssistants } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof AssistantCard> = {
  title: 'User/Atoms/AssistantCard/Interactions',
  component: AssistantCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof AssistantCard>

export const ClickCard: Story = {
  args: {
    assistant: mockAssistants[0],
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const card = canvas.getByText(mockAssistants[0].name)
    await userEvent.click(card)
    await expect(args.onClick).toHaveBeenCalled()
  },
}

export const RendersAssistantInfo: Story = {
  args: {
    assistant: mockAssistants[0],
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(mockAssistants[0].name)).toBeInTheDocument()
    await expect(canvas.getByText(mockAssistants[0].description)).toBeInTheDocument()
  },
}
