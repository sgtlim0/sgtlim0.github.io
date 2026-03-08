import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragAndDrop } from '../src/hooks/useDragAndDrop'
import type { DragHandlerProps } from '../src/hooks/useDragAndDrop'

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

function createDragEvent(overrides: Partial<React.DragEvent> = {}): React.DragEvent {
  const dataStore: Record<string, string> = {}
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn((key: string, val: string) => {
        dataStore[key] = val
      }),
      getData: vi.fn((key: string) => dataStore[key] ?? ''),
    },
    currentTarget: {
      contains: vi.fn(() => false),
    },
    relatedTarget: null,
    ...overrides,
  } as unknown as React.DragEvent
}

function createKeyboardEvent(key: string, overrides: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as React.KeyboardEvent
}

// ---------------------------------------------------------------------------
// useDragAndDrop
// ---------------------------------------------------------------------------

describe('useDragAndDrop', () => {
  let onReorder: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onReorder = vi.fn()
  })

  // --- Initial State ---

  it('returns initial state with no dragging', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    expect(result.current.isDragging).toBe(false)
    expect(result.current.dragIndex).toBeNull()
    expect(result.current.dropIndex).toBeNull()
    expect(result.current.items).toEqual(items)
  })

  it('returns dragHandlers function', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    expect(typeof result.current.dragHandlers).toBe('function')
  })

  // --- Drag Handler Props ---

  it('dragHandlers returns correct props for an item', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    const handlers = result.current.dragHandlers(1)

    expect(handlers.draggable).toBe(true)
    expect(handlers['aria-roledescription']).toBe('sortable')
    expect(handlers.role).toBe('listitem')
    expect(handlers.tabIndex).toBe(0)
    expect(handlers['data-drag-index']).toBe(1)
    expect(handlers['aria-label']).toContain('position 2 of 3')
    expect(handlers.style.opacity).toBe(1)
    expect(handlers.style.cursor).toBe('grab')
  })

  // --- HTML5 Drag & Drop ---

  it('sets dragIndex on dragStart', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      const e = createDragEvent()
      result.current.dragHandlers(1).onDragStart(e)
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.dragIndex).toBe(1)
  })

  it('sets dropIndex on dragOver', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(0).onDragStart(createDragEvent())
    })

    act(() => {
      const e = createDragEvent()
      result.current.dragHandlers(2).onDragOver(e)
      expect(e.preventDefault).toHaveBeenCalled()
    })

    expect(result.current.dropIndex).toBe(2)
  })

  it('sets dropIndex on dragEnter', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(0).onDragStart(createDragEvent())
    })

    act(() => {
      const e = createDragEvent()
      result.current.dragHandlers(2).onDragEnter(e)
      expect(e.preventDefault).toHaveBeenCalled()
    })

    expect(result.current.dropIndex).toBe(2)
  })

  it('reorders items on drop to a different position', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Simulate drag from index 0
    const startEvent = createDragEvent()
    act(() => {
      result.current.dragHandlers(0).onDragStart(startEvent)
    })

    // Simulate drop at index 2
    const dropEvent = createDragEvent()
    // Manually set getData to return '0' (the source index)
    ;(dropEvent.dataTransfer.getData as ReturnType<typeof vi.fn>).mockReturnValue('0')

    act(() => {
      result.current.dragHandlers(2).onDrop(dropEvent)
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
    const reordered = onReorder.mock.calls[0][0]
    expect(reordered[0].id).toBe('item-1')
    expect(reordered[1].id).toBe('item-2')
    expect(reordered[2].id).toBe('item-0')
  })

  it('does not call onReorder when dropping at the same position', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    const startEvent = createDragEvent()
    act(() => {
      result.current.dragHandlers(1).onDragStart(startEvent)
    })

    const dropEvent = createDragEvent()
    ;(dropEvent.dataTransfer.getData as ReturnType<typeof vi.fn>).mockReturnValue('1')

    act(() => {
      result.current.dragHandlers(1).onDrop(dropEvent)
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('resets drag state on dragEnd', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(1).onDragStart(createDragEvent())
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      result.current.dragHandlers(1).onDragEnd()
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.dragIndex).toBeNull()
    expect(result.current.dropIndex).toBeNull()
  })

  // --- Visual Feedback ---

  it('applies reduced opacity to the dragged item', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(1).onDragStart(createDragEvent())
    })

    const draggedHandlers = result.current.dragHandlers(1)
    expect(draggedHandlers.style.opacity).toBe(0.5)
    expect(draggedHandlers.style.cursor).toBe('grabbing')
  })

  it('applies drop target outline to the hovered item', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(0).onDragStart(createDragEvent())
    })

    act(() => {
      result.current.dragHandlers(2).onDragOver(createDragEvent())
    })

    const targetHandlers = result.current.dragHandlers(2)
    expect(targetHandlers.style.outline).toBe('2px dashed #4f46e5')
    expect(targetHandlers.style.outlineOffset).toBe('2px')
  })

  it('updates aria-label for grabbed item', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(1).onDragStart(createDragEvent())
    })

    const handlers = result.current.dragHandlers(1)
    expect(handlers['aria-label']).toContain('grabbed')
  })

  // --- Empty List ---

  it('handles empty item list gracefully', () => {
    const { result } = renderHook(() => useDragAndDrop([], onReorder))

    expect(result.current.isDragging).toBe(false)
    expect(result.current.items).toEqual([])
    expect(typeof result.current.dragHandlers).toBe('function')
  })

  // --- Single Item ---

  it('handles single item list', () => {
    const items = makeItems(1)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    const handlers = result.current.dragHandlers(0)
    expect(handlers['aria-label']).toContain('position 1 of 1')
  })

  // --- Keyboard Reordering ---

  it('grabs item with Space key', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      const e = createKeyboardEvent(' ')
      result.current.dragHandlers(1).onKeyDown(e)
      expect(e.preventDefault).toHaveBeenCalled()
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.dragIndex).toBe(1)
  })

  it('moves item up with ArrowUp key after grab', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab item at index 1
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent(' '))
    })

    // Move up
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent('ArrowUp'))
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
    const reordered = onReorder.mock.calls[0][0]
    expect(reordered[0].id).toBe('item-1')
    expect(reordered[1].id).toBe('item-0')
    expect(reordered[2].id).toBe('item-2')
  })

  it('moves item down with ArrowDown key after grab', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab item at index 1
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent(' '))
    })

    // Move down
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
    const reordered = onReorder.mock.calls[0][0]
    expect(reordered[0].id).toBe('item-0')
    expect(reordered[1].id).toBe('item-2')
    expect(reordered[2].id).toBe('item-1')
  })

  it('does not move item beyond top boundary', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab item at index 0
    act(() => {
      result.current.dragHandlers(0).onKeyDown(createKeyboardEvent(' '))
    })

    // Try to move up (already at top)
    act(() => {
      result.current.dragHandlers(0).onKeyDown(createKeyboardEvent('ArrowUp'))
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('does not move item beyond bottom boundary', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab item at index 2 (last)
    act(() => {
      result.current.dragHandlers(2).onKeyDown(createKeyboardEvent(' '))
    })

    // Try to move down (already at bottom)
    act(() => {
      result.current.dragHandlers(2).onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('cancels keyboard grab with Escape', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent(' '))
    })

    expect(result.current.isDragging).toBe(true)

    // Cancel
    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent('Escape'))
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.dragIndex).toBeNull()
    expect(result.current.dropIndex).toBeNull()
  })

  it('drops item at new position with Enter key', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    // Grab item at index 0
    act(() => {
      result.current.dragHandlers(0).onKeyDown(createKeyboardEvent(' '))
    })

    // Drop at index 2 (simulate: the grabbed item would be focused, pressing Enter at index 2)
    act(() => {
      result.current.dragHandlers(2).onKeyDown(createKeyboardEvent('Enter'))
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
  })

  // --- DragLeave ---

  it('clears dropIndex on dragLeave when leaving the element', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(0).onDragStart(createDragEvent())
    })

    act(() => {
      result.current.dragHandlers(2).onDragEnter(createDragEvent())
    })

    expect(result.current.dropIndex).toBe(2)

    act(() => {
      const leaveEvent = createDragEvent({
        relatedTarget: null,
      })
      ;(leaveEvent.currentTarget as unknown as { contains: ReturnType<typeof vi.fn> }).contains.mockReturnValue(false)
      result.current.dragHandlers(2).onDragLeave(leaveEvent)
    })

    expect(result.current.dropIndex).toBeNull()
  })

  // --- Touch Events ---

  it('sets dragIndex on touchStart', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      const touchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent
      result.current.dragHandlers(1).onTouchStart(touchEvent)
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.dragIndex).toBe(1)
  })

  it('resets state on touchEnd without valid drop target', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      const touchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent
      result.current.dragHandlers(1).onTouchStart(touchEvent)
    })

    act(() => {
      result.current.dragHandlers(1).onTouchEnd()
    })

    expect(result.current.isDragging).toBe(false)
    expect(onReorder).not.toHaveBeenCalled()
  })

  // --- Immutability ---

  it('does not mutate the original items array', () => {
    const items = makeItems(3)
    const originalIds = items.map((i) => i.id)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    const dropEvent = createDragEvent()
    ;(dropEvent.dataTransfer.getData as ReturnType<typeof vi.fn>).mockReturnValue('0')

    act(() => {
      result.current.dragHandlers(0).onDragStart(createDragEvent())
    })

    act(() => {
      result.current.dragHandlers(2).onDrop(dropEvent)
    })

    // Original array unchanged
    expect(items.map((i) => i.id)).toEqual(originalIds)
  })

  // --- ArrowLeft / ArrowRight ---

  it('supports ArrowLeft as alternative to ArrowUp', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent(' '))
    })

    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent('ArrowLeft'))
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
  })

  it('supports ArrowRight as alternative to ArrowDown', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent(' '))
    })

    act(() => {
      result.current.dragHandlers(1).onKeyDown(createKeyboardEvent('ArrowRight'))
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
  })

  // --- Drop with NaN dataTransfer ---

  it('does not reorder when dataTransfer contains NaN', () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useDragAndDrop(items, onReorder))

    const dropEvent = createDragEvent()
    ;(dropEvent.dataTransfer.getData as ReturnType<typeof vi.fn>).mockReturnValue('invalid')

    act(() => {
      result.current.dragHandlers(2).onDrop(dropEvent)
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  // --- Items ref update ---

  it('reflects updated items after rerender', () => {
    const items = makeItems(3)
    const { result, rerender } = renderHook(
      ({ items: hookItems }) => useDragAndDrop(hookItems, onReorder),
      { initialProps: { items } },
    )

    expect(result.current.items).toHaveLength(3)

    const newItems = makeItems(5)
    rerender({ items: newItems })

    expect(result.current.items).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// DragHandle (component)
// ---------------------------------------------------------------------------

describe('DragHandle', () => {
  it('exports DragHandle component', async () => {
    const mod = await import('../src/DragHandle')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// DraggableList (component)
// ---------------------------------------------------------------------------

describe('DraggableList', () => {
  it('exports DraggableList component', async () => {
    const mod = await import('../src/DraggableList')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// Index exports
// ---------------------------------------------------------------------------

describe('index exports', () => {
  it('exports useDragAndDrop from index', async () => {
    const mod = await import('../src/index')
    expect(mod.useDragAndDrop).toBeDefined()
    expect(typeof mod.useDragAndDrop).toBe('function')
  })

  it('exports DraggableList from index', async () => {
    const mod = await import('../src/index')
    expect(mod.DraggableList).toBeDefined()
  })

  it('exports DragHandle from index', async () => {
    const mod = await import('../src/index')
    expect(mod.DragHandle).toBeDefined()
  })
})
