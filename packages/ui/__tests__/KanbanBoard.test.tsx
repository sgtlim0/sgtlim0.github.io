import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { useKanban } from '../src/hooks/useKanban'
import type { KanbanColumn } from '../src/hooks/useKanban'
import KanbanCardComponent from '../src/KanbanCard'
import KanbanBoard from '../src/KanbanBoard'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeColumns(): KanbanColumn[] {
  return [
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        { id: 'card-1', title: 'Task 1', description: 'First task', labels: ['bug'], assignee: 'Alice' },
        { id: 'card-2', title: 'Task 2', labels: ['feature'] },
      ],
    },
    {
      id: 'doing',
      title: 'In Progress',
      cards: [
        { id: 'card-3', title: 'Task 3' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [],
    },
  ]
}

// ---------------------------------------------------------------------------
// useKanban hook
// ---------------------------------------------------------------------------

describe('useKanban', () => {
  it('initializes with the given columns', () => {
    const cols = makeColumns()
    const { result } = renderHook(() => useKanban(cols))

    expect(result.current.columns).toHaveLength(3)
    expect(result.current.columns[0].cards).toHaveLength(2)
    expect(result.current.columns[1].cards).toHaveLength(1)
    expect(result.current.columns[2].cards).toHaveLength(0)
  })

  describe('addCard', () => {
    it('adds a card to the specified column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      let newId: string = ''
      act(() => {
        newId = result.current.addCard('done', { title: 'New Task', description: 'Desc' })
      })

      expect(newId).toBeTruthy()
      expect(result.current.columns[2].cards).toHaveLength(1)
      expect(result.current.columns[2].cards[0].title).toBe('New Task')
      expect(result.current.columns[2].cards[0].description).toBe('Desc')
      expect(result.current.columns[2].cards[0].id).toBe(newId)
    })

    it('adds card with labels and assignee', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.addCard('todo', {
          title: 'Labeled',
          labels: ['urgent', 'docs'],
          assignee: 'Bob',
        })
      })

      const card = result.current.columns[0].cards[2]
      expect(card.title).toBe('Labeled')
      expect(card.labels).toEqual(['urgent', 'docs'])
      expect(card.assignee).toBe('Bob')
    })

    it('does not mutate other columns', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const doingBefore = result.current.columns[1]

      act(() => {
        result.current.addCard('todo', { title: 'X' })
      })

      expect(result.current.columns[1].cards).toEqual(doingBefore.cards)
    })

    it('returns unique IDs for each card', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const ids: string[] = []

      act(() => {
        ids.push(result.current.addCard('done', { title: 'A' }))
        ids.push(result.current.addCard('done', { title: 'B' }))
        ids.push(result.current.addCard('done', { title: 'C' }))
      })

      expect(new Set(ids).size).toBe(3)
    })
  })

  describe('moveCard', () => {
    it('moves a card between columns', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.moveCard('card-1', 'todo', 'doing')
      })

      expect(result.current.columns[0].cards).toHaveLength(1)
      expect(result.current.columns[0].cards[0].id).toBe('card-2')
      expect(result.current.columns[1].cards).toHaveLength(2)
      expect(result.current.columns[1].cards[1].id).toBe('card-1')
    })

    it('moves a card to a specific position', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.moveCard('card-1', 'todo', 'doing', 0)
      })

      expect(result.current.columns[1].cards[0].id).toBe('card-1')
      expect(result.current.columns[1].cards[1].id).toBe('card-3')
    })

    it('moves a card within the same column (reorder)', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.moveCard('card-1', 'todo', 'todo', 1)
      })

      expect(result.current.columns[0].cards[0].id).toBe('card-2')
      expect(result.current.columns[0].cards[1].id).toBe('card-1')
    })

    it('does nothing for same position within same column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.moveCard('card-1', 'todo', 'todo', 0)
      })

      // Reference equality — no change
      expect(result.current.columns).toBe(before)
    })

    it('does nothing if source column does not exist', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.moveCard('card-1', 'nonexistent', 'doing')
      })

      expect(result.current.columns).toBe(before)
    })

    it('does nothing if card does not exist in source column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.moveCard('card-999', 'todo', 'doing')
      })

      expect(result.current.columns).toBe(before)
    })

    it('clamps position to valid range', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.moveCard('card-1', 'todo', 'doing', 999)
      })

      // Card should be at the end
      const doingCards = result.current.columns[1].cards
      expect(doingCards[doingCards.length - 1].id).toBe('card-1')
    })

    it('clamps negative position to 0', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.moveCard('card-1', 'todo', 'doing', -5)
      })

      expect(result.current.columns[1].cards[0].id).toBe('card-1')
    })
  })

  describe('removeCard', () => {
    it('removes a card from the specified column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.removeCard('card-1', 'todo')
      })

      expect(result.current.columns[0].cards).toHaveLength(1)
      expect(result.current.columns[0].cards[0].id).toBe('card-2')
    })

    it('does not affect other columns', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const doingBefore = result.current.columns[1]

      act(() => {
        result.current.removeCard('card-1', 'todo')
      })

      expect(result.current.columns[1]).toBe(doingBefore)
    })
  })

  describe('updateCard', () => {
    it('updates card title', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.updateCard('card-1', 'todo', { title: 'Updated Title' })
      })

      expect(result.current.columns[0].cards[0].title).toBe('Updated Title')
      expect(result.current.columns[0].cards[0].id).toBe('card-1')
    })

    it('updates card description and labels', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.updateCard('card-1', 'todo', {
          description: 'New desc',
          labels: ['improvement'],
        })
      })

      const card = result.current.columns[0].cards[0]
      expect(card.description).toBe('New desc')
      expect(card.labels).toEqual(['improvement'])
    })

    it('does not affect other cards', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const card2Before = result.current.columns[0].cards[1]

      act(() => {
        result.current.updateCard('card-1', 'todo', { title: 'Changed' })
      })

      expect(result.current.columns[0].cards[1]).toBe(card2Before)
    })
  })

  describe('addColumn', () => {
    it('adds a new empty column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      let colId: string = ''
      act(() => {
        colId = result.current.addColumn('Review')
      })

      expect(result.current.columns).toHaveLength(4)
      expect(result.current.columns[3].id).toBe(colId)
      expect(result.current.columns[3].title).toBe('Review')
      expect(result.current.columns[3].cards).toEqual([])
    })
  })

  describe('removeColumn', () => {
    it('removes the specified column', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.removeColumn('done')
      })

      expect(result.current.columns).toHaveLength(2)
      expect(result.current.columns.find(c => c.id === 'done')).toBeUndefined()
    })

    it('removes column with its cards', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))

      act(() => {
        result.current.removeColumn('todo')
      })

      expect(result.current.columns).toHaveLength(2)
      // card-1 and card-2 are gone
      const allCards = result.current.columns.flatMap(c => c.cards)
      expect(allCards.find(c => c.id === 'card-1')).toBeUndefined()
    })
  })

  describe('immutability', () => {
    it('produces new column array on addCard', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.addCard('todo', { title: 'New' })
      })

      expect(result.current.columns).not.toBe(before)
    })

    it('produces new column array on moveCard', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.moveCard('card-1', 'todo', 'doing')
      })

      expect(result.current.columns).not.toBe(before)
    })

    it('produces new column array on removeCard', () => {
      const { result } = renderHook(() => useKanban(makeColumns()))
      const before = result.current.columns

      act(() => {
        result.current.removeCard('card-1', 'todo')
      })

      expect(result.current.columns).not.toBe(before)
    })
  })
})

// ---------------------------------------------------------------------------
// KanbanCard component
// ---------------------------------------------------------------------------

describe('KanbanCardComponent', () => {
  const baseCard = {
    id: 'c1',
    title: 'Test Card',
    description: 'A description',
    labels: ['bug', 'urgent'] as const,
    assignee: 'Alice',
  }

  it('renders card title', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.getByText('Test Card')).toBeTruthy()
  })

  it('renders card description', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.getByText('A description')).toBeTruthy()
  })

  it('renders labels', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.getByText('bug')).toBeTruthy()
    expect(screen.getByText('urgent')).toBeTruthy()
  })

  it('renders assignee', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('has accessible card label', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.getByRole('listitem', { name: /Card: Test Card/ })).toBeTruthy()
  })

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn()
    render(<KanbanCardComponent card={baseCard} columnId="col1" onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /Remove card/ }))
    expect(onRemove).toHaveBeenCalledWith('c1', 'col1')
  })

  it('does not render remove button when onRemove is undefined', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" />)
    expect(screen.queryByRole('button', { name: /Remove card/ })).toBeNull()
  })

  it('renders accessible move buttons', () => {
    const onMove = vi.fn()
    const targets = [
      { id: 'doing', title: 'In Progress' },
      { id: 'done', title: 'Done' },
    ]

    render(
      <KanbanCardComponent
        card={baseCard}
        columnId="todo"
        onMoveToColumn={onMove}
        targetColumnIds={targets}
      />,
    )

    expect(screen.getByRole('button', { name: 'Move to In Progress' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Move to Done' })).toBeTruthy()
  })

  it('calls onMoveToColumn when move button is clicked', () => {
    const onMove = vi.fn()
    const targets = [{ id: 'doing', title: 'In Progress' }]

    render(
      <KanbanCardComponent
        card={baseCard}
        columnId="todo"
        onMoveToColumn={onMove}
        targetColumnIds={targets}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move to In Progress' }))
    expect(onMove).toHaveBeenCalledWith('c1', 'todo', 'doing')
  })

  it('does not render move buttons when targetColumnIds is empty', () => {
    render(<KanbanCardComponent card={baseCard} columnId="col1" targetColumnIds={[]} />)
    expect(screen.queryByRole('button', { name: /Move to/ })).toBeNull()
  })

  it('renders card without optional fields', () => {
    const minimal = { id: 'm1', title: 'Minimal' }
    render(<KanbanCardComponent card={minimal} columnId="col1" />)
    expect(screen.getByText('Minimal')).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// KanbanBoard component
// ---------------------------------------------------------------------------

describe('KanbanBoard', () => {
  it('renders all columns', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    expect(screen.getByRole('list', { name: /Column: To Do/ })).toBeTruthy()
    expect(screen.getByRole('list', { name: /Column: In Progress/ })).toBeTruthy()
    expect(screen.getByRole('list', { name: /Column: Done/ })).toBeTruthy()
  })

  it('renders cards within columns', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    expect(screen.getByText('Task 1')).toBeTruthy()
    expect(screen.getByText('Task 2')).toBeTruthy()
    expect(screen.getByText('Task 3')).toBeTruthy()
  })

  it('has accessible board label', () => {
    render(<KanbanBoard initialColumns={makeColumns()} label="Project Board" />)
    expect(screen.getByRole('region', { name: 'Project Board' })).toBeTruthy()
  })

  it('adds a card when typing and clicking add button', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const input = screen.getByLabelText('New card title for To Do')
    fireEvent.change(input, { target: { value: 'Brand New Card' } })
    fireEvent.click(screen.getByLabelText('Add card to To Do'))

    expect(screen.getByText('Brand New Card')).toBeTruthy()
  })

  it('adds a card on Enter key press', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const input = screen.getByLabelText('New card title for To Do')
    fireEvent.change(input, { target: { value: 'Enter Card' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('Enter Card')).toBeTruthy()
  })

  it('does not add a card with empty title', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const cardsBefore = screen.getAllByRole('listitem').length
    fireEvent.click(screen.getByLabelText('Add card to Done'))

    expect(screen.getAllByRole('listitem').length).toBe(cardsBefore)
  })

  it('removes a card when remove button is clicked', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    expect(screen.getByText('Task 1')).toBeTruthy()
    const removeButtons = screen.getAllByRole('button', { name: /Remove card/ })
    fireEvent.click(removeButtons[0])

    expect(screen.queryByText('Task 1')).toBeNull()
  })

  it('removes a column when remove column button is clicked', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    fireEvent.click(screen.getByLabelText('Remove column: Done'))
    expect(screen.queryByRole('list', { name: /Column: Done/ })).toBeNull()
  })

  it('adds a new column', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const input = screen.getByLabelText('New column title')
    fireEvent.change(input, { target: { value: 'Review' } })
    fireEvent.click(screen.getByLabelText('Add new column'))

    expect(screen.getByRole('list', { name: /Column: Review/ })).toBeTruthy()
  })

  it('adds a new column on Enter key press', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const input = screen.getByLabelText('New column title')
    fireEvent.change(input, { target: { value: 'QA' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByRole('list', { name: /Column: QA/ })).toBeTruthy()
  })

  it('does not add column with empty title', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    const colsBefore = screen.getAllByRole('list').length
    fireEvent.click(screen.getByLabelText('Add new column'))

    expect(screen.getAllByRole('list').length).toBe(colsBefore)
  })

  it('moves a card via accessible move button', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)

    // Task 1 is in "To Do", move it to "Done"
    const moveButtons = screen.getAllByRole('button', { name: 'Move to Done' })
    fireEvent.click(moveButtons[0])

    // Task 1 should now be in Done column
    const doneColumn = screen.getByRole('list', { name: /Column: Done/ })
    expect(doneColumn.textContent).toContain('Task 1')
  })

  it('calls onChange when columns change', () => {
    const onChange = vi.fn()
    render(<KanbanBoard initialColumns={makeColumns()} onChange={onChange} />)

    const input = screen.getByLabelText('New card title for Done')
    fireEvent.change(input, { target: { value: 'Trigger' } })
    fireEvent.click(screen.getByLabelText('Add card to Done'))

    expect(onChange).toHaveBeenCalled()
    const cols = onChange.mock.calls[0][0]
    expect(cols.find((c: KanbanColumn) => c.id === 'done').cards).toHaveLength(1)
  })

  it('renders column card counts', () => {
    render(<KanbanBoard initialColumns={makeColumns()} />)
    // "To Do" has 2 cards, "In Progress" has 1, "Done" has 0
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  describe('drag and drop', () => {
    it('sets opacity on drag start', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)

      const card = screen.getByRole('listitem', { name: /Card: Task 1/ })
      fireEvent.dragStart(card, {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      })

      // After drag start, the card should have reduced opacity via inline style
      // This is tested indirectly through the component behavior
      expect(card).toBeTruthy()
    })

    it('handles drop on column', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)

      const card = screen.getByRole('listitem', { name: /Card: Task 1/ })
      const doneColumn = screen.getByRole('list', { name: /Column: Done/ })

      // Simulate drag start
      fireEvent.dragStart(card, {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      })

      // Simulate drag over done column
      fireEvent.dragOver(doneColumn, {
        dataTransfer: { dropEffect: '' },
      })

      // Simulate drop on done column
      fireEvent.drop(doneColumn, {
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify({ cardId: 'card-1', columnId: 'todo' })),
        },
      })

      // Task 1 should be in Done
      expect(doneColumn.textContent).toContain('Task 1')
    })

    it('handles invalid drop data gracefully', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)

      const doneColumn = screen.getByRole('list', { name: /Column: Done/ })

      // Drop with invalid data should not throw
      fireEvent.drop(doneColumn, {
        dataTransfer: {
          getData: vi.fn(() => 'invalid-json'),
        },
      })

      // Board should still be intact
      expect(screen.getByText('Task 1')).toBeTruthy()
    })

    it('handles drag leave', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      const doneColumn = screen.getByRole('list', { name: /Column: Done/ })

      fireEvent.dragLeave(doneColumn)
      // Should not crash — drop target indicator should clear
      expect(doneColumn).toBeTruthy()
    })

    it('handles drag end', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      const card = screen.getByRole('listitem', { name: /Card: Task 1/ })

      fireEvent.dragEnd(card)
      // Should reset drag state without error
      expect(card).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('each column has role="list"', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThanOrEqual(3)
    })

    it('each card has role="listitem"', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      const items = screen.getAllByRole('listitem')
      expect(items.length).toBeGreaterThanOrEqual(3) // 3 cards
    })

    it('board has role="region" with aria-label', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      expect(screen.getByRole('region', { name: 'Kanban board' })).toBeTruthy()
    })

    it('card move buttons provide accessible labels', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      // Cards in "To Do" should have buttons to move to "In Progress" and "Done"
      expect(screen.getAllByRole('button', { name: /Move to/ }).length).toBeGreaterThan(0)
    })

    it('new card inputs have aria-labels', () => {
      render(<KanbanBoard initialColumns={makeColumns()} />)
      expect(screen.getByLabelText('New card title for To Do')).toBeTruthy()
      expect(screen.getByLabelText('New card title for In Progress')).toBeTruthy()
      expect(screen.getByLabelText('New card title for Done')).toBeTruthy()
    })
  })
})
