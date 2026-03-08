import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within, userEvent } from '@storybook/test'
import LoginPage from '@hchat/ui/admin/LoginPage'
import { AuthProvider } from '@hchat/ui/admin/auth/AuthProvider'

const meta: Meta<typeof LoginPage> = {
  title: 'Admin/Pages/LoginPage/Interactions',
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

export const FillLoginForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const emailInput = canvas.getByLabelText('이메일')
    const passwordInput = canvas.getByLabelText('비밀번호')

    await userEvent.type(emailInput, 'admin@hchat.ai')
    await userEvent.type(passwordInput, 'Admin123!')

    await expect(emailInput).toHaveValue('admin@hchat.ai')
    await expect(passwordInput).toHaveValue('Admin123!')
  },
}

export const EmptyFormValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const loginButton = canvas.getByRole('button', { name: '로그인' })
    await userEvent.click(loginButton)

    await expect(canvas.getByText('이메일과 비밀번호를 입력해주세요.')).toBeInTheDocument()
  },
}

export const RememberMeCheckbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const checkbox = canvas.getByLabelText('로그인 상태 유지')
    await expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
  },
}
