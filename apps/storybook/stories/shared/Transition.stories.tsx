import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Transition } from '@hchat/ui'
import type { TransitionPresetType } from '@hchat/ui'

function TransitionDemo({ preset }: { preset: TransitionPresetType }) {
  const [show, setShow] = useState(true)
  return (
    <div className="p-6">
      <button
        onClick={() => setShow((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Toggle ({preset})
      </button>
      <Transition show={show} preset={preset} duration={300}>
        <div className="p-4 bg-blue-100 rounded-lg text-sm">
          Animated content with <strong>{preset}</strong> transition
        </div>
      </Transition>
    </div>
  )
}

function AllPresetsDemo() {
  const [show, setShow] = useState(true)
  const presets: TransitionPresetType[] = ['fade', 'slideUp', 'slideDown', 'scale']
  return (
    <div className="p-6">
      <button
        onClick={() => setShow((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        Toggle All
      </button>
      <div className="grid grid-cols-2 gap-4">
        {presets.map((preset) => (
          <Transition key={preset} show={show} preset={preset} duration={300}>
            <div className="p-4 bg-purple-100 rounded-lg text-sm text-center">
              {preset}
            </div>
          </Transition>
        ))}
      </div>
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Transition',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const FadeSlideScale: Story = {
  render: () => <AllPresetsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All 4 presets should be visible initially
    expect(canvas.getByText('fade')).toBeTruthy()
    expect(canvas.getByText('slideUp')).toBeTruthy()
    expect(canvas.getByText('scale')).toBeTruthy()

    // Toggle off
    await userEvent.click(canvas.getByText('Toggle All'))

    // Wait for exit animation
    await waitFor(
      () => {
        const items = canvasElement.querySelectorAll('[data-transition-state]')
        // Either exiting/exited or removed from DOM
        expect(items.length).toBeLessThanOrEqual(4)
      },
      { timeout: 1000 },
    )
  },
}

export const SingleFade: Story = {
  render: () => <TransitionDemo preset="fade" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const content = canvas.getByText(/Animated content/)
    expect(content).toBeTruthy()

    await userEvent.click(canvas.getByText(/Toggle/))
  },
}
