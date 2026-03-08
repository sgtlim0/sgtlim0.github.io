import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ROIDataProvider, useROIData } from '../src/roi/ROIDataContext'
import { aggregateAll } from '../src/roi/aggregateData'

/**
 * Extended ROIDataContext tests — covers:
 * - Multiple setRecords calls (replace behavior)
 * - Large dataset handling
 * - setRecords then clearRecords then setRecords cycle
 * - aggregated data structure validation
 * - Context value stability (memoization)
 */

function TestConsumer({ onContext }: { onContext: (ctx: ReturnType<typeof useROIData>) => void }) {
  const ctx = useROIData()
  onContext(ctx)
  return (
    <div>
      <span data-testid="count">{ctx.records.length}</span>
      <span data-testid="hasData">{String(ctx.hasData)}</span>
      <span data-testid="aggregated">{ctx.aggregated ? 'yes' : 'no'}</span>
      <span data-testid="totalRecords">
        {ctx.aggregated ? String((ctx.aggregated as ReturnType<typeof aggregateAll>).overviewKPIs.length) : '0'}
      </span>
    </div>
  )
}

const makeRecord = (overrides: Record<string, unknown> = {}) => ({
  '날짜': '2026-01-15',
  '사용자ID': 'user1',
  '모델': 'GPT-4',
  '기능': 'AI 채팅',
  '토큰수': 5000,
  '절감시간_분': 30,
  '만족도': 4,
  '부서': '개발팀',
  '직급': '사원',
  ...overrides,
})

describe('ROIDataContext — extended', () => {
  it('should replace records when setRecords is called multiple times', () => {
    let ctx: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(c) => { ctx = c }} />
      </ROIDataProvider>
    )

    act(() => { ctx!.setRecords([makeRecord()]) })
    expect(screen.getByTestId('count').textContent).toBe('1')

    act(() => { ctx!.setRecords([makeRecord(), makeRecord({ '사용자ID': 'user2' }), makeRecord({ '사용자ID': 'user3' })]) })
    expect(screen.getByTestId('count').textContent).toBe('3')
    expect(screen.getByTestId('hasData').textContent).toBe('true')
  })

  it('should handle set -> clear -> set cycle correctly', () => {
    let ctx: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(c) => { ctx = c }} />
      </ROIDataProvider>
    )

    act(() => { ctx!.setRecords([makeRecord()]) })
    expect(screen.getByTestId('hasData').textContent).toBe('true')
    expect(screen.getByTestId('aggregated').textContent).toBe('yes')

    act(() => { ctx!.clearRecords() })
    expect(screen.getByTestId('hasData').textContent).toBe('false')
    expect(screen.getByTestId('aggregated').textContent).toBe('no')

    act(() => { ctx!.setRecords([makeRecord({ '사용자ID': 'new-user' })]) })
    expect(screen.getByTestId('hasData').textContent).toBe('true')
    expect(screen.getByTestId('aggregated').textContent).toBe('yes')
  })

  it('should produce aggregated data with correct structure when records exist', () => {
    let ctx: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(c) => { ctx = c }} />
      </ROIDataProvider>
    )

    const records = [
      makeRecord({ '날짜': '2026-01-10', '토큰수': 2000, '절감시간_분': 20 }),
      makeRecord({ '날짜': '2026-02-15', '사용자ID': 'user2', '모델': 'Claude', '토큰수': 3000, '절감시간_분': 40 }),
    ]
    act(() => { ctx!.setRecords(records) })

    const agg = ctx!.aggregated!
    expect(agg).toBeTruthy()
    expect(agg.overviewKPIs).toHaveLength(4)
    expect(agg.adoptionKPIs).toHaveLength(4)
    expect(agg.productivityKPIs).toHaveLength(4)
    expect(agg.sentimentKPIs).toHaveLength(4)
    expect(agg.monthlyTimeSavings.length).toBeGreaterThanOrEqual(1)
    expect(agg.modelCostEfficiency.length).toBe(2)
    expect(agg.costBreakdown.length).toBe(2)
  })

  it('should handle large dataset without error', () => {
    let ctx: ReturnType<typeof useROIData> | null = null
    render(
      <ROIDataProvider>
        <TestConsumer onContext={(c) => { ctx = c }} />
      </ROIDataProvider>
    )

    const records = Array.from({ length: 500 }, (_, i) =>
      makeRecord({ '사용자ID': `user${i % 50}`, '날짜': `2026-01-${String((i % 28) + 1).padStart(2, '0')}` })
    )
    act(() => { ctx!.setRecords(records) })
    expect(screen.getByTestId('count').textContent).toBe('500')
    expect(ctx!.aggregated).toBeTruthy()
  })

  it('should provide stable function references across renders', () => {
    const setRecordsFns: Array<ReturnType<typeof useROIData>['setRecords']> = []
    const clearRecordsFns: Array<ReturnType<typeof useROIData>['clearRecords']> = []

    function Collector() {
      const ctx = useROIData()
      setRecordsFns.push(ctx.setRecords)
      clearRecordsFns.push(ctx.clearRecords)
      return <span data-testid="c">{ctx.records.length}</span>
    }

    const { rerender } = render(
      <ROIDataProvider>
        <Collector />
      </ROIDataProvider>
    )

    rerender(
      <ROIDataProvider>
        <Collector />
      </ROIDataProvider>
    )

    // useCallback should produce stable references
    expect(setRecordsFns[0]).toBe(setRecordsFns[1])
    expect(clearRecordsFns[0]).toBe(clearRecordsFns[1])
  })
})
