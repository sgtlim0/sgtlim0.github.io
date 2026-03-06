import type { Meta, StoryObj } from '@storybook/react'
import { MobileAssistantList } from '@hchat/ui/mobile'
import type { MobileAssistant } from '@hchat/ui/mobile'

const mockAssistants: MobileAssistant[] = [
  {
    id: 'a1',
    name: '범용 어시스턴트',
    description: '다양한 질문에 답변하는 기본 AI 비서',
    icon: '💬',
    category: '일반',
    isFavorite: true,
  },
  {
    id: 'a2',
    name: '코드 도우미',
    description: '코드 작성, 리뷰, 디버깅 전문',
    icon: '💻',
    category: '코딩',
    isFavorite: true,
  },
  {
    id: 'a3',
    name: '글쓰기 코치',
    description: '문서 작성과 교정을 도와주는 비서',
    icon: '✍️',
    category: '글쓰기',
    isFavorite: false,
  },
  {
    id: 'a4',
    name: '번역 전문가',
    description: '다국어 번역 및 현지화 지원',
    icon: '🌐',
    category: '번역',
    isFavorite: false,
  },
  {
    id: 'a5',
    name: '데이터 분석가',
    description: '데이터 해석과 시각화 추천',
    icon: '📊',
    category: '분석',
    isFavorite: false,
  },
  {
    id: 'a6',
    name: 'API 설계자',
    description: 'REST/GraphQL API 설계 전문',
    icon: '🔧',
    category: '코딩',
    isFavorite: false,
  },
]

const meta: Meta<typeof MobileAssistantList> = {
  title: 'Mobile/MobileAssistantList',
  component: MobileAssistantList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', maxWidth: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    assistants: mockAssistants,
  },
}
