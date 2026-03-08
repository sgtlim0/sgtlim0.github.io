import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock ROIDataContext
vi.mock('../src/roi/ROIDataContext', () => ({
  useROIData: () => ({
    records: [],
    hasData: false,
    aggregated: null,
    setRecords: vi.fn(),
    clearRecords: vi.fn(),
  }),
}))

// Mock Zod schema for ROIDataUpload
vi.mock('../src/schemas/roi', () => ({
  roiDatasetSchema: {
    safeParse: vi.fn(() => ({ success: true, data: [] })),
  },
}))

describe('ROI Pages - Extended Tests', () => {
  // =========================================================================
  // ROIOverview
  // =========================================================================
  describe('ROIOverview', () => {
    it('should render dashboard title', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('ROI 대시보드')).toBeInTheDocument()
    })

    it('should render description text', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('AI 도입 효과를 한눈에 확인하세요')).toBeInTheDocument()
    })

    it('should render all 4 KPI cards with labels', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('총 절감 시간')).toBeInTheDocument()
      expect(screen.getByText('총 비용 절감')).toBeInTheDocument()
      expect(screen.getByText('ROI')).toBeInTheDocument()
      expect(screen.getByText('활성 사용률')).toBeInTheDocument()
    })

    it('should render KPI values from mock data', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('2,450h')).toBeInTheDocument()
      expect(screen.getByText('340%')).toBeInTheDocument()
    })

    it('should render department filter', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('전체 부서')).toBeInTheDocument()
    })

    it('should render chart section headings', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('시간 절감 추이 (6개월)')).toBeInTheDocument()
      expect(screen.getByText('모델별 비용 효율')).toBeInTheDocument()
    })

    it('should render department ROI ranking section', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('부서별 ROI 순위')).toBeInTheDocument()
      // '개발팀' appears in both DepartmentFilter dropdown and ranking table
      const devTeams = screen.getAllByText('개발팀')
      expect(devTeams.length).toBeGreaterThanOrEqual(1)
    })

    it('should render AI insights section', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText('AI 인사이트')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIAdoption
  // =========================================================================
  describe('ROIAdoption', () => {
    it('should render heading', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('도입 현황')).toBeInTheDocument()
    })

    it('should render adoption KPI cards', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('전체 라이선스')).toBeInTheDocument()
      expect(screen.getByText('활성 사용자')).toBeInTheDocument()
      expect(screen.getByText('비활성 사용자')).toBeInTheDocument()
      expect(screen.getByText('지속 사용률')).toBeInTheDocument()
    })

    it('should render user segmentation section', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('사용자 세분화')).toBeInTheDocument()
    })

    it('should render feature adoption section', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('기능별 도입률')).toBeInTheDocument()
    })

    it('should render active users chart section', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      render(<ROIAdoption />)
      expect(screen.getByText('활성 사용자 추이 (12주)')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIProductivity
  // =========================================================================
  describe('ROIProductivity', () => {
    it('should render heading', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('생산성 효과')).toBeInTheDocument()
    })

    it('should render productivity KPI cards', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('AI 지원 총 시간')).toBeInTheDocument()
      expect(screen.getByText('평균 응답속도')).toBeInTheDocument()
      expect(screen.getByText('작업당 절감시간')).toBeInTheDocument()
      expect(screen.getByText('자동화율')).toBeInTheDocument()
    })

    it('should render task time savings table with headers', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('작업별 시간 절감')).toBeInTheDocument()
      expect(screen.getByText('수동 처리')).toBeInTheDocument()
      expect(screen.getByText('AI 지원')).toBeInTheDocument()
      expect(screen.getByText('절감률')).toBeInTheDocument()
    })

    it('should render chart section headings', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      render(<ROIProductivity />)
      expect(screen.getByText('주간 AI 지원 시간 추이')).toBeInTheDocument()
      expect(screen.getByText('기능별 시간 절감 비중')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIAnalysis
  // =========================================================================
  describe('ROIAnalysis', () => {
    it('should render heading', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('ROI 분석')).toBeInTheDocument()
    })

    it('should render ROI flow banner', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('ROI 계산 흐름')).toBeInTheDocument()
      expect(screen.getByText('AI 비용')).toBeInTheDocument()
      expect(screen.getByText('절감 가치')).toBeInTheDocument()
      expect(screen.getByText('순이익')).toBeInTheDocument()
    })

    it('should render cost breakdown table', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('모델별 비용 분석')).toBeInTheDocument()
    })

    it('should render ROI simulator with inputs', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('ROI 시뮬레이터')).toBeInTheDocument()
      expect(screen.getByLabelText('사용자 수')).toBeInTheDocument()
      expect(screen.getByLabelText('시간당 평균 인건비')).toBeInTheDocument()
      expect(screen.getByLabelText('월 AI 비용')).toBeInTheDocument()
    })

    it('should display simulation result', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('시뮬레이션 결과')).toBeInTheDocument()
      // Default: 280 users * 45000 * 8.75 = 110,250,000; net = 110,250,000 - 37,000,000 = 73,250,000; ROI = 198%
      expect(screen.getByText('ROI 198%')).toBeInTheDocument()
    })

    it('should update simulation when user count changes', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      const usersInput = screen.getByLabelText('사용자 수')
      fireEvent.change(usersInput, { target: { value: '0' } })
      // 0 users -> savedValue = 0, net = -37M, ROI = -100%
      expect(screen.getByText('ROI -100%')).toBeInTheDocument()
    })

    it('should render chart sections', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      render(<ROIAnalysis />)
      expect(screen.getByText('월별 ROI 추이')).toBeInTheDocument()
      expect(screen.getByText('누적 절감 금액')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIOrganization
  // =========================================================================
  describe('ROIOrganization', () => {
    it('should render heading', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('조직 분석')).toBeInTheDocument()
    })

    it('should render heatmap table', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('부서별 히트맵')).toBeInTheDocument()
      expect(screen.getByText('사용률')).toBeInTheDocument()
      expect(screen.getByText('절감시간')).toBeInTheDocument()
      expect(screen.getByText('만족도')).toBeInTheDocument()
    })

    it('should render grade usage section', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('직급별 활용도')).toBeInTheDocument()
    })

    it('should render model usage donut section', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      render(<ROIOrganization />)
      expect(screen.getByText('모델별 사용 비율')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROISentiment
  // =========================================================================
  describe('ROISentiment', () => {
    it('should render heading', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('만족도 분석')).toBeInTheDocument()
    })

    it('should render sentiment KPI cards', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('NPS 점수')).toBeInTheDocument()
      expect(screen.getByText('업무품질 향상')).toBeInTheDocument()
      expect(screen.getByText('속도향상 체감')).toBeInTheDocument()
      expect(screen.getByText('부담경감 체감')).toBeInTheDocument()
    })

    it('should render survey results section', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('설문 항목별 결과')).toBeInTheDocument()
    })

    it('should render NPS chart section', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('NPS 추이 (6개월)')).toBeInTheDocument()
    })

    it('should render department satisfaction radar section', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('부서별 만족도 비교')).toBeInTheDocument()
    })

    it('should render improvement requests top 5', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      render(<ROISentiment />)
      expect(screen.getByText('개선 요청 TOP 5')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROIReports
  // =========================================================================
  describe('ROIReports', () => {
    it('should render heading', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('리포트')).toBeInTheDocument()
    })

    it('should render new report button', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('+ 새 리포트')).toBeInTheDocument()
    })

    it('should render report list', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('생성된 리포트')).toBeInTheDocument()
    })

    it('should render preview panel', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('리포트 미리보기')).toBeInTheDocument()
    })

    it('should render download and email buttons', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByLabelText('PDF 다운로드')).toBeInTheDocument()
      expect(screen.getByLabelText('이메일 발송')).toBeInTheDocument()
    })

    it('should render core summary items', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('핵심 요약')).toBeInTheDocument()
    })

    it('should render email schedule section', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      render(<ROIReports />)
      expect(screen.getByText('이메일 예약 발송')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ROISettings
  // =========================================================================
  describe('ROISettings', () => {
    it('should render heading', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('설정')).toBeInTheDocument()
    })

    it('should render save button', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByLabelText('변경사항 저장')).toBeInTheDocument()
    })

    it('should render ROI parameter section', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('ROI 파라미터')).toBeInTheDocument()
      expect(screen.getByText('시간당 평균 인건비')).toBeInTheDocument()
      expect(screen.getByText('직급별 인건비 차등')).toBeInTheDocument()
    })

    it('should render data source section', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('데이터 소스')).toBeInTheDocument()
      expect(screen.getByText('H Chat API 연결')).toBeInTheDocument()
    })

    it('should render cost settings section', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('비용 설정')).toBeInTheDocument()
      expect(screen.getByText('모델별 단가')).toBeInTheDocument()
    })

    it('should render alert section', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('알림')).toBeInTheDocument()
      expect(screen.getByText('ROI 목표 달성 알림')).toBeInTheDocument()
    })

    it('should render permission management section', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      expect(screen.getByText('권한 관리')).toBeInTheDocument()
      expect(screen.getByText('경영진')).toBeInTheDocument()
      expect(screen.getByText('부서장')).toBeInTheDocument()
      expect(screen.getByText('일반 사용자')).toBeInTheDocument()
    })

    it('should render toggles with switch role', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      const switches = screen.getAllByRole('switch')
      // gradeDiff, apiConnected, infraIncluded = 3 toggles
      expect(switches.length).toBe(3)
    })

    it('should toggle switch when clicked', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      render(<ROISettings />)
      const switches = screen.getAllByRole('switch')
      // The first toggle is "gradeDiff" (enabled by default)
      expect(switches[0]).toHaveAttribute('aria-checked', 'true')
      fireEvent.click(switches[0])
      expect(switches[0]).toHaveAttribute('aria-checked', 'false')
    })
  })

  // =========================================================================
  // ROIDataUpload
  // =========================================================================
  describe('ROIDataUpload', () => {
    it('should render heading', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText('데이터 업로드')).toBeInTheDocument()
    })

    it('should render upload zone', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByLabelText('파일 업로드 영역')).toBeInTheDocument()
    })

    it('should render drag and drop instructions', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText(/파일을 여기로 드래그하거나 클릭/)).toBeInTheDocument()
    })

    it('should render supported format text', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText('지원 형식: .xlsx, .xls')).toBeInTheDocument()
    })

    it('should render sample data CTA', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText('샘플 데이터로 먼저 체험해보세요!')).toBeInTheDocument()
      expect(screen.getByLabelText('샘플 데이터 적재')).toBeInTheDocument()
    })

    it('should render usage guide', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText('사용 안내')).toBeInTheDocument()
    })

    it('should render hidden file input', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByLabelText('엑셀 파일 선택')).toBeInTheDocument()
    })

    it('should render footer with copyright', async () => {
      const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
      render(<ROIDataUpload />)
      expect(screen.getByText(/모든 데이터는 브라우저에서만 처리됩니다/)).toBeInTheDocument()
    })
  })
})
