import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import SubscriptionCard from '@hchat/ui/user/components/SubscriptionCard'
import { mockSubscription } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof SubscriptionCard> = {
  title: 'User/Atoms/SubscriptionCard/Interactions',
  component: SubscriptionCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof SubscriptionCard>

export const RendersPlanInfo: Story = {
  args: {
    subscription: mockSubscription,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(mockSubscription.planName)).toBeInTheDocument()
    await expect(canvas.getByText(mockSubscription.email)).toBeInTheDocument()
  },
}
