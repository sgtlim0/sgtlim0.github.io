import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useModal } from '../src/hooks/useModal'
import { useModalManager } from '../src/hooks/useModalManager'
import { ModalProvider, useModalContext } from '../src/hooks/ModalProvider'
import { Modal } from '../src/Modal'
import React from 'react'

// ---------------------------------------------------------------------------
// useModal
// ---------------------------------------------------------------------------
describe('useModal', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useModal())
    expect(result.current.isOpen).toBe(false)
  })

  it('accepts initial open state', () => {
    const { result } = renderHook(() => useModal(true))
    expect(result.current.isOpen).toBe(true)
  })

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useModal())
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useModal(true))
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
  })

  it('toggle() flips isOpen', () => {
    const { result } = renderHook(() => useModal())
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useModalManager
// ---------------------------------------------------------------------------
describe('useModalManager', () => {
  it('starts with empty stack', () => {
    const { result } = renderHook(() => useModalManager())
    expect(result.current.stack).toEqual([])
    expect(result.current.getTopModal()).toBeNull()
  })

  it('openModal pushes to stack', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => result.current.openModal('a'))
    expect(result.current.stack).toEqual(['a'])
    expect(result.current.getTopModal()).toBe('a')
  })

  it('does not duplicate ids', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('a')
    })
    expect(result.current.stack).toEqual(['a'])
  })

  it('maintains stack order', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('b')
      result.current.openModal('c')
    })
    expect(result.current.stack).toEqual(['a', 'b', 'c'])
    expect(result.current.getTopModal()).toBe('c')
  })

  it('closeModal removes specific id', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('b')
      result.current.openModal('c')
    })
    act(() => result.current.closeModal('b'))
    expect(result.current.stack).toEqual(['a', 'c'])
  })

  it('closeModal is no-op for unknown id', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => result.current.openModal('a'))
    act(() => result.current.closeModal('z'))
    expect(result.current.stack).toEqual(['a'])
  })

  it('closeAll empties the stack', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('b')
    })
    act(() => result.current.closeAll())
    expect(result.current.stack).toEqual([])
  })

  it('isTopModal returns correct result', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('b')
    })
    expect(result.current.isTopModal('b')).toBe(true)
    expect(result.current.isTopModal('a')).toBe(false)
  })

  it('Escape closes only topmost modal', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      result.current.openModal('a')
      result.current.openModal('b')
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current.stack).toEqual(['a'])
    expect(result.current.getTopModal()).toBe('a')
  })

  it('Escape does nothing on empty stack', () => {
    const { result } = renderHook(() => useModalManager())
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(result.current.stack).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// ModalProvider + useModalContext
// ---------------------------------------------------------------------------
describe('ModalProvider', () => {
  it('provides modal manager to children', () => {
    let captured: ReturnType<typeof useModalContext> | null = null
    function Inner() {
      captured = useModalContext()
      return null
    }

    render(
      <ModalProvider>
        <Inner />
      </ModalProvider>,
    )

    expect(captured).not.toBeNull()
    expect(captured!.stack).toEqual([])
    expect(typeof captured!.openModal).toBe('function')
  })

  it('throws when used outside provider', () => {
    function Bad() {
      useModalContext()
      return null
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow('useModalContext must be used within a <ModalProvider>')
    consoleSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------
describe('Modal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Hidden</p>
      </Modal>,
    )
    expect(screen.queryByText('Hidden')).toBeNull()
  })

  it('renders children when isOpen is true', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Visible</p>
      </Modal>,
    )

    await waitFor(() => {
      expect(screen.getByText('Visible')).toBeTruthy()
    })
  })

  it('has role="dialog" and aria-modal', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} ariaLabelledBy="my-title">
        <h2 id="my-title">Title</h2>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeTruthy()
      expect(dialog.getAttribute('aria-modal')).toBe('true')
      expect(dialog.getAttribute('aria-labelledby')).toBe('my-title')
    })
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not call onClose when closeOnBackdropClick is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('does not close on clicking dialog itself (only backdrop)', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByTestId('modal-dialog')
      fireEvent.click(dialog)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeTruthy()
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when closeOnEscape is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeTruthy()
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll when open', async () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    unmount()

    // After unmount, overflow should be restored
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('applies size variant classes', async () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <p>Small</p>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByTestId('modal-dialog')
      expect(dialog.className).toContain('max-w-sm')
    })

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <p>Large</p>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByTestId('modal-dialog')
      expect(dialog.className).toContain('max-w-3xl')
    })
  })

  it('renders full-size modal', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} size="full">
        <p>Full</p>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByTestId('modal-dialog')
      expect(dialog.className).toContain('max-w-full')
      expect(dialog.className).toContain('min-h-screen')
    })
  })

  it('focus trap keeps focus within modal', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <button data-testid="btn-a">A</button>
        <button data-testid="btn-b">B</button>
      </Modal>,
    )

    // Wait for focus trap to initialize via rAF
    await waitFor(() => {
      expect(screen.getByTestId('btn-a')).toBeTruthy()
    })

    // Advance timers to let rAF fire
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // After focus trap, one of the buttons should be focused
    const btnA = screen.getByTestId('btn-a')
    const btnB = screen.getByTestId('btn-b')
    const active = document.activeElement
    // Focus trap should have set focus to the first focusable element
    expect(active === btnA || active === btnB).toBe(true)
  })

  it('restores focus on close', async () => {
    const outerButton = document.createElement('button')
    outerButton.textContent = 'Outer'
    document.body.appendChild(outerButton)
    outerButton.focus()

    expect(document.activeElement).toBe(outerButton)

    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <button>Inner</button>
      </Modal>,
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    unmount()

    // Focus should return to the outer button
    await waitFor(() => {
      expect(document.activeElement).toBe(outerButton)
    })

    document.body.removeChild(outerButton)
  })

  it('renders via portal to document.body', async () => {
    const { container } = render(
      <div data-testid="parent">
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Portal content</p>
        </Modal>
      </div>,
    )

    await waitFor(() => {
      // Content should not be inside the parent container
      const parent = container.querySelector('[data-testid="parent"]')
      expect(parent?.querySelector('[data-testid="modal-dialog"]')).toBeNull()

      // But should exist in document.body
      expect(document.body.querySelector('[data-testid="modal-dialog"]')).toBeTruthy()
    })
  })

  it('applies aria-describedby when provided', async () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        ariaLabelledBy="t"
        ariaDescribedBy="d"
      >
        <h2 id="t">Title</h2>
        <p id="d">Description</p>
      </Modal>,
    )

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-describedby')).toBe('d')
    })
  })
})

// ---------------------------------------------------------------------------
// Stacked modals integration
// ---------------------------------------------------------------------------
describe('Stacked modals', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('multiple modals can be rendered simultaneously', async () => {
    render(
      <>
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal 1</p>
        </Modal>
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal 2</p>
        </Modal>
      </>,
    )

    await waitFor(() => {
      expect(screen.getByText('Modal 1')).toBeTruthy()
      expect(screen.getByText('Modal 2')).toBeTruthy()
    })
  })

  it('body scroll remains locked while any modal is open', async () => {
    const { rerender } = render(
      <>
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal 1</p>
        </Modal>
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal 2</p>
        </Modal>
      </>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    // Close one modal — the other should keep scroll locked
    rerender(
      <>
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal 1</p>
        </Modal>
        <Modal isOpen={false} onClose={vi.fn()}>
          <p>Modal 2</p>
        </Modal>
      </>,
    )

    // First modal still open, scroll should remain hidden
    expect(document.body.style.overflow).toBe('hidden')
  })
})
