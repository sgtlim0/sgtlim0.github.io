import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import { WorkflowNodeCard } from '@hchat/ui/admin'
import type { WorkflowNode } from '@hchat/ui/admin'

const sampleNode: WorkflowNode = {
  id: 'node-interact-1',
  type: 'llm',
  label: 'GPT-4o 호출',
  description: 'OpenAI GPT-4o 모델을 호출하여 응답을 생성합니다.',
  status: 'idle',
  config: {},
  position: { x: 100, y: 100 },
}

const meta: Meta<typeof WorkflowNodeCard> = {
  title: 'Admin/Workflows/WorkflowNodeCard/Interactions',
  component: WorkflowNodeCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 60 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const SelectNode: Story = {
  args: {
    node: sampleNode,
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button'))
    await expect(args.onSelect).toHaveBeenCalledWith('node-interact-1')
  },
}

export const DeleteNode: Story = {
  args: {
    node: sampleNode,
    onSelect: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const deleteBtn = canvas.getByTitle('삭제')
    await userEvent.click(deleteBtn)

    await expect(args.onDelete).toHaveBeenCalledWith('node-interact-1')
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

export const SelectedState: Story = {
  args: {
    node: sampleNode,
    selected: true,
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('GPT-4o 호출')).toBeInTheDocument()
    await expect(
      canvas.getByText('OpenAI GPT-4o 모델을 호출하여 응답을 생성합니다.'),
    ).toBeInTheDocument()
  },
}

export const RunningStatus: Story = {
  args: {
    node: { ...sampleNode, status: 'running' as const },
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('실행 중')).toBeInTheDocument()
  },
}

export const ErrorStatus: Story = {
  args: {
    node: { ...sampleNode, status: 'error' as const },
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('오류')).toBeInTheDocument()
  },
}

export const KeyboardNavigation: Story = {
  args: {
    node: sampleNode,
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const nodeCard = canvas.getByRole('button')

    nodeCard.focus()
    await userEvent.keyboard('{Enter}')

    await expect(args.onSelect).toHaveBeenCalledWith('node-interact-1')
  },
}
