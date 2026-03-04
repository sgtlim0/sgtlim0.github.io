import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import LoginPage from '@hchat/ui/admin/LoginPage'
import { AuthProvider } from '@hchat/ui/admin/auth/AuthProvider'

const meta: Meta<typeof LoginPage> = {
  title: 'Admin/Pages/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/login' } },
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof LoginPage>

export const Default: Story = {}
