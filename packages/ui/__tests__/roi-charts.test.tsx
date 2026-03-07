import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DonutChart from '../src/roi/charts/DonutChart'
import MiniBarChart from '../src/roi/charts/MiniBarChart'
import RadarChart from '../src/roi/charts/RadarChart'
import KPICard from '../src/roi/KPICard'
import MiniLineChart from '../src/roi/charts/MiniLineChart'

describe('DonutChart', () => {
  const segments = [
    { label: 'GPT-4o', value: 40, color: '#3B82F6' },
    { label: 'Claude 3', value: 30, color: '#8B5CF6' },
    { label: 'Gemini', value: 20, color: '#10B981' },
    { label: '기타', value: 10, color: '#F59E0B' },
  ]

  it('should render with aria-label', () => {
    const { container } = render(<DonutChart segments={segments} />)
    expect(container.querySelector('[aria-label="도넛 차트"]')).toBeDefined()
  })

  it('should render SVG with circles', () => {
    const { container } = render(<DonutChart segments={segments} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(segments.length + 1) // segments + background
  })

  it('should render total in center', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('합계')).toBeDefined()
  })

  it('should render legend labels', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('GPT-4o')).toBeDefined()
    expect(screen.getByText('Claude 3')).toBeDefined()
    expect(screen.getByText('Gemini')).toBeDefined()
  })

  it('should render percentage in legend', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('40%')).toBeDefined()
    expect(screen.getByText('30%')).toBeDefined()
  })

  it('should handle custom size', () => {
    const { container } = render(<DonutChart segments={segments} size={200} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
  })
})

describe('MiniBarChart', () => {
  const data = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 25 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 30 },
    { label: 'Fri', value: 20 },
  ]

  it('should render with aria-label', () => {
    const { container } = render(<MiniBarChart data={data} />)
    expect(container.querySelector('[aria-label="바 차트"]')).toBeDefined()
  })

  it('should render bars for each data point', () => {
    const { container } = render(<MiniBarChart data={data} />)
    const bars = container.querySelectorAll('.rounded-t')
    expect(bars.length).toBe(data.length)
  })

  it('should render x-axis labels', () => {
    render(<MiniBarChart data={data} />)
    expect(screen.getByText('Mon')).toBeDefined()
    expect(screen.getByText('Wed')).toBeDefined()
  })

  it('should apply custom color', () => {
    const { container } = render(<MiniBarChart data={data} color="#ff0000" />)
    const bar = container.querySelector('.rounded-t') as HTMLElement
    expect(bar.style.backgroundColor).toMatch(/rgb\(255,\s*0,\s*0\)|#ff0000/)
  })

  it('should apply custom height', () => {
    const { container } = render(<MiniBarChart data={data} height={300} />)
    const wrapper = container.querySelector('.flex.items-end') as HTMLElement
    expect(wrapper.style.height).toBe('300px')
  })
})

describe('RadarChart', () => {
  const axes = ['Speed', 'Quality', 'Cost', 'Support', 'Features']
  const datasets = [
    { label: 'GPT-4o', values: [80, 90, 60, 70, 85], color: '#3B82F6' },
    { label: 'Claude 3', values: [75, 95, 70, 80, 80], color: '#8B5CF6' },
  ]

  it('should render with aria-label', () => {
    const { container } = render(<RadarChart axes={axes} datasets={datasets} />)
    expect(container.querySelector('[aria-label="레이더 차트"]')).toBeDefined()
  })

  it('should render SVG', () => {
    const { container } = render(<RadarChart axes={axes} datasets={datasets} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('should render grid polygons', () => {
    const { container } = render(<RadarChart axes={axes} datasets={datasets} />)
    const polygons = container.querySelectorAll('polygon')
    // 4 grid levels + 2 datasets = 6
    expect(polygons.length).toBe(6)
  })

  it('should render axis labels', () => {
    render(<RadarChart axes={axes} datasets={datasets} />)
    expect(screen.getByText('Speed')).toBeDefined()
    expect(screen.getByText('Quality')).toBeDefined()
    expect(screen.getByText('Features')).toBeDefined()
  })

  it('should render legend', () => {
    render(<RadarChart axes={axes} datasets={datasets} />)
    expect(screen.getByText('GPT-4o')).toBeDefined()
    expect(screen.getByText('Claude 3')).toBeDefined()
  })

  it('should render axis lines', () => {
    const { container } = render(<RadarChart axes={axes} datasets={datasets} />)
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(axes.length)
  })
})

describe('KPICard extended', () => {
  it('should render with default trendUp', () => {
    render(<KPICard label="Cost" value="$500" trend="+10%" />)
    expect(screen.getByText(/▲/)).toBeDefined()
  })

  it('should handle large values', () => {
    render(<KPICard label="Tokens" value="1,234,567" trend="+50%" trendUp />)
    expect(screen.getByText('1,234,567')).toBeDefined()
  })
})

describe('MiniLineChart extended', () => {
  it('should handle single data point', () => {
    const data = [{ label: 'A', value: 10 }]
    const { container } = render(<MiniLineChart data={data} />)
    // Single point: polyline with one point, 1 circle
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(1)
  })

  it('should handle equal values', () => {
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 },
      { label: 'C', value: 50 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    expect(container.querySelector('polyline')).toBeDefined()
  })

  it('should apply custom color', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ]
    const { container } = render(<MiniLineChart data={data} color="#ff0000" />)
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#ff0000')
  })

  it('should apply custom height', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ]
    const { container } = render(<MiniLineChart data={data} height={300} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 300')
  })
})
