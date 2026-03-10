'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColumnDef<T> {
  readonly key: keyof T & string
  readonly header: string
  readonly sortable?: boolean
  readonly filterable?: boolean
  readonly width?: number
  readonly minWidth?: number
  readonly render?: (value: unknown, row: T) => ReactNode
}

export interface DataGridOptions {
  readonly pageSize?: number
  readonly defaultSort?: {
    readonly key: string
    readonly direction: 'asc' | 'desc'
  }
}

export interface UseDataGridReturn<T> {
  readonly rows: T[]
  readonly sortKey: string | null
  readonly sortDirection: 'asc' | 'desc'
  sort: (key: string) => void
  readonly filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  clearFilters: () => void
  readonly page: number
  readonly totalPages: number
  setPage: (p: number) => void
  readonly columnWidths: Record<string, number>
  resizeColumn: (key: string, width: number) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_WIDTH = 50
const DEFAULT_WIDTH = 150

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const multiplier = direction === 'asc' ? 1 : -1

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier
  }

  const strA = String(a ?? '').toLowerCase()
  const strB = String(b ?? '').toLowerCase()
  return strA.localeCompare(strB) * multiplier
}

function matchesFilter(value: unknown, filter: string): boolean {
  return String(value ?? '')
    .toLowerCase()
    .includes(filter.toLowerCase())
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook for managing an advanced data grid with sorting, filtering,
 * column resizing, and pagination.
 *
 * Designed for datasets up to ~1000 rows. All processing happens
 * client-side with memoised pipelines.
 *
 * @example
 * ```tsx
 * const grid = useDataGrid(data, columns, { pageSize: 20 })
 * // grid.rows — current page of filtered + sorted data
 * // grid.sort('name') — toggle sort on column
 * // grid.setFilter('name', 'alice') — filter column
 * ```
 */
export function useDataGrid<T extends Record<string, unknown>>(
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  options?: DataGridOptions,
): UseDataGridReturn<T> {
  const pageSize = options?.pageSize ?? 0

  // --- Sort state ---
  const [sortKey, setSortKey] = useState<string | null>(
    options?.defaultSort?.key ?? null,
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    options?.defaultSort?.direction ?? 'asc',
  )

  // --- Filter state ---
  const [filters, setFilters] = useState<Record<string, string>>({})

  // --- Page state ---
  const [page, setPageState] = useState(1)

  // --- Column widths ---
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    for (const col of columns) {
      widths[col.key] = col.width ?? DEFAULT_WIDTH
    }
    return widths
  })

  // --- Filtered data ---
  const filteredData = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(
      ([, value]) => value.length > 0,
    )

    if (activeFilters.length === 0) return [...data]

    return data.filter((row) =>
      activeFilters.every(([key, filterValue]) =>
        matchesFilter(row[key], filterValue),
      ),
    )
  }, [data, filters])

  // --- Sorted data ---
  const sortedData = useMemo(() => {
    if (sortKey === null) return filteredData

    return [...filteredData].sort((a, b) =>
      compareValues(a[sortKey], b[sortKey], sortDirection),
    )
  }, [filteredData, sortKey, sortDirection])

  // --- Pagination ---
  const totalItems = sortedData.length
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
  const clampedPage = Math.min(Math.max(1, page), totalPages)

  const paginatedRows = useMemo(() => {
    if (pageSize <= 0) return sortedData

    const start = (clampedPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, clampedPage, pageSize])

  // --- Actions ---

  const sort = useCallback(
    (key: string) => {
      setSortKey((prevKey) => {
        if (prevKey === key) {
          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
          return key
        }
        setSortDirection('asc')
        return key
      })
    },
    [],
  )

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (value === '') {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
    setPageState(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setPageState(1)
  }, [])

  const setPage = useCallback(
    (p: number) => {
      setPageState(Math.min(Math.max(1, p), totalPages))
    },
    [totalPages],
  )

  const resizeColumn = useCallback(
    (key: string, width: number) => {
      const col = columns.find((c) => c.key === key)
      const minWidth = col?.minWidth ?? DEFAULT_MIN_WIDTH
      const clampedWidth = Math.max(minWidth, width)

      setColumnWidths((prev) => ({
        ...prev,
        [key]: clampedWidth,
      }))
    },
    [columns],
  )

  return {
    rows: paginatedRows,
    sortKey,
    sortDirection,
    sort,
    filters,
    setFilter,
    clearFilters,
    page: clampedPage,
    totalPages,
    setPage,
    columnWidths,
    resizeColumn,
  }
}
