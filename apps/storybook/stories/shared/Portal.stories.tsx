import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Portal } from '@hchat/ui'

function PortalDemo() {
  const [show, setShow] = useState(false)
  return (
    <div className="p-6">
      <p className="text-sm mb-4 text-gray-500">
        The portal content renders outside this container, at the end of document.body.
      </p>
      <button
        onClick={() => setShow((prev) => !prev)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        {show ? 'Hide Portal' : 'Show Portal'}
      </button>

      <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-400">This is the parent container boundary.</p>
      </div>

      {show && (
        <Portal>
          <div
            data-testid="portal-content"
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              padding: '16px 24px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: 14,
              zIndex: 9999,
            }}
          >
            I am rendered via Portal (outside React tree).
          </div>
        </Portal>
      )}
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Portal',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <PortalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Show portal
    await userEvent.click(canvas.getByText('Show Portal'))

    await waitFor(() => {
      const portalEl = document.querySelector('[data-testid="portal-content"]')
      expect(portalEl).toBeTruthy()
    })

    // Verify portal content is NOT inside the canvas (it's in document.body)
    const insideCanvas = canvasElement.querySelector('[data-testid="portal-content"]')
    expect(insideCanvas).toBeNull()

    // Hide portal
    await userEvent.click(canvas.getByText('Hide Portal'))

    await waitFor(() => {
      const portalEl = document.querySelector('[data-testid="portal-content"]')
      expect(portalEl).toBeNull()
    })
  },
}
