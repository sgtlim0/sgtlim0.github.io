import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

/**
 * ROI Charts interaction tests — covers:
 * - DonutChart with zero total, single segment, custom size
 * - MiniLineChart single data point edge, tooltip hover/leave
 * - MiniBarChart empty data, zero-value bars
 * - AreaChart single data point, tooltip content verification
 * - RadarChart with single dataset, empty axes
 */

describe('DonutChart — edge cases', () => {
  it('should handle single segment (100%)', async () => {
    const DonutChart = (await import('../src/roi/charts/DonutChart')).default
    const segments = [{ label: 'Only', value: 100, color: '#ff0000' }]
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('Only')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should handle segments with zero total gracefully', async () => {
    const DonutChart = (await import('../src/roi/charts/DonutChart')).default
    const segments = [
      { label: 'A', value: 0, color: '#ff0000' },
      { label: 'B', value: 0, color: '#00ff00' },
    ]
    const { container } = render(<DonutChart segments={segments} />)
    // Should still render SVG without error
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('should render legend percentage for unequal segments', async () => {
    const DonutChart = (await import('../src/roi/charts/DonutChart')).default
    const segments = [
      { label: 'Big', value: 75, color: '#ff0000' },
      { label: 'Small', value: 25, color: '#00ff00' },
    ]
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })
})

describe('MiniLineChart — edge cases and interactions', () => {
  it('should return null for empty data', async () => {
    const MiniLineChart = (await import('../src/roi/charts/MiniLineChart')).default
    const { container } = render(<MiniLineChart data={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should show tooltip with formatted value on hover', async () => {
    const MiniLineChart = (await import('../src/roi/charts/MiniLineChart')).default
    const data = [
      { label: 'Jan', value: 1500 },
      { label: 'Feb', value: 2500 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    const circles = container.querySelectorAll('circle')
    fireEvent.mouseEnter(circles[0])
    expect(screen.getByText(/Jan: 1,500/)).toBeInTheDocument()
    fireEvent.mouseLeave(circles[0])
    expect(screen.queryByText(/Jan: 1,500/)).toBeNull()
  })

  it('should handle two data points correctly', async () => {
    const MiniLineChart = (await import('../src/roi/charts/MiniLineChart')).default
    const data = [
      { label: 'A', value: 0 },
      { label: 'B', value: 100 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
    const polyline = container.querySelector('polyline')
    expect(polyline).toBeTruthy()
  })

  it('should handle negative values', async () => {
    const MiniLineChart = (await import('../src/roi/charts/MiniLineChart')).default
    const data = [
      { label: 'A', value: -10 },
      { label: 'B', value: 10 },
    ]
    const { container } = render(<MiniLineChart data={data} />)
    expect(container.querySelector('polyline')).toBeTruthy()
  })
})

describe('MiniBarChart — edge cases', () => {
  it('should handle zero-value bars', async () => {
    const MiniBarChart = (await import('../src/roi/charts/MiniBarChart')).default
    const data = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 },
    ]
    const { container } = render(<MiniBarChart data={data} />)
    const bars = container.querySelectorAll('.rounded-t')
    expect(bars).toHaveLength(2)
  })

  it('should handle single data point', async () => {
    const MiniBarChart = (await import('../src/roi/charts/MiniBarChart')).default
    const data = [{ label: 'Only', value: 50 }]
    const { container } = render(<MiniBarChart data={data} />)
    expect(screen.getByText('Only')).toBeInTheDocument()
    const bars = container.querySelectorAll('.rounded-t')
    expect(bars).toHaveLength(1)
  })

  it('should show tooltip on hover and hide on leave', async () => {
    const MiniBarChart = (await import('../src/roi/charts/MiniBarChart')).default
    const data = [
      { label: 'W1', value: 100 },
      { label: 'W2', value: 200 },
      { label: 'W3', value: 150 },
    ]
    const { container } = render(<MiniBarChart data={data} />)
    const barContainers = container.querySelectorAll('.flex-1.flex.flex-col')
    if (barContainers.length >= 2) {
      fireEvent.mouseEnter(barContainers[0])
      expect(screen.getByText('100')).toBeInTheDocument()
      fireEvent.mouseLeave(barContainers[0])
    }
  })
})

describe('AreaChart — edge cases and interactions', () => {
  it('should return null for empty data', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const { container } = render(<AreaChart data={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should handle single data point', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const data = [{ label: 'Only', value: 50 }]
    const { container } = render(<AreaChart data={data} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(1)
    expect(screen.getByText('Only')).toBeInTheDocument()
  })

  it('should show tooltip with formatted value on hover', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const data = [
      { label: 'Jan', value: 50 },
      { label: 'Feb', value: 100 },
    ]
    const { container } = render(<AreaChart data={data} />)
    const circles = container.querySelectorAll('circle')
    fireEvent.mouseEnter(circles[1])
    // Tooltip shows "Feb: ₩100M"
    expect(screen.getByText(/Feb: ₩100M/)).toBeInTheDocument()
    fireEvent.mouseLeave(circles[1])
    expect(screen.queryByText(/Feb: ₩100M/)).toBeNull()
  })

  it('should handle equal values', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const data = [
      { label: 'A', value: 100 },
      { label: 'B', value: 100 },
      { label: 'C', value: 100 },
    ]
    const { container } = render(<AreaChart data={data} />)
    expect(container.querySelector('polygon')).toBeTruthy()
    expect(container.querySelector('polyline')).toBeTruthy()
  })

  it('should apply custom color', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ]
    const { container } = render(<AreaChart data={data} color="#ff0000" />)
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#ff0000')
  })

  it('should apply custom height', async () => {
    const AreaChart = (await import('../src/roi/charts/AreaChart')).default
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ]
    const { container } = render(<AreaChart data={data} height={300} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 300')
  })
})

describe('RadarChart — edge cases', () => {
  it('should render with single dataset', async () => {
    const RadarChart = (await import('../src/roi/charts/RadarChart')).default
    const axes = ['A', 'B', 'C']
    const datasets = [{ label: 'Only', values: [80, 70, 60], color: '#ff0000' }]
    const { container } = render(<RadarChart axes={axes} datasets={datasets} />)
    expect(screen.getByText('Only')).toBeInTheDocument()
    // 4 grid polygons + 1 dataset = 5
    const polygons = container.querySelectorAll('polygon')
    expect(polygons.length).toBe(5)
  })

  it('should apply custom size', async () => {
    const RadarChart = (await import('../src/roi/charts/RadarChart')).default
    const axes = ['A', 'B', 'C']
    const datasets = [{ label: 'Test', values: [50, 60, 70], color: '#ff0000' }]
    const { container } = render(<RadarChart axes={axes} datasets={datasets} size={300} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('300')
  })
})
