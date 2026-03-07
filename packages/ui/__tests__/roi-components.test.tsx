import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateFilter from '../src/roi/DateFilter'
import DepartmentFilter from '../src/roi/DepartmentFilter'
import HeatmapCell from '../src/roi/HeatmapCell'
import InsightCard from '../src/roi/InsightCard'
import SurveyBar from '../src/roi/SurveyBar'
import ChartPlaceholder from '../src/roi/ChartPlaceholder'
import ROISidebar from '../src/roi/ROISidebar'

describe('DateFilter', () => {
  it('should render as select element', () => {
    render(<DateFilter value="2026.02" onChange={() => {}} />)
    expect(screen.getByLabelText('기간 선택')).toBeDefined()
  })

  it('should render date options', () => {
    render(<DateFilter value="2026.02" onChange={() => {}} />)
    expect(screen.getByText('2026.02')).toBeDefined()
    expect(screen.getByText('2026.01')).toBeDefined()
  })

  it('should call onChange when option selected', () => {
    const onChange = vi.fn()
    render(<DateFilter value="2026.02" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('기간 선택'), { target: { value: '2026.01' } })
    expect(onChange).toHaveBeenCalledWith('2026.01')
  })
})

describe('DepartmentFilter', () => {
  it('should render as select element', () => {
    render(<DepartmentFilter value="전체 부서" onChange={() => {}} />)
    expect(screen.getByLabelText('부서 선택')).toBeDefined()
  })

  it('should render department options', () => {
    render(<DepartmentFilter value="전체 부서" onChange={() => {}} />)
    expect(screen.getByText('전체 부서')).toBeDefined()
    expect(screen.getByText('개발팀')).toBeDefined()
  })

  it('should call onChange on selection', () => {
    const onChange = vi.fn()
    render(<DepartmentFilter value="전체 부서" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('부서 선택'), { target: { value: '개발팀' } })
    expect(onChange).toHaveBeenCalledWith('개발팀')
  })
})

describe('HeatmapCell', () => {
  it('should render value', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <HeatmapCell value="85%" level="high" />
          </tr>
        </tbody>
      </table>,
    )
    expect(screen.getByText('85%')).toBeDefined()
  })

  it('should apply high level style', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <HeatmapCell value="90%" level="high" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector('td')
    expect(td?.className).toContain('roi-heatmap-high')
  })

  it('should apply low level style', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <HeatmapCell value="20%" level="low" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector('td')
    expect(td?.className).toContain('roi-heatmap-low')
  })
})

describe('InsightCard', () => {
  it('should render title and description', () => {
    render(
      <InsightCard
        title="주요 인사이트"
        description="AI 활용도가 전월 대비 15% 증가했습니다."
        type="positive"
      />,
    )
    expect(screen.getByText('주요 인사이트')).toBeDefined()
    expect(screen.getByText('AI 활용도가 전월 대비 15% 증가했습니다.')).toBeDefined()
  })

  it('should render positive type with icon', () => {
    render(<InsightCard title="Good" description="d" type="positive" />)
    expect(screen.getByText('💡')).toBeDefined()
  })

  it('should render warning type with icon', () => {
    render(<InsightCard title="Warn" description="d" type="warning" />)
    expect(screen.getByText('⚠️')).toBeDefined()
  })

  it('should render cost type with icon', () => {
    render(<InsightCard title="Cost" description="d" type="cost" />)
    expect(screen.getByText('💰')).toBeDefined()
  })
})

describe('SurveyBar', () => {
  it('should render label and percentage', () => {
    render(<SurveyBar label="매우 만족" value={45} color="var(--roi-chart-1)" />)
    expect(screen.getByText('매우 만족')).toBeDefined()
    expect(screen.getByText('45%')).toBeDefined()
  })
})

describe('ChartPlaceholder', () => {
  it('should render title', () => {
    render(<ChartPlaceholder title="월별 추이" />)
    expect(screen.getByText('월별 추이')).toBeDefined()
  })

  it('should render default description', () => {
    render(<ChartPlaceholder title="차트" />)
    expect(screen.getByText('차트 영역')).toBeDefined()
  })

  it('should render custom description', () => {
    render(<ChartPlaceholder title="차트" description="데이터 로딩 중..." />)
    expect(screen.getByText('데이터 로딩 중...')).toBeDefined()
  })
})

describe('ROISidebar', () => {
  it('should render navigation links', () => {
    render(<ROISidebar currentPath="/roi/overview" />)
    expect(screen.getByText('개요')).toBeDefined()
  })

  it('should render multiple menu items', () => {
    const { container } = render(<ROISidebar currentPath="/roi/overview" />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThan(3)
  })
})
