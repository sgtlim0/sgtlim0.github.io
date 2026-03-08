'use client'

import React from 'react'
import { useVirtualList } from './hooks/useVirtualList'
import type { VirtualItem, UseVirtualListOptions } from './hooks/useVirtualList'

export type { VirtualItem }

export interface VirtualListProps extends UseVirtualListOptions {
  /** Render function for each visible item */
  readonly renderItem: (item: VirtualItem) => React.ReactNode
  /** Optional className for the outer scroll container */
  readonly className?: string
  /** Optional aria-label for the list */
  readonly label?: string
}

/**
 * Virtualized list component that only renders visible items.
 *
 * Uses render prop pattern for flexible item rendering.
 * Supports fixed and variable item heights, scrollTo API via ref.
 *
 * @example
 * ```tsx
 * <VirtualList
 *   itemCount={10000}
 *   itemHeight={40}
 *   containerHeight={500}
 *   renderItem={(item) => (
 *     <div key={item.index}>Row {item.index}</div>
 *   )}
 * />
 * ```
 */
export default function VirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan,
  renderItem,
  className = '',
  label = 'Virtual list',
}: VirtualListProps): React.ReactElement {
  const { virtualItems, totalHeight, containerRef } = useVirtualList({
    itemCount,
    itemHeight,
    containerHeight,
    overscan,
  })

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((item) => (
          <div
            key={item.index}
            role="listitem"
            style={{
              position: 'absolute',
              top: item.start,
              height: item.size,
              width: '100%',
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
