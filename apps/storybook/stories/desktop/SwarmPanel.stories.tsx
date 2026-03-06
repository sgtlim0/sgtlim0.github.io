import type { Meta, StoryObj } from '@storybook/react'
import { SwarmPanel } from '@hchat/ui/desktop'
import type { SwarmAgent } from '@hchat/ui/desktop'

const meta: Meta<typeof SwarmPanel> = {
  title: 'Desktop/SwarmPanel',
  component: SwarmPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

const activeSwarmAgents: SwarmAgent[] = [
  {
    id: 'swarm-001',
    name: 'Planner',
    role: '작업 분해 및 계획 수립',
    model: 'GPT-4o',
    status: 'done',
    avatar: '🧠',
  },
  {
    id: 'swarm-002',
    name: 'Coder',
    role: '코드 구현 및 테스트 작성',
    model: 'Claude 3.5 Sonnet',
    status: 'responding',
    avatar: '💻',
  },
  {
    id: 'swarm-003',
    name: 'Reviewer',
    role: '코드 리뷰 및 품질 검증',
    model: 'GPT-4o',
    status: 'thinking',
    avatar: '🔍',
  },
  {
    id: 'swarm-004',
    name: 'Tester',
    role: 'E2E 테스트 및 검증',
    model: 'Gemini Pro',
    status: 'idle',
    avatar: '🧪',
  },
]

const completedSwarmAgents: SwarmAgent[] = [
  {
    id: 'swarm-001',
    name: 'Planner',
    role: '작업 분해 및 계획 수립',
    model: 'GPT-4o',
    status: 'done',
    avatar: '🧠',
  },
  {
    id: 'swarm-002',
    name: 'Coder',
    role: '코드 구현 및 테스트 작성',
    model: 'Claude 3.5 Sonnet',
    status: 'done',
    avatar: '💻',
  },
  {
    id: 'swarm-003',
    name: 'Reviewer',
    role: '코드 리뷰 및 품질 검증',
    model: 'GPT-4o',
    status: 'done',
    avatar: '🔍',
  },
  {
    id: 'swarm-004',
    name: 'Tester',
    role: 'E2E 테스트 및 검증',
    model: 'Gemini Pro',
    status: 'done',
    avatar: '🧪',
  },
]

export const Default: Story = {
  args: {
    agents: activeSwarmAgents,
    progress: 65,
  },
}

export const AllComplete: Story = {
  args: {
    agents: completedSwarmAgents,
    progress: 100,
  },
}
