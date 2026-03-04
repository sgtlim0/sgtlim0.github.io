import type { Meta, StoryObj } from '@storybook/react'
import MessageBubble from '@hchat/ui/user/components/MessageBubble'

const meta: Meta<typeof MessageBubble> = {
  title: 'User/Atoms/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof MessageBubble>

export const UserMessage: Story = {
  args: {
    message: {
      id: 'm1',
      role: 'user',
      content: '오늘 기획 회의 내용 정리해줘',
      timestamp: '2026-03-03T09:00:00Z',
    },
  },
}

export const AssistantMessage: Story = {
  args: {
    message: {
      id: 'm2',
      role: 'assistant',
      content:
        '네, 회의 내용을 정리해드리겠습니다.\n\n1. 프로젝트 일정 확인\n2. 담당자 배정\n3. 다음 회의 일정 조율',
      timestamp: '2026-03-03T09:00:05Z',
      assistantId: 'a1',
    },
  },
}

export const Streaming: Story = {
  args: {
    message: {
      id: 'm3',
      role: 'assistant',
      content: '분석 결과를 작성하고 있습니다',
      timestamp: '2026-03-03T09:01:00Z',
      assistantId: 'a1',
    },
    isStreaming: true,
  },
}

export const LongMessage: Story = {
  args: {
    message: {
      id: 'm4',
      role: 'assistant',
      content:
        '안녕하세요! H Chat AI 비서입니다.\n\n현재 지원하는 기능은 다음과 같습니다:\n\n- **AI 채팅**: GPT-4o, Claude Sonnet 등 최신 모델 활용\n- **문서 요약**: PDF, DOCX 등 다양한 형식 지원\n- **번역**: 50개 이상 언어 간 번역\n- **코드 리뷰**: 코드 품질 분석 및 개선 제안\n- **데이터 분석**: Excel/CSV 파일 분석\n\n더 자세한 내용이 필요하시면 말씀해주세요!',
      timestamp: '2026-03-03T09:02:00Z',
      assistantId: 'a1',
    },
  },
}
