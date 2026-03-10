'use client'

import React, { useCallback, useRef } from 'react'
import { useDataGrid } from './hooks/useDataGrid'
import type { ColumnDef, DataGridOptions } from './hooks/useDataGrid'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DataGridProps<T extends Record<string, unknown>> {
  readonly data: readonly T[]
  readonly columns: readonly ColumnDef<T>[]
  readonly pageSize?: number
  readonly defaultSort?: DataGridOptions['defaultSort']
  readonly emptyMessage?: string
  readonly className?: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIndicator({
  active,
  direction,
}: {
  readonly active: boolean
  readonly direction: 'asc' | 'desc'
}) {
  if (!active) {
    return (
      <span className="ml-1 text-text-secondary opacity-30" aria-hidden="true">
        {'↕'}
      </span>
    )
  }

  return (
    <span className="ml-1 text-primary" aria-hidden="true">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DataGrid
// ---------------------------------------------------------------------------

export function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize,
  defaultSort,
  emptyMessage = 'No data available',
  className = '',
}: DataGridProps<T>) {
  const grid = useDataGrid(data, columns, {
    pageSize,
    defaultSort,
  })

  const resizingRef = useRef<{
    key: string
    startX: number
    startWidth: number
  } | null>(null)

  // --- Resize handlers ---

  const handleResizeStart = useCallback(
    (key: string, e: React.MouseEvent | React.PointerEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = grid.columnWidths[key] ?? 150

      resizingRef.current = { key, startX, startWidth }

      const handleMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return
        const delta = moveEvent.clientX - resizingRef.current.startX
        grid.resizeColumn(
          resizingRef.current.key,
          resizingRef.current.startWidth + delta,
        )
      }

      const handleUp = () => {
        resizingRef.current = null
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    },
    [grid],
  )

  // --- Determine if filter row is needed ---
  const hasFilterableColumns = columns.some((col) => col.filterable)
  const showPagination = pageSize !== undefined && pageSize > 0 && grid.totalPages > 1

  return (
    <div className={`rounded-lg border border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table
          role="grid"
          className="w-full text-sm border-collapse"
          aria-label="Data grid"
        >
          {/* --- Header row --- */}
          <thead>
            <tr className="bg-admin-bg-section border-b border-border">
              {columns.map((col) => {
                const isSorted = grid.sortKey === col.key
                const ariaSort = col.sortable
                  ? isSorted
                    ? grid.sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined

                return (
                  <th
                    key={col.key}
                    role="columnheader"
                    aria-sort={ariaSort}
                    style={{ width: `${grid.columnWidths[col.key]}px` }}
                    className="relative px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap select-none"
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => grid.sort(col.key)}
                        className="inline-flex items-center hover:text-text-primary transition-colors"
                      >
                        {col.header}
                        <SortIndicator
                          active={isSorted}
                          direction={grid.sortDirection}
                        />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}

                    {/* Resize handle */}
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60"
                      onMouseDown={(e) => handleResizeStart(col.key, e)}
                    />
                  </th>
                )
              })}
            </tr>

            {/* --- Filter row --- */}
            {hasFilterableColumns && (
              <tr className="bg-bg-card border-b border-border">
                {columns.map((col) => (
                  <th key={`filter-${col.key}`} className="px-3 py-2">
                    {col.filterable ? (
                      <input
                        type="text"
                        aria-label={`Filter ${col.header}`}
                        value={grid.filters[col.key] ?? ''}
                        onChange={(e) => grid.setFilter(col.key, e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-border bg-bg-page text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={`Filter...`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* --- Body --- */}
          <tbody>
            {grid.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-text-secondary text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              grid.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-border-light hover:bg-bg-hover transition-colors ${
                    rowIndex % 2 === 1 ? 'bg-admin-table-stripe' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      role="gridcell"
                      className="px-4 py-3 text-text-primary whitespace-nowrap"
                      style={{ width: `${grid.columnWidths[col.key]}px` }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-card">
          <button
            type="button"
            aria-label="Previous page"
            disabled={grid.page <= 1}
            onClick={() => grid.setPage(grid.page - 1)}
            className="px-3 py-1 text-xs rounded border border-border text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>

          <span className="text-xs text-text-secondary tabular-nums">
            {grid.page} / {grid.totalPages}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={grid.page >= grid.totalPages}
            onClick={() => grid.setPage(grid.page + 1)}
            className="px-3 py-1 text-xs rounded border border-border text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export type { ColumnDef, DataGridOptions } from './hooks/useDataGrid'
