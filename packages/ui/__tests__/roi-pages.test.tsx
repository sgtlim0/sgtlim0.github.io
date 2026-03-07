import { render, screen } from '@testing-library/react'
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

describe('ROI Pages', () => {
  describe('ROIOverview', () => {
    it('should render with mock data fallback', async () => {
      const { default: ROIOverview } = await import('../src/roi/ROIOverview')
      render(<ROIOverview />)
      expect(screen.getByText(/전체 부서/)).toBeTruthy()
    })
  })

  describe('ROIAdoption', () => {
    it('should render without crashing', async () => {
      const { default: ROIAdoption } = await import('../src/roi/ROIAdoption')
      const { container } = render(<ROIAdoption />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROIProductivity', () => {
    it('should render without crashing', async () => {
      const { default: ROIProductivity } = await import('../src/roi/ROIProductivity')
      const { container } = render(<ROIProductivity />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROIAnalysis', () => {
    it('should render without crashing', async () => {
      const { default: ROIAnalysis } = await import('../src/roi/ROIAnalysis')
      const { container } = render(<ROIAnalysis />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROIOrganization', () => {
    it('should render without crashing', async () => {
      const { default: ROIOrganization } = await import('../src/roi/ROIOrganization')
      const { container } = render(<ROIOrganization />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROISentiment', () => {
    it('should render without crashing', async () => {
      const { default: ROISentiment } = await import('../src/roi/ROISentiment')
      const { container } = render(<ROISentiment />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROIReports', () => {
    it('should render without crashing', async () => {
      const { default: ROIReports } = await import('../src/roi/ROIReports')
      const { container } = render(<ROIReports />)
      expect(container).toBeTruthy()
    })
  })

  describe('ROISettings', () => {
    it('should render without crashing', async () => {
      const { default: ROISettings } = await import('../src/roi/ROISettings')
      const { container } = render(<ROISettings />)
      expect(container).toBeTruthy()
    })
  })
})
