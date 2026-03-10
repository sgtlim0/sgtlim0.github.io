import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Modal } from '@hchat/ui'
import type { ModalSize } from '@hchat/ui'

function ModalDemo({ size = 'md' }: { size?: ModalSize }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="p-6">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Open {size} Modal
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={size} ariaLabelledBy="modal-title">
        <div className="p-6">
          <h2 id="modal-title" className="text-lg font-semibold mb-2">
            Modal ({size})
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This is a {size} modal dialog with focus trap and escape to close.
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

function StackedModalDemo() {
  const [first, setFirst] = useState(false)
  const [second, setSecond] = useState(false)
  return (
    <div className="p-6">
      <button
        onClick={() => setFirst(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Open First Modal
      </button>
      <Modal isOpen={first} onClose={() => setFirst(false)} size="md" ariaLabelledBy="first-title">
        <div className="p-6">
          <h2 id="first-title" className="text-lg font-semibold mb-2">First Modal</h2>
          <p className="text-sm text-gray-600 mb-4">Click below to open a nested modal.</p>
          <button
            onClick={() => setSecond(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
          >
            Open Second Modal
          </button>
        </div>
      </Modal>
      <Modal isOpen={second} onClose={() => setSecond(false)} size="sm" ariaLabelledBy="second-title">
        <div className="p-6">
          <h2 id="second-title" className="text-lg font-semibold mb-2">Second Modal</h2>
          <p className="text-sm text-gray-600 mb-4">This is a stacked modal.</p>
          <button
            onClick={() => setSecond(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Modal',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const SizeVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <ModalDemo size="sm" />
      <ModalDemo size="md" />
      <ModalDemo size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the "md" modal
    await userEvent.click(canvas.getByText('Open md Modal'))

    await waitFor(() => {
      const dialog = document.querySelector('[data-testid="modal-dialog"]')
      expect(dialog).toBeTruthy()
    })

    // Close by clicking close button
    const closeBtn = document.querySelector('[data-testid="modal-dialog"] button')
    if (closeBtn) {
      await userEvent.click(closeBtn)
    }

    await waitFor(() => {
      const dialog = document.querySelector('[data-testid="modal-dialog"]')
      expect(dialog).toBeNull()
    })
  },
}

export const StackedModals: Story = {
  render: () => <StackedModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open first modal
    await userEvent.click(canvas.getByText('Open First Modal'))

    await waitFor(() => {
      const dialogs = document.querySelectorAll('[data-testid="modal-dialog"]')
      expect(dialogs.length).toBe(1)
    })

    // Open second modal
    const secondBtn = document.querySelector('[data-testid="modal-dialog"] button')
    if (secondBtn && secondBtn.textContent === 'Open Second Modal') {
      await userEvent.click(secondBtn)
    }
  },
}
