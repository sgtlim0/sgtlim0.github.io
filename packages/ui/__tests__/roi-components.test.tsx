import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateFilter from '../src/roi/DateFilter'
import DepartmentFilter from '../src/roi/DepartmentFilter'
import HeatmapCell from '../src/roi/HeatmapCell'
import InsightCard from '../src/roi/InsightCard'
import SurveyBar from '../src/roi/SurveyBar'
import ChartPlaceholder from '../src/roi/ChartPlaceholder'
import ROISidebar from '../src/roi/ROISidebar'
import KPICard from '../src/roi/KPICard'
import DonutChart from '../src/roi/charts/DonutChart'
import MiniBarChart from '../src/roi/charts/MiniBarChart'
import MiniLineChart from '../src/roi/charts/MiniLineChart'
import { aggregateAll } from '../src/roi/aggregateData'

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

// ---------------------------------------------------------------------------
// KPICard
// ---------------------------------------------------------------------------
describe('KPICard', () => {
  it('renders label, value, and trend text', () => {
    render(<KPICard label="총 절감 시간" value="1,200h" trend="+15%" />)
    expect(screen.getByText('총 절감 시간')).toBeDefined()
    expect(screen.getByText('1,200h')).toBeDefined()
    expect(screen.getByText(/\+15%/)).toBeDefined()
  })

  it('shows upward indicator by default (trendUp=true)', () => {
    const { container } = render(
      <KPICard label="ROI" value="320%" trend="+8%" />,
    )
    const trendEl = container.querySelector('span.inline-flex')
    expect(trendEl?.textContent).toContain('▲')
  })

  it('shows downward indicator when trendUp is false', () => {
    const { container } = render(
      <KPICard label="비용" value="₩120M" trend="-5%" trendUp={false} />,
    )
    const trendEl = container.querySelector('span.inline-flex')
    expect(trendEl?.textContent).toContain('▼')
  })

  it('applies positive color class when trendUp', () => {
    const { container } = render(
      <KPICard label="L" value="V" trend="T" trendUp />,
    )
    const trendEl = container.querySelector('span.inline-flex')
    expect(trendEl?.className).toContain('roi-positive')
  })

  it('applies negative color class when trendUp is false', () => {
    const { container } = render(
      <KPICard label="L" value="V" trend="T" trendUp={false} />,
    )
    const trendEl = container.querySelector('span.inline-flex')
    expect(trendEl?.className).toContain('roi-negative')
  })
})

// ---------------------------------------------------------------------------
// DonutChart
// ---------------------------------------------------------------------------
describe('DonutChart', () => {
  const segments = [
    { label: 'GPT-4', value: 60, color: 'blue' },
    { label: 'Claude', value: 30, color: 'purple' },
    { label: 'Gemini', value: 10, color: 'green' },
  ]

  it('renders with aria-label', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByRole('img', { name: '도넛 차트' })).toBeDefined()
  })

  it('renders legend labels', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('GPT-4')).toBeDefined()
    expect(screen.getByText('Claude')).toBeDefined()
    expect(screen.getByText('Gemini')).toBeDefined()
  })

  it('shows total in center', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('100')).toBeDefined()
  })

  it('calculates percentages in legend', () => {
    render(<DonutChart segments={segments} />)
    expect(screen.getByText('60%')).toBeDefined()
    expect(screen.getByText('30%')).toBeDefined()
    expect(screen.getByText('10%')).toBeDefined()
  })

  it('renders SVG circles for each segment', () => {
    const { container } = render(<DonutChart segments={segments} />)
    const circles = container.querySelectorAll('circle')
    // 1 background circle + 3 segment circles
    expect(circles.length).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// MiniBarChart
// ---------------------------------------------------------------------------
describe('MiniBarChart', () => {
  const data = [
    { label: 'W1', value: 100 },
    { label: 'W2', value: 200 },
    { label: 'W3', value: 150 },
  ]

  it('renders with aria-label', () => {
    render(<MiniBarChart data={data} />)
    expect(screen.getByRole('img', { name: '바 차트' })).toBeDefined()
  })

  it('renders x-axis labels', () => {
    render(<MiniBarChart data={data} />)
    expect(screen.getByText('W1')).toBeDefined()
    expect(screen.getByText('W3')).toBeDefined()
  })

  it('renders bars for each data point', () => {
    const { container } = render(<MiniBarChart data={data} />)
    const bars = container.querySelectorAll('.rounded-t')
    expect(bars.length).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// MiniLineChart
// ---------------------------------------------------------------------------
describe('MiniLineChart', () => {
  const data = [
    { label: '1월', value: 50 },
    { label: '2월', value: 80 },
    { label: '3월', value: 120 },
  ]

  it('renders with aria-label', () => {
    render(<MiniLineChart data={data} />)
    expect(screen.getByRole('img', { name: '라인 차트' })).toBeDefined()
  })

  it('renders x-axis labels', () => {
    render(<MiniLineChart data={data} />)
    expect(screen.getByText('1월')).toBeDefined()
    expect(screen.getByText('3월')).toBeDefined()
  })

  it('returns null for empty data', () => {
    const { container } = render(<MiniLineChart data={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders SVG dots for each data point', () => {
    const { container } = render(<MiniLineChart data={data} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(3)
  })

  it('renders polyline for the line', () => {
    const { container } = render(<MiniLineChart data={data} />)
    const polyline = container.querySelector('polyline')
    expect(polyline).toBeDefined()
    expect(polyline?.getAttribute('points')).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// aggregateAll (pure function — high coverage impact)
// ---------------------------------------------------------------------------
describe('aggregateAll', () => {
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

  it('returns all expected keys', () => {
    const result = aggregateAll([makeRecord()])
    const expectedKeys = [
      'overviewKPIs', 'adoptionKPIs', 'productivityKPIs', 'sentimentKPIs',
      'monthlyTimeSavings', 'modelCostEfficiency', 'weeklyActiveUsers',
      'weeklyAIHours', 'featureSavingsRatio', 'monthlyROI',
      'cumulativeSavings', 'modelUsageRatio', 'npsHistory',
      'departmentRanking', 'userSegments', 'featureAdoption',
      'gradeUsage', 'deptSatisfaction', 'taskTimeSavings',
      'costBreakdown', 'heatmapData',
    ]
    for (const key of expectedKeys) {
      expect(result).toHaveProperty(key)
    }
  })

  it('calculates correct number of KPIs per section', () => {
    const result = aggregateAll([makeRecord()])
    expect(result.overviewKPIs).toHaveLength(4)
    expect(result.adoptionKPIs).toHaveLength(4)
    expect(result.productivityKPIs).toHaveLength(4)
    expect(result.sentimentKPIs).toHaveLength(4)
  })

  it('computes total saved hours', () => {
    const records = [
      makeRecord({ '절감시간_분': 60 }),
      makeRecord({ '절감시간_분': 120 }),
    ]
    const result = aggregateAll(records)
    const timeSavings = result.overviewKPIs.find((k) => k.label === '총 절감 시간')
    expect(timeSavings?.value).toBe('3h')
  })

  it('groups data by model', () => {
    const records = [
      makeRecord({ '모델': 'GPT-4' }),
      makeRecord({ '모델': 'GPT-4' }),
      makeRecord({ '모델': 'Claude' }),
    ]
    const result = aggregateAll(records)
    expect(result.modelCostEfficiency.length).toBe(2)
  })

  it('groups data by department', () => {
    const records = [
      makeRecord({ '부서': '개발팀' }),
      makeRecord({ '부서': '마케팅팀' }),
    ]
    const result = aggregateAll(records)
    expect(result.departmentRanking.length).toBe(2)
  })

  it('computes feature adoption percentages', () => {
    const records = [
      makeRecord({ '기능': 'AI 채팅', '사용자ID': 'u1' }),
      makeRecord({ '기능': 'AI 채팅', '사용자ID': 'u2' }),
      makeRecord({ '기능': '번역', '사용자ID': 'u1' }),
    ]
    const result = aggregateAll(records)
    expect(result.featureAdoption.length).toBe(2)
    const chatAdoption = result.featureAdoption.find((f) => f.label === 'AI 채팅')
    expect(chatAdoption?.value).toBe(100)
  })

  it('calculates monthly time savings across months', () => {
    const records = [
      makeRecord({ '날짜': '2026-01-10', '절감시간_분': 60 }),
      makeRecord({ '날짜': '2026-01-20', '절감시간_분': 120 }),
      makeRecord({ '날짜': '2026-02-15', '절감시간_분': 60 }),
    ]
    const result = aggregateAll(records)
    expect(result.monthlyTimeSavings.length).toBe(2)
  })

  it('computes cost breakdown by model', () => {
    const records = [
      makeRecord({ '모델': 'GPT-4', '토큰수': 10000 }),
      makeRecord({ '모델': 'Claude', '토큰수': 5000 }),
    ]
    const result = aggregateAll(records)
    expect(result.costBreakdown.length).toBe(2)
    for (const row of result.costBreakdown) {
      expect(row).toHaveProperty('model')
      expect(row).toHaveProperty('tokens')
      expect(row).toHaveProperty('cost')
      expect(row).toHaveProperty('savings')
      expect(row).toHaveProperty('roi')
    }
  })

  it('computes heatmap data with levels', () => {
    const records = [
      makeRecord({ '부서': '개발팀' }),
      makeRecord({ '부서': '마케팅팀' }),
    ]
    const result = aggregateAll(records)
    expect(result.heatmapData.length).toBe(2)
    for (const row of result.heatmapData) {
      expect(row.levels).toHaveLength(4)
      for (const level of row.levels) {
        expect(['high', 'mid', 'low']).toContain(level)
      }
    }
  })

  it('handles empty records gracefully', () => {
    const result = aggregateAll([])
    expect(result.overviewKPIs).toHaveLength(4)
    expect(result.monthlyTimeSavings).toHaveLength(0)
    expect(result.costBreakdown).toHaveLength(0)
  })

  it('computes user segments', () => {
    const records = Array.from({ length: 25 }, (_, i) =>
      makeRecord({ '사용자ID': `user${i % 3}`, '날짜': `2026-01-${String(i + 1).padStart(2, '0')}` }),
    )
    const result = aggregateAll(records)
    expect(result.userSegments).toHaveLength(4)
    const totalPct = result.userSegments.reduce((s, seg) => s + seg.value, 0)
    expect(totalPct).toBeLessThanOrEqual(104) // rounding tolerance
  })

  it('computes NPS history from satisfaction scores', () => {
    const records = [
      makeRecord({ '날짜': '2026-01-10', '만족도': 5 }),
      makeRecord({ '날짜': '2026-02-10', '만족도': 3 }),
    ]
    const result = aggregateAll(records)
    expect(result.npsHistory.length).toBe(2)
    expect(result.npsHistory[0].score).toBe(50)
    expect(result.npsHistory[1].score).toBe(0)
  })

  it('computes cumulative savings', () => {
    const records = [
      makeRecord({ '날짜': '2026-01-10', '절감시간_분': 60, '토큰수': 1000 }),
      makeRecord({ '날짜': '2026-02-10', '절감시간_분': 120, '토큰수': 2000 }),
    ]
    const result = aggregateAll(records)
    expect(result.cumulativeSavings.length).toBe(2)
    expect(result.cumulativeSavings[1].amount).toBeGreaterThanOrEqual(result.cumulativeSavings[0].amount)
  })

  it('computes grade usage', () => {
    const records = [
      makeRecord({ '직급': '사원', '사용자ID': 'u1' }),
      makeRecord({ '직급': '대리', '사용자ID': 'u2' }),
      makeRecord({ '직급': '사원', '사용자ID': 'u3' }),
    ]
    const result = aggregateAll(records)
    expect(result.gradeUsage.length).toBe(2)
    for (const g of result.gradeUsage) {
      expect(g.maxValue).toBe(100)
    }
  })

  it('computes task time savings with known feature estimates', () => {
    const records = [
      makeRecord({ '기능': 'AI 채팅', '절감시간_분': 10 }),
      makeRecord({ '기능': '문서 요약', '절감시간_분': 20 }),
    ]
    const result = aggregateAll(records)
    expect(result.taskTimeSavings.length).toBe(2)
    for (const t of result.taskTimeSavings) {
      expect(t.savedPercent).toBeGreaterThanOrEqual(0)
      expect(t.savedPercent).toBeLessThanOrEqual(100)
    }
  })

  it('computes weekly active users', () => {
    const records = [
      makeRecord({ '날짜': '2026-01-06', '사용자ID': 'u1' }),
      makeRecord({ '날짜': '2026-01-06', '사용자ID': 'u2' }),
      makeRecord({ '날짜': '2026-01-13', '사용자ID': 'u1' }),
    ]
    const result = aggregateAll(records)
    expect(result.weeklyActiveUsers.length).toBeGreaterThanOrEqual(1)
    expect(result.weeklyAIHours.length).toBeGreaterThanOrEqual(1)
  })

  it('computes feature savings ratio', () => {
    const records = [
      makeRecord({ '기능': 'AI 채팅', '절감시간_분': 100 }),
      makeRecord({ '기능': '번역', '절감시간_분': 50 }),
    ]
    const result = aggregateAll(records)
    expect(result.featureSavingsRatio.length).toBe(2)
    const totalPct = result.featureSavingsRatio.reduce((s, f) => s + f.percent, 0)
    expect(totalPct).toBeLessThanOrEqual(101) // rounding
  })

  it('computes monthly ROI', () => {
    const records = [
      makeRecord({ '날짜': '2026-01-10', '토큰수': 5000, '절감시간_분': 60 }),
      makeRecord({ '날짜': '2026-02-10', '토큰수': 5000, '절감시간_분': 120 }),
    ]
    const result = aggregateAll(records)
    expect(result.monthlyROI.length).toBe(2)
    for (const m of result.monthlyROI) {
      expect(typeof m.roi).toBe('number')
    }
  })
})
