import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from '@hchat/ui'
import type { DrawerPlacement } from '@hchat/ui'

function DrawerDemo({ placement = 'right', size = 'md' }: { placement?: DrawerPlacement; size?: 'sm' | 'md' | 'lg' | 'full' }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="p-6">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
      >
        Open {placement} drawer
      </button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement={placement}
        size={size}
        ariaLabel={`${placement} drawer`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          {placement.charAt(0).toUpperCase() + placement.slice(1)} Drawer
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This drawer slides in from the <strong>{placement}</strong> side
            with size <strong>{size}</strong>.
          </p>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm">
                Content item {i + 1}
              </div>
            ))}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </DrawerFooter>
      </Drawer>
    </div>
  )
}

function AllDirectionsDemo() {
  const [openDrawer, setOpenDrawer] = useState<DrawerPlacement | null>(null)
  const placements: DrawerPlacement[] = ['left', 'right', 'top', 'bottom']
  return (
    <div className="flex gap-3 p-6">
      {placements.map((p) => (
        <button
          key={p}
          onClick={() => setOpenDrawer(p)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          {p}
        </button>
      ))}
      {placements.map((p) => (
        <Drawer
          key={p}
          isOpen={openDrawer === p}
          onClose={() => setOpenDrawer(null)}
          placement={p}
          size="sm"
          ariaLabel={`${p} drawer`}
        >
          <DrawerHeader onClose={() => setOpenDrawer(null)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm">Drawer from the {p}.</p>
          </DrawerBody>
        </Drawer>
      ))}
    </div>
  )
}

function SizeDemo() {
  const [openSize, setOpenSize] = useState<string | null>(null)
  const sizes = ['sm', 'md', 'lg'] as const
  return (
    <div className="flex gap-3 p-6">
      {sizes.map((s) => (
        <button
          key={s}
          onClick={() => setOpenSize(s)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          {s.toUpperCase()}
        </button>
      ))}
      {sizes.map((s) => (
        <Drawer
          key={s}
          isOpen={openSize === s}
          onClose={() => setOpenSize(null)}
          placement="right"
          size={s}
          ariaLabel={`${s} drawer`}
        >
          <DrawerHeader onClose={() => setOpenSize(null)}>
            Size: {s.toUpperCase()}
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm">This is a {s} drawer.</p>
          </DrawerBody>
        </Drawer>
      ))}
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Drawer',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const FourDirections: Story = {
  render: () => <AllDirectionsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click "right" button to open drawer
    const rightBtn = canvas.getByText('right')
    await userEvent.click(rightBtn)

    await waitFor(() => {
      const panel = document.querySelector('[data-testid="drawer-panel"]')
      expect(panel).toBeTruthy()
      expect(panel?.getAttribute('data-placement')).toBe('right')
    })

    // Close via close button
    const closeBtn = document.querySelector('[data-testid="drawer-close-button"]')
    if (closeBtn) {
      await userEvent.click(closeBtn)

      await waitFor(() => {
        const panel = document.querySelector('[data-testid="drawer-panel"]')
        expect(panel).toBeNull()
      }, { timeout: 1000 })
    }
  },
}

export const Sizes: Story = {
  render: () => <SizeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open MD drawer
    const mdBtn = canvas.getByText('MD')
    await userEvent.click(mdBtn)

    await waitFor(() => {
      const panel = document.querySelector('[data-testid="drawer-panel"]')
      expect(panel).toBeTruthy()
    })

    // Close via backdrop
    const backdrop = document.querySelector('[data-testid="drawer-backdrop"]')
    if (backdrop) {
      await userEvent.click(backdrop)

      await waitFor(() => {
        const panel = document.querySelector('[data-testid="drawer-panel"]')
        expect(panel).toBeNull()
      }, { timeout: 1000 })
    }
  },
}
