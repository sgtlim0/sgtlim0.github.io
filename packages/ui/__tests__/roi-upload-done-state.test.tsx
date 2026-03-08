import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * ROIDataUpload done state tests — covers:
 * - Sample data load -> done state with data preview
 * - StatBox rendering (총 레코드, 컬럼 수, 기간, 고유 사용자)
 * - Data table preview rendering
 * - Reset/clear functionality from done state
 * - getDateRange and getUniqueCount helpers (via rendered output)
 */

const mockSetRecords = vi.fn()
const mockClearRecords = vi.fn()

vi.mock('../src/roi/ROIDataContext', () => ({
  useROIData: () => ({
    records: [],
    hasData: false,
    aggregated: null,
    setRecords: mockSetRecords,
    clearRecords: mockClearRecords,
  }),
}))

// Mock Zod schema to pass validation
vi.mock('../src/schemas/roi', () => ({
  roiDatasetSchema: {
    safeParse: vi.fn((data: unknown[]) => ({
      success: true,
      data,
    })),
  },
}))

describe('ROIDataUpload — done state and sample load', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should transition to done state after sample data load', async () => {
    const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
    render(<ROIDataUpload />)

    const sampleBtn = screen.getByLabelText('샘플 데이터 적재')
    fireEvent.click(sampleBtn)

    // Should show parsing state initially
    expect(screen.getByText('파일 분석 중...')).toBeInTheDocument()

    // Wait for setTimeout(600ms) + data generation to complete
    await waitFor(() => {
      expect(screen.getByText(/레코드 분석 완료/)).toBeInTheDocument()
    }, { timeout: 10000 })

    expect(mockSetRecords).toHaveBeenCalled()
  }, 15000)

  it('should render data preview table and stat boxes in done state', async () => {
    const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
    render(<ROIDataUpload />)

    const sampleBtn = screen.getByLabelText('샘플 데이터 적재')
    fireEvent.click(sampleBtn)

    await waitFor(() => {
      expect(screen.getByText('데이터 미리보기')).toBeInTheDocument()
    }, { timeout: 10000 })

    // Column headers from sample data
    expect(screen.getByText('날짜')).toBeInTheDocument()
    expect(screen.getByText('사용자ID')).toBeInTheDocument()
    expect(screen.getByText('부서')).toBeInTheDocument()

    // Stat boxes
    expect(screen.getByText('총 레코드')).toBeInTheDocument()
    expect(screen.getByText('컬럼 수')).toBeInTheDocument()
    expect(screen.getByText('기간')).toBeInTheDocument()
    expect(screen.getByText('고유 사용자')).toBeInTheDocument()

    // Values
    expect(screen.getByText('10,433건')).toBeInTheDocument()
    expect(screen.getByText('9개')).toBeInTheDocument()
  }, 15000)

  it('should show date range and success banner', async () => {
    const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
    render(<ROIDataUpload />)

    const sampleBtn = screen.getByLabelText('샘플 데이터 적재')
    fireEvent.click(sampleBtn)

    await waitFor(() => {
      expect(screen.getByText(/샘플_이용통계_2025Q3-2026Q1\.xlsx/)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Date range (generated data spans 2025-09 to 2026-02)
    expect(screen.getByText('2025-09 ~ 2026-02')).toBeInTheDocument()

    // Preview footer
    expect(screen.getByText(/전체.*건 중 10건 표시/)).toBeInTheDocument()
  }, 15000)

  it('should reset to idle state when 초기화 button clicked', async () => {
    const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
    render(<ROIDataUpload />)

    const sampleBtn = screen.getByLabelText('샘플 데이터 적재')
    fireEvent.click(sampleBtn)

    await waitFor(() => {
      expect(screen.getByLabelText('데이터 초기화')).toBeInTheDocument()
    }, { timeout: 10000 })

    fireEvent.click(screen.getByLabelText('데이터 초기화'))

    // Should return to idle state
    expect(screen.queryByText('데이터 미리보기')).toBeNull()
    expect(screen.queryByText('총 레코드')).toBeNull()
    expect(mockClearRecords).toHaveBeenCalled()
  }, 15000)
})

describe('ROIDataUpload — Zod validation failure on sample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show error when Zod validation fails for sample data', async () => {
    const { roiDatasetSchema } = await import('../src/schemas/roi')
    ;(roiDatasetSchema.safeParse as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      success: false,
      error: { issues: [{ message: '필수 필드가 누락되었습니다' }] },
    })

    const { default: ROIDataUpload } = await import('../src/roi/ROIDataUpload')
    render(<ROIDataUpload />)

    const sampleBtn = screen.getByLabelText('샘플 데이터 적재')
    fireEvent.click(sampleBtn)

    await waitFor(() => {
      expect(screen.getByText('업로드 실패')).toBeInTheDocument()
    }, { timeout: 10000 })

    expect(screen.getByText(/샘플 데이터 생성 중 오류가 발생했습니다/)).toBeInTheDocument()
  }, 15000)
})
