import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { ToastQueueProvider, useToastQueue2 } from '@hchat/ui'

function ToastDemo() {
  const { addToast } = useToastQueue2()
  return (
    <div className="flex flex-wrap gap-3 p-6">
      <button
        onClick={() => addToast({ type: 'success', title: 'Success!', description: 'Operation completed.' })}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
      >
        Success
      </button>
      <button
        onClick={() => addToast({ type: 'error', title: 'Error', description: 'Something went wrong.' })}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
      >
        Error
      </button>
      <button
        onClick={() => addToast({ type: 'warning', title: 'Warning', description: 'Please check your input.' })}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm"
      >
        Warning
      </button>
      <button
        onClick={() => addToast({ type: 'info', title: 'Info', description: 'New version is available.' })}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Info
      </button>
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/ToastContainer',
  decorators: [
    (Story) => (
      <ToastQueueProvider>
        <Story />
      </ToastQueueProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const FourTypes: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click all 4 toast type buttons
    await userEvent.click(canvas.getByText('Success'))
    await userEvent.click(canvas.getByText('Error'))
    await userEvent.click(canvas.getByText('Warning'))
    await userEvent.click(canvas.getByText('Info'))

    // Wait for toasts to appear in the document
    await waitFor(() => {
      const alerts = document.querySelectorAll('[role="alert"]')
      expect(alerts.length).toBeGreaterThanOrEqual(4)
    })
  },
}

export const DismissToast: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('Success'))

    await waitFor(() => {
      const alerts = document.querySelectorAll('[role="alert"]')
      expect(alerts.length).toBeGreaterThan(0)
    })

    // Find and click dismiss button
    const dismissBtn = document.querySelector('[aria-label="Dismiss notification"]')
    if (dismissBtn) {
      await userEvent.click(dismissBtn)
    }
  },
}
