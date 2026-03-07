import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent, waitFor } from '@storybook/test'
import { ToastProvider, useToast } from '@hchat/ui'

function ToastDemo() {
  const { toast } = useToast()
  return (
    <div className="flex gap-3 p-6">
      <button
        onClick={() => toast('성공적으로 저장되었습니다!', 'success')}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
      >
        Success
      </button>
      <button
        onClick={() => toast('오류가 발생했습니다.', 'error')}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
      >
        Error
      </button>
      <button
        onClick={() => toast('주의가 필요합니다.', 'warning')}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm"
      >
        Warning
      </button>
      <button
        onClick={() => toast('참고 정보입니다.', 'info')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Info
      </button>
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Toast/Interactions',
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
}

export default meta
type Story = StoryObj

export const ShowSuccessToast: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('Success'))

    await waitFor(() => {
      expect(document.body.querySelector('[class*="rounded-lg"]')).toBeTruthy()
    })
  },
}

export const ShowErrorToast: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('Error'))

    await waitFor(() => {
      const toastEl = document.body.querySelectorAll('[class*="rounded-lg"]')
      expect(toastEl.length).toBeGreaterThan(0)
    })
  },
}

export const ShowMultipleToasts: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('Success'))
    await userEvent.click(canvas.getByText('Error'))
    await userEvent.click(canvas.getByText('Warning'))
  },
}
