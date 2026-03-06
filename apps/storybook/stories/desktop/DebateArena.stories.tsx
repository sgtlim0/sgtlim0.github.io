import type { Meta, StoryObj } from '@storybook/react'
import { DebateArena } from '@hchat/ui/desktop'
import type { DebateParticipant } from '@hchat/ui/desktop'

const meta: Meta<typeof DebateArena> = {
  title: 'Desktop/DebateArena',
  component: DebateArena,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

const participants: DebateParticipant[] = [
  {
    id: 'participant-001',
    name: 'Claude',
    position: 'for',
    model: 'Claude 3.5 Sonnet',
    avatar: '🟣',
  },
  {
    id: 'participant-002',
    name: 'GPT',
    position: 'against',
    model: 'GPT-4o',
    avatar: '🟢',
  },
  {
    id: 'participant-003',
    name: 'Gemini',
    position: 'moderator',
    model: 'Gemini Pro',
    avatar: '🔵',
  },
]

const messages = [
  {
    id: 'debate-msg-001',
    participantId: 'participant-003',
    content:
      '오늘의 주제는 "AI 코드 생성이 개발자의 역할을 대체할 것인가"입니다. 먼저 찬성 측 의견을 들어보겠습니다.',
    round: 1,
    timestamp: 1709712000000,
  },
  {
    id: 'debate-msg-002',
    participantId: 'participant-001',
    content:
      'AI 코드 생성 기술은 반복적인 보일러플레이트 코드를 자동화하여 개발자가 더 높은 수준의 설계와 아키텍처에 집중할 수 있게 합니다. 이는 대체가 아닌 역할의 진화입니다.',
    round: 1,
    timestamp: 1709712060000,
  },
  {
    id: 'debate-msg-003',
    participantId: 'participant-002',
    content:
      '반대합니다. AI가 생성한 코드는 컨텍스트 이해가 부족하고, 보안 취약점을 포함할 수 있으며, 유지보수성이 떨어집니다. 개발자의 비판적 사고와 도메인 지식은 AI로 대체할 수 없습니다.',
    round: 1,
    timestamp: 1709712120000,
  },
  {
    id: 'debate-msg-004',
    participantId: 'participant-001',
    content:
      '최근 벤치마크에서 AI 모델은 SWE-bench에서 49%의 이슈를 자율적으로 해결했습니다. 이 수치는 매년 급격히 향상되고 있어, 일정 수준 이하의 코딩 작업은 충분히 자동화될 수 있음을 시사합니다.',
    round: 2,
    timestamp: 1709712180000,
  },
]

export const Default: Story = {
  args: {
    participants,
    messages,
    topic: 'AI 코드 생성이 개발자의 역할을 대체할 것인가',
    currentRound: 2,
    totalRounds: 3,
  },
}
