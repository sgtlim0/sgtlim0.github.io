'use client'

import React, { useCallback, useRef } from 'react'
import type { UseBatchSelectReturn } from './hooks/useBatchSelect'

/**
 * Props for SelectableList component.
 */
export interface SelectableListProps<T extends { id: string }> {
  /** Items to render in the list. Each must have a unique `id`. */
  readonly items: readonly T[]
  /** Batch select state from useBatchSelect hook */
  readonly batch: UseBatchSelectReturn<T>
  /** Render function for each item */
  readonly renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the list container */
  readonly className?: string
  /** Optional aria-label for the list */
  readonly label?: string
}

/**
 * Selectable list component with checkbox and Shift+Click range selection.
 *
 * Uses the render prop pattern for item rendering. Integrates with
 * `useBatchSelect` hook for selection state management.
 *
 * Features:
 * - Checkbox per item
 * - Click to toggle selection
 * - Shift+Click for range selection
 * - Accessible: role="listbox", aria-selected, aria-checked
 *
 * @example
 * ```tsx
 * const batch = useBatchSelect(items)
 *
 * <SelectableList
 *   items={items}
 *   batch={batch}
 *   renderItem={(item) => <span>{item.name}</span>}
 * />
 * ```
 */
export function SelectableList<T extends { id: string }>({
  items,
  batch,
  renderItem,
  className = '',
  label = 'Selectable list',
}: SelectableListProps<T>): React.ReactElement {
  const lastClickedRef = useRef<string | null>(null)

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.shiftKey && lastClickedRef.current !== null) {
        batch.rangeSelect(id)
      } else {
        batch.toggle(id)
      }
      lastClickedRef.current = id
    },
    [batch],
  )

  const handleCheckboxChange = useCallback(
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      // Prevent double-fire from label click
      e.stopPropagation()
      batch.toggle(id)
      lastClickedRef.current = id
    },
    [batch],
  )

  const handleKeyDown = useCallback(
    (id: string, e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey && lastClickedRef.current !== null) {
          batch.rangeSelect(id)
        } else {
          batch.toggle(id)
        }
        lastClickedRef.current = id
      }
    },
    [batch],
  )

  return (
    <div
      role="listbox"
      aria-label={label}
      aria-multiselectable="true"
      className={className}
      data-testid="selectable-list"
    >
      {items.map((item, index) => {
        const selected = batch.isSelected(item.id)
        return (
          <div
            key={item.id}
            role="option"
            aria-selected={selected}
            aria-checked={selected}
            tabIndex={0}
            onClick={(e) => handleItemClick(item.id, e)}
            onKeyDown={(e) => handleKeyDown(item.id, e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              userSelect: 'none',
              backgroundColor: selected
                ? 'var(--selectable-selected-bg, #eff6ff)'
                : 'transparent',
              borderLeft: selected
                ? '3px solid var(--selectable-accent, #3b82f6)'
                : '3px solid transparent',
              transition: 'background-color 0.15s ease',
            }}
            data-testid={`selectable-item-${item.id}`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => handleCheckboxChange(item.id, e)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select item ${item.id}`}
              tabIndex={-1}
            />
            <div style={{ flex: 1 }}>{renderItem(item, index)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default SelectableList
