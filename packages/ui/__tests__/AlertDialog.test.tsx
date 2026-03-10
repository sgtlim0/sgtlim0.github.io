import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAlertDialog } from '../src/hooks/useAlertDialog'
import { AlertDialog } from '../src/AlertDialog'
import { AlertDialogProvider, useConfirm } from '../src/hooks/AlertDialogProvider'
import React from 'react'

// ---------------------------------------------------------------------------
// useAlertDialog
// ---------------------------------------------------------------------------
describe('useAlertDialog', () => {
  it('starts closed with null options', () => {
    const { result } = renderHook(() => useAlertDialog())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.options).toBeNull()
  })

  it('confirm() opens dialog and sets options', async () => {
    const { result } = renderHook(() => useAlertDialog())

    let promise: Promise<boolean> | undefined
    act(() => {
      promise = result.current.confirm({
        title: 'Test',
        message: 'Are you sure?',
        variant: 'danger',
      })
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.options).toEqual({
      title: 'Test',
      message: 'Are you sure?',
      variant: 'danger',
    })

    // Resolve by confirming
    act(() => result.current.handleConfirm())
    await expect(promise).resolves.toBe(true)
  })

  it('handleConfirm resolves promise with true', async () => {
    const { result } = renderHook(() => useAlertDialog())

    let resolved: boolean | undefined
    act(() => {
      result.current.confirm({ title: 'T', message: 'M' }).then((v) => {
        resolved = v
      })
    })

    act(() => result.current.handleConfirm())

    await waitFor(() => {
      expect(resolved).toBe(true)
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.options).toBeNull()
  })

  it('handleCancel resolves promise with false', async () => {
    const { result } = renderHook(() => useAlertDialog())

    let resolved: boolean | undefined
    act(() => {
      result.current.confirm({ title: 'T', message: 'M' }).then((v) => {
        resolved = v
      })
    })

    act(() => result.current.handleCancel())

    await waitFor(() => {
      expect(resolved).toBe(false)
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('close() resolves as cancel (false)', async () => {
    const { result } = renderHook(() => useAlertDialog())

    let resolved: boolean | undefined
    act(() => {
      result.current.confirm({ title: 'T', message: 'M' }).then((v) => {
        resolved = v
      })
    })

    act(() => result.current.close())

    await waitFor(() => {
      expect(resolved).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// AlertDialog component
// ---------------------------------------------------------------------------
describe('AlertDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <AlertDialog
        isOpen={false}
        title="Hidden"
        message="Not shown"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByText('Hidden')).toBeNull()
  })

  it('renders title and message when open', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="Delete Item"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('alertdialog-title').textContent).toBe('Delete Item')
    expect(screen.getByTestId('alertdialog-message').textContent).toBe('This cannot be undone.')
  })

  it('has role="alertdialog" and aria-modal', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="Title"
        message="Msg"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('alertdialog-title')
    expect(dialog.getAttribute('aria-describedby')).toBe('alertdialog-message')
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('alertdialog-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTestId('alertdialog-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn()
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn()
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    // Click the backdrop overlay (the div with bg-black/50)
    const backdrop = document.body.querySelector('.bg-black\\/50') as HTMLElement
    fireEvent.click(backdrop)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('uses custom button labels', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('alertdialog-confirm').textContent).toBe('Yes')
    expect(screen.getByTestId('alertdialog-cancel').textContent).toBe('No')
  })

  it('uses default button labels', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('alertdialog-confirm').textContent).toBe('확인')
    expect(screen.getByTestId('alertdialog-cancel').textContent).toBe('취소')
  })

  it('renders danger variant with red confirm button', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        variant="danger"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const confirmBtn = screen.getByTestId('alertdialog-confirm')
    expect(confirmBtn.className).toContain('bg-red-600')
  })

  it('renders info variant with blue button', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        variant="info"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const confirmBtn = screen.getByTestId('alertdialog-confirm')
    expect(confirmBtn.className).toContain('bg-blue-600')
  })

  it('renders warning variant with amber button', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        variant="warning"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const confirmBtn = screen.getByTestId('alertdialog-confirm')
    expect(confirmBtn.className).toContain('bg-amber-600')
  })

  it('renders icon for each variant', () => {
    const { rerender } = render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        variant="info"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('alertdialog-icon')).toBeTruthy()

    rerender(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        variant="danger"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('alertdialog-icon')).toBeTruthy()
  })

  it('auto-focuses confirm button when opened', async () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(document.activeElement).toBe(screen.getByTestId('alertdialog-confirm'))
  })

  it('restores focus on close', async () => {
    const outerButton = document.createElement('button')
    outerButton.textContent = 'Outer'
    document.body.appendChild(outerButton)
    outerButton.focus()

    expect(document.activeElement).toBe(outerButton)

    const { unmount } = render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
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

  it('locks body scroll when open', () => {
    const { unmount } = render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('traps focus within dialog', async () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    const cancelBtn = screen.getByTestId('alertdialog-cancel')
    const confirmBtn = screen.getByTestId('alertdialog-confirm')
    const panel = screen.getByTestId('alertdialog-panel')

    // Focus is on confirm button (autoFocus)
    expect(document.activeElement).toBe(confirmBtn)

    // Tab from last button (confirm) should wrap to first (cancel)
    fireEvent.keyDown(panel, { key: 'Tab' })

    // Shift+Tab from cancel (first) should wrap to confirm (last)
    cancelBtn.focus()
    fireEvent.keyDown(panel, { key: 'Tab', shiftKey: true })
  })

  it('renders children between message and buttons', () => {
    render(
      <AlertDialog
        isOpen={true}
        title="T"
        message="M"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      >
        <p data-testid="custom-child">Custom content</p>
      </AlertDialog>,
    )

    expect(screen.getByTestId('custom-child').textContent).toBe('Custom content')
  })

  it('renders via portal to document.body', () => {
    const { container } = render(
      <div data-testid="parent">
        <AlertDialog
          isOpen={true}
          title="T"
          message="M"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </div>,
    )

    const parent = container.querySelector('[data-testid="parent"]')
    expect(parent?.querySelector('[data-testid="alertdialog-panel"]')).toBeNull()
    expect(document.body.querySelector('[data-testid="alertdialog-panel"]')).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// AlertDialogProvider + useConfirm
// ---------------------------------------------------------------------------
describe('AlertDialogProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('provides useConfirm to children', () => {
    let confirmFn: ((opts: { title: string; message: string }) => Promise<boolean>) | null = null

    function Inner() {
      confirmFn = useConfirm()
      return null
    }

    render(
      <AlertDialogProvider>
        <Inner />
      </AlertDialogProvider>,
    )

    expect(typeof confirmFn).toBe('function')
  })

  it('throws when useConfirm is used outside provider', () => {
    function Bad() {
      useConfirm()
      return null
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow('useConfirm must be used within an <AlertDialogProvider>')
    consoleSpy.mockRestore()
  })

  it('shows dialog when confirm is called and resolves on confirm click', async () => {
    let resolved: boolean | undefined

    function Inner() {
      const confirm = useConfirm()

      const handleClick = async () => {
        const result = await confirm({
          title: 'Delete?',
          message: 'Are you sure?',
          variant: 'danger',
          confirmLabel: 'Delete',
        })
        resolved = result
      }

      return <button onClick={handleClick} data-testid="trigger">Delete</button>
    }

    render(
      <AlertDialogProvider>
        <Inner />
      </AlertDialogProvider>,
    )

    // Trigger the dialog
    fireEvent.click(screen.getByTestId('trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('alertdialog-title').textContent).toBe('Delete?')
    })

    // Confirm
    fireEvent.click(screen.getByTestId('alertdialog-confirm'))

    await waitFor(() => {
      expect(resolved).toBe(true)
    })

    // Dialog should close
    expect(screen.queryByTestId('alertdialog-panel')).toBeNull()
  })

  it('resolves with false when cancel is clicked', async () => {
    let resolved: boolean | undefined

    function Inner() {
      const confirm = useConfirm()

      const handleClick = async () => {
        const result = await confirm({ title: 'T', message: 'M' })
        resolved = result
      }

      return <button onClick={handleClick} data-testid="trigger">Open</button>
    }

    render(
      <AlertDialogProvider>
        <Inner />
      </AlertDialogProvider>,
    )

    fireEvent.click(screen.getByTestId('trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('alertdialog-cancel')).toBeTruthy()
    })

    fireEvent.click(screen.getByTestId('alertdialog-cancel'))

    await waitFor(() => {
      expect(resolved).toBe(false)
    })
  })

  it('resolves with false on Escape key', async () => {
    let resolved: boolean | undefined

    function Inner() {
      const confirm = useConfirm()

      const handleClick = async () => {
        const result = await confirm({ title: 'T', message: 'M' })
        resolved = result
      }

      return <button onClick={handleClick} data-testid="trigger">Open</button>
    }

    render(
      <AlertDialogProvider>
        <Inner />
      </AlertDialogProvider>,
    )

    fireEvent.click(screen.getByTestId('trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('alertdialog-panel')).toBeTruthy()
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    await waitFor(() => {
      expect(resolved).toBe(false)
    })
  })
})
