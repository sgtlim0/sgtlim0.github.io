import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ROIDataProvider, useROIData } from '../src/roi/ROIDataContext'

// No mock for ROIDataContext - test the real implementation

// Mock aggregateAll since it's tested separately
vi.mock('../src/roi/aggregateData', () => ({
  aggregateAll: vi.fn((records: unknown[]) => ({
    overviewKPIs: [],
    adoptionKPIs: [],
    productivityKPIs: [],
    sentimentKPIs: [],
    monthlyTimeSavings: [],
    modelCostEfficiency: [],
    weeklyActiveUsers: [],
    weeklyAIHours: [],
    featureSavingsRatio: [],
    monthlyROI: [],
    cumulativeSavings: [],
    modelUsageRatio: [],
    npsHistory: [],
    departmentRanking: [],
    userSegments: [],
    featureAdoption: [],
    gradeUsage: [],
    deptSatisfaction: [],
    taskTimeSavings: [],
    costBreakdown: [],
    heatmapData: [],
    totalRecords: (records as unknown[]).length,
  })),
}))

function TestConsumer({ onContext }: { onContext: (ctx: ReturnType<typeof useROIData>) => void }) {
  const ctx = useROIData()
  onContext(ctx)
  return (
    <div>
      <span data-testid="count">{ctx.records.length}</span>
      <span data-testid="hasData">{String(ctx.hasData)}</span>
      <span data-testid="aggregated">{ctx.aggregated ? 'yes' : 'no'}</span>
    </div>
  )
}

describe('ROIDataContext', () => {
  it('should render children through the provider', () => {
    render(
      <ROIDataProvider>
        <div data-testid="child">Hello</div>
      </ROIDataProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should provide default empty records and hasData=false', () => {
    let contextValue: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(ctx) => { contextValue = ctx }} />
      </ROIDataProvider>
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('hasData').textContent).toBe('false')
    expect(screen.getByTestId('aggregated').textContent).toBe('no')
    expect(contextValue).toBeTruthy()
  })

  it('should update records via setRecords', () => {
    let contextValue: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(ctx) => { contextValue = ctx }} />
      </ROIDataProvider>
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
    // Set records
    act(() => {
      contextValue!.setRecords([{ a: 1 }, { b: 2 }])
    })
    expect(screen.getByTestId('count').textContent).toBe('2')
    expect(screen.getByTestId('hasData').textContent).toBe('true')
    expect(screen.getByTestId('aggregated').textContent).toBe('yes')
  })

  it('should clear records via clearRecords', () => {
    let contextValue: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(ctx) => { contextValue = ctx }} />
      </ROIDataProvider>
    )
    // Set then clear
    act(() => {
      contextValue!.setRecords([{ a: 1 }])
    })
    expect(screen.getByTestId('hasData').textContent).toBe('true')
    act(() => {
      contextValue!.clearRecords()
    })
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('hasData').textContent).toBe('false')
    expect(screen.getByTestId('aggregated').textContent).toBe('no')
  })

  it('should return null aggregated when records are empty', () => {
    render(
      <ROIDataProvider>
        <TestConsumer onContext={() => {}} />
      </ROIDataProvider>
    )
    expect(screen.getByTestId('aggregated').textContent).toBe('no')
  })

  it('should call aggregateAll when records are set', async () => {
    const { aggregateAll } = await import('../src/roi/aggregateData')
    let contextValue: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(ctx) => { contextValue = ctx }} />
      </ROIDataProvider>
    )
    act(() => {
      contextValue!.setRecords([{ x: 1 }, { x: 2 }, { x: 3 }])
    })
    expect(aggregateAll).toHaveBeenCalledWith([{ x: 1 }, { x: 2 }, { x: 3 }])
  })

  it('useROIData returns default values when used outside provider', () => {
    // When used outside provider, the default context should return empty values
    function StandaloneConsumer() {
      const { records, hasData, aggregated } = useROIData()
      return (
        <div>
          <span data-testid="standalone-count">{records.length}</span>
          <span data-testid="standalone-hasData">{String(hasData)}</span>
          <span data-testid="standalone-aggregated">{aggregated ? 'yes' : 'no'}</span>
        </div>
      )
    }
    render(<StandaloneConsumer />)
    expect(screen.getByTestId('standalone-count').textContent).toBe('0')
    expect(screen.getByTestId('standalone-hasData').textContent).toBe('false')
    expect(screen.getByTestId('standalone-aggregated').textContent).toBe('no')
  })
})
