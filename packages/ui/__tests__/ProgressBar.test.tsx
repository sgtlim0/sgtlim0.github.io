import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar, { clampPercent } from '../src/ProgressBar'

// ===========================================================================
// 1. clampPercent utility
// ===========================================================================

describe('clampPercent', () => {
  it('returns correct percentage for normal values', () => {
    expect(clampPercent(50, 100)).toBe(50)
    expect(clampPercent(25, 200)).toBe(12.5)
  })

  it('clamps to 0 when value is negative', () => {
    expect(clampPercent(-10, 100)).toBe(0)
  })

  it('clamps to 100 when value exceeds max', () => {
    expect(clampPercent(150, 100)).toBe(100)
  })

  it('returns 0 when max is 0 or negative', () => {
    expect(clampPercent(50, 0)).toBe(0)
    expect(clampPercent(50, -10)).toBe(0)
  })
})

// ===========================================================================
// 2. Linear ProgressBar
// ===========================================================================

describe('ProgressBar — linear', () => {
  it('renders with role="progressbar" and correct ARIA attributes', () => {
    render(<ProgressBar value={40} />)
    const el = screen.getByRole('progressbar')
    expect(el).toBeDefined()
    expect(el.getAttribute('aria-valuenow')).toBe('40')
    expect(el.getAttribute('aria-valuemin')).toBe('0')
    expect(el.getAttribute('aria-valuemax')).toBe('100')
  })

  it('uses custom max for ARIA and fill width', () => {
    render(<ProgressBar value={50} max={200} />)
    const el = screen.getByRole('progressbar')
    expect(el.getAttribute('aria-valuenow')).toBe('25')
    expect(el.getAttribute('aria-valuemax')).toBe('200')
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('25%')
  })

  it('displays default percentage label when showLabel is true', () => {
    render(<ProgressBar value={75} showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('75%')
  })

  it('displays custom label when provided', () => {
    render(<ProgressBar value={30} showLabel label="30 of 100" />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('30 of 100')
  })

  it('does not display label when showLabel is false', () => {
    render(<ProgressBar value={50} />)
    expect(screen.queryByTestId('progress-label')).toBeNull()
  })

  it('applies sm size height', () => {
    render(<ProgressBar value={50} size="sm" />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.parentElement?.style.height).toBe('4px')
  })

  it('applies md size height (default)', () => {
    render(<ProgressBar value={50} />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.parentElement?.style.height).toBe('8px')
  })

  it('applies lg size height', () => {
    render(<ProgressBar value={50} size="lg" />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.parentElement?.style.height).toBe('12px')
  })

  it('applies custom color to fill', () => {
    render(<ProgressBar value={60} color="#ff0000" />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('applies stripe animation when animated is true', () => {
    render(<ProgressBar value={60} animated />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.animation).toContain('hchat-progress-stripe')
    expect(fill.style.backgroundImage).toContain('repeating-linear-gradient')
  })

  it('does not apply stripe animation by default', () => {
    render(<ProgressBar value={60} />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.animation).toBe('')
  })

  it('renders indeterminate mode with animation', () => {
    render(<ProgressBar value={50} indeterminate />)
    const el = screen.getByRole('progressbar')
    // indeterminate should not have aria-valuenow
    expect(el.getAttribute('aria-valuenow')).toBeNull()
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('40%')
    expect(fill.style.animation).toContain('hchat-progress-indeterminate')
  })

  it('sets aria-label to "Loading" when indeterminate without custom label', () => {
    render(<ProgressBar value={0} indeterminate />)
    const el = screen.getByRole('progressbar')
    expect(el.getAttribute('aria-label')).toBe('Loading')
  })

  it('sets aria-label to custom label when provided', () => {
    render(<ProgressBar value={50} label="Uploading file" />)
    const el = screen.getByRole('progressbar')
    expect(el.getAttribute('aria-label')).toBe('Uploading file')
  })

  it('clamps value above max to 100%', () => {
    render(<ProgressBar value={200} max={100} />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('100%')
  })

  it('clamps negative value to 0%', () => {
    render(<ProgressBar value={-10} />)
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('0%')
  })

  it('applies className to wrapper', () => {
    render(<ProgressBar value={50} className="my-custom-class" />)
    const fill = screen.getByTestId('progress-fill')
    // className is applied to the inner wrapper div
    const wrapper = fill.parentElement?.parentElement
    expect(wrapper?.className).toContain('my-custom-class')
  })

  it('does not apply stripe when animated + indeterminate', () => {
    render(<ProgressBar value={50} animated indeterminate />)
    const fill = screen.getByTestId('progress-fill')
    // indeterminate takes priority — no stripe
    expect(fill.style.animation).toContain('hchat-progress-indeterminate')
    expect(fill.style.backgroundImage).toBe('')
  })
})

// ===========================================================================
// 3. Circular ProgressBar
// ===========================================================================

describe('ProgressBar — circular', () => {
  it('renders SVG with correct ARIA attributes', () => {
    render(<ProgressBar value={60} variant="circular" />)
    const el = screen.getByRole('progressbar')
    expect(el).toBeDefined()
    expect(el.getAttribute('aria-valuenow')).toBe('60')
    expect(el.querySelector('svg')).toBeDefined()
  })

  it('renders progress circle element', () => {
    render(<ProgressBar value={50} variant="circular" />)
    const circle = screen.getByTestId('progress-circle')
    expect(circle).toBeDefined()
    expect(circle.getAttribute('stroke-dasharray')).toBeTruthy()
    expect(circle.getAttribute('stroke-dashoffset')).toBeTruthy()
  })

  it('displays percentage label in center when showLabel is true', () => {
    render(<ProgressBar value={75} variant="circular" showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('75%')
  })

  it('displays custom label when provided', () => {
    render(<ProgressBar value={30} variant="circular" showLabel label="30s" />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('30s')
  })

  it('hides label in indeterminate circular mode', () => {
    render(<ProgressBar value={50} variant="circular" showLabel indeterminate />)
    expect(screen.queryByTestId('progress-label')).toBeNull()
  })

  it('uses sm size (32px diameter)', () => {
    render(<ProgressBar value={50} variant="circular" size="sm" />)
    const svg = screen.getByRole('progressbar').querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('uses md size (48px diameter, default)', () => {
    render(<ProgressBar value={50} variant="circular" />)
    const svg = screen.getByRole('progressbar').querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('48')
    expect(svg?.getAttribute('height')).toBe('48')
  })

  it('uses lg size (64px diameter)', () => {
    render(<ProgressBar value={50} variant="circular" size="lg" />)
    const svg = screen.getByRole('progressbar').querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('64')
    expect(svg?.getAttribute('height')).toBe('64')
  })

  it('applies custom color to stroke', () => {
    render(<ProgressBar value={50} variant="circular" color="#ff0000" />)
    const circle = screen.getByTestId('progress-circle')
    expect(circle.getAttribute('stroke')).toBe('#ff0000')
  })

  it('renders indeterminate circular with rotation animation', () => {
    render(<ProgressBar value={50} variant="circular" indeterminate />)
    const svg = screen.getByRole('progressbar').querySelector('svg')
    expect(svg?.style.animation).toContain('hchat-circular-rotate')
  })

  it('does not rotate when not indeterminate', () => {
    render(<ProgressBar value={50} variant="circular" />)
    const svg = screen.getByRole('progressbar').querySelector('svg')
    expect(svg?.style.animation).toBeFalsy()
  })

  it('calculates correct strokeDashoffset at 0%', () => {
    render(<ProgressBar value={0} variant="circular" />)
    const circle = screen.getByTestId('progress-circle')
    const dasharray = parseFloat(circle.getAttribute('stroke-dasharray') || '0')
    const dashoffset = parseFloat(circle.getAttribute('stroke-dashoffset') || '0')
    // At 0%, offset should equal full circumference
    expect(Math.abs(dashoffset - dasharray)).toBeLessThan(0.01)
  })

  it('calculates correct strokeDashoffset at 100%', () => {
    render(<ProgressBar value={100} variant="circular" />)
    const circle = screen.getByTestId('progress-circle')
    const dashoffset = parseFloat(circle.getAttribute('stroke-dashoffset') || '0')
    // At 100%, offset should be 0
    expect(Math.abs(dashoffset)).toBeLessThan(0.01)
  })

  it('calculates correct strokeDashoffset at 50%', () => {
    render(<ProgressBar value={50} variant="circular" />)
    const circle = screen.getByTestId('progress-circle')
    const dasharray = parseFloat(circle.getAttribute('stroke-dasharray') || '0')
    const dashoffset = parseFloat(circle.getAttribute('stroke-dashoffset') || '0')
    // At 50%, offset should be half of circumference
    expect(Math.abs(dashoffset - dasharray / 2)).toBeLessThan(0.01)
  })
})

// ===========================================================================
// 4. Edge cases & accessibility
// ===========================================================================

describe('ProgressBar — edge cases', () => {
  it('renders with value=0', () => {
    render(<ProgressBar value={0} showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('0%')
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('0%')
  })

  it('renders with value=100', () => {
    render(<ProgressBar value={100} showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('100%')
    const fill = screen.getByTestId('progress-fill')
    expect(fill.style.width).toBe('100%')
  })

  it('handles fractional values correctly', () => {
    render(<ProgressBar value={33.333} showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('33%')
  })

  it('handles max=0 gracefully', () => {
    render(<ProgressBar value={50} max={0} showLabel />)
    const label = screen.getByTestId('progress-label')
    expect(label.textContent).toBe('0%')
  })

  it('all variants have role="progressbar"', () => {
    const { unmount } = render(<ProgressBar value={50} variant="linear" />)
    expect(screen.getByRole('progressbar')).toBeDefined()
    unmount()
    render(<ProgressBar value={50} variant="circular" />)
    expect(screen.getByRole('progressbar')).toBeDefined()
  })

  it('aria-valuemin is always 0', () => {
    render(<ProgressBar value={50} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemin')).toBe('0')
  })
})
