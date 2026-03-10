import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBatchSelect } from '../src/hooks/useBatchSelect'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TestItem {
  id: string
  name: string
}

function makeItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }))
}

// ---------------------------------------------------------------------------
// useBatchSelect
// ---------------------------------------------------------------------------

describe('useBatchSelect', () => {
  let items: TestItem[]

  beforeEach(() => {
    items = makeItems(5)
  })

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts with no items selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      expect(result.current.selectedIds.size).toBe(0)
      expect(result.current.selectedItems).toEqual([])
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isIndeterminate).toBe(false)
    })

    it('isSelected returns false for all items initially', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      items.forEach(item => {
        expect(result.current.isSelected(item.id)).toBe(false)
      })
    })
  })

  // -------------------------------------------------------------------------
  // toggle
  // -------------------------------------------------------------------------

  describe('toggle', () => {
    it('selects an unselected item', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-0')
      })

      expect(result.current.isSelected('item-0')).toBe(true)
      expect(result.current.selectedCount).toBe(1)
      expect(result.current.selectedItems).toEqual([items[0]])
    })

    it('deselects a selected item', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-0')
      })
      act(() => {
        result.current.toggle('item-0')
      })

      expect(result.current.isSelected('item-0')).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })

    it('handles multiple toggles independently', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-0')
      })
      act(() => {
        result.current.toggle('item-2')
      })

      expect(result.current.isSelected('item-0')).toBe(true)
      expect(result.current.isSelected('item-1')).toBe(false)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.selectedCount).toBe(2)
    })

    it('creates a new Set on each toggle (immutability)', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      const initialSet = result.current.selectedIds

      act(() => {
        result.current.toggle('item-0')
      })

      expect(result.current.selectedIds).not.toBe(initialSet)
    })
  })

  // -------------------------------------------------------------------------
  // selectAll / deselectAll
  // -------------------------------------------------------------------------

  describe('selectAll', () => {
    it('selects all items', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selectedCount).toBe(5)
      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.isIndeterminate).toBe(false)
      items.forEach(item => {
        expect(result.current.isSelected(item.id)).toBe(true)
      })
    })
  })

  describe('deselectAll', () => {
    it('deselects all items', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.selectAll()
      })
      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      items.forEach(item => {
        expect(result.current.isSelected(item.id)).toBe(false)
      })
    })
  })

  // -------------------------------------------------------------------------
  // toggleAll
  // -------------------------------------------------------------------------

  describe('toggleAll', () => {
    it('selects all when none are selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggleAll()
      })

      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.selectedCount).toBe(5)
    })

    it('selects all when some are selected (indeterminate)', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-0')
      })
      act(() => {
        result.current.toggle('item-2')
      })
      act(() => {
        result.current.toggleAll()
      })

      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.selectedCount).toBe(5)
    })

    it('deselects all when all are selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.selectAll()
      })
      act(() => {
        result.current.toggleAll()
      })

      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // isIndeterminate
  // -------------------------------------------------------------------------

  describe('isIndeterminate', () => {
    it('is false when no items are selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))
      expect(result.current.isIndeterminate).toBe(false)
    })

    it('is true when some (not all) items are selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-1')
      })

      expect(result.current.isIndeterminate).toBe(true)
    })

    it('is false when all items are selected', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.isIndeterminate).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // rangeSelect
  // -------------------------------------------------------------------------

  describe('rangeSelect', () => {
    it('selects a range from last toggled item to target', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      // First toggle item-1 to set the anchor
      act(() => {
        result.current.toggle('item-1')
      })

      // Range select to item-3
      act(() => {
        result.current.rangeSelect('item-3')
      })

      expect(result.current.isSelected('item-0')).toBe(false)
      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
      expect(result.current.isSelected('item-4')).toBe(false)
    })

    it('selects a range in reverse direction', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      // First toggle item-3 to set the anchor
      act(() => {
        result.current.toggle('item-3')
      })

      // Range select to item-1
      act(() => {
        result.current.rangeSelect('item-1')
      })

      expect(result.current.isSelected('item-0')).toBe(false)
      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
      expect(result.current.isSelected('item-4')).toBe(false)
    })

    it('selects single item when no previous toggle', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.rangeSelect('item-2')
      })

      expect(result.current.selectedCount).toBe(1)
      expect(result.current.isSelected('item-2')).toBe(true)
    })

    it('preserves previously selected items outside the range', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      // Select item-0 first
      act(() => {
        result.current.toggle('item-0')
      })

      // Toggle item-2 to set anchor
      act(() => {
        result.current.toggle('item-2')
      })

      // Range select to item-4
      act(() => {
        result.current.rangeSelect('item-4')
      })

      // item-0 should still be selected
      expect(result.current.isSelected('item-0')).toBe(true)
      // Range item-2 to item-4 should be selected
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
      expect(result.current.isSelected('item-4')).toBe(true)
    })

    it('handles rangeSelect with same item as last toggled', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-2')
      })
      act(() => {
        result.current.rangeSelect('item-2')
      })

      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.selectedCount).toBe(1)
    })
  })

  // -------------------------------------------------------------------------
  // selectedItems
  // -------------------------------------------------------------------------

  describe('selectedItems', () => {
    it('returns selected item objects in original order', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('item-3')
      })
      act(() => {
        result.current.toggle('item-1')
      })

      expect(result.current.selectedItems).toEqual([items[1], items[3]])
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles empty items array', () => {
      const { result } = renderHook(() => useBatchSelect<TestItem>([]))

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isIndeterminate).toBe(false)

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
    })

    it('handles single item array', () => {
      const single = makeItems(1)
      const { result } = renderHook(() => useBatchSelect(single))

      act(() => {
        result.current.toggle('item-0')
      })

      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.isIndeterminate).toBe(false)
      expect(result.current.selectedCount).toBe(1)
    })

    it('rangeSelect handles missing last toggled item in items array', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      // Toggle an item that exists
      act(() => {
        result.current.toggle('item-1')
      })

      // Now rerender with different items (simulate item removal)
      const newItems = makeItems(3) // item-0, item-1, item-2
      const { result: result2 } = renderHook(() => useBatchSelect(newItems))

      // Range select should still work as a single toggle
      act(() => {
        result2.current.rangeSelect('item-2')
      })

      expect(result2.current.isSelected('item-2')).toBe(true)
    })

    it('toggle with non-existent id adds it to selectedIds', () => {
      const { result } = renderHook(() => useBatchSelect(items))

      act(() => {
        result.current.toggle('non-existent')
      })

      // It adds to the Set even if not in items
      expect(result.current.selectedIds.has('non-existent')).toBe(true)
      // But selectedItems filters by actual items
      expect(result.current.selectedItems).toEqual([])
    })
  })
})
