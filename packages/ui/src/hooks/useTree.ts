'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  icon?: ReactNode
  isLeaf?: boolean
}

export interface FlatTreeNode {
  id: string
  label: string
  icon?: ReactNode
  isLeaf: boolean
  depth: number
  hasChildren: boolean
  parentId: string | null
}

export interface UseTreeOptions {
  defaultExpanded?: string[]
  defaultSelected?: string
  multiSelect?: boolean
}

export interface UseTreeReturn {
  expandedIds: Set<string>
  selectedIds: Set<string>
  toggle: (id: string) => void
  expand: (id: string) => void
  collapse: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  select: (id: string) => void
  isExpanded: (id: string) => boolean
  isSelected: (id: string) => boolean
  flatNodes: FlatTreeNode[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectAllBranchIds(nodes: TreeNode[]): string[] {
  const ids: string[] = []
  function walk(list: TreeNode[]) {
    for (const node of list) {
      if (node.children && node.children.length > 0 && !node.isLeaf) {
        ids.push(node.id)
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return ids
}

function flattenNodes(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  depth: number = 0,
  parentId: string | null = null,
): FlatTreeNode[] {
  const result: FlatTreeNode[] = []

  for (const node of nodes) {
    const hasChildren =
      !node.isLeaf && Array.isArray(node.children) && node.children.length > 0

    result.push({
      id: node.id,
      label: node.label,
      icon: node.icon,
      isLeaf: node.isLeaf ?? !hasChildren,
      depth,
      hasChildren,
      parentId,
    })

    if (hasChildren && expandedIds.has(node.id)) {
      const childFlat = flattenNodes(
        node.children!,
        expandedIds,
        depth + 1,
        node.id,
      )
      result.push(...childFlat)
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTree(
  nodes: TreeNode[],
  options: UseTreeOptions = {},
): UseTreeReturn {
  const {
    defaultExpanded = [],
    defaultSelected,
    multiSelect = false,
  } = options

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpanded),
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => (defaultSelected ? new Set([defaultSelected]) : new Set()),
  )

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const collapse = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    const allBranchIds = collectAllBranchIds(nodes)
    setExpandedIds(new Set(allBranchIds))
  }, [nodes])

  const collapseAll = useCallback(() => {
    setExpandedIds((prev) => (prev.size === 0 ? prev : new Set()))
  }, [])

  const select = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (multiSelect) {
          const next = new Set(prev)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        }
        return new Set([id])
      })
    },
    [multiSelect],
  )

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  )

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  const flatNodes = useMemo(
    () => flattenNodes(nodes, expandedIds),
    [nodes, expandedIds],
  )

  return {
    expandedIds,
    selectedIds,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    select,
    isExpanded,
    isSelected,
    flatNodes,
  }
}
