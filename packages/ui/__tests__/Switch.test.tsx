import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useSwitch } from '../src/hooks/useSwitch'
import Switch from '../src/Switch'

// ===========================================================================
// 1. useSwitch hook
// ===========================================================================

describe('useSwitch', () => {
  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------
  it('returns default values', () => {
    const { result } = renderHook(() => useSwitch())
    expect(result.current.checked).toBe(false)
    expect(typeof result.current.toggle).toBe('function')
    expect(typeof result.current.setChecked).toBe('function')
    expect(result.current.switchProps).toBeDefined()
  })

  it('initializes with initialChecked = true', () => {
    const { result } = renderHook(() =>
      useSwitch({ initialChecked: true }),
    )
    expect(result.current.checked).toBe(true)
  })

  // -------------------------------------------------------------------------
  // toggle
  // -------------------------------------------------------------------------
  it('toggles checked state', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useSwitch({ onChange }))

    act(() => result.current.toggle())

    expect(result.current.checked).toBe(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('toggles back to false', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSwitch({ initialChecked: true, onChange }),
    )

    act(() => result.current.toggle())

    expect(result.current.checked).toBe(false)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('does not toggle when disabled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSwitch({ disabled: true, onChange }),
    )

    act(() => result.current.toggle())

    expect(result.current.checked).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // setChecked
  // -------------------------------------------------------------------------
  it('sets checked to specific value', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useSwitch({ onChange }))

    act(() => result.current.setChecked(true))

    expect(result.current.checked).toBe(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not setChecked when disabled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSwitch({ disabled: true, onChange }),
    )

    act(() => result.current.setChecked(true))

    expect(result.current.checked).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // switchProps
  // -------------------------------------------------------------------------
  it('provides correct switchProps', () => {
    const { result } = renderHook(() => useSwitch())
    const props = result.current.switchProps

    expect(props.role).toBe('switch')
    expect(props['aria-checked']).toBe(false)
    expect(props.tabIndex).toBe(0)
  })

  it('provides disabled switchProps when disabled', () => {
    const { result } = renderHook(() => useSwitch({ disabled: true }))
    const props = result.current.switchProps

    expect(props['aria-disabled']).toBe(true)
    expect(props.tabIndex).toBe(-1)
  })

  it('updates switchProps after toggle', () => {
    const { result } = renderHook(() => useSwitch())

    act(() => result.current.toggle())

    expect(result.current.switchProps['aria-checked']).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Works without onChange
  // -------------------------------------------------------------------------
  it('works without onChange callback', () => {
    const { result } = renderHook(() => useSwitch())

    act(() => result.current.toggle())

    expect(result.current.checked).toBe(true)
  })
})

// ===========================================================================
// 2. Switch component
// ===========================================================================

describe('Switch', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it('renders with default props', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button).toBeTruthy()
  })

  it('renders as a button element', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.tagName).toBe('BUTTON')
  })

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  it('has role="switch"', () => {
    render(<Switch />)
    expect(screen.getByRole('switch')).toBeTruthy()
  })

  it('has aria-checked false by default', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('aria-checked')).toBe('false')
  })

  it('has aria-checked true when checked', () => {
    render(<Switch initialChecked />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('aria-checked')).toBe('true')
  })

  it('supports aria-label', () => {
    render(<Switch aria-label="Enable notifications" />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('aria-label')).toBe('Enable notifications')
  })

  it('has aria-disabled when disabled', () => {
    render(<Switch disabled />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('aria-disabled')).toBe('true')
  })

  it('is focusable when enabled', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('tabindex')).toBe('0')
  })

  it('is not focusable when disabled', () => {
    render(<Switch disabled />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('tabindex')).toBe('-1')
  })

  // -------------------------------------------------------------------------
  // Toggle
  // -------------------------------------------------------------------------
  it('toggles on click', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(button.getAttribute('aria-checked')).toBe('true')
  })

  it('toggles back on second click', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} initialChecked />)
    const button = screen.getByRole('switch')

    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(false)
    expect(button.getAttribute('aria-checked')).toBe('false')
  })

  it('does not toggle when disabled', () => {
    const onChange = vi.fn()
    render(<Switch disabled onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.click(button)

    expect(onChange).not.toHaveBeenCalled()
    expect(button.getAttribute('aria-checked')).toBe('false')
  })

  // -------------------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------------------
  it('toggles on Space key', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.keyDown(button, { key: ' ' })

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('toggles on Enter key', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.keyDown(button, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle on other keys', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.keyDown(button, { key: 'Escape' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not toggle keyboard when disabled', () => {
    const onChange = vi.fn()
    render(<Switch disabled onChange={onChange} />)
    const button = screen.getByRole('switch')

    fireEvent.keyDown(button, { key: ' ' })

    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Size variants
  // -------------------------------------------------------------------------
  it('renders sm size', () => {
    render(<Switch size="sm" />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-size')).toBe('sm')
  })

  it('renders md size (default)', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-size')).toBe('md')
  })

  it('renders lg size', () => {
    render(<Switch size="lg" />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-size')).toBe('lg')
  })

  // -------------------------------------------------------------------------
  // Color variants
  // -------------------------------------------------------------------------
  it('renders primary color (default)', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-color')).toBe('primary')
  })

  it('renders success color', () => {
    render(<Switch color="success" />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-color')).toBe('success')
  })

  it('renders danger color', () => {
    render(<Switch color="danger" />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-color')).toBe('danger')
  })

  // -------------------------------------------------------------------------
  // Label
  // -------------------------------------------------------------------------
  it('renders label on the right by default', () => {
    render(<Switch label="Dark mode" />)
    expect(screen.getByText('Dark mode')).toBeTruthy()
  })

  it('renders label on the left', () => {
    render(<Switch label="Dark mode" labelPosition="left" />)
    const wrapper = screen.getByTestId('switch-wrapper')
    const label = screen.getByText('Dark mode')
    const button = screen.getByRole('switch')
    // Label should appear before the switch in DOM
    const children = Array.from(wrapper.children)
    expect(children.indexOf(label)).toBeLessThan(children.indexOf(button))
  })

  it('renders label on the right', () => {
    render(<Switch label="Dark mode" labelPosition="right" />)
    const wrapper = screen.getByTestId('switch-wrapper')
    const label = screen.getByText('Dark mode')
    const button = screen.getByRole('switch')
    // Label should appear after the switch in DOM
    const children = Array.from(wrapper.children)
    expect(children.indexOf(label)).toBeGreaterThan(children.indexOf(button))
  })

  // -------------------------------------------------------------------------
  // Disabled styling
  // -------------------------------------------------------------------------
  it('applies disabled data attribute', () => {
    render(<Switch disabled />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-disabled')).toBe('true')
  })

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------
  it('applies className to wrapper', () => {
    render(<Switch className="my-switch" />)
    const wrapper = screen.getByTestId('switch-wrapper')
    expect(wrapper.className).toContain('my-switch')
  })

  // -------------------------------------------------------------------------
  // Track and thumb elements
  // -------------------------------------------------------------------------
  it('contains track and thumb elements', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    const thumb = button.querySelector('[data-testid="switch-thumb"]')
    expect(thumb).toBeTruthy()
  })

  it('applies checked state to data attribute', () => {
    render(<Switch initialChecked />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-checked')).toBe('true')
  })

  it('applies unchecked state to data attribute', () => {
    render(<Switch />)
    const button = screen.getByRole('switch')
    expect(button.getAttribute('data-checked')).toBe('false')
  })
})
