import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { Popover } from '../src/Popover'
import { usePopover } from '../src/hooks/usePopover'

describe('usePopover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with isOpen=false', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.isOpen).toBe(false)
  })

  it('should return open, close, toggle functions', () => {
    const { result } = renderHook(() => usePopover())
    expect(typeof result.current.open).toBe('function')
    expect(typeof result.current.close).toBe('function')
    expect(typeof result.current.toggle).toBe('function')
  })

  it('should return triggerRef and popoverRef', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.triggerRef).toBeDefined()
    expect(result.current.popoverRef).toBeDefined()
  })

  it('should open on calling open()', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)
  })

  it('should close on calling close()', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should toggle open/close', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should have aria-expanded=false when closed', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.triggerProps['aria-expanded']).toBe(false)
  })

  it('should have aria-expanded=true when open', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.open()
    })
    expect(result.current.triggerProps['aria-expanded']).toBe(true)
  })

  it('should have aria-haspopup=true', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.triggerProps['aria-haspopup']).toBe(true)
  })

  it('should not have aria-controls when closed', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.triggerProps['aria-controls']).toBeUndefined()
  })

  it('should set aria-controls when open', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.open()
    })
    expect(result.current.triggerProps['aria-controls']).toBeDefined()
  })

  it('should have onClick for click trigger (default)', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.triggerProps.onClick).toBeDefined()
  })

  it('should have onMouseEnter/onMouseLeave for hover trigger', () => {
    const { result } = renderHook(() => usePopover({ trigger: 'hover' }))
    expect(result.current.triggerProps.onMouseEnter).toBeDefined()
    expect(result.current.triggerProps.onMouseLeave).toBeDefined()
    expect(result.current.triggerProps.onClick).toBeUndefined()
  })

  it('should close on Escape key', () => {
    const { result } = renderHook(() => usePopover())

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should have fixed positioning and high z-index', () => {
    const { result } = renderHook(() => usePopover())
    expect(result.current.popoverProps.style.position).toBe('fixed')
    expect(result.current.popoverProps.style.zIndex).toBe(9999)
  })

  it('should accept placement option', () => {
    const { result } = renderHook(() => usePopover({ placement: 'top' }))
    expect(result.current.isOpen).toBe(false)
  })

  it('should accept offset option', () => {
    const { result } = renderHook(() => usePopover({ offset: 16 }))
    expect(result.current.isOpen).toBe(false)
  })

  it('should close on hover leave with delay', () => {
    const { result } = renderHook(() => usePopover({ trigger: 'hover' }))

    act(() => {
      ;(result.current.triggerProps.onMouseEnter as () => void)()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      ;(result.current.triggerProps.onMouseLeave as () => void)()
    })
    // Still open during delay
    expect(result.current.isOpen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should cancel hover close when re-entering trigger', () => {
    const { result } = renderHook(() => usePopover({ trigger: 'hover' }))

    act(() => {
      ;(result.current.triggerProps.onMouseEnter as () => void)()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      ;(result.current.triggerProps.onMouseLeave as () => void)()
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Re-enter before timeout
    act(() => {
      ;(result.current.triggerProps.onMouseEnter as () => void)()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.isOpen).toBe(true)
  })
})

describe('Popover component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render children', () => {
    render(
      <Popover content={<span>Menu content</span>}>
        <button>Open</button>
      </Popover>,
    )
    expect(screen.getByText('Open')).toBeDefined()
  })

  it('should not show popover initially', () => {
    render(
      <Popover content={<span>Menu content</span>}>
        <button>Open</button>
      </Popover>,
    )
    expect(screen.queryByTestId('popover')).toBeNull()
  })

  it('should show popover on click (default trigger)', () => {
    render(
      <Popover content={<span>Menu content</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()
    expect(screen.getByText('Menu content')).toBeDefined()
  })

  it('should hide popover on second click (toggle)', () => {
    render(
      <Popover content={<span>Menu content</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()

    fireEvent.click(screen.getByText('Open'))
    expect(screen.queryByTestId('popover')).toBeNull()
  })

  it('should show popover on hover trigger', () => {
    render(
      <Popover content={<span>Hover content</span>} trigger="hover">
        <button>Hover me</button>
      </Popover>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    expect(screen.getByTestId('popover')).toBeDefined()
    expect(screen.getByText('Hover content')).toBeDefined()
  })

  it('should close hover popover after mouse leave + delay', () => {
    render(
      <Popover content={<span>Hover content</span>} trigger="hover">
        <button>Hover me</button>
      </Popover>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    expect(screen.getByTestId('popover')).toBeDefined()

    fireEvent.mouseLeave(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(screen.queryByTestId('popover')).toBeNull()
  })

  it('should close on Escape key', () => {
    render(
      <Popover content={<span>Menu content</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('popover')).toBeNull()
  })

  it('should close on outside click', () => {
    render(
      <div>
        <Popover content={<span>Menu content</span>}>
          <button>Open</button>
        </Popover>
        <button data-testid="outside">Outside</button>
      </div>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByTestId('popover')).toBeNull()
  })

  it('should not close on outside click when closeOnOutsideClick=false', () => {
    render(
      <div>
        <Popover content={<span>Menu content</span>} closeOnOutsideClick={false}>
          <button>Open</button>
        </Popover>
        <button data-testid="outside">Outside</button>
      </div>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.getByTestId('popover')).toBeDefined()
  })

  it('should have role="dialog" for accessibility', () => {
    render(
      <Popover content={<span>Dialog content</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))

    const popover = screen.getByTestId('popover')
    expect(popover.getAttribute('role')).toBe('dialog')
    expect(popover.getAttribute('aria-modal')).toBe('false')
  })

  it('should set aria-expanded on trigger when open', () => {
    render(
      <Popover content={<span>Content</span>}>
        <button>Open</button>
      </Popover>,
    )

    const trigger = screen.getByText('Open')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('should set aria-haspopup on trigger', () => {
    render(
      <Popover content={<span>Content</span>}>
        <button>Open</button>
      </Popover>,
    )

    const trigger = screen.getByText('Open')
    expect(trigger.getAttribute('aria-haspopup')).toBe('true')
  })

  it('should render popover with arrow', () => {
    render(
      <Popover content={<span>Arrow test</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover-arrow')).toBeDefined()
  })

  it('should support placement="top"', () => {
    render(
      <Popover content={<span>Top content</span>} placement="top">
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))

    const popover = screen.getByTestId('popover')
    expect(popover.getAttribute('data-placement')).toBe('top')
  })

  it('should support placement="left"', () => {
    render(
      <Popover content={<span>Left content</span>} placement="left">
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))

    const popover = screen.getByTestId('popover')
    expect(popover.getAttribute('data-placement')).toBe('left')
  })

  it('should support placement="right"', () => {
    render(
      <Popover content={<span>Right content</span>} placement="right">
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))

    const popover = screen.getByTestId('popover')
    expect(popover.getAttribute('data-placement')).toBe('right')
  })

  it('should render via portal (in document.body)', () => {
    render(
      <Popover content={<span>Portal test</span>}>
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))

    const popover = screen.getByTestId('popover')
    expect(popover.parentElement).toBe(document.body)
  })

  it('should render interactive content', () => {
    const handleAction = vi.fn()

    render(
      <Popover
        content={
          <div>
            <button onClick={handleAction}>Action</button>
          </div>
        }
      >
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Action')).toBeDefined()

    fireEvent.click(screen.getByText('Action'))
    expect(handleAction).toHaveBeenCalledOnce()
  })

  it('should keep popover open when clicking inside', () => {
    render(
      <Popover
        content={
          <div data-testid="popover-inner">
            <button>Inner button</button>
          </div>
        }
      >
        <button>Open</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('popover')).toBeDefined()

    // Clicking inside the popover should not close it
    fireEvent.mouseDown(screen.getByText('Inner button'))
    expect(screen.getByTestId('popover')).toBeDefined()
  })
})
