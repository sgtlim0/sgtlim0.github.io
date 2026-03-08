import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * ROI Pages with hasData=true — covers the aggregated data branches
 * that are currently at 50% branch coverage across:
 * ROIOverview, ROIAdoption, ROIProductivity, ROIAnalysis,
 * ROIOrganization, ROISentiment
 */

const mockAggregated = {
  overviewKPIs: [
    { label: '총 절감 시간', value: '100h', trend: '+10%', trendUp: true },
    { label: '총 비용 절감', value: '₩50M', trend: '+20%', trendUp: true },
    { label: 'ROI', value: '250%', trend: '+25%', trendUp: true },
    { label: '활성 사용률', value: '85%', trend: '+5%p', trendUp: true },
  ],
  adoptionKPIs: [
    { label: '전체 사용자', value: '100명', trend: '', trendUp: true },
    { label: '활성 사용자', value: '85명', trend: '+10', trendUp: true },
    { label: '비활성 사용자', value: '15명', trend: '-3', trendUp: false },
    { label: '지속 사용률', value: '85%', trend: '+3%p', trendUp: true },
  ],
  productivityKPIs: [
    { label: 'AI 지원 총 시간', value: '100h', trend: '+20h', trendUp: true },
    { label: '평균 절감시간', value: '15분', trend: '', trendUp: true },
    { label: '작업당 절감시간', value: '15분', trend: '', trendUp: true },
    { label: '자동화율', value: '60%', trend: '', trendUp: true },
  ],
  sentimentKPIs: [
    { label: 'NPS 점수', value: '+30', trend: '', trendUp: true },
    { label: '업무품질 향상', value: '80%', trend: '', trendUp: true },
    { label: '속도향상 체감', value: '75%', trend: '', trendUp: true },
    { label: '부담경감 체감', value: '78%', trend: '', trendUp: true },
  ],
  monthlyTimeSavings: [
    { month: '1월', hours: 40 },
    { month: '2월', hours: 60 },
  ],
  modelCostEfficiency: [
    { name: 'Claude', value: 60, color: 'var(--roi-chart-1)' },
    { name: 'GPT-4', value: 40, color: 'var(--roi-chart-2)' },
  ],
  weeklyActiveUsers: [
    { week: 'W1', count: 50 },
    { week: 'W2', count: 60 },
  ],
  weeklyAIHours: [
    { week: 'W1', hours: 30 },
    { week: 'W2', hours: 40 },
  ],
  featureSavingsRatio: [
    { name: '코드 리뷰', percent: 50, color: 'var(--roi-chart-1)' },
    { name: '번역', percent: 50, color: 'var(--roi-chart-2)' },
  ],
  monthlyROI: [
    { month: '1월', roi: 200 },
    { month: '2월', roi: 250 },
  ],
  cumulativeSavings: [
    { month: '1월', amount: 20 },
    { month: '2월', amount: 50 },
  ],
  modelUsageRatio: [
    { name: 'Claude', percent: 55, color: 'var(--roi-chart-1)' },
    { name: 'GPT-4', percent: 45, color: 'var(--roi-chart-2)' },
  ],
  npsHistory: [
    { month: '1월', score: 25 },
    { month: '2월', score: 30 },
  ],
  departmentRanking: [
    { department: '개발팀', roi: 300, maxRoi: 300 },
    { department: '마케팅팀', roi: 200, maxRoi: 300 },
  ],
  userSegments: [
    { label: '헤비 유저 (주 20회+)', value: 40, maxValue: 100 },
    { label: '보통 유저 (주 5-19회)', value: 30, maxValue: 100 },
    { label: '가벼운 유저 (주 1-4회)', value: 20, maxValue: 100 },
    { label: '비활성 (0회)', value: 10, maxValue: 100 },
  ],
  featureAdoption: [
    { label: 'AI 채팅', value: 90 },
    { label: '번역', value: 70 },
  ],
  gradeUsage: [
    { label: '사원', value: 90, maxValue: 100 },
    { label: '대리', value: 80, maxValue: 100 },
  ],
  deptSatisfaction: [
    { dept: '개발팀', values: [85, 90, 80, 88, 86] },
    { dept: '마케팅팀', values: [75, 70, 78, 72, 74] },
  ],
  taskTimeSavings: [
    { task: 'AI 채팅', manualMin: 15, aiMin: 5, savedPercent: 67 },
    { task: '번역', manualMin: 40, aiMin: 10, savedPercent: 75 },
  ],
  costBreakdown: [
    { model: 'Claude', tokens: '5.0M', cost: '₩10M', savings: '₩30M', roi: '200%' },
    { model: 'GPT-4', tokens: '3.0M', cost: '₩8M', savings: '₩20M', roi: '150%' },
  ],
  heatmapData: [
    { dept: '개발팀', usage: '90%', time: '60h', roi: '300%', satisfaction: '4.5', levels: ['high', 'high', 'high', 'high'] as const },
    { dept: '마케팅팀', usage: '70%', time: '40h', roi: '200%', satisfaction: '3.8', levels: ['mid', 'mid', 'mid', 'mid'] as const },
  ],
}

// Mock ROIDataContext to return hasData=true with aggregated data
vi.mock('../src/roi/ROIDataContext', () => ({
  useROIData: () => ({
    records: [{ id: 1 }],
    hasData: true,
    aggregated: mockAggregated,
    setRecords: vi.fn(),
    clearRecords: vi.fn(),
  }),
}))

describe('ROI Pages with aggregated data (hasData=true)', () => {
  // =========================================================================
  // ROIOverview — hasData branch
  // =========================================================================
  describe('ROIOverview with data', () => {
    it('should render data source badge when hasData', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated description text', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('업로드된 데이터 기반 분석')).toBeInTheDocument()
    })

    it('should render aggregated KPI values', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('100h')).toBeInTheDocument()
      expect(screen.getByText('250%')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('should render aggregated department ranking', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('300%')).toBeInTheDocument()
      expect(screen.getByText('200%')).toBeInTheDocument()
    })

    it('should render DateFilter and DepartmentFilter', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByLabelText('기간 선택')).toBeInTheDocument()
      expect(screen.getByLabelText('부서 선택')).toBeInTheDocument()
    })

    it('should change date filter value', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      const dateSelect = screen.getByLabelText('기간 선택')
      fireEvent.change(dateSelect, { target: { value: '2026.01' } })
      expect((dateSelect as HTMLSelectElement).value).toBe('2026.01')
    })

    it('should change department filter value', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      const deptSelect = screen.getByLabelText('부서 선택')
      fireEvent.change(deptSelect, { target: { value: '개발팀' } })
      expect((deptSelect as HTMLSelectElement).value).toBe('개발팀')
    })
  })

  // =========================================================================
  // ROIAdoption — hasData branch
  // =========================================================================
  describe('ROIAdoption with data', () => {
    it('should render data source badge', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated KPIs', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('100명')).toBeInTheDocument()
      expect(screen.getByText('85명')).toBeInTheDocument()
      expect(screen.getByText('15명')).toBeInTheDocument()
    })

    it('should render aggregated user segments', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('헤비 유저 (주 20회+)')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
    })

    it('should render aggregated feature adoption', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('AI 채팅')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIProductivity — hasData branch
  // =========================================================================
  describe('ROIProductivity with data', () => {
    it('should render data source badge', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated productivity KPIs', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('AI 지원 총 시간')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    it('should render aggregated task time savings table', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('AI 채팅')).toBeInTheDocument()
      // 15분 appears multiple times (KPI + table), use getAllByText
      const fifteenMin = screen.getAllByText('15분')
      expect(fifteenMin.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('5분')).toBeInTheDocument()
      expect(screen.getByText('67%')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIAnalysis — hasData branch + simulator
  // =========================================================================
  describe('ROIAnalysis with data', () => {
    it('should render data source badge', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated cost breakdown', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('Claude')).toBeInTheDocument()
      expect(screen.getByText('5.0M')).toBeInTheDocument()
    })

    it('should update hourly cost in simulator', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      const hourlyCostInput = screen.getByLabelText('시간당 평균 인건비')
      fireEvent.change(hourlyCostInput, { target: { value: '50000' } })
      // 280 * 50000 * 8.75 = 122,500,000; net = 122,500,000 - 37,000,000 = 85,500,000; ROI = 231%
      expect(screen.getByText('ROI 231%')).toBeInTheDocument()
    })

    it('should update monthly cost in simulator', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      const monthlyCostInput = screen.getByLabelText('월 AI 비용')
      fireEvent.change(monthlyCostInput, { target: { value: '0' } })
      // monthlyCost=0 -> simulatedROI = 0 (division by zero guard)
      expect(screen.getByText('ROI 0%')).toBeInTheDocument()
    })

    it('should show negative ROI when costs exceed savings', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      const usersInput = screen.getByLabelText('사용자 수')
      const monthlyCostInput = screen.getByLabelText('월 AI 비용')
      fireEvent.change(usersInput, { target: { value: '1' } })
      fireEvent.change(monthlyCostInput, { target: { value: '100000000' } })
      // 1 * 45000 * 8.75 = 393,750; net = 393,750 - 100,000,000; ROI = -100%
      expect(screen.getByText('ROI -100%')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIOrganization — hasData branch
  // =========================================================================
  describe('ROIOrganization with data', () => {
    it('should render data source badge', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated heatmap data', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('개발팀')).toBeInTheDocument()
      expect(screen.getByText('마케팅팀')).toBeInTheDocument()
      // 90% appears in both heatmap usage and grade usage, use getAllByText
      const ninetyPct = screen.getAllByText('90%')
      expect(ninetyPct.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('60h')).toBeInTheDocument()
    })

    it('should render aggregated grade usage', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('사원')).toBeInTheDocument()
      expect(screen.getByText('대리')).toBeInTheDocument()
    })

    it('should render aggregated model usage donut', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('모델별 사용 비율')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROISentiment — hasData branch
  // =========================================================================
  describe('ROISentiment with data', () => {
    it('should render data source badge', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('업로드 데이터 반영 중')).toBeInTheDocument()
    })

    it('should render aggregated sentiment KPIs', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('+30')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('78%')).toBeInTheDocument()
    })

    it('should render aggregated NPS chart data', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      const { container } = render(<ROISentiment />)
      // NPS chart with 2 data points → 2 circles
      const npsSection = screen.getByText('NPS 추이 (6개월)')
      expect(npsSection).toBeInTheDocument()
    })

    it('should render aggregated radar chart with dept satisfaction', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('부서별 만족도 비교')).toBeInTheDocument()
    })

    it('should change date filter in sentiment page', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      const dateSelect = screen.getByLabelText('기간 선택')
      fireEvent.change(dateSelect, { target: { value: '2025.12' } })
      expect((dateSelect as HTMLSelectElement).value).toBe('2025.12')
    })

    it('should change department filter in sentiment page', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      const deptSelect = screen.getByLabelText('부서 선택')
      fireEvent.change(deptSelect, { target: { value: '마케팅팀' } })
      expect((deptSelect as HTMLSelectElement).value).toBe('마케팅팀')
    })
  })
})
