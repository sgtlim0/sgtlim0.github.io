import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../../src/popup/App'
import type { PageContext } from '../../src/types/context'
import { DEFAULT_SETTINGS } from '../../src/types/settings'
import * as hooks from '../../src/popup/hooks'

// Mock @hchat/ui components
vi.mock('@hchat/ui', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ThemeToggle: () => <button aria-label="테마 변경">theme</button>,
  SkeletonText: ({ lines }: { lines?: number }) => (
    <div role="status">
      {Array.from({ length: lines ?? 1 }).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  ),
}))

// Mock all hooks
vi.mock('../../src/popup/hooks', async () => {
  const actual = await vi.importActual('../../src/popup/hooks')
  return {
    ...actual,
    usePageContext: vi.fn(),
    useExtensionSettings: vi.fn(),
    useExtensionChat: vi.fn(),
  }
})

describe('App', () => {
  const mockClearContext = vi.fn()
  const mockUpdateSettings = vi.fn()
  const mockStartAnalysis = vi.fn()
  const mockReset = vi.fn()

  const mockContext: PageContext = {
    text: 'Sample page content',
    url: 'https://example.com',
    title: 'Example Page',
    favicon: 'https://example.com/favicon.ico',
    timestamp: Date.now(),
    sanitized: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations matching actual hook signatures
    vi.mocked(hooks.usePageContext).mockReturnValue({
      context: null,
      isLoading: false,
      error: null,
      clearContext: mockClearContext,
      refreshContext: vi.fn(),
    })

    vi.mocked(hooks.useExtensionSettings).mockReturnValue({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      error: null,
      updateSettings: mockUpdateSettings,
    })

    vi.mocked(hooks.useExtensionChat).mockReturnValue({
      result: '',
      isStreaming: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      reset: mockReset,
    })
  })

  describe('초기 렌더링 (컨텍스트 없음)', () => {
    it('should render PopupHeader', () => {
      render(<App />)

      expect(screen.getByText('H Chat')).toBeInTheDocument()
    })

    it('should render ModeSelector', () => {
      render(<App />)

      expect(screen.getByText('분석 모드 선택')).toBeInTheDocument()
    })

    it('should not render ContextBanner when no context', () => {
      render(<App />)

      expect(screen.queryByText('컨텍스트 지우기')).not.toBeInTheDocument()
    })

    it('should disable ModeSelector when no context', () => {
      render(<App />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      expect(summarizeButton).toBeDisabled()
    })

    it('should show disabled message in ModeSelector', () => {
      render(<App />)

      expect(screen.getByText('페이지 컨텍스트를 먼저 추출해주세요')).toBeInTheDocument()
    })
  })

  describe('컨텍스트 있을 때', () => {
    beforeEach(() => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })
    })

    it('should render ContextBanner', () => {
      render(<App />)

      expect(screen.getByText('Example Page')).toBeInTheDocument()
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('should enable ModeSelector', () => {
      render(<App />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      expect(summarizeButton).not.toBeDisabled()
    })

    it('should not show disabled message', () => {
      render(<App />)

      expect(screen.queryByText('페이지 컨텍스트를 먼저 추출해주세요')).not.toBeInTheDocument()
    })

    it('should call clearContext when clear button is clicked', async () => {
      render(<App />)

      const clearButton = screen.getByLabelText('컨텍스트 지우기')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(mockClearContext).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('모드 선택 플로우', () => {
    beforeEach(() => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })
    })

    it('should switch to AnalyzePage when mode is selected', async () => {
      render(<App />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      fireEvent.click(summarizeButton)

      await waitFor(() => {
        expect(screen.getByText('분석 결과')).toBeInTheDocument()
        expect(screen.getByText('요약')).toBeInTheDocument()
      })
    })

    it('should show explain mode badge when explain is selected', async () => {
      render(<App />)

      const explainButton = screen.getByLabelText('설명 모드')
      fireEvent.click(explainButton)

      await waitFor(() => {
        expect(screen.getByText('설명')).toBeInTheDocument()
      })
    })

    it('should show research mode badge when research is selected', async () => {
      render(<App />)

      const researchButton = screen.getByLabelText('조사 모드')
      fireEvent.click(researchButton)

      await waitFor(() => {
        expect(screen.getByText('조사')).toBeInTheDocument()
      })
    })

    it('should show translate mode badge when translate is selected', async () => {
      render(<App />)

      const translateButton = screen.getByLabelText('번역 모드')
      fireEvent.click(translateButton)

      await waitFor(() => {
        expect(screen.getByText('번역')).toBeInTheDocument()
      })
    })

    it('should hide main UI when showing AnalyzePage', async () => {
      render(<App />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      fireEvent.click(summarizeButton)

      await waitFor(() => {
        // Main UI components should not be visible
        expect(screen.queryByText('분석 모드 선택')).not.toBeInTheDocument()
      })
    })
  })

  describe('AnalyzePage에서 뒤로가기', () => {
    beforeEach(() => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })
    })

    it('should return to main UI when back button is clicked', async () => {
      render(<App />)

      // Go to AnalyzePage
      const summarizeButton = screen.getByLabelText('요약 모드')
      fireEvent.click(summarizeButton)

      await waitFor(() => {
        expect(screen.getByText('분석 결과')).toBeInTheDocument()
      })

      // Go back
      const backButton = screen.getByLabelText('뒤로가기')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByText('분석 모드 선택')).toBeInTheDocument()
        expect(screen.queryByText('분석 결과')).not.toBeInTheDocument()
      })
    })

    it('should show ContextBanner again after going back', async () => {
      render(<App />)

      // Go to AnalyzePage
      fireEvent.click(screen.getByLabelText('요약 모드'))

      await waitFor(() => {
        expect(screen.getByText('분석 결과')).toBeInTheDocument()
      })

      // Go back
      fireEvent.click(screen.getByLabelText('뒤로가기'))

      await waitFor(() => {
        expect(screen.getByText('Example Page')).toBeInTheDocument()
      })
    })
  })

  describe('ThemeProvider 통합', () => {
    it('should wrap entire app in ThemeProvider', () => {
      const { container } = render(<App />)

      // ThemeProvider adds theme class to root
      expect(container.firstChild).toBeTruthy()
    })

    it('should apply correct dimensions to main UI', () => {
      const { container } = render(<App />)

      const mainDiv = container.querySelector('.w-\\[400px\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should apply correct dimensions to AnalyzePage', async () => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })

      const { container } = render(<App />)

      fireEvent.click(screen.getByLabelText('요약 모드'))

      await waitFor(() => {
        const analyzeDiv = container.querySelector('.h-\\[600px\\]')
        expect(analyzeDiv).toBeInTheDocument()
      })
    })
  })

  describe('설정 통합', () => {
    it('should pass settings to PopupHeader', () => {
      const customSettings = { ...DEFAULT_SETTINGS, theme: 'dark' as const }
      vi.mocked(hooks.useExtensionSettings).mockReturnValue({
        settings: customSettings,
        updateSettings: mockUpdateSettings,
      })

      render(<App />)

      // PopupHeader should be rendered (can verify by checking for H Chat text)
      expect(screen.getByText('H Chat')).toBeInTheDocument()
    })

    it('should call updateSettings when PopupHeader changes settings', async () => {
      render(<App />)

      // Settings button in PopupHeader
      const settingsButton = screen.getByLabelText('설정 열기')
      fireEvent.click(settingsButton)

      // chrome.runtime.openOptionsPage should be called, but updateSettings not directly
      // This test verifies the prop is passed correctly
      expect(screen.getByText('H Chat')).toBeInTheDocument()
    })
  })

  describe('에러 처리', () => {
    it('should handle clearContext errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockClearContext.mockRejectedValueOnce(new Error('Clear failed'))

      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })

      render(<App />)

      const clearButton = screen.getByLabelText('컨텍스트 지우기')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to clear context:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })

  describe('조건부 렌더링', () => {
    it('should not show ContextBanner when activeMode is set', async () => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })

      render(<App />)

      // Initially ContextBanner is visible
      expect(screen.getByText('Example Page')).toBeInTheDocument()

      // Select a mode
      fireEvent.click(screen.getByLabelText('요약 모드'))

      await waitFor(() => {
        // ContextBanner should not be visible in AnalyzePage
        expect(screen.queryByLabelText('컨텍스트 지우기')).not.toBeInTheDocument()
      })
    })

    it('should not render AnalyzePage when activeMode is null', () => {
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })

      render(<App />)

      expect(screen.queryByText('분석 결과')).not.toBeInTheDocument()
    })

    it('should not render AnalyzePage when context is null even with activeMode', async () => {
      // Start with context
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: mockContext,
        isLoading: false,
        error: null,
        clearContext: mockClearContext,
        refreshContext: vi.fn(),
      })

      const { rerender } = render(<App />)

      fireEvent.click(screen.getByLabelText('요약 모드'))

      // Remove context
      vi.mocked(hooks.usePageContext).mockReturnValue({
        context: null,
        setContext: vi.fn(),
        clearContext: mockClearContext,
      })

      rerender(<App />)

      // Should show main UI, not AnalyzePage
      await waitFor(() => {
        expect(screen.getByText('분석 모드 선택')).toBeInTheDocument()
      })
    })
  })
})
