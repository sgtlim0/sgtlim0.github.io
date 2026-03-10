'use client'

import { useState, useCallback, useRef, useMemo } from 'react'

/**
 * Return type for useBatchSelect hook.
 */
export interface UseBatchSelectReturn<T extends { id: string }> {
  /** Set of currently selected item IDs */
  readonly selectedIds: ReadonlySet<string>
  /** Array of currently selected items */
  readonly selectedItems: readonly T[]
  /** Check if an item is selected */
  readonly isSelected: (id: string) => boolean
  /** Toggle selection of a single item */
  readonly toggle: (id: string) => void
  /** Select all items */
  readonly selectAll: () => void
  /** Deselect all items */
  readonly deselectAll: () => void
  /** Toggle between select all / deselect all */
  readonly toggleAll: () => void
  /** Whether all items are selected */
  readonly isAllSelected: boolean
  /** Whether some (but not all) items are selected */
  readonly isIndeterminate: boolean
  /** Number of selected items */
  readonly selectedCount: number
  /** Range select from last toggled item to target (Shift+Click) */
  readonly rangeSelect: (id: string) => void
}

/**
 * Hook for multi-select / batch operations on lists of items.
 *
 * Features:
 * - Single toggle, select all, deselect all, toggle all
 * - Shift+Click range selection via `rangeSelect`
 * - Immutable Set updates (new Set on every change)
 * - Derived state: isAllSelected, isIndeterminate, selectedCount
 * - SSR safe (no browser API usage)
 *
 * @param items - Array of items with unique `id` property
 *
 * @example
 * ```tsx
 * const batch = useBatchSelect(items)
 * return items.map(item => (
 *   <label key={item.id}>
 *     <input
 *       type="checkbox"
 *       checked={batch.isSelected(item.id)}
 *       onChange={() => batch.toggle(item.id)}
 *     />
 *     {item.name}
 *   </label>
 * ))
 * ```
 */
export function useBatchSelect<T extends { id: string }>(
  items: readonly T[],
): UseBatchSelectReturn<T> {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const lastToggledRef = useRef<string | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const isSelected = useCallback(
    (id: string): boolean => selectedIds.has(id),
    [selectedIds],
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    lastToggledRef.current = id
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(itemsRef.current.map(item => item.id)))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
    lastToggledRef.current = null
  }, [])

  const isAllSelected = items.length > 0 && selectedIds.size === items.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length

  const toggleAll = useCallback(() => {
    if (itemsRef.current.length > 0 && selectedIds.size === itemsRef.current.length) {
      setSelectedIds(new Set())
      lastToggledRef.current = null
    } else {
      setSelectedIds(new Set(itemsRef.current.map(item => item.id)))
    }
  }, [selectedIds.size])

  const rangeSelect = useCallback((id: string) => {
    const currentItems = itemsRef.current
    const lastId = lastToggledRef.current

    if (lastId === null) {
      // No previous toggle — just toggle the single item
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
      lastToggledRef.current = id
      return
    }

    const lastIndex = currentItems.findIndex(item => item.id === lastId)
    const currentIndex = currentItems.findIndex(item => item.id === id)

    if (lastIndex === -1 || currentIndex === -1) {
      // Fallback: just toggle the single item
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
      lastToggledRef.current = id
      return
    }

    const start = Math.min(lastIndex, currentIndex)
    const end = Math.max(lastIndex, currentIndex)

    setSelectedIds(prev => {
      const next = new Set(prev)
      for (let i = start; i <= end; i++) {
        next.add(currentItems[i].id)
      }
      return next
    })

    lastToggledRef.current = id
  }, [])

  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds],
  )

  return {
    selectedIds,
    selectedItems,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedIds.size,
    rangeSelect,
  }
}
