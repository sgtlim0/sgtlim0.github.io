import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary, { ErrorFallback } from '../src/ErrorBoundary'
import StatusBadge from '../src/admin/StatusBadge'
import StatCard from '../src/admin/StatCard'
import KPICard from '../src/roi/KPICard'
import TabFilter from '../src/hmg/TabFilter'
import MiniLineChart from '../src/roi/charts/MiniLineChart'

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <span>OK</span>
      </ErrorBoundary>,
    )
    expect(screen.getByText('OK')).toBeDefined()
  })

  it('should render fallback when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function ThrowingComponent() {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Test error')).toBeDefined()
    spy.mockRestore()
  })

  it('should render custom fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function ThrowingComponent() {
      throw new Error('Oops')
    }

    render(
      <ErrorBoundary fallback={<div>Custom Error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom Error')).toBeDefined()
    spy.mockRestore()
  })
})

describe('ErrorFallback', () => {
  it('should render default title', () => {
    render(<ErrorFallback />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('should render custom title', () => {
    render(<ErrorFallback title="Custom Title" />)
    expect(screen.getByText('Custom Title')).toBeDefined()
  })

  it('should render error message', () => {
    render(<ErrorFallback error={new Error('Detailed error')} />)
    expect(screen.getByText('Detailed error')).toBeDefined()
  })

  it('should render retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    render(<ErrorFallback onRetry={onRetry} />)

    const button = screen.getByText('Try Again')
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should not render retry button when no onRetry', () => {
    render(<ErrorFallback />)
    expect(screen.queryByText('Try Again')).toBeNull()
  })
})

describe('StatusBadge', () => {
  it('should render success status with default label', () => {
    render(<StatusBadge status="success" />)
    expect(screen.getByText('완료')).toBeDefined()
  })

  it('should render error status with default label', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('실패')).toBeDefined()
  })

  it('should render pending status with default label', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('진행중')).toBeDefined()
  })

  it('should render custom label', () => {
    render(<StatusBadge status="success" label="커스텀" />)
    expect(screen.getByText('커스텀')).toBeDefined()
  })
})

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="Total Users" value="1,234" />)
    expect(screen.getByText('Total Users')).toBeDefined()
    expect(screen.getByText('1,234')).toBeDefined()
  })

  it('should render trend when provided', () => {
    render(<StatCard label="Revenue" value="$50K" trend="+12%" trendUp />)
    expect(screen.getByText('+12%', { exact: false })).toBeDefined()
  })

  it('should not render trend when not provided', () => {
    const { container } = render(<StatCard label="Test" value="100" />)
    expect(container.querySelector('.text-xs.font-medium')).toBeNull()
  })
})

describe('KPICard', () => {
  it('should render label, value, and trend', () => {
    render(<KPICard label="Time Saved" value="120h" trend="+15%" trendUp />)
    expect(screen.getByText('Time Saved')).toBeDefined()
    expect(screen.getByText('120h')).toBeDefined()
    expect(screen.getByText('+15%', { exact: false })).toBeDefined()
  })

  it('should show up arrow for positive trend', () => {
    render(<KPICard label="ROI" value="350%" trend="+20%" trendUp />)
    expect(screen.getByText(/▲/)).toBeDefined()
  })

  it('should show down arrow for negative trend', () => {
    render(<KPICard label="Cost" value="$1K" trend="-5%" trendUp={false} />)
    expect(screen.getByText(/▼/)).toBeDefined()
  })
})

describe('TabFilter', () => {
  it('should render all tabs', () => {
    const tabs = ['All', 'Guide', 'Release']
    render(<TabFilter tabs={tabs} activeTab="All" onTabChange={() => {}} />)

    tabs.forEach((tab) => {
      expect(screen.getByText(tab)).toBeDefined()
    })
  })

  it('should call onTabChange when tab clicked', () => {
    const onTabChange = vi.fn()
    render(<TabFilter tabs={['A', 'B', 'C']} activeTab="A" onTabChange={onTabChange} />)

    fireEvent.click(screen.getByText('B'))
    expect(onTabChange).toHaveBeenCalledWith('B')
  })
})

describe('MiniLineChart', () => {
  it('should render nothing when data is empty', () => {
    const { container } = render(<MiniLineChart data={[]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('should render svg with data', () => {
    const data = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
      { label: 'Mar', value: 15 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    expect(container.querySelector('svg')).toBeDefined()
    expect(container.querySelector('polyline')).toBeDefined()
  })

  it('should render circles for each data point', () => {
    const data = [
      { label: 'A', value: 5 },
      { label: 'B', value: 10 },
      { label: 'C', value: 8 },
      { label: 'D', value: 12 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(4)
  })

  it('should render x-axis labels', () => {
    const data = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
    ]
    render(<MiniLineChart data={data} />)
    expect(screen.getByText('Jan')).toBeDefined()
    expect(screen.getByText('Feb')).toBeDefined()
  })

  it('should have aria-label for accessibility', () => {
    const data = [
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    expect(container.querySelector('[aria-label="라인 차트"]')).toBeDefined()
  })
})
