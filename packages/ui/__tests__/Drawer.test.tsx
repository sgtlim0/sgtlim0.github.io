import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useDrawer } from '../src/hooks/useDrawer'
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from '../src/Drawer'
import React from 'react'

// ---------------------------------------------------------------------------
// useDrawer
// ---------------------------------------------------------------------------
describe('useDrawer', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useDrawer())
    expect(result.current.isOpen).toBe(false)
  })

  it('accepts initialOpen option', () => {
    const { result } = renderHook(() => useDrawer({ initialOpen: true }))
    expect(result.current.isOpen).toBe(true)
  })

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useDrawer())
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useDrawer({ initialOpen: true }))
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
  })

  it('toggle() flips isOpen', () => {
    const { result } = renderHook(() => useDrawer())
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
  })

  it('calls onOpen callback when opened', () => {
    const onOpen = vi.fn()
    const { result } = renderHook(() => useDrawer({ onOpen }))
    act(() => result.current.open())
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('calls onClose callback when closed', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useDrawer({ initialOpen: true, onClose }))
    act(() => result.current.close())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onOpen callback when toggled open', () => {
    const onOpen = vi.fn()
    const { result } = renderHook(() => useDrawer({ onOpen }))
    act(() => result.current.toggle())
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('calls onClose callback when toggled closed', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useDrawer({ initialOpen: true, onClose }))
    act(() => result.current.toggle())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call callbacks when not provided', () => {
    const { result } = renderHook(() => useDrawer())
    // Should not throw
    act(() => result.current.open())
    act(() => result.current.close())
    act(() => result.current.toggle())
  })
})

// ---------------------------------------------------------------------------
// Drawer component
// ---------------------------------------------------------------------------
describe('Drawer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()}>
        <p>Hidden</p>
      </Drawer>,
    )
    expect(screen.queryByText('Hidden')).toBeNull()
  })

  it('renders children when isOpen is true', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <p>Visible</p>
      </Drawer>,
    )

    await waitFor(() => {
      expect(screen.getByText('Visible')).toBeTruthy()
    })
  })

  it('has role="dialog" and aria-modal', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} ariaLabel="Test drawer">
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeTruthy()
      expect(dialog.getAttribute('aria-modal')).toBe('true')
      expect(dialog.getAttribute('aria-label')).toBe('Test drawer')
    })
  })

  it('applies aria-labelledby and aria-describedby', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} ariaLabelledBy="t" ariaDescribedBy="d">
        <h2 id="t">Title</h2>
        <p id="d">Description</p>
      </Drawer>,
    )

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-labelledby')).toBe('t')
      expect(dialog.getAttribute('aria-describedby')).toBe('d')
    })
  })

  // -- Placement --

  it('defaults to right placement', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <p>Right</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.getAttribute('data-placement')).toBe('right')
    })
  })

  it('supports left placement', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} placement="left">
        <p>Left</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.getAttribute('data-placement')).toBe('left')
    })
  })

  it('supports top placement', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} placement="top">
        <p>Top</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.getAttribute('data-placement')).toBe('top')
    })
  })

  it('supports bottom placement', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} placement="bottom">
        <p>Bottom</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.getAttribute('data-placement')).toBe('bottom')
    })
  })

  // -- Size --

  it('applies sm size (256px width for horizontal)', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} size="sm" placement="right">
        <p>Small</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.style.width).toBe('256px')
    })
  })

  it('applies md size (384px) by default', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <p>Medium</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.style.width).toBe('384px')
    })
  })

  it('applies lg size (512px)', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} size="lg">
        <p>Large</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.style.width).toBe('512px')
    })
  })

  it('applies full size (100%)', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} size="full">
        <p>Full</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.style.width).toBe('100%')
    })
  })

  it('applies height for vertical placement (top/bottom)', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} placement="top" size="sm">
        <p>Top</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      expect(panel.style.height).toBe('256px')
    })
  })

  // -- Escape key --

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>,
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
      <Drawer isOpen={true} onClose={onClose} closeOnEscape={false}>
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeTruthy()
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(onClose).not.toHaveBeenCalled()
  })

  // -- Backdrop click --

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      const backdrop = screen.getByTestId('drawer-backdrop')
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not call onClose when closeOnBackdropClick is false', async () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      const backdrop = screen.getByTestId('drawer-backdrop')
      fireEvent.click(backdrop)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('does not close when clicking the panel itself', async () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      const panel = screen.getByTestId('drawer-panel')
      fireEvent.click(panel)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // -- Body scroll lock --

  it('locks body scroll when open', async () => {
    const { unmount } = render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </Drawer>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    unmount()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  // -- Focus trap --

  it('focus trap keeps focus within drawer', async () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <button data-testid="btn-a">A</button>
        <button data-testid="btn-b">B</button>
      </Drawer>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('btn-a')).toBeTruthy()
    })

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    const btnA = screen.getByTestId('btn-a')
    const btnB = screen.getByTestId('btn-b')
    const active = document.activeElement
    expect(active === btnA || active === btnB).toBe(true)
  })

  it('restores focus on close', async () => {
    const outerButton = document.createElement('button')
    outerButton.textContent = 'Outer'
    document.body.appendChild(outerButton)
    outerButton.focus()

    expect(document.activeElement).toBe(outerButton)

    const { unmount } = render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <button>Inner</button>
      </Drawer>,
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    unmount()

    await waitFor(() => {
      expect(document.activeElement).toBe(outerButton)
    })

    document.body.removeChild(outerButton)
  })

  // -- Portal rendering --

  it('renders via portal to document.body', async () => {
    const { container } = render(
      <div data-testid="parent">
        <Drawer isOpen={true} onClose={vi.fn()}>
          <p>Portal content</p>
        </Drawer>
      </div>,
    )

    await waitFor(() => {
      const parent = container.querySelector('[data-testid="parent"]')
      expect(parent?.querySelector('[data-testid="drawer-panel"]')).toBeNull()
      expect(document.body.querySelector('[data-testid="drawer-panel"]')).toBeTruthy()
    })
  })
})

// ---------------------------------------------------------------------------
// DrawerHeader
// ---------------------------------------------------------------------------
describe('DrawerHeader', () => {
  it('renders title content', () => {
    render(<DrawerHeader onClose={vi.fn()}>Settings</DrawerHeader>)
    expect(screen.getByText('Settings')).toBeTruthy()
  })

  it('renders close button by default', () => {
    render(<DrawerHeader onClose={vi.fn()}>Title</DrawerHeader>)
    expect(screen.getByTestId('drawer-close-button')).toBeTruthy()
  })

  it('close button calls onClose', () => {
    const onClose = vi.fn()
    render(<DrawerHeader onClose={onClose}>Title</DrawerHeader>)
    fireEvent.click(screen.getByTestId('drawer-close-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('hides close button when showClose is false', () => {
    render(
      <DrawerHeader showClose={false} onClose={vi.fn()}>
        Title
      </DrawerHeader>,
    )
    expect(screen.queryByTestId('drawer-close-button')).toBeNull()
  })

  it('hides close button when onClose is not provided', () => {
    render(<DrawerHeader>Title</DrawerHeader>)
    expect(screen.queryByTestId('drawer-close-button')).toBeNull()
  })

  it('close button has accessible label', () => {
    render(<DrawerHeader onClose={vi.fn()}>Title</DrawerHeader>)
    const btn = screen.getByTestId('drawer-close-button')
    expect(btn.getAttribute('aria-label')).toBe('Close drawer')
  })
})

// ---------------------------------------------------------------------------
// DrawerBody
// ---------------------------------------------------------------------------
describe('DrawerBody', () => {
  it('renders children', () => {
    render(<DrawerBody><p>Body content</p></DrawerBody>)
    expect(screen.getByText('Body content')).toBeTruthy()
  })

  it('has scrollable container', () => {
    render(<DrawerBody><p>Scroll me</p></DrawerBody>)
    const body = screen.getByTestId('drawer-body')
    expect(body.className).toContain('overflow-y-auto')
  })
})

// ---------------------------------------------------------------------------
// DrawerFooter
// ---------------------------------------------------------------------------
describe('DrawerFooter', () => {
  it('renders children', () => {
    render(
      <DrawerFooter>
        <button>Save</button>
        <button>Cancel</button>
      </DrawerFooter>,
    )
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('has border-top styling', () => {
    render(<DrawerFooter><button>OK</button></DrawerFooter>)
    const footer = screen.getByTestId('drawer-footer')
    expect(footer.className).toContain('border-t')
  })
})

// ---------------------------------------------------------------------------
// Full Drawer composition
// ---------------------------------------------------------------------------
describe('Drawer composition', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders header, body, and footer together', async () => {
    const onClose = vi.fn()

    render(
      <Drawer isOpen={true} onClose={onClose} placement="left" size="lg" ariaLabel="Settings panel">
        <DrawerHeader onClose={onClose}>Settings</DrawerHeader>
        <DrawerBody>
          <p>Configuration options</p>
        </DrawerBody>
        <DrawerFooter>
          <button onClick={onClose}>Close</button>
        </DrawerFooter>
      </Drawer>,
    )

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeTruthy()
      expect(screen.getByText('Configuration options')).toBeTruthy()
      expect(screen.getByText('Close')).toBeTruthy()

      const panel = screen.getByTestId('drawer-panel')
      expect(panel.getAttribute('data-placement')).toBe('left')
      expect(panel.style.width).toBe('512px')
      expect(panel.getAttribute('aria-label')).toBe('Settings panel')
    })
  })
})
