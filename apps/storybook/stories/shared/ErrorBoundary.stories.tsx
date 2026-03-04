import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ErrorFallback } from '@hchat/ui'

const meta: Meta<typeof ErrorFallback> = {
  title: 'Shared/ErrorBoundary',
  component: ErrorFallback,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ErrorFallback>

export const Default: Story = {
  args: {
    error: new Error('Something unexpected happened'),
    onRetry: () => window.location.reload(),
  },
}

export const CustomTitle: Story = {
  args: {
    title: '페이지를 불러올 수 없습니다',
    error: new Error('네트워크 연결이 끊어졌습니다'),
    onRetry: () => {},
  },
}

export const NoError: Story = {
  args: {
    onRetry: () => {},
  },
}
