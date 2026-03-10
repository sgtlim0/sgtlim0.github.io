import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { HotkeyProvider } from '../src/hooks/HotkeyProvider'
import { useHotkeys } from '../src/hooks/useHotkeys'
import {
  CommandPaletteProvider,
  useCommandPaletteContext,
} from '../src/CommandPalette'
import type { Command } from '../src/CommandPalette'

// ---------------------------------------------------------------------------
// Wrapper: HotkeyProvider + CommandPaletteProvider
// ---------------------------------------------------------------------------

function KeyboardProviders({
  children,
  commands,
}: {
  children: ReactNode
  commands?: Command[]
}) {
  return (
    <HotkeyProvider>
      <CommandPaletteProvider defaultCommands={commands}>
        {children}
      </CommandPaletteProvider>
    </HotkeyProvider>
  )
}

// ---------------------------------------------------------------------------
// Consumer: uses both hotkeys and command palette
// ---------------------------------------------------------------------------

function KeyboardApp({ onAction }: { onAction: (action: string) => void }) {
  const { isOpen, open, close, registerCommand } = useCommandPaletteContext()

  useHotkeys([
    {
      key: 'ctrl+n',
      description: 'New item',
      handler: () => onAction('new-item'),
      preventDefault: true,
    },
    {
      key: 'ctrl+s',
      description: 'Save',
      handler: () => onAction('save'),
      preventDefault: true,
    },
  ])

  return (
    <div>
      <span data-testid="palette-open">{String(isOpen)}</span>
      <button data-testid="manual-open" onClick={open}>Open Palette</button>
      <button data-testid="manual-close" onClick={close}>Close Palette</button>
      <button
        data-testid="register-cmd"
        onClick={() =>
          registerCommand({
            id: 'dynamic-cmd',
            label: 'Dynamic Command',
            category: 'action',
            handler: () => onAction('dynamic'),
          })
        }
      >
        Register
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()
})

describe('Integration: Keyboard shortcuts + Command Palette', () => {
  describe('Cmd+K opens Command Palette', () => {
    it('should open palette with Ctrl+K', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      expect(screen.getByTestId('palette-open').textContent).toBe('false')

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      expect(screen.getByTestId('palette-open').textContent).toBe('true')
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('should open palette with Meta+K (macOS)', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', metaKey: true })
      })

      expect(screen.getByTestId('palette-open').textContent).toBe('true')
    })

    it('should toggle palette with repeated Ctrl+K', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      // Open
      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })
      expect(screen.getByTestId('palette-open').textContent).toBe('true')

      // Close
      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })
      expect(screen.getByTestId('palette-open').textContent).toBe('false')
    })
  })

  describe('search and execute commands', () => {
    it('should display default commands in palette', () => {
      const onAction = vi.fn()
      const commands: Command[] = [
        { id: 'go-home', label: 'Go to Home', category: 'navigation', handler: () => onAction('home') },
        { id: 'toggle-dark', label: 'Toggle Dark Mode', category: 'action', handler: () => onAction('dark') },
        { id: 'open-settings', label: 'Open Settings', category: 'settings', handler: () => onAction('settings') },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      expect(screen.getByText('Go to Home')).toBeDefined()
      expect(screen.getByText('Toggle Dark Mode')).toBeDefined()
      expect(screen.getByText('Open Settings')).toBeDefined()
    })

    it('should filter commands by search query', () => {
      const onAction = vi.fn()
      const commands: Command[] = [
        { id: 'go-home', label: 'Go to Home', category: 'navigation', handler: vi.fn() },
        { id: 'toggle-dark', label: 'Toggle Dark Mode', category: 'action', handler: vi.fn() },
        { id: 'open-settings', label: 'Open Settings', category: 'settings', handler: vi.fn() },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      const input = screen.getByPlaceholderText('Type a command...')
      act(() => {
        fireEvent.change(input, { target: { value: 'dark' } })
      })

      expect(screen.getByText('Toggle Dark Mode')).toBeDefined()
      expect(screen.queryByText('Go to Home')).toBeNull()
      expect(screen.queryByText('Open Settings')).toBeNull()
    })

    it('should execute command on Enter', () => {
      const onAction = vi.fn()
      const commands: Command[] = [
        { id: 'go-home', label: 'Go to Home', category: 'navigation', handler: () => onAction('home') },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      const input = screen.getByPlaceholderText('Type a command...')
      act(() => {
        fireEvent.keyDown(input, { key: 'Enter' })
      })

      expect(onAction).toHaveBeenCalledWith('home')
    })

    it('should execute command on click', () => {
      const onAction = vi.fn()
      const commands: Command[] = [
        { id: 'go-home', label: 'Go to Home', category: 'navigation', handler: () => onAction('home') },
        { id: 'toggle-dark', label: 'Toggle Dark Mode', category: 'action', handler: () => onAction('dark') },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      act(() => {
        fireEvent.click(screen.getByText('Toggle Dark Mode'))
      })

      expect(onAction).toHaveBeenCalledWith('dark')
    })
  })

  describe('Escape closes palette', () => {
    it('should close palette on Escape key in search input', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })
      expect(screen.getByTestId('palette-open').textContent).toBe('true')

      const input = screen.getByPlaceholderText('Type a command...')
      act(() => {
        fireEvent.keyDown(input, { key: 'Escape' })
      })

      expect(screen.getByTestId('palette-open').textContent).toBe('false')
    })

    it('should close palette on backdrop click', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })
      expect(screen.getByRole('dialog')).toBeDefined()

      act(() => {
        fireEvent.click(screen.getByRole('dialog'))
      })
      expect(screen.getByTestId('palette-open').textContent).toBe('false')
    })
  })

  describe('HotkeyProvider and CommandPalette coexistence', () => {
    it('should fire hotkeys when palette is closed', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      // Hotkeys fire on document keydown
      act(() => {
        fireEvent.keyDown(document, { key: 'n', ctrlKey: true })
      })

      expect(onAction).toHaveBeenCalledWith('new-item')
    })

    it('should register dynamically added commands', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      // Register a new command
      act(() => {
        fireEvent.click(screen.getByTestId('register-cmd'))
      })

      // Open palette and check command is listed
      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      expect(screen.getByText('Dynamic Command')).toBeDefined()
    })

    it('should execute dynamically registered command', () => {
      const onAction = vi.fn()
      render(
        <KeyboardProviders>
          <KeyboardApp onAction={onAction} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.click(screen.getByTestId('register-cmd'))
      })

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      act(() => {
        fireEvent.click(screen.getByText('Dynamic Command'))
      })

      expect(onAction).toHaveBeenCalledWith('dynamic')
    })
  })

  describe('keyboard navigation within palette', () => {
    it('should navigate commands with ArrowDown/ArrowUp', () => {
      const commands: Command[] = [
        { id: 'cmd-1', label: 'First Command', category: 'action', handler: vi.fn() },
        { id: 'cmd-2', label: 'Second Command', category: 'action', handler: vi.fn() },
        { id: 'cmd-3', label: 'Third Command', category: 'action', handler: vi.fn() },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={vi.fn()} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      const input = screen.getByPlaceholderText('Type a command...')

      // First item selected by default
      let options = screen.getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')

      // Move down
      act(() => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      options = screen.getAllByRole('option')
      expect(options[1]?.getAttribute('aria-selected')).toBe('true')

      // Move up
      act(() => {
        fireEvent.keyDown(input, { key: 'ArrowUp' })
      })
      options = screen.getAllByRole('option')
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')
    })

    it('should execute navigated command on Enter', () => {
      const handler2 = vi.fn()
      const commands: Command[] = [
        { id: 'cmd-1', label: 'First', category: 'action', handler: vi.fn() },
        { id: 'cmd-2', label: 'Second', category: 'action', handler: handler2 },
      ]

      render(
        <KeyboardProviders commands={commands}>
          <KeyboardApp onAction={vi.fn()} />
        </KeyboardProviders>,
      )

      act(() => {
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      })

      const input = screen.getByPlaceholderText('Type a command...')
      act(() => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      act(() => {
        fireEvent.keyDown(input, { key: 'Enter' })
      })

      expect(handler2).toHaveBeenCalledOnce()
    })
  })
})
