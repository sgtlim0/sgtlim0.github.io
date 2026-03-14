import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContextBanner } from '../../src/popup/components/ContextBanner'
import type { PageContext } from '../../src/types/context'

describe('ContextBanner', () => {
  const mockOnClear = vi.fn()

  const mockContext: PageContext = {
    text: 'Sample page content that is being displayed in the context banner',
    url: 'https://example.com',
    title: 'Example Page Title',
    favicon: 'https://example.com/favicon.ico',
    timestamp: Date.now(),
    sanitized: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('should render page title', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      expect(screen.getByText('Example Page Title')).toBeInTheDocument()
    })

    it('should render page URL', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('should render text content', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      expect(screen.getByText(/Sample page content that is being displayed/)).toBeInTheDocument()
    })

    it('should render text length', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const textLength = mockContext.text.length
      expect(screen.getByText(`${textLength.toLocaleString()}자`)).toBeInTheDocument()
    })

    it('should render favicon when provided', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const favicon = screen.getByAltText('')
      expect(favicon).toBeInTheDocument()
      expect(favicon).toHaveAttribute('src', mockContext.favicon)
    })

    it('should not render favicon when not provided', () => {
      const contextWithoutFavicon = { ...mockContext, favicon: undefined }
      render(<ContextBanner context={contextWithoutFavicon} onClear={mockOnClear} />)

      const images = screen.queryAllByRole('img')
      expect(images).toHaveLength(0)
    })
  })

  describe('텍스트 자르기', () => {
    it('should truncate long text to 120 characters', () => {
      const longText = 'a'.repeat(200)
      const longContext = { ...mockContext, text: longText }

      render(<ContextBanner context={longContext} onClear={mockOnClear} />)

      const displayedText = screen.getByText(/a+\.\.\./)
      expect(displayedText.textContent).toHaveLength(123) // 120 + '...'
    })

    it('should not truncate short text', () => {
      const shortText = 'Short text'
      const shortContext = { ...mockContext, text: shortText }

      render(<ContextBanner context={shortContext} onClear={mockOnClear} />)

      expect(screen.getByText('Short text')).toBeInTheDocument()
    })

    it('should handle text exactly 120 characters', () => {
      const exactText = 'a'.repeat(120)
      const exactContext = { ...mockContext, text: exactText }

      render(<ContextBanner context={exactContext} onClear={mockOnClear} />)

      const displayedText = screen.getByText(exactText)
      expect(displayedText.textContent).not.toContain('...')
    })
  })

  describe('새니타이즈 상태', () => {
    it('should show sanitized indicator when sanitized is true', () => {
      const sanitizedContext = { ...mockContext, sanitized: true }

      render(<ContextBanner context={sanitizedContext} onClear={mockOnClear} />)

      expect(screen.getByText('새니타이즈됨')).toBeInTheDocument()
    })

    it('should not show sanitized indicator when sanitized is false', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      expect(screen.queryByText('새니타이즈됨')).not.toBeInTheDocument()
    })

    it('should render sanitized icon when sanitized', () => {
      const sanitizedContext = { ...mockContext, sanitized: true }
      const { container } = render(
        <ContextBanner context={sanitizedContext} onClear={mockOnClear} />,
      )

      const sanitizedSection = screen.getByText('새니타이즈됨').parentElement
      const icon = sanitizedSection?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('지우기 기능', () => {
    it('should render clear button', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const clearButton = screen.getByLabelText('컨텍스트 지우기')
      expect(clearButton).toBeInTheDocument()
    })

    it('should call onClear when clear button is clicked', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const clearButton = screen.getByLabelText('컨텍스트 지우기')
      fireEvent.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('should render X icon in clear button', () => {
      render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const clearButton = screen.getByLabelText('컨텍스트 지우기')
      const svg = clearButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('레이아웃', () => {
    it('should use flex layout for header section', () => {
      const { container } = render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const flexContainer = container.querySelector('.flex.items-start')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should apply rounded corners and borders', () => {
      const { container } = render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const banner = container.firstChild
      expect(banner).toHaveClass('rounded-lg', 'border')
    })
  })

  describe('숫자 포맷팅', () => {
    it('should format large numbers with locale string', () => {
      const largeTextContext = { ...mockContext, text: 'a'.repeat(10000) }

      render(<ContextBanner context={largeTextContext} onClear={mockOnClear} />)

      expect(screen.getByText('10,000자')).toBeInTheDocument()
    })

    it('should format small numbers without commas', () => {
      const smallTextContext = { ...mockContext, text: 'a'.repeat(100) }

      render(<ContextBanner context={smallTextContext} onClear={mockOnClear} />)

      expect(screen.getByText('100자')).toBeInTheDocument()
    })
  })

  describe('URL 표시', () => {
    it('should handle long URLs', () => {
      const longUrl =
        'https://example.com/very/long/path/with/many/segments/that/exceeds/normal/length'
      const longUrlContext = { ...mockContext, url: longUrl }

      render(<ContextBanner context={longUrlContext} onClear={mockOnClear} />)

      expect(screen.getByText(longUrl)).toBeInTheDocument()
    })

    it('should apply truncate class to URL', () => {
      const { container } = render(<ContextBanner context={mockContext} onClear={mockOnClear} />)

      const urlElement = screen.getByText(mockContext.url)
      expect(urlElement).toHaveClass('truncate')
    })
  })
})
