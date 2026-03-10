import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Popover } from '@hchat/ui'

function ClickTriggerDemo() {
  return (
    <div className="p-12 flex justify-center">
      <Popover
        content={
          <div style={{ padding: '8px 0' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Popover Menu</p>
            <button
              type="button"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '4px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                borderRadius: '4px',
              }}
            >
              Edit
            </button>
            <button
              type="button"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '4px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                borderRadius: '4px',
                color: '#ef4444',
              }}
            >
              Delete
            </button>
          </div>
        }
        placement="bottom"
        trigger="click"
      >
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Click to open
        </button>
      </Popover>
    </div>
  )
}

function HoverTriggerDemo() {
  return (
    <div className="p-12 flex justify-center">
      <Popover
        content={
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px' }}>
              User Info
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              admin@hchat.ai
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
              Role: Administrator
            </p>
          </div>
        }
        placement="bottom"
        trigger="hover"
      >
        <button
          type="button"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
        >
          Hover over me
        </button>
      </Popover>
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Popover',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const ClickTrigger: Story = {
  render: () => <ClickTriggerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const trigger = canvas.getByText('Click to open')
    await expect(trigger).toBeInTheDocument()

    // Open popover
    await userEvent.click(trigger)

    await waitFor(() => {
      const popover = document.querySelector('[data-testid="popover"]')
      expect(popover).toBeTruthy()
    })

    // Verify interactive content rendered
    await waitFor(() => {
      const popover = document.querySelector('[data-testid="popover"]')
      expect(popover?.textContent).toContain('Popover Menu')
      expect(popover?.textContent).toContain('Edit')
      expect(popover?.textContent).toContain('Delete')
    })
  },
}

export const HoverTrigger: Story = {
  render: () => <HoverTriggerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const trigger = canvas.getByText('Hover over me')
    await expect(trigger).toBeInTheDocument()

    // Hover to open
    await userEvent.hover(trigger)

    await waitFor(() => {
      const popover = document.querySelector('[data-testid="popover"]')
      expect(popover).toBeTruthy()
    })

    // Verify content
    await waitFor(() => {
      const popover = document.querySelector('[data-testid="popover"]')
      expect(popover?.textContent).toContain('User Info')
      expect(popover?.textContent).toContain('admin@hchat.ai')
    })
  },
}
