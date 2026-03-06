import type { Meta, StoryObj } from '@storybook/react'
import { WorkflowNodeCard } from '@hchat/ui/admin'
import type { WorkflowNode } from '@hchat/ui/admin/services'

const mockNode: WorkflowNode = {
  id: 'n1',
  type: 'llm',
  label: 'GPT-4o 호출',
  description: 'AI 모델을 호출하여 응답을 생성합니다',
  position: { x: 0, y: 0 },
  config: { model: 'GPT-4o', temperature: 0.7 },
  status: 'idle',
}

const meta: Meta<typeof WorkflowNodeCard> = {
  title: 'Admin/Workflow/WorkflowNodeCard',
  component: WorkflowNodeCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 40 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    node: mockNode,
  },
}

export const Running: Story = {
  args: {
    node: { ...mockNode, status: 'running' },
  },
}

export const Success: Story = {
  args: {
    node: { ...mockNode, status: 'success' },
  },
}

export const Error: Story = {
  args: {
    node: { ...mockNode, status: 'error' },
  },
}

export const Selected: Story = {
  args: {
    node: mockNode,
    selected: true,
  },
}
