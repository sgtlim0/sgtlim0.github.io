import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import StatusBadge from '@hchat/ui/admin/StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Admin/Atoms/StatusBadge/Interactions',
  component: StatusBadge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const RendersSuccessLabel: Story = {
  args: { status: 'success' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('성공')).toBeInTheDocument()
  },
}

export const RendersCustomLabel: Story = {
  args: { status: 'success', label: '승인됨' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('승인됨')).toBeInTheDocument()
  },
}
