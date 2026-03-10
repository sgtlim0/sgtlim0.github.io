'use client'

import React, { useCallback, useEffect } from 'react'

/**
 * Action button configuration for the batch action bar.
 */
export interface BatchAction {
  /** Unique key for the action */
  readonly key: string
  /** Display label */
  readonly label: string
  /** Optional icon element */
  readonly icon?: React.ReactNode
  /** Action handler, receives selected IDs */
  readonly onClick: (selectedIds: ReadonlySet<string>) => void
  /** Optional variant for styling */
  readonly variant?: 'default' | 'danger'
  /** Whether this action is disabled */
  readonly disabled?: boolean
}

/**
 * Props for BatchActionBar component.
 */
export interface BatchActionBarProps {
  /** Number of selected items */
  readonly selectedCount: number
  /** Set of selected item IDs */
  readonly selectedIds: ReadonlySet<string>
  /** Available batch actions */
  readonly actions: readonly BatchAction[]
  /** Whether all items are selected */
  readonly isAllSelected: boolean
  /** Whether selection is indeterminate */
  readonly isIndeterminate: boolean
  /** Handler for toggle all checkbox */
  readonly onToggleAll: () => void
  /** Handler to deselect all */
  readonly onDeselectAll: () => void
  /** Optional className for the container */
  readonly className?: string
}

/**
 * Floating action bar that slides up when items are selected.
 *
 * Features:
 * - Slide-up animation when selection count > 0
 * - "N items selected" label with select all / deselect all checkbox
 * - Action buttons (delete, move, export, etc.)
 * - Escape key to deselect all
 * - Accessible: role="toolbar", aria-label
 *
 * @example
 * ```tsx
 * <BatchActionBar
 *   selectedCount={batch.selectedCount}
 *   selectedIds={batch.selectedIds}
 *   actions={[
 *     { key: 'delete', label: 'Delete', onClick: handleDelete, variant: 'danger' },
 *     { key: 'export', label: 'Export', onClick: handleExport },
 *   ]}
 *   isAllSelected={batch.isAllSelected}
 *   isIndeterminate={batch.isIndeterminate}
 *   onToggleAll={batch.toggleAll}
 *   onDeselectAll={batch.deselectAll}
 * />
 * ```
 */
export function BatchActionBar({
  selectedCount,
  selectedIds,
  actions,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
  onDeselectAll,
  className = '',
}: BatchActionBarProps): React.ReactElement | null {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCount > 0) {
        onDeselectAll()
      }
    },
    [selectedCount, onDeselectAll],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  if (selectedCount === 0) {
    return null
  }

  return (
    <div
      role="toolbar"
      aria-label={`Batch actions for ${selectedCount} selected items`}
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        backgroundColor: 'var(--batch-bar-bg, #1e293b)',
        color: 'var(--batch-bar-text, #f8fafc)',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(0)',
        transition: 'transform 0.2s ease-out',
        zIndex: 50,
      }}
      data-testid="batch-action-bar"
    >
      {/* Select all / deselect all checkbox */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = isIndeterminate
            }
          }}
          onChange={onToggleAll}
          aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
        />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </label>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'var(--batch-bar-divider, #475569)',
        }}
        aria-hidden="true"
      />

      {/* Action buttons */}
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => action.onClick(selectedIds)}
          disabled={action.disabled}
          aria-label={action.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: action.disabled ? 'not-allowed' : 'pointer',
            opacity: action.disabled ? 0.5 : 1,
            backgroundColor:
              action.variant === 'danger'
                ? 'var(--batch-btn-danger, #dc2626)'
                : 'var(--batch-btn-default, #3b82f6)',
            color: 'var(--batch-btn-text, #ffffff)',
            transition: 'opacity 0.15s ease',
          }}
        >
          {action.icon && <span aria-hidden="true">{action.icon}</span>}
          {action.label}
        </button>
      ))}

      {/* Deselect button */}
      <button
        type="button"
        onClick={onDeselectAll}
        aria-label="Deselect all"
        style={{
          marginLeft: 'auto',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--batch-bar-divider, #475569)',
          backgroundColor: 'transparent',
          color: 'var(--batch-bar-text, #f8fafc)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Clear
      </button>
    </div>
  )
}

export default BatchActionBar
