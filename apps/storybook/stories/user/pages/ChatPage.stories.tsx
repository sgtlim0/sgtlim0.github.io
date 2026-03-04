import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ChatPage from '@hchat/ui/user/pages/ChatPage'

const meta: Meta<typeof ChatPage> = {
  title: 'User/Pages/ChatPage',
  component: ChatPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/chat' } },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ChatPage>

export const Default: Story = {}
