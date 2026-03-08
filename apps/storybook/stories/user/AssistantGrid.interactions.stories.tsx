import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import AssistantGrid from '@hchat/ui/user/components/AssistantGrid'
import { mockAssistants } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof AssistantGrid> = {
  title: 'User/Organisms/AssistantGrid/Interactions',
  component: AssistantGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof AssistantGrid>

export const ClickAssistantCard: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'official',
    activeCategory: '전체',
    onTabChange: fn(),
    onCategoryChange: fn(),
    onSelectAssistant: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const firstCard = canvas.getByText(mockAssistants[0].name)
    await userEvent.click(firstCard)
    await expect(args.onSelectAssistant).toHaveBeenCalled()
  },
}

export const SwitchTab: Story = {
  args: {
    assistants: mockAssistants,
    activeTab: 'official',
    activeCategory: '전체',
    onTabChange: fn(),
    onCategoryChange: fn(),
    onSelectAssistant: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const customTab = canvas.getByText('커스텀')
    await userEvent.click(customTab)
    await expect(args.onTabChange).toHaveBeenCalledWith('custom')
  },
}
