'use client'

import React, { useRef, useCallback, useId } from 'react'
import type { ReactNode } from 'react'
import { useTree } from './hooks/useTree'
import type { TreeNode, UseTreeOptions, FlatTreeNode } from './hooks/useTree'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreeViewProps {
  nodes: TreeNode[]
  defaultExpanded?: string[]
  defaultSelected?: string
  multiSelect?: boolean
  className?: string
  onSelect?: (id: string) => void
}

export interface TreeItemProps {
  node: FlatTreeNode
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  itemId: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const treeStyles = 'text-sm'

const itemBaseStyles = [
  'flex items-center w-full px-2 py-1.5 text-left',
  'transition-colors cursor-pointer',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  'hover:bg-gray-100 dark:hover:bg-gray-800',
].join(' ')

const selectedStyles = 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'

const chevronStyles = [
  'inline-flex items-center justify-center',
  'w-4 h-4 shrink-0 transition-transform duration-150',
].join(' ')

const labelStyles = 'truncate select-none'

// ---------------------------------------------------------------------------
// Chevron Icon (inline SVG, no external deps)
// ---------------------------------------------------------------------------

function ChevronRight({ rotated }: { rotated: boolean }) {
  return (
    <svg
      className={`${chevronStyles} ${rotated ? 'rotate-90' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// TreeItem
// ---------------------------------------------------------------------------

export function TreeItem({
  node,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  itemId,
}: TreeItemProps) {
  const paddingLeft = `${node.depth * 20 + 4}px`

  const handleClick = useCallback(() => {
    if (node.hasChildren) {
      onToggle()
    }
    onSelect()
  }, [node.hasChildren, onToggle, onSelect])

  return (
    <div
      role="treeitem"
      id={itemId}
      aria-expanded={node.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={node.depth + 1}
      tabIndex={-1}
      className={`${itemBaseStyles} ${isSelected ? selectedStyles : ''}`}
      style={{ paddingLeft }}
      onClick={handleClick}
      data-tree-item
      data-node-id={node.id}
    >
      <span className="mr-1 shrink-0" style={{ width: '16px' }}>
        {node.hasChildren ? (
          <ChevronRight rotated={isExpanded} />
        ) : (
          <span className="inline-block w-4" />
        )}
      </span>
      {node.icon && (
        <span className="mr-1.5 shrink-0">{node.icon}</span>
      )}
      <span className={labelStyles}>{node.label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TreeView
// ---------------------------------------------------------------------------

export function TreeView({
  nodes,
  defaultExpanded,
  defaultSelected,
  multiSelect = false,
  className = '',
  onSelect,
}: TreeViewProps) {
  const baseId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const treeOptions: UseTreeOptions = {
    defaultExpanded,
    defaultSelected,
    multiSelect,
  }

  const tree = useTree(nodes, treeOptions)

  const getVisibleItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[data-tree-item]'),
    )
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getVisibleItems()
      if (items.length === 0) return

      const currentIndex = items.findIndex(
        (el) => el === document.activeElement,
      )
      if (currentIndex === -1) return

      const currentItem = items[currentIndex]
      const nodeId = currentItem.getAttribute('data-node-id')
      if (!nodeId) return

      const currentFlat = tree.flatNodes.find((n) => n.id === nodeId)

      let nextIndex: number | undefined

      switch (e.key) {
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + 1, items.length - 1)
          break
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - 1, 0)
          break
        case 'ArrowRight':
          if (currentFlat?.hasChildren && !tree.isExpanded(nodeId)) {
            tree.expand(nodeId)
          } else if (currentFlat?.hasChildren && tree.isExpanded(nodeId)) {
            // Move to first child
            nextIndex = Math.min(currentIndex + 1, items.length - 1)
          }
          break
        case 'ArrowLeft':
          if (currentFlat?.hasChildren && tree.isExpanded(nodeId)) {
            tree.collapse(nodeId)
          } else if (currentFlat?.parentId) {
            // Move to parent
            const parentIndex = items.findIndex(
              (el) =>
                el.getAttribute('data-node-id') === currentFlat.parentId,
            )
            if (parentIndex !== -1) {
              nextIndex = parentIndex
            }
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (currentFlat?.hasChildren) {
            tree.toggle(nodeId)
          }
          tree.select(nodeId)
          onSelect?.(nodeId)
          return
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = items.length - 1
          break
        default:
          return
      }

      if (nextIndex !== undefined) {
        e.preventDefault()
        items[nextIndex].focus()
      }
    },
    [getVisibleItems, tree, onSelect],
  )

  // Focus first item when tree receives focus via Tab
  const handleFocus = useCallback(
    (e: React.FocusEvent) => {
      // Only handle if the tree container itself received focus (not a child)
      if (e.target === containerRef.current) {
        const items = getVisibleItems()
        if (items.length > 0) {
          items[0].focus()
        }
      }
    },
    [getVisibleItems],
  )

  return (
    <div
      ref={containerRef}
      role="tree"
      aria-label="Tree view"
      tabIndex={0}
      className={`${treeStyles} ${className}`}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      {tree.flatNodes.map((flatNode) => {
        const itemId = `${baseId}-item-${flatNode.id}`

        return (
          <TreeItem
            key={flatNode.id}
            node={flatNode}
            isExpanded={tree.isExpanded(flatNode.id)}
            isSelected={tree.isSelected(flatNode.id)}
            onToggle={() => tree.toggle(flatNode.id)}
            onSelect={() => {
              tree.select(flatNode.id)
              onSelect?.(flatNode.id)
            }}
            itemId={itemId}
          />
        )
      })}
    </div>
  )
}

export default TreeView
