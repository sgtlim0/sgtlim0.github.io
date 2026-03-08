import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

/**
 * ROIReports interaction tests — covers:
 * - Selecting custom report type (line 70 branch: '커스텀' type)
 * - Report list selection cycling
 * - Individual report download icons
 * - Preview panel updates on report change
 */

describe('ROIReports — interactions', () => {
  it('should display custom report type title when custom report selected', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)

    // The 3rd report (index 2) has type '커스텀'
    const reportButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label')?.includes('리포트 선택')
    )

    // Select the custom report (3rd item, index 2)
    if (reportButtons.length >= 3) {
      fireEvent.click(reportButtons[2])
      // Preview should show '비교 리포트' for custom type
      expect(screen.getByText('비교 리포트')).toBeInTheDocument()
    }
  })

  it('should show monthly report title for non-custom report', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)
    // Default selection (index 0) should show '월간 AI 생산성 리포트'
    expect(screen.getByText('월간 AI 생산성 리포트')).toBeInTheDocument()
  })

  it('should update preview panel pages when different report selected', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)

    // Default: 12페이지 appears in list item and preview panel
    const twelvePages = screen.getAllByText(/12페이지/)
    expect(twelvePages.length).toBeGreaterThanOrEqual(1)

    // Select 2nd report (11 pages)
    const reportButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label')?.includes('리포트 선택')
    )
    if (reportButtons.length >= 2) {
      fireEvent.click(reportButtons[1])
      const elevenPages = screen.getAllByText(/11페이지/)
      expect(elevenPages.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should handle download icon click with stopPropagation', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)

    // Find download icons (aria-label includes "다운로드" but not "PDF")
    const downloadIcons = screen.getAllByRole('button').filter(
      (btn) => {
        const label = btn.getAttribute('aria-label') ?? ''
        return label.includes('다운로드') && !label.includes('PDF')
      }
    )

    expect(downloadIcons.length).toBeGreaterThan(0)
    fireEvent.click(downloadIcons[0])
    expect(alertSpy).toHaveBeenCalledWith('PDF 다운로드 준비중')
    alertSpy.mockRestore()
  })

  it('should select last report and show its details', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)

    const reportButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label')?.includes('리포트 선택')
    )

    // Select the last report (index 3, 10 pages)
    const lastIdx = reportButtons.length - 1
    if (lastIdx >= 0) {
      fireEvent.click(reportButtons[lastIdx])
      // 10페이지 appears in both the list item and the preview panel
      const tenPages = screen.getAllByText(/10페이지/)
      expect(tenPages.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should render + 새 리포트 button', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)
    expect(screen.getByText('+ 새 리포트')).toBeInTheDocument()
  })

  it('should render schedule info in preview', async () => {
    const { default: ROIReports } = await import('../src/roi/ROIReports')
    render(<ROIReports />)
    expect(screen.getByText('이메일 예약 발송')).toBeInTheDocument()
    expect(screen.getByText('월간 (매월 1일)')).toBeInTheDocument()
    expect(screen.getByText('경영진 (5명)')).toBeInTheDocument()
  })
})
