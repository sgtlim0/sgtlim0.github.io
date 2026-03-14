import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnalyzePage } from '../../src/popup/pages/AnalyzePage'
import type { PageContext } from '../../src/types/context'
import * as hooks from '../../src/popup/hooks'

// Mock @hchat/ui components
vi.mock('@hchat/ui', () => ({
  SkeletonText: ({ lines }: { lines?: number }) => (
    <div role="status" aria-label="loading">
      {Array.from({ length: lines ?? 1 }).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  ),
}))

// Mock the useExtensionChat hook
vi.mock('../../src/popup/hooks', async () => {
  const actual = await vi.importActual('../../src/popup/hooks')
  return {
    ...actual,
    useExtensionChat: vi.fn(),
  }
})

describe('AnalyzePage', () => {
  const mockOnBack = vi.fn()
  const mockStartAnalysis = vi.fn()
  const mockReset = vi.fn()

  const mockContext: PageContext = {
    text: 'Sample page content for analysis',
    url: 'https://example.com',
    title: 'Example Page',
    favicon: 'https://example.com/favicon.ico',
    timestamp: Date.now(),
    sanitized: false,
  }

  const defaultHookReturn = {
    result: '',
    isStreaming: false,
    error: null,
    startAnalysis: mockStartAnalysis,
    reset: mockReset,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hooks.useExtensionChat).mockReturnValue(defaultHookReturn)
  })

  describe('초기 렌더링', () => {
    it('should render page title', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('분석 결과')).toBeInTheDocument()
    })

    it('should render mode badge', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('요약')).toBeInTheDocument()
    })

    it('should render back button', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const backButton = screen.getByLabelText('뒤로가기')
      expect(backButton).toBeInTheDocument()
    })

    it('should call startAnalysis on mount', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(mockStartAnalysis).toHaveBeenCalledTimes(1)
    })

    it('should call reset on unmount', () => {
      const { unmount } = render(
        <AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />,
      )

      unmount()
      expect(mockReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('모드별 라벨', () => {
    it('should show "요약" for summarize mode', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('요약')).toBeInTheDocument()
    })

    it('should show "설명" for explain mode', () => {
      render(<AnalyzePage mode="explain" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('설명')).toBeInTheDocument()
    })

    it('should show "조사" for research mode', () => {
      render(<AnalyzePage mode="research" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('조사')).toBeInTheDocument()
    })

    it('should show "번역" for translate mode', () => {
      render(<AnalyzePage mode="translate" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('번역')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('should show skeleton when streaming with no result', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        isStreaming: true,
        result: '',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should not show skeleton when result exists', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        isStreaming: false,
        result: 'Analysis result',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('Analysis result')).toBeInTheDocument()
    })
  })

  describe('스트리밍 결과', () => {
    it('should display result text', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'This is the analysis result from AI',
        isStreaming: false,
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('This is the analysis result from AI')).toBeInTheDocument()
    })

    it('should show streaming indicator when streaming', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Partial result',
        isStreaming: true,
      })

      const { container } = render(
        <AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />,
      )

      expect(screen.getByText('Partial result')).toBeInTheDocument()
      // Check for animated pulse cursor
      const cursor = container.querySelector('.animate-pulse')
      expect(cursor).toBeInTheDocument()
    })

    it('should not show streaming indicator when not streaming', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Complete result',
        isStreaming: false,
      })

      const { container } = render(
        <AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />,
      )

      const cursor = container.querySelector('.animate-pulse')
      expect(cursor).not.toBeInTheDocument()
    })
  })

  describe('에러 표시', () => {
    it('should display error message when error occurs', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        error: new Error('API connection failed'),
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('오류 발생')).toBeInTheDocument()
      expect(screen.getByText('API connection failed')).toBeInTheDocument()
    })

    it('should not show result when error exists', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
        error: new Error('Error occurred'),
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.queryByText('Some result')).not.toBeInTheDocument()
    })

    it('should render error icon', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Test error'),
      })

      const { container } = render(
        <AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />,
      )

      const errorIcon = container.querySelector('.text-red-500')
      expect(errorIcon).toBeInTheDocument()
    })
  })

  describe('복사 기능', () => {
    it('should render copy button', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Result to copy',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('복사')).toBeInTheDocument()
    })

    it('should disable copy button when no result', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: '',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const copyButton = screen.getByText('복사')
      expect(copyButton).toBeDisabled()
    })

    it('should disable copy button when streaming', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Streaming...',
        isStreaming: true,
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const copyButton = screen.getByText('복사')
      expect(copyButton).toBeDisabled()
    })

    it('should copy result to clipboard when clicked', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      navigator.clipboard.writeText = mockWriteText

      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Text to copy',
        isStreaming: false,
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const copyButton = screen.getByText('복사')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Text to copy')
      })
    })
  })

  describe('뒤로가기 기능', () => {
    it('should call onBack when back button is clicked', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const backButton = screen.getByLabelText('뒤로가기')
      fireEvent.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should render back button SVG icon', () => {
      const { container } = render(
        <AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />,
      )

      const backButton = screen.getByLabelText('뒤로가기')
      const svg = backButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('새 분석 버튼', () => {
    it('should render "새 분석" button', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('새 분석')).toBeInTheDocument()
    })

    it('should call reset and onBack when clicked', () => {
      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const newAnalysisButton = screen.getByText('새 분석')
      fireEvent.click(newAnalysisButton)

      expect(mockReset).toHaveBeenCalledTimes(1)
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('컨텍스트 정보', () => {
    it('should display context title', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('Example Page')).toBeInTheDocument()
    })

    it('should display context URL', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('should display text length', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const textLength = mockContext.text.length
      expect(screen.getByText(new RegExp(`${textLength.toLocaleString()}자`))).toBeInTheDocument()
    })

    it('should show sanitized indicator when context is sanitized', () => {
      const sanitizedContext = { ...mockContext, sanitized: true }
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
      })

      render(<AnalyzePage mode="summarize" context={sanitizedContext} onBack={mockOnBack} />)

      expect(screen.getByText(/새니타이즈됨/)).toBeInTheDocument()
    })

    it('should display favicon when provided', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        result: 'Some result',
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      const favicon = screen.getByAltText('')
      expect(favicon).toBeInTheDocument()
      expect(favicon).toHaveAttribute('src', mockContext.favicon)
    })

    it('should not show context info when error exists', () => {
      vi.mocked(hooks.useExtensionChat).mockReturnValue({
        ...defaultHookReturn,
        error: new Error('Test error'),
      })

      render(<AnalyzePage mode="summarize" context={mockContext} onBack={mockOnBack} />)

      expect(screen.queryByText('분석 대상')).not.toBeInTheDocument()
    })
  })
})
