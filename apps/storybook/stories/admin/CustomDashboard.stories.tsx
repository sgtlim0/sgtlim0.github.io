import type { Meta, StoryObj } from '@storybook/react'
import { CustomDashboard } from '@hchat/ui/admin'

const meta: Meta<typeof CustomDashboard> = {
  title: 'Admin/Customize/CustomDashboard',
  component: CustomDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
