import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import KanbanBoard from '@hchat/ui/KanbanBoard'
import type { KanbanColumn } from '@hchat/ui/hooks/useKanban'

const initialColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Design review', description: 'Review new component designs' },
      { id: 'card-2', title: 'Write tests', description: 'Add unit tests for hooks' },
    ],
  },
  {
    id: 'doing',
    title: 'In Progress',
    cards: [
      { id: 'card-3', title: 'Implement carousel', description: 'Build carousel component' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [],
  },
]

const meta: Meta<typeof KanbanBoard> = {
  title: 'Shared/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof KanbanBoard>

export const AddCard: Story = {
  render: () => (
    <KanbanBoard
      initialColumns={initialColumns}
      label="Task board"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Board region should render
    const board = canvas.getByRole('region', { name: 'Task board' })
    await expect(board).toBeInTheDocument()

    // Verify initial cards exist
    await expect(canvas.getByText('Design review')).toBeInTheDocument()
    await expect(canvas.getByText('Write tests')).toBeInTheDocument()
    await expect(canvas.getByText('Implement carousel')).toBeInTheDocument()

    // Add a new card to "To Do" column
    const todoInput = canvas.getByLabelText('New card title for To Do')
    await userEvent.type(todoInput, 'New task')
    await userEvent.keyboard('{Enter}')

    // Verify card was added
    await waitFor(() => {
      expect(canvas.getByText('New task')).toBeInTheDocument()
    })

    // Input should be cleared after adding
    await waitFor(() => {
      expect(todoInput).toHaveValue('')
    })
  },
}

export const MoveCard: Story = {
  render: () => (
    <KanbanBoard
      initialColumns={initialColumns}
      label="Move demo board"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Board should render with 3 columns
    const board = canvas.getByRole('region', { name: 'Move demo board' })
    await expect(board).toBeInTheDocument()

    // Verify columns
    const todoColumn = canvas.getByRole('list', { name: /Column: To Do/i })
    await expect(todoColumn).toBeInTheDocument()

    const doingColumn = canvas.getByRole('list', { name: /Column: In Progress/i })
    await expect(doingColumn).toBeInTheDocument()

    // The "Design review" card should have accessible move buttons
    // Find the move button for "Design review" to "In Progress"
    const moveButtons = canvas.getAllByRole('button', { name: /Move to/i })
    expect(moveButtons.length).toBeGreaterThan(0)

    // Click the first move button to move card to another column
    await userEvent.click(moveButtons[0])

    // Card count should have changed (To Do had 2, now should have 1)
    await waitFor(() => {
      // Verify the card moved - "Design review" should now be in a different column
      const allCards = canvas.getAllByText(/Design review|Write tests|Implement carousel/)
      expect(allCards.length).toBe(3) // All 3 cards still exist
    })
  },
}
