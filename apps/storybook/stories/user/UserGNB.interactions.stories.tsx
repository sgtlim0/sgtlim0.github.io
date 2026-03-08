import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import UserGNB from '@hchat/ui/user/components/UserGNB'

const meta: Meta<typeof UserGNB> = {
  title: 'User/Atoms/UserGNB/Interactions',
  component: UserGNB,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof UserGNB>

export const RendersActiveTab: Story = {
  args: {
    activeTab: 'chat',
    userEmail: 'wooggi@gmail.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('wooggi@gmail.com')).toBeInTheDocument()
  },
}

export const RendersNavLinks: Story = {
  args: {
    activeTab: 'docs',
    userEmail: 'user@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('user@example.com')).toBeInTheDocument()
  },
}
