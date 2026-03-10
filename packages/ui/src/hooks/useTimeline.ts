'use client'

import { useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimelineStatus = 'completed' | 'current' | 'upcoming'

export type TimelineSortOrder = 'asc' | 'desc'

export interface TimelineItemData {
  id: string
  title: string
  description?: string
  timestamp: Date | string | number
  icon?: React.ReactNode
  color?: string
  status?: TimelineStatus
}

export interface TimelineGroup {
  label: string
  items: TimelineItemData[]
}

export interface UseTimelineOptions {
  items: TimelineItemData[]
  defaultSort?: TimelineSortOrder
  defaultFilter?: TimelineStatus | null
}

export interface UseTimelineReturn {
  /** Sorted and filtered items */
  items: TimelineItemData[]
  /** Current sort order */
  sortOrder: TimelineSortOrder
  /** Current status filter (null = show all) */
  filter: TimelineStatus | null
  /** Set sort order */
  setSortOrder: (order: TimelineSortOrder) => void
  /** Toggle sort order between asc/desc */
  toggleSortOrder: () => void
  /** Set status filter (null = show all) */
  setFilter: (status: TimelineStatus | null) => void
  /** Items grouped by date (YYYY-MM-DD) */
  groupedByDate: TimelineGroup[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toTimestamp(value: Date | string | number): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return new Date(value).getTime()
}

function toDateLabel(value: Date | string | number): string {
  const d = value instanceof Date ? value : new Date(value)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTimeline(options: UseTimelineOptions): UseTimelineReturn {
  const {
    items: rawItems,
    defaultSort = 'desc',
    defaultFilter = null,
  } = options

  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>(defaultSort)
  const [filter, setFilter] = useState<TimelineStatus | null>(defaultFilter)

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }, [])

  const items = useMemo(() => {
    const filtered =
      filter === null
        ? [...rawItems]
        : rawItems.filter((item) => item.status === filter)

    filtered.sort((a, b) => {
      const diff = toTimestamp(a.timestamp) - toTimestamp(b.timestamp)
      return sortOrder === 'asc' ? diff : -diff
    })

    return filtered
  }, [rawItems, sortOrder, filter])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, TimelineItemData[]>()

    for (const item of items) {
      const label = toDateLabel(item.timestamp)
      const group = map.get(label)
      if (group) {
        group.push(item)
      } else {
        map.set(label, [item])
      }
    }

    const groups: TimelineGroup[] = []
    for (const [label, groupItems] of map) {
      groups.push({ label, items: groupItems })
    }

    return groups
  }, [items])

  return {
    items,
    sortOrder,
    filter,
    setSortOrder,
    toggleSortOrder,
    setFilter,
    groupedByDate,
  }
}
