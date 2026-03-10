import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useRating } from '../src/hooks/useRating'
import Rating from '../src/Rating'

// ===========================================================================
// 1. useRating hook
// ===========================================================================

describe('useRating', () => {
  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------
  it('returns default values', () => {
    const { result } = renderHook(() => useRating())
    expect(result.current.value).toBe(0)
    expect(result.current.hoverValue).toBeNull()
  })

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useRating({ initialValue: 3 }))
    expect(result.current.value).toBe(3)
  })

  it('clamps initialValue to max', () => {
    const { result } = renderHook(() =>
      useRating({ initialValue: 10, max: 5 }),
    )
    expect(result.current.value).toBe(5)
  })

  it('clamps initialValue to 0 for negative', () => {
    const { result } = renderHook(() => useRating({ initialValue: -3 }))
    expect(result.current.value).toBe(0)
  })

  // -------------------------------------------------------------------------
  // setValue
  // -------------------------------------------------------------------------
  it('updates value via setValue', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useRating({ onChange }))

    act(() => result.current.setValue(4))

    expect(result.current.value).toBe(4)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('clamps setValue to max', () => {
    const { result } = renderHook(() => useRating({ max: 5 }))

    act(() => result.current.setValue(8))

    expect(result.current.value).toBe(5)
  })

  it('clamps setValue to 0', () => {
    const { result } = renderHook(() => useRating())

    act(() => result.current.setValue(-1))

    expect(result.current.value).toBe(0)
  })

  // -------------------------------------------------------------------------
  // Half precision
  // -------------------------------------------------------------------------
  it('supports half-star precision', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useRating({ precision: 0.5, onChange }),
    )

    act(() => result.current.setValue(3.5))

    expect(result.current.value).toBe(3.5)
    expect(onChange).toHaveBeenCalledWith(3.5)
  })

  it('rounds to nearest half step', () => {
    const { result } = renderHook(() => useRating({ precision: 0.5 }))

    act(() => result.current.setValue(3.3))

    expect(result.current.value).toBe(3.5)
  })

  it('rounds to nearest full step with precision 1', () => {
    const { result } = renderHook(() => useRating({ precision: 1 }))

    act(() => result.current.setValue(3.7))

    expect(result.current.value).toBe(4)
  })

  // -------------------------------------------------------------------------
  // Hover
  // -------------------------------------------------------------------------
  it('sets hoverValue on onMouseEnter', () => {
    const { result } = renderHook(() => useRating())

    act(() => result.current.onMouseEnter(3))

    expect(result.current.hoverValue).toBe(3)
  })

  it('clears hoverValue on onMouseLeave', () => {
    const { result } = renderHook(() => useRating())

    act(() => result.current.onMouseEnter(3))
    act(() => result.current.onMouseLeave())

    expect(result.current.hoverValue).toBeNull()
  })

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  it('resets value to 0', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useRating({ initialValue: 4, onChange }),
    )

    act(() => result.current.reset())

    expect(result.current.value).toBe(0)
    expect(onChange).toHaveBeenCalledWith(0)
  })

  // -------------------------------------------------------------------------
  // Read-only
  // -------------------------------------------------------------------------
  it('ignores setValue in readOnly mode', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useRating({ initialValue: 3, readOnly: true, onChange }),
    )

    act(() => result.current.setValue(5))

    expect(result.current.value).toBe(3)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ignores onMouseEnter in readOnly mode', () => {
    const { result } = renderHook(() => useRating({ readOnly: true }))

    act(() => result.current.onMouseEnter(3))

    expect(result.current.hoverValue).toBeNull()
  })

  it('ignores reset in readOnly mode', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useRating({ initialValue: 4, readOnly: true, onChange }),
    )

    act(() => result.current.reset())

    expect(result.current.value).toBe(4)
    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Custom max
  // -------------------------------------------------------------------------
  it('supports custom max', () => {
    const { result } = renderHook(() => useRating({ max: 10 }))

    act(() => result.current.setValue(8))

    expect(result.current.value).toBe(8)
  })

  // -------------------------------------------------------------------------
  // No onChange callback
  // -------------------------------------------------------------------------
  it('works without onChange callback', () => {
    const { result } = renderHook(() => useRating())

    act(() => result.current.setValue(3))

    expect(result.current.value).toBe(3)
  })
})

// ===========================================================================
// 2. Rating component
// ===========================================================================

describe('Rating', () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it('renders correct number of stars', () => {
    render(<Rating />)
    const stars = screen.getAllByRole('radio')
    expect(stars).toHaveLength(5)
  })

  it('renders custom max stars', () => {
    render(<Rating max={10} />)
    const stars = screen.getAllByRole('radio')
    expect(stars).toHaveLength(10)
  })

  it('has radiogroup role', () => {
    render(<Rating />)
    expect(screen.getByRole('radiogroup')).toBeTruthy()
  })

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  it('has aria-label on the group', () => {
    render(<Rating aria-label="Product rating" />)
    const group = screen.getByRole('radiogroup')
    expect(group.getAttribute('aria-label')).toBe('Product rating')
  })

  it('defaults aria-label to Rating', () => {
    render(<Rating />)
    const group = screen.getByRole('radiogroup')
    expect(group.getAttribute('aria-label')).toBe('Rating')
  })

  it('each star has aria-label', () => {
    render(<Rating max={3} />)
    const stars = screen.getAllByRole('radio')
    expect(stars[0].getAttribute('aria-label')).toBe('1 star')
    expect(stars[1].getAttribute('aria-label')).toBe('2 stars')
    expect(stars[2].getAttribute('aria-label')).toBe('3 stars')
  })

  it('each star has aria-checked', () => {
    render(<Rating />)
    const stars = screen.getAllByRole('radio')
    stars.forEach((star) => {
      expect(star.getAttribute('aria-checked')).toBeDefined()
    })
  })

  it('group is focusable when not readOnly', () => {
    render(<Rating />)
    const group = screen.getByRole('radiogroup')
    expect(group.getAttribute('tabindex')).toBe('0')
  })

  it('group is not focusable when readOnly', () => {
    render(<Rating readOnly />)
    const group = screen.getByRole('radiogroup')
    expect(group.getAttribute('tabindex')).toBe('-1')
  })

  // -------------------------------------------------------------------------
  // Click interaction
  // -------------------------------------------------------------------------
  it('selects rating on click', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} />)

    const star3 = screen.getByTestId('rating-star-3')
    fireEvent.click(star3)

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('does not change rating on click in readOnly', () => {
    const onChange = vi.fn()
    render(<Rating readOnly onChange={onChange} initialValue={2} />)

    const star4 = screen.getByTestId('rating-star-4')
    fireEvent.click(star4)

    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Hover interaction
  // -------------------------------------------------------------------------
  it('shows hover preview on mouse enter', () => {
    render(<Rating />)

    const star4 = screen.getByTestId('rating-star-4')
    fireEvent.mouseEnter(star4)

    // Stars 1-4 should show filled color (yellow)
    const star1 = screen.getByTestId('rating-star-1')
    expect(star1.style.color).toBe('rgb(250, 204, 21)')
  })

  it('clears hover preview on mouse leave', () => {
    render(<Rating />)
    const group = screen.getByRole('radiogroup')
    const star4 = screen.getByTestId('rating-star-4')

    fireEvent.mouseEnter(star4)
    fireEvent.mouseLeave(group)

    // Without selection, star1 should show empty color
    const star1 = screen.getByTestId('rating-star-1')
    expect(star1.style.color).toBe('rgb(209, 213, 219)')
  })

  // -------------------------------------------------------------------------
  // Half-star precision
  // -------------------------------------------------------------------------
  it('toggles between full and half on repeated click (precision 0.5)', () => {
    const onChange = vi.fn()
    render(<Rating precision={0.5} onChange={onChange} />)

    const star3 = screen.getByTestId('rating-star-3')

    // First click: set to 3
    fireEvent.click(star3)
    expect(onChange).toHaveBeenCalledWith(3)

    // Second click on same star: toggle to 2.5
    fireEvent.click(star3)
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------
  it('increases rating with ArrowRight', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={2} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('decreases rating with ArrowLeft', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={3} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowLeft' })

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('increases rating with ArrowUp', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={2} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowUp' })

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('decreases rating with ArrowDown', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={3} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowDown' })

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('does not exceed max with ArrowRight', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={5} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('does not go below 0 with ArrowLeft', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={0} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowLeft' })

    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('sets to max with End key', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={2} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'End' })

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('sets to 0 with Home key', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={3} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'Home' })

    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('uses half step for keyboard with precision 0.5', () => {
    const onChange = vi.fn()
    render(<Rating precision={0.5} onChange={onChange} initialValue={2} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('ignores keyboard in readOnly mode', () => {
    const onChange = vi.fn()
    render(<Rating readOnly onChange={onChange} initialValue={3} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('ignores unrelated keys', () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} initialValue={3} />)
    const group = screen.getByRole('radiogroup')

    fireEvent.keyDown(group, { key: 'Enter' })

    expect(onChange).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Size variants
  // -------------------------------------------------------------------------
  it('renders with sm size', () => {
    render(<Rating size="sm" />)
    const star = screen.getByTestId('rating-star-1')
    const svg = star.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('16')
  })

  it('renders with md size (default)', () => {
    render(<Rating />)
    const star = screen.getByTestId('rating-star-1')
    const svg = star.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
  })

  it('renders with lg size', () => {
    render(<Rating size="lg" />)
    const star = screen.getByTestId('rating-star-1')
    const svg = star.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
  })

  // -------------------------------------------------------------------------
  // Custom icon
  // -------------------------------------------------------------------------
  it('uses custom renderIcon', () => {
    const customIcon = (fill: 'full' | 'half' | 'empty') => (
      <span data-testid={`custom-${fill}`}>{fill === 'full' ? 'X' : 'O'}</span>
    )
    render(<Rating initialValue={2} renderIcon={customIcon} />)

    expect(screen.getAllByTestId('custom-full')).toHaveLength(2)
    expect(screen.getAllByTestId('custom-empty')).toHaveLength(3)
  })

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------
  it('applies className to root element', () => {
    render(<Rating className="my-rating" />)
    const group = screen.getByRole('radiogroup')
    expect(group.className).toContain('my-rating')
  })

  // -------------------------------------------------------------------------
  // Cursor style
  // -------------------------------------------------------------------------
  it('shows pointer cursor when interactive', () => {
    render(<Rating />)
    const star = screen.getByTestId('rating-star-1')
    expect(star.style.cursor).toBe('pointer')
  })

  it('shows default cursor when readOnly', () => {
    render(<Rating readOnly />)
    const star = screen.getByTestId('rating-star-1')
    expect(star.style.cursor).toBe('default')
  })
})
