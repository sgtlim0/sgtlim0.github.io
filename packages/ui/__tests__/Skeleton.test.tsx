import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  SkeletonPulse,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
} from '../src/Skeleton'

describe('SkeletonPulse', () => {
  it('renders a div', () => {
    const { container } = render(<SkeletonPulse />)
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonPulse className="h-6 w-1/3" />)
    expect(container.firstChild).toHaveClass('h-6', 'w-1/3')
  })

  it('applies custom style', () => {
    const { container } = render(<SkeletonPulse style={{ width: '50%' }} />)
    expect(container.firstChild).toHaveStyle({ width: '50%' })
  })
})

describe('SkeletonText', () => {
  it('renders default 1 line', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('.rounded')
    expect(lines.length).toBe(1)
  })

  it('renders multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('.rounded')
    expect(lines.length).toBe(3)
  })

  it('last line is shorter when multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('.rounded')
    const lastLine = lines[lines.length - 1] as HTMLElement
    expect(lastLine.style.width).toBe('75%')
  })
})

describe('SkeletonCard', () => {
  it('renders with default 3 lines', () => {
    const { container } = render(<SkeletonCard />)
    // header pulse + 3 text lines
    const pulses = container.querySelectorAll('.rounded')
    expect(pulses.length).toBeGreaterThanOrEqual(4)
  })

  it('renders with custom lines', () => {
    const { container } = render(<SkeletonCard lines={5} />)
    const pulses = container.querySelectorAll('.rounded')
    expect(pulses.length).toBeGreaterThanOrEqual(6)
  })
})

describe('SkeletonTable', () => {
  it('renders default 5 rows and 4 cols', () => {
    const { container } = render(<SkeletonTable />)
    // header row (4 cols) + 5 data rows (4 cols each) = 24 pulses
    const pulses = container.querySelectorAll('.rounded')
    expect(pulses.length).toBe(24)
  })

  it('renders custom rows and cols', () => {
    const { container } = render(<SkeletonTable rows={3} cols={2} />)
    // header (2) + 3 rows * 2 cols = 8
    const pulses = container.querySelectorAll('.rounded')
    expect(pulses.length).toBe(8)
  })
})

describe('SkeletonChart', () => {
  it('renders with default height', () => {
    const { container } = render(<SkeletonChart />)
    const chartArea = container.querySelectorAll('.rounded, .rounded-lg')
    expect(chartArea.length).toBeGreaterThan(0)
  })

  it('renders legend items', () => {
    const { container } = render(<SkeletonChart />)
    const legendDots = container.querySelectorAll('.rounded-full')
    expect(legendDots.length).toBe(3)
  })
})
