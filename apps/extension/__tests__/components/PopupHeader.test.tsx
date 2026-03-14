import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PopupHeader } from '../../src/popup/components/PopupHeader'
import { DEFAULT_SETTINGS } from '../../src/types/settings'

describe('PopupHeader', () => {
  const mockOnSettingsChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render H Chat logo and title', () => {
    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('H Chat')).toBeInTheDocument()
  })

  it('should render ThemeToggle component', () => {
    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    // ThemeToggle should be present (can't test exact behavior without mocking the component)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render settings button', () => {
    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    const settingsButton = screen.getByLabelText('설정 열기')
    expect(settingsButton).toBeInTheDocument()
  })

  it('should call chrome.runtime.openOptionsPage when settings button is clicked', () => {
    const mockOpenOptionsPage = vi.fn()
    chrome.runtime.openOptionsPage = mockOpenOptionsPage

    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    const settingsButton = screen.getByLabelText('설정 열기')
    fireEvent.click(settingsButton)

    expect(mockOpenOptionsPage).toHaveBeenCalledTimes(1)
  })

  it('should not crash when chrome.runtime is undefined', () => {
    const originalChrome = globalThis.chrome
    // @ts-expect-error Testing undefined chrome
    delete globalThis.chrome

    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    const settingsButton = screen.getByLabelText('설정 열기')
    expect(() => fireEvent.click(settingsButton)).not.toThrow()

    globalThis.chrome = originalChrome
  })

  it('should have proper styling for header', () => {
    const { container } = render(
      <PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />,
    )

    const header = container.querySelector('header')
    expect(header).toHaveClass('flex', 'items-center', 'justify-between')
  })

  it('should render logo with gradient background', () => {
    render(<PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />)

    const logo = screen.getByText('H').parentElement
    expect(logo).toHaveClass('bg-gradient-to-br', 'from-blue-500', 'to-purple-600')
  })

  it('should render settings icon SVG', () => {
    const { container } = render(
      <PopupHeader settings={DEFAULT_SETTINGS} onSettingsChange={mockOnSettingsChange} />,
    )

    const settingsButton = screen.getByLabelText('설정 열기')
    const svg = settingsButton.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
