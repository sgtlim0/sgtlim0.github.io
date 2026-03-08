'use client'

import React from 'react'
import { useDragAndDrop } from './hooks/useDragAndDrop'
import type { DragHandlerProps } from './hooks/useDragAndDrop'

export interface DraggableListProps<T extends { id: string }> {
  /** Items to render in the list. Each must have a unique `id`. */
  readonly items: readonly T[]
  /** Callback when items are reordered. Receives the new array. */
  readonly onReorder: (items: T[]) => void
  /** Render function for each item. Receives the item and drag handler props. */
  readonly renderItem: (item: T, dragHandlers: DragHandlerProps, index: number) => React.ReactNode
  /** Optional className for the list container. */
  readonly className?: string
  /** Optional aria-label for the list. */
  readonly label?: string
}

/**
 * Generic drag-and-drop reorderable list component.
 *
 * Wraps `useDragAndDrop` hook and renders items via a render prop.
 * Supports HTML5 drag & drop, touch events, and keyboard reordering.
 *
 * @example
 * ```tsx
 * <DraggableList
 *   items={widgets}
 *   onReorder={setWidgets}
 *   renderItem={(item, dragHandlers) => (
 *     <WidgetCard key={item.id} {...item} {...dragHandlers} />
 *   )}
 * />
 * ```
 */
export default function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className = '',
  label = 'Sortable list',
}: DraggableListProps<T>): React.ReactElement {
  const { dragHandlers } = useDragAndDrop(items, onReorder)

  return (
    <div
      role="list"
      aria-label={label}
      className={className}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderItem(item, dragHandlers(index), index)}
        </React.Fragment>
      ))}
    </div>
  )
}
