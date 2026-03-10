import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useNumberInput } from '../src/hooks/useNumberInput'
import NumberInput from '../src/NumberInput'

// ===========================================================================
// useNumberInput hook tests
// ===========================================================================

describe('useNumberInput', () => {
  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------

  it('starts with 0 by default', () => {
    const { result } = renderHook(() => useNumberInput())
    expect(result.current.value).toBe(0)
    expect(result.current.displayValue).toBe('0')
  })

  it('uses initialValue', () => {
    const { result } = renderHook(() => useNumberInput({ initialValue: 42 }))
    expect(result.current.value).toBe(42)
  })

  it('clamps initialValue to min/max', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 200, min: 0, max: 100 }),
    )
    expect(result.current.value).toBe(100)
  })

  it('clamps initialValue below min', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: -5, min: 0, max: 100 }),
    )
    expect(result.current.value).toBe(0)
  })

  // -------------------------------------------------------------------------
  // setValue
  // -------------------------------------------------------------------------

  it('sets value directly', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useNumberInput({ min: 0, max: 100, onChange }),
    )

    act(() => {
      result.current.setValue(50)
    })

    expect(result.current.value).toBe(50)
    expect(onChange).toHaveBeenCalledWith(50)
  })

  it('clamps setValue to max', () => {
    const { result } = renderHook(() =>
      useNumberInput({ min: 0, max: 10 }),
    )

    act(() => {
      result.current.setValue(999)
    })

    expect(result.current.value).toBe(10)
  })

  it('clamps setValue to min', () => {
    const { result } = renderHook(() =>
      useNumberInput({ min: 0, max: 10 }),
    )

    act(() => {
      result.current.setValue(-5)
    })

    expect(result.current.value).toBe(0)
  })

  it('does not clamp when clamp is false', () => {
    const { result } = renderHook(() =>
      useNumberInput({ min: 0, max: 10, clamp: false }),
    )

    act(() => {
      result.current.setValue(999)
    })

    expect(result.current.value).toBe(999)
  })

  // -------------------------------------------------------------------------
  // increment / decrement
  // -------------------------------------------------------------------------

  it('increments by step', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 5, step: 3 }),
    )

    act(() => {
      result.current.increment()
    })

    expect(result.current.value).toBe(8)
  })

  it('decrements by step', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 10, step: 4 }),
    )

    act(() => {
      result.current.decrement()
    })

    expect(result.current.value).toBe(6)
  })

  it('does not increment past max', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 9, max: 10, step: 5 }),
    )

    act(() => {
      result.current.increment()
    })

    expect(result.current.value).toBe(10)
  })

  it('does not decrement past min', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 2, min: 0, step: 5 }),
    )

    act(() => {
      result.current.decrement()
    })

    expect(result.current.value).toBe(0)
  })

  it('calls onChange on increment', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 0, step: 1, onChange }),
    )

    act(() => {
      result.current.increment()
    })

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('calls onChange on decrement', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 5, step: 1, onChange }),
    )

    act(() => {
      result.current.decrement()
    })

    expect(onChange).toHaveBeenCalledWith(4)
  })

  // -------------------------------------------------------------------------
  // isMin / isMax
  // -------------------------------------------------------------------------

  it('isMin is true when value equals min', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 0, min: 0 }),
    )
    expect(result.current.isMin).toBe(true)
  })

  it('isMax is true when value equals max', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 100, max: 100 }),
    )
    expect(result.current.isMax).toBe(true)
  })

  it('isMin and isMax are false in range', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 50, min: 0, max: 100 }),
    )
    expect(result.current.isMin).toBe(false)
    expect(result.current.isMax).toBe(false)
  })

  // -------------------------------------------------------------------------
  // precision
  // -------------------------------------------------------------------------

  it('formats displayValue with precision', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 3.1, precision: 2 }),
    )
    expect(result.current.displayValue).toBe('3.10')
  })

  it('rounds to precision on increment', () => {
    const { result } = renderHook(() =>
      useNumberInput({ initialValue: 0, step: 0.1, precision: 1 }),
    )

    act(() => {
      result.current.increment()
    })

    expect(result.current.value).toBeCloseTo(0.1)
    expect(result.current.displayValue).toBe('0.1')
  })

  // -------------------------------------------------------------------------
  // inputProps
  // -------------------------------------------------------------------------

  it('provides correct inputProps', () => {
    const { result } = renderHook(() =>
      useNumberInput({ min: 0, max: 100 }),
    )

    expect(result.current.inputProps.role).toBe('spinbutton')
    expect(result.current.inputProps['aria-valuemin']).toBe(0)
    expect(result.current.inputProps['aria-valuemax']).toBe(100)
    expect(result.current.inputProps['aria-valuenow']).toBe(0)
    expect(result.current.inputProps.inputMode).toBe('decimal')
    expect(result.current.inputProps.type).toBe('text')
  })

  it('omits aria-valuemin when min is -Infinity', () => {
    const { result } = renderHook(() => useNumberInput({ max: 100 }))
    expect(result.current.inputProps['aria-valuemin']).toBeUndefined()
  })

  it('omits aria-valuemax when max is Infinity', () => {
    const { result } = renderHook(() => useNumberInput({ min: 0 }))
    expect(result.current.inputProps['aria-valuemax']).toBeUndefined()
  })
})

// ===========================================================================
// NumberInput component tests
// ===========================================================================

describe('NumberInput', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders with default value', () => {
    render(<NumberInput />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('0')
  })

  it('renders with initial value', () => {
    render(<NumberInput initialValue={25} />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('25')
  })

  it('renders increment and decrement buttons', () => {
    render(<NumberInput />)
    expect(screen.getByTestId('number-input-increment')).toBeDefined()
    expect(screen.getByTestId('number-input-decrement')).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  it('has role=spinbutton on input', () => {
    render(<NumberInput min={0} max={100} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toBeDefined()
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<NumberInput min={0} max={100} />)
    const input = screen.getByRole('spinbutton')
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('100')
  })

  it('sets aria-valuenow', () => {
    render(<NumberInput initialValue={42} />)
    const input = screen.getByRole('spinbutton')
    expect(input.getAttribute('aria-valuenow')).toBe('42')
  })

  it('sets aria-label', () => {
    render(<NumberInput aria-label="Quantity" />)
    const input = screen.getByLabelText('Quantity')
    expect(input).toBeDefined()
  })

  it('increment button has aria-label', () => {
    render(<NumberInput />)
    expect(screen.getByLabelText('Increment')).toBeDefined()
  })

  it('decrement button has aria-label', () => {
    render(<NumberInput />)
    expect(screen.getByLabelText('Decrement')).toBeDefined()
  })

  // -------------------------------------------------------------------------
  // Button clicks
  // -------------------------------------------------------------------------

  it('increments on button click', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} onChange={onChange} />)

    fireEvent.click(screen.getByTestId('number-input-increment'))

    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('6')
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('decrements on button click', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} onChange={onChange} />)

    fireEvent.click(screen.getByTestId('number-input-decrement'))

    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('4')
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('does not increment past max', () => {
    render(<NumberInput initialValue={10} max={10} />)
    fireEvent.click(screen.getByTestId('number-input-increment'))
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('10')
  })

  it('does not decrement past min', () => {
    render(<NumberInput initialValue={0} min={0} />)
    fireEvent.click(screen.getByTestId('number-input-decrement'))
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('0')
  })

  // -------------------------------------------------------------------------
  // Keyboard: ArrowUp / ArrowDown
  // -------------------------------------------------------------------------

  it('increments on ArrowUp', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('decrements on ArrowDown', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('increments by step*10 on Shift+ArrowUp', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} step={2} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp', shiftKey: true })

    expect(onChange).toHaveBeenCalledWith(25)
  })

  it('decrements by step*10 on Shift+ArrowDown', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={50} step={2} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true })

    expect(onChange).toHaveBeenCalledWith(30)
  })

  // -------------------------------------------------------------------------
  // Keyboard: Home / End
  // -------------------------------------------------------------------------

  it('goes to min on Home', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={50} min={0} max={100} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Home' })

    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('goes to max on End', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={50} min={0} max={100} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'End' })

    expect(onChange).toHaveBeenCalledWith(100)
  })

  it('does nothing on Home when min is -Infinity', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={50} max={100} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Home' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does nothing on End when max is Infinity', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={50} min={0} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'End' })

    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Direct typing + blur clamping
  // -------------------------------------------------------------------------

  it('allows direct typing and clamps on blur', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} min={0} max={10} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '999' } })
    fireEvent.blur(input)

    expect(input.value).toBe('10')
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('keeps previous value on invalid text blur', () => {
    render(<NumberInput initialValue={5} />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.blur(input)

    expect(input.value).toBe('5')
  })

  it('commits value on Enter', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={5} min={0} max={100} onChange={onChange} />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(42)
  })

  // -------------------------------------------------------------------------
  // Disabled state
  // -------------------------------------------------------------------------

  it('disables input when disabled', () => {
    render(<NumberInput disabled />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('disables buttons when disabled', () => {
    render(<NumberInput disabled />)
    const inc = screen.getByTestId('number-input-increment') as HTMLButtonElement
    const dec = screen.getByTestId('number-input-decrement') as HTMLButtonElement
    expect(inc.disabled).toBe(true)
    expect(dec.disabled).toBe(true)
  })

  it('does not change value on button click when disabled', () => {
    const onChange = vi.fn()
    render(<NumberInput disabled initialValue={5} onChange={onChange} />)

    fireEvent.click(screen.getByTestId('number-input-increment'))
    fireEvent.click(screen.getByTestId('number-input-decrement'))

    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Size variants
  // -------------------------------------------------------------------------

  it('renders sm size', () => {
    render(<NumberInput size="sm" />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.style.height).toBe('2rem')
  })

  it('renders md size (default)', () => {
    render(<NumberInput />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.style.height).toBe('2.5rem')
  })

  it('renders lg size', () => {
    render(<NumberInput size="lg" />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.style.height).toBe('3rem')
  })

  // -------------------------------------------------------------------------
  // Precision formatting
  // -------------------------------------------------------------------------

  it('formats display with precision', () => {
    render(<NumberInput initialValue={3} precision={2} />)
    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('3.00')
  })

  it('increments with decimal step and precision', () => {
    const onChange = vi.fn()
    render(<NumberInput initialValue={0} step={0.1} precision={1} onChange={onChange} />)

    fireEvent.click(screen.getByTestId('number-input-increment'))

    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('0.1')
  })

  // -------------------------------------------------------------------------
  // Custom props
  // -------------------------------------------------------------------------

  it('applies custom className', () => {
    render(<NumberInput className="my-custom-class" />)
    const wrapper = screen.getByTestId('number-input')
    expect(wrapper.className).toContain('my-custom-class')
  })

  it('uses custom id', () => {
    render(<NumberInput id="qty-input" />)
    const input = document.getElementById('qty-input')
    expect(input).toBeDefined()
    expect(input).not.toBeNull()
  })

  // -------------------------------------------------------------------------
  // Step with clamp=false
  // -------------------------------------------------------------------------

  it('allows exceeding max when clamp is false', () => {
    render(<NumberInput initialValue={9} max={10} step={5} clamp={false} />)

    fireEvent.click(screen.getByTestId('number-input-increment'))

    const input = screen.getByTestId('number-input-field') as HTMLInputElement
    expect(input.value).toBe('14')
  })
})
