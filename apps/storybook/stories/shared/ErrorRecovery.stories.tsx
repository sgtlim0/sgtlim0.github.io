import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import React from 'react'
import { ErrorRecovery } from '@hchat/ui'

const meta: Meta<typeof ErrorRecovery> = {
  title: 'Shared/ErrorRecovery',
  component: ErrorRecovery,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ErrorRecovery>

export const Default: Story = {
  args: {
    onExecute: async () => {
      // Simulate a successful operation
      await new Promise((resolve) => setTimeout(resolve, 200))
    },
    maxRetries: 3,
    children: ({ execute }) => (
      <button
        type="button"
        onClick={execute}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white"
      >
        Load Data
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByText('Load Data')
    await expect(button).toBeInTheDocument()

    // Click should succeed without showing error state
    await userEvent.click(button)

    // Button should still be available after success
    await waitFor(() => {
      expect(canvas.getByText('Load Data')).toBeInTheDocument()
    })
  },
}

export const AllRetriesExhausted: Story = {
  args: {
    onExecute: async () => {
      throw new Error('Network timeout')
    },
    maxRetries: 1,
    children: ({ execute }) => (
      <button
        type="button"
        onClick={execute}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white"
      >
        Fetch Data
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the button to trigger the failing operation
    await userEvent.click(canvas.getByText('Fetch Data'))

    // After all retries exhausted, error UI should appear
    await waitFor(
      () => {
        expect(canvas.getByText('Operation failed')).toBeInTheDocument()
        expect(canvas.getByText('Network timeout')).toBeInTheDocument()
        expect(canvas.getByText('Try Again')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  },
}
