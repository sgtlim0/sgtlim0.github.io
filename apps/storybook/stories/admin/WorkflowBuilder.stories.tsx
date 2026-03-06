import type { Meta, StoryObj } from '@storybook/react'
import { WorkflowBuilder } from '@hchat/ui/admin'

const meta: Meta<typeof WorkflowBuilder> = {
  title: 'Admin/Workflow/WorkflowBuilder',
  component: WorkflowBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
