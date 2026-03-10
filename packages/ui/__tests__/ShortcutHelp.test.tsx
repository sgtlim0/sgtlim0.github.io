import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { HotkeyProvider } from '../src/hooks/HotkeyProvider'
import { useHotkeys } from '../src/hooks/useHotkeys'
import { useShortcutHelp } from '../src/hooks/useShortcutHelp'
import type { ShortcutGroup } from '../src/hooks/useShortcutHelp'
import { ShortcutHelp } from '../src/ShortcutHelp'
import { ShortcutKey } from '../src/ShortcutKey'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(HotkeyProvider, null, children)
  }
}

// ---------------------------------------------------------------------------
// ShortcutKey component
// ---------------------------------------------------------------------------

describe('ShortcutKey', () => {
  it('renders kbd elements for each key part', () => {
    const { container } = render(<ShortcutKey keys="ctrl+shift+k" />)
    const kbds = container.querySelectorAll('kbd')
    expect(kbds).toHaveLength(3)
  })

  it('renders a single key', () => {
    const { container } = render(<ShortcutKey keys="escape" />)
    const kbds = container.querySelectorAll('kbd')
    expect(kbds).toHaveLength(1)
    expect(kbds[0].textContent).toBe('Esc')
  })

  it('renders separator between keys', () => {
    const { container } = render(<ShortcutKey keys="ctrl+k" />)
    // There should be at least one "+" separator text
    const text = container.textContent ?? ''
    expect(text).toContain('+')
  })

  it('has an aria-label on the wrapper span', () => {
    const { container } = render(<ShortcutKey keys="ctrl+k" />)
    const span = container.querySelector('span[aria-label]')
    expect(span).not.toBeNull()
    expect(span?.getAttribute('aria-label')).toBe('ctrl+k')
  })

  it('renders uppercase for single character keys', () => {
    const { container } = render(<ShortcutKey keys="k" />)
    const kbd = container.querySelector('kbd')
    expect(kbd?.textContent).toBe('K')
  })

  it('renders special key symbols on non-Mac', () => {
    // jsdom typically does not report as Mac
    const { container } = render(<ShortcutKey keys="alt+enter" />)
    const kbds = container.querySelectorAll('kbd')
    // alt and enter
    expect(kbds).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// useShortcutHelp hook
// ---------------------------------------------------------------------------

describe('useShortcutHelp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts closed with empty query', () => {
    const { result } = renderHook(() => useShortcutHelp(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
    expect(result.current.groups).toEqual([])
  })

  it('open/close/toggle work correctly', () => {
    const { result } = renderHook(() => useShortcutHelp(), {
      wrapper: createWrapper(),
    })

    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)

    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
  })

  it('open resets query', () => {
    const { result } = renderHook(() => useShortcutHelp(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.open()
      result.current.setQuery('test')
    })
    expect(result.current.query).toBe('test')

    act(() => result.current.close())
    act(() => result.current.open())
    expect(result.current.query).toBe('')
  })

  it('reads registered hotkeys from provider', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
        { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
        { key: 'ctrl+shift+d', handler: () => {}, description: 'Toggle dark mode' },
      ])
      return useShortcutHelp()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    expect(result.current.allShortcuts).toHaveLength(3)
  })

  it('groups shortcuts into categories', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
        { key: 'escape', handler: () => {}, description: 'Close modal' },
        { key: 'ctrl+shift+d', handler: () => {}, description: 'Toggle dark mode' },
      ])
      return useShortcutHelp()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    const categories = result.current.groups.map((g) => g.category)
    // "Open search" → Navigation, "Close modal" → Actions, "Toggle dark mode" → Settings
    expect(categories).toContain('Navigation')
    expect(categories).toContain('Settings')
  })

  it('filters shortcuts by query (description)', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
        { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
      ])
      return useShortcutHelp()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    act(() => result.current.setQuery('search'))
    const allFiltered = result.current.groups.flatMap((g) => g.shortcuts)
    expect(allFiltered).toHaveLength(1)
    expect(allFiltered[0].description).toBe('Open search')
  })

  it('filters shortcuts by query (key)', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
        { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
      ])
      return useShortcutHelp()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    act(() => result.current.setQuery('escape'))
    const allFiltered = result.current.groups.flatMap((g) => g.shortcuts)
    expect(allFiltered).toHaveLength(1)
    expect(allFiltered[0].key).toBe('escape')
  })

  it('returns empty groups when no shortcuts match query', () => {
    function useTestHook() {
      useHotkeys([
        { key: 'escape', handler: () => {}, description: 'Close modal' },
      ])
      return useShortcutHelp()
    }

    const { result } = renderHook(() => useTestHook(), {
      wrapper: createWrapper(),
    })

    act(() => result.current.setQuery('zzzzz'))
    expect(result.current.groups).toEqual([])
  })

  it('works without HotkeyProvider (returns empty)', () => {
    const { result } = renderHook(() => useShortcutHelp())
    expect(result.current.allShortcuts).toEqual([])
    expect(result.current.groups).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// ShortcutHelp component
// ---------------------------------------------------------------------------

describe('ShortcutHelp', () => {
  const mockGroups: ShortcutGroup[] = [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'ctrl+k', description: 'Open search', category: 'Navigation', enabled: true },
      ],
    },
    {
      category: 'Actions',
      shortcuts: [
        { key: 'escape', description: 'Close modal', category: 'Actions', enabled: true },
      ],
    },
    {
      category: 'Settings',
      shortcuts: [
        { key: 'ctrl+shift+d', description: 'Toggle dark mode', category: 'Settings', enabled: true },
      ],
    },
  ]

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    groups: mockGroups,
    query: '',
    onQueryChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ShortcutHelp {...defaultProps} isOpen={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog when isOpen is true', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeDefined()
  })

  it('has correct accessibility attributes', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-label')).toBe('Keyboard shortcuts')
  })

  it('displays title', () => {
    render(<ShortcutHelp {...defaultProps} />)
    expect(screen.getByText('Keyboard Shortcuts')).toBeDefined()
  })

  it('displays category headings', () => {
    render(<ShortcutHelp {...defaultProps} />)
    expect(screen.getByText('Navigation')).toBeDefined()
    expect(screen.getByText('Actions')).toBeDefined()
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('displays shortcut descriptions', () => {
    render(<ShortcutHelp {...defaultProps} />)
    expect(screen.getByText('Open search')).toBeDefined()
    expect(screen.getByText('Close modal')).toBeDefined()
    expect(screen.getByText('Toggle dark mode')).toBeDefined()
  })

  it('renders search input with placeholder', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search shortcuts...')
    expect(input).toBeDefined()
  })

  it('calls onQueryChange when typing in search', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search shortcuts...')
    fireEvent.change(input, { target: { value: 'search' } })
    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('search')
  })

  it('calls onClose when close button is clicked', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const closeBtn = screen.getByLabelText('Close')
    fireEvent.click(closeBtn)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<ShortcutHelp {...defaultProps} />)
    // The backdrop is the outer div with role="presentation"
    const backdrop = screen.getByRole('presentation')
    fireEvent.click(backdrop)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when dialog content is clicked', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const backdrop = screen.getByRole('presentation')
    fireEvent.keyDown(backdrop, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('shows empty message when no shortcuts', () => {
    render(<ShortcutHelp {...defaultProps} groups={[]} />)
    expect(screen.getByText('No shortcuts registered.')).toBeDefined()
  })

  it('shows "no results" message when query has no matches', () => {
    render(
      <ShortcutHelp {...defaultProps} groups={[]} query="zzz" />,
    )
    expect(screen.getByText('No shortcuts found.')).toBeDefined()
  })

  it('renders disabled shortcuts with reduced opacity', () => {
    const disabledGroups: ShortcutGroup[] = [
      {
        category: 'Actions',
        shortcuts: [
          { key: 'escape', description: 'Disabled action', category: 'Actions', enabled: false },
        ],
      },
    ]
    render(<ShortcutHelp {...defaultProps} groups={disabledGroups} />)
    const item = screen.getByText('Disabled action').closest('li')
    expect(item?.className).toContain('opacity-50')
  })

  it('displays footer with Escape hint', () => {
    render(<ShortcutHelp {...defaultProps} />)
    // Footer text contains "Press" and "to close"
    const footer = screen.getByText((content) => content.includes('to close'))
    expect(footer).toBeDefined()
  })

  it('locks body scroll when open', () => {
    const { unmount } = render(<ShortcutHelp {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
  })

  it('restores body scroll on unmount', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = render(<ShortcutHelp {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('renders shortcut list items', () => {
    render(<ShortcutHelp {...defaultProps} />)
    const lists = screen.getAllByRole('list')
    expect(lists.length).toBeGreaterThan(0)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// Integration: useShortcutHelp + ShortcutHelp component
// ---------------------------------------------------------------------------

describe('ShortcutHelp integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function TestApp() {
    useHotkeys([
      { key: 'escape', handler: () => {}, description: 'Close modal' },
      { key: 'ctrl+k', handler: () => {}, description: 'Open search' },
      { key: 'ctrl+shift+d', handler: () => {}, description: 'Toggle dark mode' },
    ])

    const help = useShortcutHelp()

    return (
      <>
        <button type="button" onClick={help.open} data-testid="open-btn">
          Open Help
        </button>
        <ShortcutHelp
          isOpen={help.isOpen}
          onClose={help.close}
          groups={help.groups}
          query={help.query}
          onQueryChange={help.setQuery}
        />
      </>
    )
  }

  it('opens and shows shortcuts when button clicked', () => {
    render(
      <HotkeyProvider>
        <TestApp />
      </HotkeyProvider>,
    )

    // Dialog should not be visible initially
    expect(screen.queryByRole('dialog')).toBeNull()

    // Click open
    fireEvent.click(screen.getByTestId('open-btn'))

    // Dialog should now be visible
    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByText('Close modal')).toBeDefined()
    expect(screen.getByText('Open search')).toBeDefined()
    expect(screen.getByText('Toggle dark mode')).toBeDefined()
  })

  it('filters shortcuts via search input', () => {
    render(
      <HotkeyProvider>
        <TestApp />
      </HotkeyProvider>,
    )

    fireEvent.click(screen.getByTestId('open-btn'))

    const input = screen.getByPlaceholderText('Search shortcuts...')
    fireEvent.change(input, { target: { value: 'dark' } })

    // Only "Toggle dark mode" should remain
    expect(screen.getByText('Toggle dark mode')).toBeDefined()
    expect(screen.queryByText('Close modal')).toBeNull()
    expect(screen.queryByText('Open search')).toBeNull()
  })

  it('closes on Escape key', () => {
    render(
      <HotkeyProvider>
        <TestApp />
      </HotkeyProvider>,
    )

    fireEvent.click(screen.getByTestId('open-btn'))
    expect(screen.getByRole('dialog')).toBeDefined()

    const backdrop = screen.getByRole('presentation')
    fireEvent.keyDown(backdrop, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
