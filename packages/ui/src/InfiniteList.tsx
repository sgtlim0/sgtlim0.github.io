'use client'

import React from 'react'
import { useInfiniteScroll } from './hooks/useInfiniteScroll'
import type { UseInfiniteScrollOptions } from './hooks/useInfiniteScroll'

export interface InfiniteListProps<T> extends UseInfiniteScrollOptions<T> {
  /** Render function for each item */
  readonly renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the outer container */
  readonly className?: string
  /** Optional aria-label for the list */
  readonly label?: string
  /** Custom loading indicator (default: spinner) */
  readonly loadingElement?: React.ReactNode
  /** Custom error element factory */
  readonly renderError?: (error: Error, retry: () => void) => React.ReactNode
  /** Custom "no more items" element */
  readonly endElement?: React.ReactNode
  /** Custom "empty list" element (shown when loaded with 0 items) */
  readonly emptyElement?: React.ReactNode
}

const defaultSpinner = (
  <div
    role="status"
    aria-label="Loading more items"
    style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '16px 0',
    }}
  >
    <div
      style={{
        width: 24,
        height: 24,
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'infinite-list-spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes infinite-list-spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

/**
 * Infinite scroll list component with render prop pattern.
 *
 * Automatically places a sentinel element and handles loading,
 * error, and "end of list" states.
 *
 * @example
 * ```tsx
 * <InfiniteList
 *   fetchPage={async (page) => {
 *     const res = await fetch(`/api/items?page=${page}`)
 *     return res.json()
 *   }}
 *   renderItem={(item) => <div key={item.id}>{item.name}</div>}
 * />
 * ```
 */
export default function InfiniteList<T>({
  fetchPage,
  initialPage,
  threshold,
  enabled,
  renderItem,
  className = '',
  label = 'Infinite list',
  loadingElement = defaultSpinner,
  renderError,
  endElement,
  emptyElement,
}: InfiniteListProps<T>): React.ReactElement {
  const { items, isLoading, isLoadingMore, error, hasMore, loadMore, sentinelRef } =
    useInfiniteScroll({ fetchPage, initialPage, threshold, enabled })

  const showEmpty = !isLoading && items.length === 0 && !error

  return (
    <div role="list" aria-label={label} className={className}>
      {items.map((item, index) => (
        <div key={index} role="listitem">
          {renderItem(item, index)}
        </div>
      ))}

      {(isLoading || isLoadingMore) && loadingElement}

      {error && !isLoading && (
        renderError ? (
          renderError(error, loadMore)
        ) : (
          <div role="alert" style={{ textAlign: 'center', padding: '16px 0', color: '#ef4444' }}>
            <p>{error.message}</p>
            <button
              type="button"
              onClick={loadMore}
              style={{
                marginTop: 8,
                padding: '4px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              Retry
            </button>
          </div>
        )
      )}

      {showEmpty && (emptyElement ?? <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7280' }}>No items</div>)}

      {!hasMore && items.length > 0 && !error && (endElement ?? null)}

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
    </div>
  )
}
