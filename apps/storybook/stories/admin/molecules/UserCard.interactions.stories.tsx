import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import UserCard from '@hchat/ui/admin/UserCard'

const meta: Meta<typeof UserCard> = {
  title: 'Admin/Molecules/UserCard/Interactions',
  component: UserCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof UserCard>

export const RendersUserInfo: Story = {
  args: {
    name: '김철수',
    userId: 'user01',
    department: 'AI혁신팀',
    totalConversations: 245,
    monthlyTokens: '125,000',
    status: 'active',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('김철수')).toBeInTheDocument()
    await expect(canvas.getByText('AI혁신팀')).toBeInTheDocument()
    await expect(canvas.getByText('125,000')).toBeInTheDocument()
  },
}
