import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeSelector } from '../../src/popup/components/ModeSelector'

describe('ModeSelector', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('should render all 4 mode options', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      expect(screen.getByText('요약')).toBeInTheDocument()
      expect(screen.getByText('설명')).toBeInTheDocument()
      expect(screen.getByText('조사')).toBeInTheDocument()
      expect(screen.getByText('번역')).toBeInTheDocument()
    })

    it('should render section title', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      expect(screen.getByText('분석 모드 선택')).toBeInTheDocument()
    })

    it('should render mode descriptions', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      expect(screen.getByText('페이지 내용을 간단히 요약합니다')).toBeInTheDocument()
      expect(screen.getByText('내용을 자세히 설명합니다')).toBeInTheDocument()
      expect(screen.getByText('주제에 대해 심층 조사합니다')).toBeInTheDocument()
      expect(screen.getByText('다른 언어로 번역합니다')).toBeInTheDocument()
    })

    it('should render mode icons', () => {
      const { container } = render(<ModeSelector onSelect={mockOnSelect} />)

      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('모드 선택', () => {
    it('should call onSelect with summarize mode', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      fireEvent.click(summarizeButton)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith('summarize')
    })

    it('should call onSelect with explain mode', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      const explainButton = screen.getByLabelText('설명 모드')
      fireEvent.click(explainButton)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith('explain')
    })

    it('should call onSelect with research mode', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      const researchButton = screen.getByLabelText('조사 모드')
      fireEvent.click(researchButton)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith('research')
    })

    it('should call onSelect with translate mode', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      const translateButton = screen.getByLabelText('번역 모드')
      fireEvent.click(translateButton)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith('translate')
    })
  })

  describe('비활성화 상태', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<ModeSelector disabled={true} onSelect={mockOnSelect} />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      const explainButton = screen.getByLabelText('설명 모드')
      const researchButton = screen.getByLabelText('조사 모드')
      const translateButton = screen.getByLabelText('번역 모드')

      expect(summarizeButton).toBeDisabled()
      expect(explainButton).toBeDisabled()
      expect(researchButton).toBeDisabled()
      expect(translateButton).toBeDisabled()
    })

    it('should show disabled message when disabled', () => {
      render(<ModeSelector disabled={true} onSelect={mockOnSelect} />)

      expect(screen.getByText('페이지 컨텍스트를 먼저 추출해주세요')).toBeInTheDocument()
    })

    it('should not show disabled message when enabled', () => {
      render(<ModeSelector disabled={false} onSelect={mockOnSelect} />)

      expect(screen.queryByText('페이지 컨텍스트를 먼저 추출해주세요')).not.toBeInTheDocument()
    })

    it('should not call onSelect when disabled button is clicked', () => {
      render(<ModeSelector disabled={true} onSelect={mockOnSelect} />)

      const summarizeButton = screen.getByLabelText('요약 모드')
      fireEvent.click(summarizeButton)

      expect(mockOnSelect).not.toHaveBeenCalled()
    })
  })

  describe('그리드 레이아웃', () => {
    it('should render buttons in 2-column grid', () => {
      const { container } = render(<ModeSelector onSelect={mockOnSelect} />)

      const grid = container.querySelector('.grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('should have 4 button elements', () => {
      render(<ModeSelector onSelect={mockOnSelect} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })
  })

  describe('스타일링', () => {
    it('should apply correct color classes to mode icons', () => {
      const { container } = render(<ModeSelector onSelect={mockOnSelect} />)

      // Check for color classes (text-blue-500, text-green-500, etc.)
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument()
      expect(container.querySelector('.text-green-500')).toBeInTheDocument()
      expect(container.querySelector('.text-orange-500')).toBeInTheDocument()
      expect(container.querySelector('.text-purple-500')).toBeInTheDocument()
    })

    it('should have hover effects on buttons', () => {
      const { container } = render(<ModeSelector onSelect={mockOnSelect} />)

      const button = screen.getByLabelText('요약 모드')
      expect(button).toHaveClass('hover:border-ext-primary')
    })
  })
})
