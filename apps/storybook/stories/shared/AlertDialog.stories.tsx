import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { AlertDialog } from '@hchat/ui'

function ConfirmDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Open Confirm
      </button>
      {result && (
        <p data-testid="dialog-result" className="mt-2 text-sm text-gray-600">
          Result: {result}
        </p>
      )}
      <AlertDialog
        isOpen={isOpen}
        title="변경사항 저장"
        message="변경사항을 저장하시겠습니까?"
        variant="confirm"
        confirmLabel="저장"
        cancelLabel="취소"
        onConfirm={() => { setIsOpen(false); setResult('confirmed') }}
        onCancel={() => { setIsOpen(false); setResult('cancelled') }}
      />
    </div>
  )
}

function DangerDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
      >
        Open Danger
      </button>
      {result && (
        <p data-testid="danger-result" className="mt-2 text-sm text-gray-600">
          Result: {result}
        </p>
      )}
      <AlertDialog
        isOpen={isOpen}
        title="항목 삭제"
        message="이 작업은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"
        variant="danger"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => { setIsOpen(false); setResult('deleted') }}
        onCancel={() => { setIsOpen(false); setResult('cancelled') }}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/AlertDialog',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Confirm: Story = {
  render: () => <ConfirmDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the dialog
    await userEvent.click(canvas.getByText('Open Confirm'))

    await waitFor(() => {
      const panel = document.querySelector('[data-testid="alertdialog-panel"]')
      expect(panel).toBeTruthy()
    })

    // Verify title and message
    const title = document.querySelector('[data-testid="alertdialog-title"]')
    await expect(title).toHaveTextContent('변경사항 저장')

    // Click confirm
    const confirmBtn = document.querySelector('[data-testid="alertdialog-confirm"]')
    if (confirmBtn) {
      await userEvent.click(confirmBtn)
    }

    // Dialog should close, result should display
    await waitFor(() => {
      const panel = document.querySelector('[data-testid="alertdialog-panel"]')
      expect(panel).toBeNull()
    })

    await expect(canvas.getByTestId('dialog-result')).toHaveTextContent('confirmed')
  },
}

export const Danger: Story = {
  render: () => <DangerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the danger dialog
    await userEvent.click(canvas.getByText('Open Danger'))

    await waitFor(() => {
      const panel = document.querySelector('[data-testid="alertdialog-panel"]')
      expect(panel).toBeTruthy()
    })

    // Verify danger icon is present
    const icon = document.querySelector('[data-testid="alertdialog-icon"]')
    await expect(icon).toBeTruthy()

    // Cancel the dialog
    const cancelBtn = document.querySelector('[data-testid="alertdialog-cancel"]')
    if (cancelBtn) {
      await userEvent.click(cancelBtn)
    }

    await waitFor(() => {
      const panel = document.querySelector('[data-testid="alertdialog-panel"]')
      expect(panel).toBeNull()
    })

    await expect(canvas.getByTestId('danger-result')).toHaveTextContent('cancelled')
  },
}
