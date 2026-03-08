import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import { MobileChatList } from '@hchat/ui/mobile'
import type { MobileChat } from '@hchat/ui/mobile'

const mockChats: MobileChat[] = [
  { id: 'c1', title: '프로젝트 기획서 작성', lastMessage: '기획서 초안을 완성했습니다.', model: 'H Chat Pro', timestamp: Date.now() - 3_600_000, unread: true },
  { id: 'c2', title: '영어 이메일 번역', lastMessage: '번역 결과를 확인해주세요.', model: 'H Chat', timestamp: Date.now() - 7_200_000, unread: false },
]

const meta: Meta<typeof MobileChatList> = {
  title: 'Mobile/MobileChatList/Interactions',
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

export const RendersChats: Story = {
  args: { chats: mockChats },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('프로젝트 기획서 작성')).toBeInTheDocument()
    await expect(canvas.getByText('영어 이메일 번역')).toBeInTheDocument()
  },
}

export const ClickChat: Story = {
  args: { chats: mockChats, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const firstChat = canvas.getByText('프로젝트 기획서 작성')
    await userEvent.click(firstChat)
    await expect(args.onSelect).toHaveBeenCalledWith('c1')
  },
}
