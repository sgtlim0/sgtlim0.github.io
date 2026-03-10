'use client'

import React, { useCallback } from 'react'
import type { KanbanCard as KanbanCardData } from './hooks/useKanban'

const LABEL_COLORS: Record<string, string> = {
  bug: '#ef4444',
  feature: '#3b82f6',
  improvement: '#8b5cf6',
  urgent: '#f97316',
  docs: '#10b981',
}

function getLabelColor(label: string): string {
  return LABEL_COLORS[label.toLowerCase()] ?? '#6b7280'
}

export interface KanbanCardProps {
  /** The card data to render. */
  readonly card: KanbanCardData
  /** Column ID the card belongs to. */
  readonly columnId: string
  /** Callback to remove this card. */
  readonly onRemove?: (cardId: string, columnId: string) => void
  /** Callback to move this card to another column via button (accessibility). */
  readonly onMoveToColumn?: (cardId: string, fromColumnId: string, toColumnId: string) => void
  /** Available target column IDs for accessible move buttons. */
  readonly targetColumnIds?: readonly { readonly id: string; readonly title: string }[]
  /** Drag handler props from useDragAndDrop or parent board. */
  readonly dragProps?: Record<string, unknown>
}

/**
 * Individual Kanban card component.
 *
 * Renders card title, optional description, labels (color tags),
 * assignee, remove button, and accessible move buttons.
 */
export default function KanbanCardComponent({
  card,
  columnId,
  onRemove,
  onMoveToColumn,
  targetColumnIds = [],
  dragProps = {},
}: KanbanCardProps): React.ReactElement {
  const handleRemove = useCallback(() => {
    onRemove?.(card.id, columnId)
  }, [onRemove, card.id, columnId])

  const handleMove = useCallback((toColumnId: string) => {
    onMoveToColumn?.(card.id, columnId, toColumnId)
  }, [onMoveToColumn, card.id, columnId])

  return (
    <div
      role="listitem"
      aria-label={`Card: ${card.title}`}
      data-card-id={card.id}
      style={{
        border: '1px solid var(--kanban-card-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: 'var(--kanban-card-bg, #ffffff)',
        cursor: 'grab',
        transition: 'box-shadow 0.2s ease',
      }}
      {...dragProps}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--kanban-card-title, #111827)' }}>
          {card.title}
        </h4>
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove card: ${card.title}`}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'var(--kanban-card-remove, #9ca3af)',
              padding: '0 2px',
              lineHeight: 1,
            }}
          >
            x
          </button>
        )}
      </div>

      {card.description && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--kanban-card-desc, #6b7280)' }}>
          {card.description}
        </p>
      )}

      {card.labels && card.labels.length > 0 && (
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}
          aria-label="Card labels"
        >
          {card.labels.map(label => (
            <span
              key={label}
              style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '9999px',
                color: '#ffffff',
                backgroundColor: getLabelColor(label),
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {card.assignee && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--kanban-card-assignee, #9ca3af)' }}>
          {card.assignee}
        </div>
      )}

      {targetColumnIds.length > 0 && (
        <div
          style={{ display: 'flex', gap: '4px', marginTop: '8px' }}
          aria-label="Move card to column"
        >
          {targetColumnIds.map(target => (
            <button
              key={target.id}
              type="button"
              onClick={() => handleMove(target.id)}
              aria-label={`Move to ${target.title}`}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                border: '1px solid var(--kanban-move-border, #d1d5db)',
                borderRadius: '4px',
                backgroundColor: 'var(--kanban-move-bg, #f9fafb)',
                cursor: 'pointer',
                color: 'var(--kanban-move-text, #374151)',
              }}
            >
              {target.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
