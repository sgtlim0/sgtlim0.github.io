'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useKanban } from './hooks/useKanban'
import type { KanbanColumn, KanbanCard } from './hooks/useKanban'
import KanbanCardComponent from './KanbanCard'

export interface KanbanBoardProps {
  /** Initial columns with cards. */
  readonly initialColumns: readonly KanbanColumn[]
  /** Optional callback when columns change. */
  readonly onChange?: (columns: readonly KanbanColumn[]) => void
  /** Optional class name for the board container. */
  readonly className?: string
  /** Optional aria-label for the board. */
  readonly label?: string
}

interface DragState {
  readonly cardId: string
  readonly fromColumnId: string
}

/**
 * Kanban board with horizontal column layout, card drag-and-drop,
 * and accessible move buttons.
 *
 * Uses the useKanban hook for immutable state management.
 * Supports HTML5 drag-and-drop between columns and keyboard/button-based
 * card movement for accessibility.
 *
 * @example
 * ```tsx
 * <KanbanBoard
 *   initialColumns={[
 *     { id: 'todo', title: 'To Do', cards: [] },
 *     { id: 'doing', title: 'Doing', cards: [] },
 *     { id: 'done', title: 'Done', cards: [] },
 *   ]}
 *   onChange={cols => console.log(cols)}
 * />
 * ```
 */
export default function KanbanBoard({
  initialColumns,
  onChange,
  className = '',
  label = 'Kanban board',
}: KanbanBoardProps): React.ReactElement {
  const {
    columns,
    addCard,
    moveCard,
    removeCard,
    addColumn,
    removeColumn,
  } = useKanban(initialColumns)

  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null)
  const [newCardInputs, setNewCardInputs] = useState<Record<string, string>>({})
  const [newColumnTitle, setNewColumnTitle] = useState('')

  // Notify parent on changes
  const prevColumnsRef = React.useRef(columns)
  React.useEffect(() => {
    if (prevColumnsRef.current !== columns) {
      prevColumnsRef.current = columns
      onChange?.(columns)
    }
  }, [columns, onChange])

  // Drag handlers for cards
  const handleCardDragStart = useCallback((cardId: string, columnId: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/kanban-card', JSON.stringify({ cardId, columnId }))
    setDragState({ cardId, fromColumnId: columnId })
  }, [])

  const handleColumnDragOver = useCallback((columnId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetColumnId(columnId)
  }, [])

  const handleColumnDragLeave = useCallback(() => {
    setDropTargetColumnId(null)
  }, [])

  const handleColumnDrop = useCallback((toColumnId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/kanban-card'))
      if (data.cardId && data.columnId) {
        moveCard(data.cardId, data.columnId, toColumnId)
      }
    } catch {
      // Ignore invalid drag data
    }
    setDragState(null)
    setDropTargetColumnId(null)
  }, [moveCard])

  const handleCardDragEnd = useCallback(() => {
    setDragState(null)
    setDropTargetColumnId(null)
  }, [])

  // Accessible move via button
  const handleMoveToColumn = useCallback((cardId: string, fromColumnId: string, toColumnId: string) => {
    moveCard(cardId, fromColumnId, toColumnId)
  }, [moveCard])

  // Add card to column
  const handleAddCard = useCallback((columnId: string) => {
    const title = (newCardInputs[columnId] ?? '').trim()
    if (!title) return
    addCard(columnId, { title })
    setNewCardInputs(prev => {
      const next = { ...prev }
      delete next[columnId]
      return next
    })
  }, [newCardInputs, addCard])

  const handleCardInputChange = useCallback((columnId: string, value: string) => {
    setNewCardInputs(prev => ({ ...prev, [columnId]: value }))
  }, [])

  const handleCardInputKeyDown = useCallback((columnId: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCard(columnId)
    }
  }, [handleAddCard])

  // Add column
  const handleAddColumn = useCallback(() => {
    const title = newColumnTitle.trim()
    if (!title) return
    addColumn(title)
    setNewColumnTitle('')
  }, [newColumnTitle, addColumn])

  const handleColumnTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddColumn()
    }
  }, [handleAddColumn])

  // Build target column list for accessible move buttons (exclude current)
  const columnTargets = useMemo(() =>
    columns.map(col => ({ id: col.id, title: col.title })),
  [columns])

  return (
    <div
      role="region"
      aria-label={label}
      className={className}
      style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        padding: '16px',
        minHeight: '200px',
      }}
    >
      {columns.map(column => {
        const isDropTarget = dropTargetColumnId === column.id && dragState?.fromColumnId !== column.id
        const targets = columnTargets.filter(t => t.id !== column.id)

        return (
          <div
            key={column.id}
            role="list"
            aria-label={`Column: ${column.title}`}
            data-column-id={column.id}
            onDragOver={handleColumnDragOver(column.id)}
            onDragLeave={handleColumnDragLeave}
            onDrop={handleColumnDrop(column.id)}
            style={{
              minWidth: '280px',
              maxWidth: '320px',
              backgroundColor: 'var(--kanban-column-bg, #f3f4f6)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              outline: isDropTarget ? '2px dashed #4f46e5' : undefined,
              outlineOffset: isDropTarget ? '-2px' : undefined,
              transition: 'outline 0.15s ease',
            }}
          >
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--kanban-column-title, #111827)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {column.title}
                <span style={{ marginLeft: '8px', fontWeight: 400, color: 'var(--kanban-column-count, #9ca3af)' }}>
                  {column.cards.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => removeColumn(column.id)}
                aria-label={`Remove column: ${column.title}`}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--kanban-column-remove, #9ca3af)',
                  padding: '0 4px',
                }}
              >
                x
              </button>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {column.cards.map(card => (
                <KanbanCardComponent
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  onRemove={removeCard}
                  onMoveToColumn={handleMoveToColumn}
                  targetColumnIds={targets}
                  dragProps={{
                    draggable: true,
                    onDragStart: handleCardDragStart(card.id, column.id),
                    onDragEnd: handleCardDragEnd,
                    style: {
                      opacity: dragState?.cardId === card.id ? 0.5 : 1,
                      cursor: dragState?.cardId === card.id ? 'grabbing' : 'grab',
                    },
                  }}
                />
              ))}
            </div>

            {/* Add card input */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <input
                type="text"
                value={newCardInputs[column.id] ?? ''}
                onChange={e => handleCardInputChange(column.id, e.target.value)}
                onKeyDown={handleCardInputKeyDown(column.id)}
                placeholder="New card title..."
                aria-label={`New card title for ${column.title}`}
                style={{
                  flex: 1,
                  fontSize: '12px',
                  padding: '6px 8px',
                  border: '1px solid var(--kanban-input-border, #d1d5db)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--kanban-input-bg, #ffffff)',
                  color: 'var(--kanban-input-text, #111827)',
                }}
              />
              <button
                type="button"
                onClick={() => handleAddCard(column.id)}
                aria-label={`Add card to ${column.title}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'var(--kanban-add-btn-bg, #4f46e5)',
                  color: 'var(--kanban-add-btn-text, #ffffff)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                +
              </button>
            </div>
          </div>
        )
      })}

      {/* Add column */}
      <div style={{
        minWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '8px',
        border: '2px dashed var(--kanban-add-col-border, #d1d5db)',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <input
          type="text"
          value={newColumnTitle}
          onChange={e => setNewColumnTitle(e.target.value)}
          onKeyDown={handleColumnTitleKeyDown}
          placeholder="New column title..."
          aria-label="New column title"
          style={{
            width: '100%',
            fontSize: '12px',
            padding: '6px 8px',
            border: '1px solid var(--kanban-input-border, #d1d5db)',
            borderRadius: '4px',
            backgroundColor: 'var(--kanban-input-bg, #ffffff)',
            color: 'var(--kanban-input-text, #111827)',
          }}
        />
        <button
          type="button"
          onClick={handleAddColumn}
          aria-label="Add new column"
          style={{
            fontSize: '12px',
            padding: '6px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--kanban-add-btn-bg, #4f46e5)',
            color: 'var(--kanban-add-btn-text, #ffffff)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Add Column
        </button>
      </div>
    </div>
  )
}
