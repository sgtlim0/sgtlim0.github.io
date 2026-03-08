import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import {
  CommandPalette,
  CommandPaletteProvider,
  useCommandPaletteContext,
  createDefaultCommands,
} from '../src/CommandPalette'
import type { Command } from '../src/CommandPalette'

// --- Test helpers ---

function createTestCommands(): Command[] {
  return [
    { id: 'nav-home', label: 'Go to Home', category: 'navigation', shortcut: 'Ctrl+H', handler: vi.fn() },
    { id: 'nav-docs', label: 'Go to Docs', category: 'navigation', handler: vi.fn() },
    { id: 'action-search', label: 'Search', category: 'action', shortcut: 'Ctrl+/', handler: vi.fn() },
    { id: 'action-dark', label: 'Toggle Dark Mode', category: 'action', shortcut: 'Ctrl+Shift+D', handler: vi.fn() },
    { id: 'settings-open', label: 'Open Settings', category: 'settings', shortcut: 'Ctrl+,', handler: vi.fn() },
  ]
}

function ContextConsumer() {
  const { isOpen, open, close, registerCommand, unregisterCommand, commands } = useCommandPaletteContext()
  return (
    <div>
      <span data-testid="is-open">{String(isOpen)}</span>
      <span data-testid="count">{commands.length}</span>
      <button onClick={open}>Open</button>
      <button onClick={close}>Close</button>
      <button
        onClick={() =>
          registerCommand({ id: 'test-cmd', label: 'Test Command', category: 'action', handler: vi.fn() })
        }
      >
        Register
      </button>
      <button onClick={() => unregisterCommand('test-cmd')}>Unregister</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

// --- CommandPalette component tests ---

describe('CommandPalette', () => {
  describe('open/close', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <CommandPalette commands={createTestCommands()} isOpen={false} onClose={vi.fn()} />,
      )
      expect(container.innerHTML).toBe('')
    })

    it('should render dialog when isOpen is true', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('should close on Escape key', () => {
      const onClose = vi.fn()
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={onClose} />)
      fireEvent.keyDown(screen.getByPlaceholderText('Type a command...'), { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('should close when clicking backdrop', () => {
      const onClose = vi.fn()
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={onClose} />)
      fireEvent.click(screen.getByRole('dialog'))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('should not close when clicking inside the panel', () => {
      const onClose = vi.fn()
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={onClose} />)
      fireEvent.click(screen.getByPlaceholderText('Type a command...'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('search filtering', () => {
    it('should show all commands when query is empty', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByText('Go to Home')).toBeDefined()
      expect(screen.getByText('Go to Docs')).toBeDefined()
      expect(screen.getByText('Search')).toBeDefined()
      expect(screen.getByText('Toggle Dark Mode')).toBeDefined()
      expect(screen.getByText('Open Settings')).toBeDefined()
    })

    it('should filter commands by fuzzy match', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      fireEvent.change(screen.getByPlaceholderText('Type a command...'), { target: { value: 'dark' } })
      expect(screen.getByText('Toggle Dark Mode')).toBeDefined()
      expect(screen.queryByText('Go to Home')).toBeNull()
      expect(screen.queryByText('Search')).toBeNull()
    })

    it('should show empty state when no commands match', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      fireEvent.change(screen.getByPlaceholderText('Type a command...'), { target: { value: 'zzzzzzz' } })
      expect(screen.getByText('No commands found')).toBeDefined()
    })

    it('should fuzzy match non-contiguous characters', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      fireEvent.change(screen.getByPlaceholderText('Type a command...'), { target: { value: 'gho' } })
      // "Go to Home" matches g...h...o
      expect(screen.getByText('Go to Home')).toBeDefined()
    })
  })

  describe('category grouping', () => {
    it('should display category headers', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByText('Navigation')).toBeDefined()
      expect(screen.getByText('Actions')).toBeDefined()
      expect(screen.getByText('Settings')).toBeDefined()
    })
  })

  describe('keyboard navigation', () => {
    it('should move selection down with ArrowDown', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const input = screen.getByPlaceholderText('Type a command...')

      // First item is selected by default
      const options = screen.getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')

      fireEvent.keyDown(input, { key: 'ArrowDown' })
      const optionsAfter = screen.getAllByRole('option')
      expect(optionsAfter[1]?.getAttribute('aria-selected')).toBe('true')
    })

    it('should move selection up with ArrowUp', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const input = screen.getByPlaceholderText('Type a command...')

      // ArrowUp from first should wrap to last
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      const options = screen.getAllByRole('option')
      expect(options[options.length - 1]?.getAttribute('aria-selected')).toBe('true')
    })

    it('should wrap around on ArrowDown from last item', () => {
      const commands = createTestCommands()
      render(<CommandPalette commands={commands} isOpen={true} onClose={vi.fn()} />)
      const input = screen.getByPlaceholderText('Type a command...')

      // Navigate to the end
      for (let i = 0; i < commands.length; i++) {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      }

      // Should wrap to first
      const options = screen.getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')
    })

    it('should execute command on Enter', () => {
      const commands = createTestCommands()
      const onClose = vi.fn()
      render(<CommandPalette commands={commands} isOpen={true} onClose={onClose} />)
      const input = screen.getByPlaceholderText('Type a command...')

      fireEvent.keyDown(input, { key: 'Enter' })
      // First command (Go to Home) should have been called
      expect(commands[0]!.handler).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('should execute selected command on Enter after navigation', () => {
      const commands = createTestCommands()
      const onClose = vi.fn()
      render(<CommandPalette commands={commands} isOpen={true} onClose={onClose} />)
      const input = screen.getByPlaceholderText('Type a command...')

      // Navigate down twice (to third item: Search)
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(commands[2]!.handler).toHaveBeenCalledOnce()
    })
  })

  describe('command execution', () => {
    it('should execute command on click', () => {
      const commands = createTestCommands()
      const onClose = vi.fn()
      render(<CommandPalette commands={commands} isOpen={true} onClose={onClose} />)

      fireEvent.click(screen.getByText('Search'))
      expect(commands[2]!.handler).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('should save executed command to recent', () => {
      const commands = createTestCommands()
      render(<CommandPalette commands={commands} isOpen={true} onClose={vi.fn()} />)

      fireEvent.click(screen.getByText('Search'))

      const stored = JSON.parse(localStorage.getItem('hchat-command-palette-recent') || '[]')
      expect(stored).toContain('action-search')
    })
  })

  describe('shortcuts display', () => {
    it('should display keyboard shortcuts', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByText('Ctrl+H')).toBeDefined()
      expect(screen.getByText('Ctrl+/')).toBeDefined()
      expect(screen.getByText('Ctrl+Shift+D')).toBeDefined()
      expect(screen.getByText('Ctrl+,')).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('should have role=dialog with aria-modal', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-modal')).toBe('true')
    })

    it('should have role=listbox for results', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole('listbox')).toBeDefined()
    })

    it('should have role=option for each command', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const options = screen.getAllByRole('option')
      expect(options.length).toBe(5)
    })

    it('should set aria-selected on the active option', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const options = screen.getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')
      expect(options[1]?.getAttribute('aria-selected')).toBe('false')
    })

    it('should have aria-label on the search input', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByLabelText('Search commands')).toBeDefined()
    })
  })

  describe('mobile behavior', () => {
    it('should have hidden class for mobile (sm:flex)', () => {
      render(<CommandPalette commands={createTestCommands()} isOpen={true} onClose={vi.fn()} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toContain('hidden')
      expect(dialog.className).toContain('sm:flex')
    })
  })
})

// --- CommandPaletteProvider tests ---

describe('CommandPaletteProvider', () => {
  it('should provide context to children', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )
    expect(screen.getByTestId('is-open').textContent).toBe('false')
  })

  it('should allow opening the palette', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )

    act(() => {
      fireEvent.click(screen.getByText('Open'))
    })
    expect(screen.getByTestId('is-open').textContent).toBe('true')
  })

  it('should allow registering commands', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )

    act(() => {
      fireEvent.click(screen.getByText('Register'))
    })
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('should allow unregistering commands', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )

    act(() => {
      fireEvent.click(screen.getByText('Register'))
    })
    expect(screen.getByTestId('count').textContent).toBe('1')

    act(() => {
      fireEvent.click(screen.getByText('Unregister'))
    })
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('should register default commands on mount', () => {
    const defaults = createTestCommands().slice(0, 2)
    render(
      <CommandPaletteProvider defaultCommands={defaults}>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('should toggle palette with Ctrl+K', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )

    expect(screen.getByTestId('is-open').textContent).toBe('false')

    act(() => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })
    expect(screen.getByTestId('is-open').textContent).toBe('true')

    act(() => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    })
    expect(screen.getByTestId('is-open').textContent).toBe('false')
  })

  it('should toggle palette with Meta+K (macOS)', () => {
    render(
      <CommandPaletteProvider>
        <ContextConsumer />
      </CommandPaletteProvider>,
    )

    act(() => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true })
    })
    expect(screen.getByTestId('is-open').textContent).toBe('true')
  })
})

// --- useCommandPaletteContext error ---

describe('useCommandPaletteContext', () => {
  it('should throw when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ContextConsumer />)).toThrow(
      'useCommandPaletteContext must be used within CommandPaletteProvider',
    )
    consoleSpy.mockRestore()
  })
})

// --- createDefaultCommands ---

describe('createDefaultCommands', () => {
  it('should return empty array when no options provided', () => {
    expect(createDefaultCommands()).toEqual([])
  })

  it('should create home navigation command', () => {
    const handler = vi.fn()
    const commands = createDefaultCommands({ onNavigateHome: handler })
    expect(commands).toHaveLength(1)
    expect(commands[0]!.id).toBe('nav-home')
    expect(commands[0]!.category).toBe('navigation')
    commands[0]!.handler()
    expect(handler).toHaveBeenCalledOnce()
  })

  it('should create dark mode toggle command', () => {
    const handler = vi.fn()
    const commands = createDefaultCommands({ onToggleDarkMode: handler })
    expect(commands).toHaveLength(1)
    expect(commands[0]!.id).toBe('action-dark-mode')
    expect(commands[0]!.category).toBe('action')
  })

  it('should create search command', () => {
    const handler = vi.fn()
    const commands = createDefaultCommands({ onSearch: handler })
    expect(commands).toHaveLength(1)
    expect(commands[0]!.id).toBe('action-search')
  })

  it('should create settings command', () => {
    const handler = vi.fn()
    const commands = createDefaultCommands({ onSettings: handler })
    expect(commands).toHaveLength(1)
    expect(commands[0]!.id).toBe('nav-settings')
    expect(commands[0]!.category).toBe('settings')
  })

  it('should create all commands when all options provided', () => {
    const commands = createDefaultCommands({
      onNavigateHome: vi.fn(),
      onToggleDarkMode: vi.fn(),
      onSearch: vi.fn(),
      onSettings: vi.fn(),
    })
    expect(commands).toHaveLength(4)
  })
})
