import type { Meta, StoryObj } from '@storybook/react'
import { MobileChatList } from '@hchat/ui/mobile'
import type { MobileChat } from '@hchat/ui/mobile'

const now = Date.now()
const hour = 3_600_000
const day = 86_400_000

const mockChats: MobileChat[] = [
  {
    id: 'c1',
    title: '프로젝트 기획서 작성',
    lastMessage: '기획서 초안을 완성했습니다.',
    model: 'H Chat Pro',
    timestamp: now - hour,
    unread: true,
  },
  {
    id: 'c2',
    title: '영어 이메일 번역',
    lastMessage: '번역 결과를 확인해주세요.',
    model: 'H Chat',
    timestamp: now - 2 * hour,
    unread: true,
  },
  {
    id: 'c3',
    title: 'Python 코드 리뷰',
    lastMessage: '몇 가지 개선 사항이 있습니다.',
    model: 'H Chat Code',
    timestamp: now - 4 * hour,
    unread: false,
  },
  {
    id: 'c4',
    title: '주간 보고서 요약',
    lastMessage: '요약본을 작성했습니다.',
    model: 'H Chat Pro',
    timestamp: now - day,
    unread: false,
  },
  {
    id: 'c5',
    title: '회의록 정리',
    lastMessage: '핵심 내용을 정리했습니다.',
    model: 'H Chat',
    timestamp: now - 2 * day,
    unread: false,
  },
]

const meta: Meta<typeof MobileChatList> = {
  title: 'Mobile/MobileChatList',
  component: MobileChatList,
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
    chats: mockChats,
  },
}

export const Empty: Story = {
  args: {
    chats: [],
  },
}
