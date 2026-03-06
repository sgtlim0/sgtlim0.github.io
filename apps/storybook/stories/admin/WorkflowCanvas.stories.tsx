import type { Meta, StoryObj } from '@storybook/react'
import { WorkflowCanvas } from '@hchat/ui/admin'
import type { WorkflowNode, WorkflowEdge } from '@hchat/ui/admin/services'

const mockNodes: WorkflowNode[] = [
  {
    id: 'n1',
    type: 'input',
    label: '사용자 입력',
    description: '텍스트 입력',
    position: { x: 200, y: 20 },
    config: { source: 'user' },
    status: 'idle',
  },
  {
    id: 'n2',
    type: 'llm',
    label: 'GPT-4o 분석',
    description: 'AI 분석',
    position: { x: 200, y: 160 },
    config: { model: 'GPT-4o' },
    status: 'idle',
  },
  {
    id: 'n3',
    type: 'transform',
    label: 'JSON 변환',
    description: '형식 변환',
    position: { x: 200, y: 300 },
    config: { format: 'json' },
    status: 'idle',
  },
  {
    id: 'n4',
    type: 'output',
    label: '결과 출력',
    description: '응답 반환',
    position: { x: 200, y: 440 },
    config: { destination: 'response' },
    status: 'idle',
  },
]

const mockEdges: WorkflowEdge[] = [
  { id: 'e1', sourceId: 'n1', targetId: 'n2' },
  { id: 'e2', sourceId: 'n2', targetId: 'n3' },
  { id: 'e3', sourceId: 'n3', targetId: 'n4' },
]

const meta: Meta<typeof WorkflowCanvas> = {
  title: 'Admin/Workflow/WorkflowCanvas',
  component: WorkflowCanvas,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 600 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    nodes: mockNodes,
    edges: mockEdges,
  },
}
