'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Represents a card in a Kanban column.
 */
export interface KanbanCard {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly labels?: readonly string[]
  readonly assignee?: string
}

/**
 * Represents a column in a Kanban board.
 */
export interface KanbanColumn {
  readonly id: string
  readonly title: string
  readonly cards: readonly KanbanCard[]
}

/**
 * Return type for the useKanban hook.
 */
export interface UseKanbanReturn {
  readonly columns: readonly KanbanColumn[]
  readonly addCard: (columnId: string, card: Omit<KanbanCard, 'id'>) => string
  readonly moveCard: (cardId: string, fromColumnId: string, toColumnId: string, position?: number) => void
  readonly removeCard: (cardId: string, columnId: string) => void
  readonly updateCard: (cardId: string, columnId: string, updates: Partial<Omit<KanbanCard, 'id'>>) => void
  readonly addColumn: (title: string) => string
  readonly removeColumn: (columnId: string) => void
}

let nextId = 1

function generateId(): string {
  return `kanban-${Date.now()}-${nextId++}`
}

/**
 * Hook for managing Kanban board state with immutable updates.
 *
 * Provides operations for adding, moving, removing, and updating cards
 * across columns. All state mutations produce new arrays (immutable).
 *
 * @param initialColumns - Initial column configuration
 *
 * @example
 * ```tsx
 * const { columns, addCard, moveCard } = useKanban([
 *   { id: 'todo', title: 'To Do', cards: [] },
 *   { id: 'doing', title: 'In Progress', cards: [] },
 *   { id: 'done', title: 'Done', cards: [] },
 * ])
 * ```
 */
export function useKanban(initialColumns: readonly KanbanColumn[]): UseKanbanReturn {
  const [columns, setColumns] = useState<readonly KanbanColumn[]>(initialColumns)
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const addCard = useCallback((columnId: string, card: Omit<KanbanCard, 'id'>): string => {
    const id = generateId()
    const newCard: KanbanCard = { ...card, id }

    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col,
      ),
    )

    return id
  }, [])

  const moveCard = useCallback((
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    position?: number,
  ): void => {
    setColumns(prev => {
      const fromColumn = prev.find(col => col.id === fromColumnId)
      if (!fromColumn) return prev

      const card = fromColumn.cards.find(c => c.id === cardId)
      if (!card) return prev

      if (fromColumnId === toColumnId) {
        const currentIndex = fromColumn.cards.findIndex(c => c.id === cardId)
        const targetPosition = position ?? currentIndex
        if (currentIndex === targetPosition) return prev

        const newCards = fromColumn.cards.filter(c => c.id !== cardId)
        const insertAt = Math.min(Math.max(0, targetPosition), newCards.length)
        const reordered = [
          ...newCards.slice(0, insertAt),
          card,
          ...newCards.slice(insertAt),
        ]

        return prev.map(col =>
          col.id === fromColumnId
            ? { ...col, cards: reordered }
            : col,
        )
      }

      return prev.map(col => {
        if (col.id === fromColumnId) {
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        }
        if (col.id === toColumnId) {
          const insertAt = position !== undefined
            ? Math.min(Math.max(0, position), col.cards.length)
            : col.cards.length
          return {
            ...col,
            cards: [
              ...col.cards.slice(0, insertAt),
              card,
              ...col.cards.slice(insertAt),
            ],
          }
        }
        return col
      })
    })
  }, [])

  const removeCard = useCallback((cardId: string, columnId: string): void => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
          : col,
      ),
    )
  }, [])

  const updateCard = useCallback((
    cardId: string,
    columnId: string,
    updates: Partial<Omit<KanbanCard, 'id'>>,
  ): void => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(c =>
                c.id === cardId ? { ...c, ...updates } : c,
              ),
            }
          : col,
      ),
    )
  }, [])

  const addColumn = useCallback((title: string): string => {
    const id = generateId()
    const newColumn: KanbanColumn = { id, title, cards: [] }

    setColumns(prev => [...prev, newColumn])

    return id
  }, [])

  const removeColumn = useCallback((columnId: string): void => {
    setColumns(prev => prev.filter(col => col.id !== columnId))
  }, [])

  return {
    columns,
    addCard,
    moveCard,
    removeCard,
    updateCard,
    addColumn,
    removeColumn,
  }
}
