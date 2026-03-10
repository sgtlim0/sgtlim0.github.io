import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import React, { useState } from 'react'
import { ShortcutHelp } from '@hchat/ui'
import type { ShortcutGroup } from '@hchat/ui'

const sampleGroups: ShortcutGroup[] = [
  {
    category: 'Navigation',
    shortcuts: [
      { key: 'mod+/', description: 'Open search', category: 'Navigation', enabled: true },
      { key: 'mod+shift+p', description: 'Go to page', category: 'Navigation', enabled: true },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { key: 'mod+s', description: 'Save document', category: 'Actions', enabled: true },
      { key: 'mod+shift+z', description: 'Redo', category: 'Actions', enabled: true },
      { key: 'mod+d', description: 'Duplicate', category: 'Actions', enabled: false },
    ],
  },
  {
    category: 'Settings',
    shortcuts: [
      { key: 'mod+,', description: 'Open settings', category: 'Settings', enabled: true },
    ],
  },
]

function ShortcutHelpDemo() {
  const [isOpen, setIsOpen] = useState(true)
  const [query, setQuery] = useState('')

  const filteredGroups = query
    ? sampleGroups
        .map((g) => ({
          ...g,
          shortcuts: g.shortcuts.filter(
            (s) =>
              s.description.toLowerCase().includes(query.toLowerCase()) ||
              s.key.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((g) => g.shortcuts.length > 0)
    : sampleGroups

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open Shortcuts
      </button>
      <ShortcutHelp
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={filteredGroups}
        query={query}
        onQueryChange={setQuery}
      />
    </>
  )
}

const meta: Meta<typeof ShortcutHelp> = {
  title: 'Shared/ShortcutHelp',
  component: ShortcutHelp,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ShortcutHelp>

export const Default: Story = {
  render: () => <ShortcutHelpDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Dialog should be open by default
    const dialog = canvas.getByRole('dialog')
    await expect(dialog).toBeInTheDocument()

    // All category headings visible
    await expect(canvas.getByText('Navigation')).toBeInTheDocument()
    await expect(canvas.getByText('Actions')).toBeInTheDocument()
    await expect(canvas.getByText('Settings')).toBeInTheDocument()

    // Shortcut descriptions visible
    await expect(canvas.getByText('Open search')).toBeInTheDocument()
    await expect(canvas.getByText('Save document')).toBeInTheDocument()
  },
}

export const SearchFilter: Story = {
  render: () => <ShortcutHelpDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Type in the search box
    const searchInput = canvas.getByPlaceholderText('Search shortcuts...')
    await userEvent.type(searchInput, 'save')

    // Only "Save document" should remain visible
    await expect(canvas.getByText('Save document')).toBeInTheDocument()
    await expect(canvas.queryByText('Open search')).not.toBeInTheDocument()
    await expect(canvas.queryByText('Open settings')).not.toBeInTheDocument()
  },
}
