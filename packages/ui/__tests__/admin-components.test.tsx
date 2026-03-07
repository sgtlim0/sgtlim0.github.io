import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataTable from '../src/admin/DataTable'
import MonthPicker from '../src/admin/MonthPicker'
import StatCard from '../src/admin/StatCard'
import StatusBadge from '../src/admin/StatusBadge'
import type { UsageRow } from '../src/admin/DataTable'

describe('DataTable', () => {
  const sampleRows: UsageRow[] = [
    {
      date: '2026-03-01',
      user: '홍길동',
      type: '채팅',
      model: 'GPT-4o',
      tokens: '1,234',
      cost: '₩185',
      status: 'success',
    },
    {
      date: '2026-03-02',
      user: '김철수',
      type: '번역',
      model: 'Claude 3',
      tokens: '2,456',
      cost: '₩370',
      status: 'pending',
    },
    {
      date: '2026-03-03',
      user: '이영희',
      type: 'OCR',
      model: 'Gemini',
      tokens: '567',
      cost: '₩85',
      status: 'error',
    },
  ]

  it('should render empty state when no rows', () => {
    render(<DataTable rows={[]} />)
    expect(screen.getByText('데이터가 없습니다.')).toBeDefined()
  })

  it('should render table headers', () => {
    render(<DataTable rows={sampleRows} />)
    expect(screen.getByText('날짜')).toBeDefined()
    expect(screen.getByText('사용자')).toBeDefined()
    expect(screen.getByText('모델')).toBeDefined()
  })

  it('should render all rows', () => {
    render(<DataTable rows={sampleRows} />)
    expect(screen.getByText('홍길동')).toBeDefined()
    expect(screen.getByText('김철수')).toBeDefined()
    expect(screen.getByText('이영희')).toBeDefined()
  })

  it('should render status badges', () => {
    render(<DataTable rows={sampleRows} />)
    expect(screen.getByText('완료')).toBeDefined()
    expect(screen.getByText('진행중')).toBeDefined()
    expect(screen.getByText('실패')).toBeDefined()
  })

  it('should call onViewDetail when detail button clicked', () => {
    const onViewDetail = vi.fn()
    render(<DataTable rows={sampleRows} onViewDetail={onViewDetail} />)

    const buttons = screen.getAllByText('상세')
    fireEvent.click(buttons[1])
    expect(onViewDetail).toHaveBeenCalledWith(1)
  })

  it('should have accessible aria labels on detail buttons', () => {
    render(<DataTable rows={sampleRows} />)
    expect(screen.getByLabelText('홍길동 2026-03-01 상세 보기')).toBeDefined()
  })

  it('should render token and cost values', () => {
    render(<DataTable rows={sampleRows} />)
    expect(screen.getByText('1,234')).toBeDefined()
    expect(screen.getByText('₩185')).toBeDefined()
  })
})

describe('MonthPicker', () => {
  it('should display current year and month', () => {
    render(<MonthPicker year={2026} month={3} />)
    expect(screen.getByText('2026년 3월')).toBeDefined()
  })

  it('should call onChange with previous month', () => {
    const onChange = vi.fn()
    render(<MonthPicker year={2026} month={3} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('이전 달'))
    expect(onChange).toHaveBeenCalledWith(2026, 2)
  })

  it('should call onChange with next month', () => {
    const onChange = vi.fn()
    render(<MonthPicker year={2026} month={3} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('다음 달'))
    expect(onChange).toHaveBeenCalledWith(2026, 4)
  })

  it('should wrap January to previous year December', () => {
    const onChange = vi.fn()
    render(<MonthPicker year={2026} month={1} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('이전 달'))
    expect(onChange).toHaveBeenCalledWith(2025, 12)
  })

  it('should wrap December to next year January', () => {
    const onChange = vi.fn()
    render(<MonthPicker year={2026} month={12} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('다음 달'))
    expect(onChange).toHaveBeenCalledWith(2027, 1)
  })
})

describe('StatCard extended', () => {
  it('should render with trend down', () => {
    render(<StatCard label="Errors" value="5" trend="-10%" trendUp={false} />)
    expect(screen.getByText('↓', { exact: false })).toBeDefined()
  })

  it('should render with trend up', () => {
    render(<StatCard label="Users" value="100" trend="+20%" trendUp />)
    expect(screen.getByText('↑', { exact: false })).toBeDefined()
  })
})

describe('StatusBadge extended', () => {
  it('should render all three status types', () => {
    const { rerender } = render(<StatusBadge status="success" />)
    expect(screen.getByText('완료')).toBeDefined()

    rerender(<StatusBadge status="error" />)
    expect(screen.getByText('실패')).toBeDefined()

    rerender(<StatusBadge status="pending" />)
    expect(screen.getByText('진행중')).toBeDefined()
  })

  it('should override default labels', () => {
    render(<StatusBadge status="success" label="Active" />)
    expect(screen.getByText('Active')).toBeDefined()
    expect(screen.queryByText('완료')).toBeNull()
  })
})
