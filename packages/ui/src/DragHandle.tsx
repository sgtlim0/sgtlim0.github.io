'use client'

import React from 'react'

export interface DragHandleProps {
  readonly size?: number
  readonly color?: string
  readonly className?: string
  readonly label?: string
}

/**
 * 6-dot grip icon for drag handles.
 *
 * Renders an accessible SVG grip icon indicating a draggable area.
 * Uses aria-hidden since the parent sortable element carries the
 * accessibility semantics.
 *
 * @example
 * ```tsx
 * <div {...dragHandlers(index)}>
 *   <DragHandle />
 *   <span>{item.name}</span>
 * </div>
 * ```
 */
export default function DragHandle({
  size = 16,
  color = 'currentColor',
  className = '',
  label = 'Drag handle',
}: DragHandleProps): React.ReactElement {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'grab' }}
      aria-hidden="true"
      title={label}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={label}
      >
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </span>
  )
}
