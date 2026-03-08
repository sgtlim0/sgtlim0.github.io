import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { Tooltip } from '../src/Tooltip'
import { useTooltip } from '../src/hooks/useTooltip'

describe('useTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with isVisible=false', () => {
    const { result } = renderHook(() => useTooltip())
    expect(result.current.isVisible).toBe(false)
  })

  it('should return trigger and tooltip props', () => {
    const { result } = renderHook(() => useTooltip())
    expect(result.current.triggerProps.onMouseEnter).toBeDefined()
    expect(result.current.triggerProps.onMouseLeave).toBeDefined()
    expect(result.current.triggerProps.onFocus).toBeDefined()
    expect(result.current.triggerProps.onBlur).toBeDefined()
    expect(result.current.triggerProps.ref).toBeDefined()
    expect(result.current.tooltipProps.id).toBeDefined()
    expect(result.current.tooltipProps.role).toBe('tooltip')
    expect(result.current.tooltipProps.ref).toBeDefined()
  })

  it('should not set aria-describedby when hidden', () => {
    const { result } = renderHook(() => useTooltip())
    expect(result.current.triggerProps['aria-describedby']).toBeUndefined()
  })

  it('should show tooltip after delay on mouseEnter', () => {
    const { result } = renderHook(() => useTooltip({ delay: 100 }))

    act(() => {
      result.current.triggerProps.onMouseEnter()
    })
    // Not yet visible before delay
    expect(result.current.isVisible).toBe(false)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.isVisible).toBe(true)
  })

  it('should hide tooltip on mouseLeave', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }))

    act(() => {
      result.current.triggerProps.onMouseEnter()
      vi.advanceTimersByTime(0)
    })
    expect(result.current.isVisible).toBe(true)

    act(() => {
      result.current.triggerProps.onMouseLeave()
    })
    expect(result.current.isVisible).toBe(false)
  })

  it('should show tooltip on focus', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }))

    act(() => {
      result.current.triggerProps.onFocus()
      vi.advanceTimersByTime(0)
    })
    expect(result.current.isVisible).toBe(true)
  })

  it('should hide tooltip on blur', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }))

    act(() => {
      result.current.triggerProps.onFocus()
      vi.advanceTimersByTime(0)
    })
    expect(result.current.isVisible).toBe(true)

    act(() => {
      result.current.triggerProps.onBlur()
    })
    expect(result.current.isVisible).toBe(false)
  })

  it('should cancel show if mouseLeave before delay', () => {
    const { result } = renderHook(() => useTooltip({ delay: 200 }))

    act(() => {
      result.current.triggerProps.onMouseEnter()
    })
    act(() => {
      vi.advanceTimersByTime(100)
      result.current.triggerProps.onMouseLeave()
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.isVisible).toBe(false)
  })

  it('should hide on Escape key', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }))

    act(() => {
      result.current.triggerProps.onMouseEnter()
      vi.advanceTimersByTime(0)
    })
    expect(result.current.isVisible).toBe(true)

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(result.current.isVisible).toBe(false)
  })

  it('should set aria-describedby when visible', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }))

    act(() => {
      result.current.triggerProps.onMouseEnter()
      vi.advanceTimersByTime(0)
    })
    expect(result.current.triggerProps['aria-describedby']).toBe(
      result.current.tooltipProps.id,
    )
  })

  it('should use default options', () => {
    const { result } = renderHook(() => useTooltip())
    // Default delay is 200
    act(() => {
      result.current.triggerProps.onMouseEnter()
      vi.advanceTimersByTime(199)
    })
    expect(result.current.isVisible).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isVisible).toBe(true)
  })

  it('should have fixed positioning and high z-index', () => {
    const { result } = renderHook(() => useTooltip())
    expect(result.current.tooltipProps.style.position).toBe('fixed')
    expect(result.current.tooltipProps.style.zIndex).toBe(9999)
    expect(result.current.tooltipProps.style.pointerEvents).toBe('none')
  })

  it('should accept placement option', () => {
    const { result } = renderHook(() => useTooltip({ placement: 'bottom' }))
    // Hook accepts the option without error
    expect(result.current.isVisible).toBe(false)
  })

  it('should accept offset option', () => {
    const { result } = renderHook(() => useTooltip({ offset: 16 }))
    expect(result.current.isVisible).toBe(false)
  })
})

describe('Tooltip component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render children', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    )
    expect(screen.getByText('Hover me')).toBeDefined()
  })

  it('should not show tooltip initially', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    )
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('should show tooltip on hover after delay', () => {
    render(
      <Tooltip content="Help text" delay={100}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    expect(screen.queryByTestId('tooltip')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByTestId('tooltip')).toBeDefined()
    expect(screen.getByText('Help text')).toBeDefined()
  })

  it('should hide tooltip on mouse leave', () => {
    render(
      <Tooltip content="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByTestId('tooltip')).toBeDefined()

    fireEvent.mouseLeave(screen.getByText('Hover me'))
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('should show tooltip on focus', () => {
    render(
      <Tooltip content="Focus text" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    )

    fireEvent.focus(screen.getByText('Focus me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByText('Focus text')).toBeDefined()
  })

  it('should hide tooltip on blur', () => {
    render(
      <Tooltip content="Focus text" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    )

    fireEvent.focus(screen.getByText('Focus me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByTestId('tooltip')).toBeDefined()

    fireEvent.blur(screen.getByText('Focus me'))
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('should close on Escape key', () => {
    render(
      <Tooltip content="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByTestId('tooltip')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('should have role="tooltip" for accessibility', () => {
    render(
      <Tooltip content="Accessible text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.getAttribute('role')).toBe('tooltip')
  })

  it('should set aria-describedby on trigger when visible', () => {
    render(
      <Tooltip content="Described text" delay={0}>
        <button>Trigger</button>
      </Tooltip>,
    )

    const trigger = screen.getByText('Trigger')
    expect(trigger.getAttribute('aria-describedby')).toBeNull()

    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltipEl = screen.getByTestId('tooltip')
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltipEl.id)
  })

  it('should render tooltip with arrow', () => {
    render(
      <Tooltip content="Arrow test" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByTestId('tooltip-arrow')).toBeDefined()
  })

  it('should support placement="bottom"', () => {
    render(
      <Tooltip content="Bottom text" placement="bottom" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.getAttribute('data-placement')).toBe('bottom')
  })

  it('should support placement="left"', () => {
    render(
      <Tooltip content="Left text" placement="left" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.getAttribute('data-placement')).toBe('left')
  })

  it('should support placement="right"', () => {
    render(
      <Tooltip content="Right text" placement="right" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.getAttribute('data-placement')).toBe('right')
  })

  it('should render via portal (in document.body)', () => {
    render(
      <Tooltip content="Portal test" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.parentElement).toBe(document.body)
  })

  it('should use custom delay', () => {
    render(
      <Tooltip content="Custom delay" delay={500}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(screen.queryByTestId('tooltip')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByTestId('tooltip')).toBeDefined()
  })

  it('should not show tooltip if mouse leaves before delay completes', () => {
    render(
      <Tooltip content="Cancelled" delay={300}>
        <button>Hover me</button>
      </Tooltip>,
    )

    fireEvent.mouseEnter(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(100)
    })

    fireEvent.mouseLeave(screen.getByText('Hover me'))
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByTestId('tooltip')).toBeNull()
  })
})
