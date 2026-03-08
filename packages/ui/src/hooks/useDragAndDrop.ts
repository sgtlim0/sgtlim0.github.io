'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Represents a draggable item with a unique identifier.
 */
export interface DragItem {
  readonly id: string
  readonly index: number
}

/**
 * Props returned by dragHandlers for attaching to draggable elements.
 */
export interface DragHandlerProps {
  readonly draggable: true
  readonly 'aria-roledescription': 'sortable'
  readonly 'aria-label': string
  readonly role: 'listitem'
  readonly tabIndex: 0
  readonly onDragStart: (e: React.DragEvent) => void
  readonly onDragOver: (e: React.DragEvent) => void
  readonly onDragEnd: () => void
  readonly onDrop: (e: React.DragEvent) => void
  readonly onDragEnter: (e: React.DragEvent) => void
  readonly onDragLeave: (e: React.DragEvent) => void
  readonly onTouchStart: (e: React.TouchEvent) => void
  readonly onTouchMove: (e: React.TouchEvent) => void
  readonly onTouchEnd: () => void
  readonly onKeyDown: (e: React.KeyboardEvent) => void
  readonly style: React.CSSProperties
  readonly 'data-drag-index': number
}

/**
 * Return type for useDragAndDrop hook.
 */
export interface UseDragAndDropReturn<T extends { id: string }> {
  readonly dragHandlers: (index: number) => DragHandlerProps
  readonly isDragging: boolean
  readonly dragIndex: number | null
  readonly dropIndex: number | null
  readonly items: readonly T[]
}

function reorderItems<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}

/**
 * Hook for drag-and-drop reordering of lists using HTML5 Drag & Drop API.
 *
 * Features:
 * - HTML5 Drag & Drop with visual feedback (opacity, placeholder)
 * - Touch device support (touch events fallback)
 * - Keyboard reorder (Space to grab, Arrow keys to move, Space/Enter to drop, Escape to cancel)
 * - Accessibility: aria-roledescription="sortable", aria-label
 * - SSR safe (no window/document access during init)
 * - Immutable state updates
 *
 * @param items - Array of items with unique `id` property
 * @param onReorder - Callback when items are reordered (receives new array)
 *
 * @example
 * ```tsx
 * const { dragHandlers, isDragging } = useDragAndDrop(widgets, setWidgets)
 * return widgets.map((w, i) => <div key={w.id} {...dragHandlers(i)}>{w.name}</div>)
 * ```
 */
export function useDragAndDrop<T extends { id: string }>(
  items: readonly T[],
  onReorder: (items: T[]) => void,
): UseDragAndDropReturn<T> {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [keyboardGrabbed, setKeyboardGrabbed] = useState(false)

  const touchStartRef = useRef<{ index: number; y: number } | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDragEnter = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    setDropIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (!e.currentTarget.contains(relatedTarget)) {
      setDropIndex(null)
    }
  }, [])

  const handleDrop = useCallback((targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'))
    if (!Number.isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      const reordered = reorderItems(itemsRef.current, sourceIndex, targetIndex)
      onReorder(reordered)
    }
    setDragIndex(null)
    setDropIndex(null)
  }, [onReorder])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  const handleTouchStart = useCallback((index: number) => (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { index, y: touch.clientY }
    setDragIndex(index)
  }, [])

  const handleTouchMove = useCallback((_index: number) => (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return

    const touch = e.touches[0]
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY)

    for (const el of elements) {
      const dragAttr = (el as HTMLElement).dataset?.dragIndex
      if (dragAttr !== undefined) {
        const overIndex = Number(dragAttr)
        if (!Number.isNaN(overIndex)) {
          setDropIndex(overIndex)
          break
        }
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current !== null && dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const reordered = reorderItems(itemsRef.current, dragIndex, dropIndex)
      onReorder(reordered)
    }
    touchStartRef.current = null
    setDragIndex(null)
    setDropIndex(null)
  }, [dragIndex, dropIndex, onReorder])

  const handleKeyDown = useCallback((index: number) => (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!keyboardGrabbed) {
        setDragIndex(index)
        setKeyboardGrabbed(true)
      } else if (dragIndex !== null) {
        if (dragIndex !== index) {
          const reordered = reorderItems(itemsRef.current, dragIndex, index)
          onReorder(reordered)
        }
        setDragIndex(null)
        setDropIndex(null)
        setKeyboardGrabbed(false)
      }
    } else if (keyboardGrabbed && dragIndex !== null) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const newIndex = Math.max(0, dragIndex - 1)
        if (newIndex !== dragIndex) {
          const reordered = reorderItems(itemsRef.current, dragIndex, newIndex)
          onReorder(reordered)
          setDragIndex(newIndex)
          setDropIndex(newIndex)
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const newIndex = Math.min(itemsRef.current.length - 1, dragIndex + 1)
        if (newIndex !== dragIndex) {
          const reordered = reorderItems(itemsRef.current, dragIndex, newIndex)
          onReorder(reordered)
          setDragIndex(newIndex)
          setDropIndex(newIndex)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setDragIndex(null)
        setDropIndex(null)
        setKeyboardGrabbed(false)
      }
    }
  }, [keyboardGrabbed, dragIndex, onReorder])

  const dragHandlers = useCallback((index: number): DragHandlerProps => {
    const isDragged = dragIndex === index
    const isDropTarget = dropIndex === index && dragIndex !== index

    return {
      draggable: true as const,
      'aria-roledescription': 'sortable' as const,
      'aria-label': `Sortable item, position ${index + 1} of ${itemsRef.current.length}${isDragged ? ', grabbed' : ''}${isDropTarget ? ', drop target' : ''}`,
      role: 'listitem' as const,
      tabIndex: 0 as const,
      onDragStart: handleDragStart(index),
      onDragOver: handleDragOver(index),
      onDragEnd: handleDragEnd,
      onDrop: handleDrop(index),
      onDragEnter: handleDragEnter(index),
      onDragLeave: handleDragLeave(),
      onTouchStart: handleTouchStart(index),
      onTouchMove: handleTouchMove(index),
      onTouchEnd: handleTouchEnd,
      onKeyDown: handleKeyDown(index),
      style: {
        opacity: isDragged ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
        outline: isDropTarget ? '2px dashed #4f46e5' : undefined,
        outlineOffset: isDropTarget ? '2px' : undefined,
        cursor: isDragged ? 'grabbing' : 'grab',
      },
      'data-drag-index': index,
    }
  }, [
    dragIndex,
    dropIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  ])

  return {
    dragHandlers,
    isDragging: dragIndex !== null,
    dragIndex,
    dropIndex,
    items,
  }
}
