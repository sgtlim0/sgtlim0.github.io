import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTree } from '../src/hooks/useTree'
import type { TreeNode } from '../src/hooks/useTree'
import { TreeView, TreeItem } from '../src/TreeView'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleNodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', isLeaf: true },
          { id: 'Modal.tsx', label: 'Modal.tsx', isLeaf: true },
        ],
      },
      { id: 'index.ts', label: 'index.ts', isLeaf: true },
    ],
  },
  {
    id: 'package.json',
    label: 'package.json',
    isLeaf: true,
  },
  {
    id: 'docs',
    label: 'docs',
    children: [
      { id: 'README.md', label: 'README.md', isLeaf: true },
    ],
  },
]

const flatNodes: TreeNode[] = [
  { id: 'a', label: 'A', isLeaf: true },
  { id: 'b', label: 'B', isLeaf: true },
  { id: 'c', label: 'C', isLeaf: true },
]

// ---------------------------------------------------------------------------
// useTree hook tests
// ---------------------------------------------------------------------------

describe('useTree', () => {
  // --- initial state ---

  it('starts with no expanded or selected items by default', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    expect(result.current.expandedIds.size).toBe(0)
    expect(result.current.selectedIds.size).toBe(0)
  })

  it('initializes expanded items from defaultExpanded', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src', 'docs'] }),
    )
    expect(result.current.isExpanded('src')).toBe(true)
    expect(result.current.isExpanded('docs')).toBe(true)
    expect(result.current.isExpanded('components')).toBe(false)
  })

  it('initializes selected item from defaultSelected', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultSelected: 'index.ts' }),
    )
    expect(result.current.isSelected('index.ts')).toBe(true)
    expect(result.current.isSelected('src')).toBe(false)
  })

  // --- toggle ---

  it('toggle() expands a collapsed node', () => {
    const { result } = renderHook(() => useTree(sampleNodes))

    act(() => {
      result.current.toggle('src')
    })

    expect(result.current.isExpanded('src')).toBe(true)
  })

  it('toggle() collapses an expanded node', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src'] }),
    )

    act(() => {
      result.current.toggle('src')
    })

    expect(result.current.isExpanded('src')).toBe(false)
  })

  // --- expand / collapse ---

  it('expand() expands a specific node', () => {
    const { result } = renderHook(() => useTree(sampleNodes))

    act(() => {
      result.current.expand('docs')
    })

    expect(result.current.isExpanded('docs')).toBe(true)
  })

  it('expand() is a no-op if already expanded', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src'] }),
    )
    const prevSet = result.current.expandedIds

    act(() => {
      result.current.expand('src')
    })

    expect(result.current.expandedIds).toBe(prevSet)
  })

  it('collapse() collapses a specific node', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src'] }),
    )

    act(() => {
      result.current.collapse('src')
    })

    expect(result.current.isExpanded('src')).toBe(false)
  })

  it('collapse() is a no-op if already collapsed', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    const prevSet = result.current.expandedIds

    act(() => {
      result.current.collapse('nonexistent')
    })

    expect(result.current.expandedIds).toBe(prevSet)
  })

  // --- expandAll / collapseAll ---

  it('expandAll() expands all branch nodes', () => {
    const { result } = renderHook(() => useTree(sampleNodes))

    act(() => {
      result.current.expandAll()
    })

    expect(result.current.isExpanded('src')).toBe(true)
    expect(result.current.isExpanded('components')).toBe(true)
    expect(result.current.isExpanded('docs')).toBe(true)
    // Leaf nodes should NOT be in expandedIds
    expect(result.current.isExpanded('index.ts')).toBe(false)
    expect(result.current.isExpanded('package.json')).toBe(false)
  })

  it('collapseAll() collapses all nodes', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src', 'components', 'docs'] }),
    )

    act(() => {
      result.current.collapseAll()
    })

    expect(result.current.expandedIds.size).toBe(0)
  })

  it('collapseAll() is a no-op when nothing is expanded', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    const prevSet = result.current.expandedIds

    act(() => {
      result.current.collapseAll()
    })

    expect(result.current.expandedIds).toBe(prevSet)
  })

  // --- select ---

  it('select() selects a node (single select mode)', () => {
    const { result } = renderHook(() => useTree(sampleNodes))

    act(() => {
      result.current.select('index.ts')
    })

    expect(result.current.isSelected('index.ts')).toBe(true)
  })

  it('select() replaces previous selection in single select mode', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultSelected: 'index.ts' }),
    )

    act(() => {
      result.current.select('Button.tsx')
    })

    expect(result.current.isSelected('Button.tsx')).toBe(true)
    expect(result.current.isSelected('index.ts')).toBe(false)
  })

  it('select() adds to selection in multiSelect mode', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { multiSelect: true }),
    )

    act(() => {
      result.current.select('index.ts')
    })
    act(() => {
      result.current.select('Button.tsx')
    })

    expect(result.current.isSelected('index.ts')).toBe(true)
    expect(result.current.isSelected('Button.tsx')).toBe(true)
  })

  it('select() deselects in multiSelect mode when already selected', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { multiSelect: true, defaultSelected: 'index.ts' }),
    )

    act(() => {
      result.current.select('index.ts')
    })

    expect(result.current.isSelected('index.ts')).toBe(false)
  })

  // --- isExpanded / isSelected ---

  it('isExpanded() returns false for unknown ids', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    expect(result.current.isExpanded('nonexistent')).toBe(false)
  })

  it('isSelected() returns false for unknown ids', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    expect(result.current.isSelected('nonexistent')).toBe(false)
  })

  // --- flatNodes ---

  it('flatNodes only includes root-level nodes when nothing is expanded', () => {
    const { result } = renderHook(() => useTree(sampleNodes))
    const ids = result.current.flatNodes.map((n) => n.id)
    expect(ids).toEqual(['src', 'package.json', 'docs'])
  })

  it('flatNodes includes children when a node is expanded', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src'] }),
    )
    const ids = result.current.flatNodes.map((n) => n.id)
    expect(ids).toEqual([
      'src',
      'components',
      'index.ts',
      'package.json',
      'docs',
    ])
  })

  it('flatNodes includes deeply nested children', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src', 'components'] }),
    )
    const ids = result.current.flatNodes.map((n) => n.id)
    expect(ids).toEqual([
      'src',
      'components',
      'Button.tsx',
      'Modal.tsx',
      'index.ts',
      'package.json',
      'docs',
    ])
  })

  it('flatNodes sets correct depth values', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src', 'components'] }),
    )
    const depthMap = Object.fromEntries(
      result.current.flatNodes.map((n) => [n.id, n.depth]),
    )
    expect(depthMap['src']).toBe(0)
    expect(depthMap['components']).toBe(1)
    expect(depthMap['Button.tsx']).toBe(2)
    expect(depthMap['package.json']).toBe(0)
  })

  it('flatNodes sets correct parentId values', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src', 'components'] }),
    )
    const parentMap = Object.fromEntries(
      result.current.flatNodes.map((n) => [n.id, n.parentId]),
    )
    expect(parentMap['src']).toBeNull()
    expect(parentMap['components']).toBe('src')
    expect(parentMap['Button.tsx']).toBe('components')
    expect(parentMap['package.json']).toBeNull()
  })

  it('flatNodes marks leaf nodes correctly', () => {
    const { result } = renderHook(() =>
      useTree(sampleNodes, { defaultExpanded: ['src'] }),
    )
    const leafMap = Object.fromEntries(
      result.current.flatNodes.map((n) => [n.id, n.isLeaf]),
    )
    expect(leafMap['src']).toBe(false)
    expect(leafMap['components']).toBe(false)
    expect(leafMap['index.ts']).toBe(true)
    expect(leafMap['package.json']).toBe(true)
  })

  it('handles empty nodes array', () => {
    const { result } = renderHook(() => useTree([]))
    expect(result.current.flatNodes).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// TreeView component tests
// ---------------------------------------------------------------------------

describe('TreeView component', () => {
  // --- rendering ---

  it('renders root-level nodes', () => {
    render(<TreeView nodes={sampleNodes} />)

    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('package.json')).toBeInTheDocument()
    expect(screen.getByText('docs')).toBeInTheDocument()
  })

  it('does not render children of collapsed nodes', () => {
    render(<TreeView nodes={sampleNodes} />)

    expect(screen.queryByText('components')).not.toBeInTheDocument()
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument()
  })

  it('renders children of expanded nodes via defaultExpanded', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    expect(screen.getByText('components')).toBeInTheDocument()
    expect(screen.getByText('index.ts')).toBeInTheDocument()
  })

  it('renders deeply nested children', () => {
    render(
      <TreeView
        nodes={sampleNodes}
        defaultExpanded={['src', 'components']}
      />,
    )

    expect(screen.getByText('Button.tsx')).toBeInTheDocument()
    expect(screen.getByText('Modal.tsx')).toBeInTheDocument()
  })

  it('renders nothing for empty nodes', () => {
    const { container } = render(<TreeView nodes={[]} />)
    const tree = container.querySelector('[role="tree"]')
    expect(tree?.children).toHaveLength(0)
  })

  // --- expand / collapse interactions ---

  it('expands a folder node when clicked', () => {
    render(<TreeView nodes={sampleNodes} />)

    fireEvent.click(screen.getByText('src'))

    expect(screen.getByText('components')).toBeInTheDocument()
    expect(screen.getByText('index.ts')).toBeInTheDocument()
  })

  it('collapses an expanded node when clicked again', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    fireEvent.click(screen.getByText('src'))

    expect(screen.queryByText('components')).not.toBeInTheDocument()
  })

  // --- selection ---

  it('selects a node when clicked', () => {
    render(<TreeView nodes={sampleNodes} />)

    fireEvent.click(screen.getByText('package.json'))

    const item = screen.getByText('package.json').closest('[role="treeitem"]')
    expect(item).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onSelect when a node is selected', () => {
    const onSelect = vi.fn()
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('package.json'))

    expect(onSelect).toHaveBeenCalledWith('package.json')
  })

  it('highlights the selected node with defaultSelected', () => {
    render(
      <TreeView nodes={flatNodes} defaultSelected="b" />,
    )

    const item = screen.getByText('B').closest('[role="treeitem"]')
    expect(item).toHaveAttribute('aria-selected', 'true')
  })

  // --- accessibility ---

  it('has role="tree" on the container', () => {
    render(<TreeView nodes={sampleNodes} />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
  })

  it('items have role="treeitem"', () => {
    render(<TreeView nodes={sampleNodes} />)
    const treeitems = screen.getAllByRole('treeitem')
    expect(treeitems).toHaveLength(3) // src, package.json, docs
  })

  it('branch nodes have aria-expanded attribute', () => {
    render(<TreeView nodes={sampleNodes} />)

    const srcItem = screen.getByText('src').closest('[role="treeitem"]')
    expect(srcItem).toHaveAttribute('aria-expanded', 'false')
  })

  it('expanded branch nodes have aria-expanded="true"', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    const srcItem = screen.getByText('src').closest('[role="treeitem"]')
    expect(srcItem).toHaveAttribute('aria-expanded', 'true')
  })

  it('leaf nodes do not have aria-expanded attribute', () => {
    render(<TreeView nodes={sampleNodes} />)

    const leafItem = screen
      .getByText('package.json')
      .closest('[role="treeitem"]')
    expect(leafItem).not.toHaveAttribute('aria-expanded')
  })

  it('items have aria-selected attribute', () => {
    render(<TreeView nodes={sampleNodes} />)

    const treeitems = screen.getAllByRole('treeitem')
    treeitems.forEach((item) => {
      expect(item).toHaveAttribute('aria-selected')
    })
  })

  it('items have aria-level attribute', () => {
    render(
      <TreeView nodes={sampleNodes} defaultExpanded={['src']} />,
    )

    const srcItem = screen.getByText('src').closest('[role="treeitem"]')
    expect(srcItem).toHaveAttribute('aria-level', '1')

    const componentsItem = screen
      .getByText('components')
      .closest('[role="treeitem"]')
    expect(componentsItem).toHaveAttribute('aria-level', '2')
  })

  // --- keyboard navigation ---

  it('ArrowDown moves focus to the next visible item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus()

    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
  })

  it('ArrowUp moves focus to the previous visible item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[1].focus()

    fireEvent.keyDown(items[1], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[0])
  })

  it('ArrowDown does not wrap past last item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[2].focus()

    fireEvent.keyDown(items[2], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[2])
  })

  it('ArrowUp does not wrap past first item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus()

    fireEvent.keyDown(items[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[0])
  })

  it('ArrowRight expands a collapsed branch node', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus() // src

    fireEvent.keyDown(items[0], { key: 'ArrowRight' })

    // After expand, children should be visible
    expect(screen.getByText('components')).toBeInTheDocument()
  })

  it('ArrowRight on expanded branch moves to first child', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus() // src

    fireEvent.keyDown(items[0], { key: 'ArrowRight' })

    // Focus should move to 'components'
    const updatedItems = screen.getAllByRole('treeitem')
    expect(document.activeElement).toBe(updatedItems[1])
  })

  it('ArrowLeft collapses an expanded branch node', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus() // src (expanded)

    fireEvent.keyDown(items[0], { key: 'ArrowLeft' })

    // Children should be hidden
    expect(screen.queryByText('components')).not.toBeInTheDocument()
  })

  it('ArrowLeft on a child node moves focus to parent', () => {
    render(<TreeView nodes={sampleNodes} defaultExpanded={['src']} />)

    const items = screen.getAllByRole('treeitem')
    // items: src, components, index.ts, package.json, docs
    items[1].focus() // components

    fireEvent.keyDown(items[1], { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(items[0]) // src
  })

  it('Enter selects a node and calls onSelect', () => {
    const onSelect = vi.fn()
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />)

    const items = screen.getAllByRole('treeitem')
    items[1].focus() // package.json

    fireEvent.keyDown(items[1], { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith('package.json')
    expect(items[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('Space selects a node and toggles branch', () => {
    const onSelect = vi.fn()
    render(<TreeView nodes={sampleNodes} onSelect={onSelect} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus() // src (branch)

    fireEvent.keyDown(items[0], { key: ' ' })

    expect(onSelect).toHaveBeenCalledWith('src')
    // Branch should expand
    expect(screen.getByText('components')).toBeInTheDocument()
  })

  it('Home moves focus to the first item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[2].focus()

    fireEvent.keyDown(items[2], { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })

  it('End moves focus to the last item', () => {
    render(<TreeView nodes={sampleNodes} />)

    const items = screen.getAllByRole('treeitem')
    items[0].focus()

    fireEvent.keyDown(items[0], { key: 'End' })
    expect(document.activeElement).toBe(items[2])
  })

  // --- className ---

  it('accepts className prop', () => {
    const { container } = render(
      <TreeView nodes={sampleNodes} className="custom-tree" />,
    )
    const tree = container.querySelector('[role="tree"]')
    expect(tree).toHaveClass('custom-tree')
  })
})

// ---------------------------------------------------------------------------
// TreeItem standalone tests
// ---------------------------------------------------------------------------

describe('TreeItem', () => {
  const baseFlatNode = {
    id: 'test',
    label: 'Test Item',
    isLeaf: true,
    depth: 0,
    hasChildren: false,
    parentId: null,
  }

  it('renders label text', () => {
    render(
      <TreeItem
        node={baseFlatNode}
        isExpanded={false}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    const nodeWithIcon = {
      ...baseFlatNode,
      icon: <span data-testid="custom-icon">F</span>,
    }

    render(
      <TreeItem
        node={nodeWithIcon}
        isExpanded={false}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('shows chevron for branch nodes', () => {
    const branchNode = {
      ...baseFlatNode,
      isLeaf: false,
      hasChildren: true,
    }

    const { container } = render(
      <TreeItem
        node={branchNode}
        isExpanded={false}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('does not show chevron for leaf nodes', () => {
    const { container } = render(
      <TreeItem
        node={baseFlatNode}
        isExpanded={false}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('rotates chevron when expanded', () => {
    const branchNode = {
      ...baseFlatNode,
      isLeaf: false,
      hasChildren: true,
    }

    const { container } = render(
      <TreeItem
        node={branchNode}
        isExpanded={true}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain(
      'rotate-90',
    )
  })

  it('calls onToggle and onSelect when branch node is clicked', () => {
    const onToggle = vi.fn()
    const onSelect = vi.fn()
    const branchNode = {
      ...baseFlatNode,
      isLeaf: false,
      hasChildren: true,
    }

    render(
      <TreeItem
        node={branchNode}
        isExpanded={false}
        isSelected={false}
        onToggle={onToggle}
        onSelect={onSelect}
        itemId="item-test"
      />,
    )

    fireEvent.click(screen.getByText('Test Item'))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls only onSelect (not onToggle) when leaf node is clicked', () => {
    const onToggle = vi.fn()
    const onSelect = vi.fn()

    render(
      <TreeItem
        node={baseFlatNode}
        isExpanded={false}
        isSelected={false}
        onToggle={onToggle}
        onSelect={onSelect}
        itemId="item-test"
      />,
    )

    fireEvent.click(screen.getByText('Test Item'))

    expect(onToggle).not.toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('applies indentation based on depth', () => {
    const deepNode = { ...baseFlatNode, depth: 3 }

    render(
      <TreeItem
        node={deepNode}
        isExpanded={false}
        isSelected={false}
        onToggle={() => {}}
        onSelect={() => {}}
        itemId="item-test"
      />,
    )

    const item = screen.getByRole('treeitem')
    expect(item.style.paddingLeft).toBe('64px') // 3 * 20 + 4
  })
})
