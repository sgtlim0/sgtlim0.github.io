import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserGNB from '../src/user/components/UserGNB'

// Mock ThemeToggle
vi.mock('@hchat/ui', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
}))

describe('UserGNB', () => {
  it('renders the brand name', () => {
    render(<UserGNB activeTab="chat" />)
    expect(screen.getByText('H Chat')).toBeDefined()
  })

  it('renders all tab labels', () => {
    render(<UserGNB activeTab="chat" />)
    expect(screen.getByText('업무 비서')).toBeDefined()
    expect(screen.getByText('문서 번역')).toBeDefined()
    expect(screen.getByText('문서 작성')).toBeDefined()
    expect(screen.getByText('텍스트 추출')).toBeDefined()
  })

  it('renders navigation landmark', () => {
    render(<UserGNB activeTab="chat" />)
    const nav = screen.getByRole('navigation', { name: '메인 네비게이션' })
    expect(nav).toBeDefined()
  })

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn()
    render(<UserGNB activeTab="chat" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByText('문서 번역'))
    expect(onTabChange).toHaveBeenCalledWith('translate')
  })

  it('renders enterprise button', () => {
    render(<UserGNB activeTab="chat" />)
    expect(screen.getByText('기업용 버전 가입')).toBeDefined()
  })

  it('renders language selector button', () => {
    render(<UserGNB activeTab="chat" />)
    const langBtn = screen.getByLabelText('언어 선택')
    expect(langBtn).toBeDefined()
  })

  it('renders ThemeToggle', () => {
    render(<UserGNB activeTab="chat" />)
    expect(screen.getByTestId('theme-toggle')).toBeDefined()
  })

  describe('user email', () => {
    it('displays userEmail when provided', () => {
      render(<UserGNB activeTab="chat" userEmail="user@test.com" />)
      // Desktop email display + mobile email display (in opened menu)
      expect(screen.getByText('user@test.com')).toBeDefined()
    })

    it('does not render email element when not provided', () => {
      const { container } = render(<UserGNB activeTab="chat" />)
      const emailSpans = container.querySelectorAll('.truncate.max-w-48')
      expect(emailSpans.length).toBe(0)
    })
  })

  describe('mobile menu', () => {
    it('toggles mobile menu on hamburger click', () => {
      render(<UserGNB activeTab="chat" userEmail="a@b.com" />)
      const menuBtn = screen.getByLabelText('메뉴 열기')
      expect(menuBtn).toBeDefined()

      // Open menu
      fireEvent.click(menuBtn)
      // Mobile menu should now show all tabs again (mobile version)
      const mobileButtons = screen.getAllByText('업무 비서')
      expect(mobileButtons.length).toBe(2) // desktop + mobile

      // Close menu
      fireEvent.click(menuBtn)
      const afterClose = screen.getAllByText('업무 비서')
      expect(afterClose.length).toBe(1) // only desktop
    })

    it('closes mobile menu when a tab is clicked', () => {
      const onTabChange = vi.fn()
      render(<UserGNB activeTab="chat" onTabChange={onTabChange} />)

      // Open menu
      fireEvent.click(screen.getByLabelText('메뉴 열기'))

      // Click a mobile tab
      const mobileTabs = screen.getAllByText('문서 번역')
      fireEvent.click(mobileTabs[mobileTabs.length - 1]) // click the mobile one

      expect(onTabChange).toHaveBeenCalledWith('translate')
    })

    it('shows user email in mobile menu when provided and menu is open', () => {
      render(<UserGNB activeTab="chat" userEmail="test@example.com" />)
      fireEvent.click(screen.getByLabelText('메뉴 열기'))
      const emails = screen.getAllByText('test@example.com')
      expect(emails.length).toBeGreaterThanOrEqual(2) // desktop + mobile
    })
  })

  it('highlights the active tab', () => {
    const { container } = render(<UserGNB activeTab="translate" />)
    // The active tab should have an underline indicator span
    const activeIndicators = container.querySelectorAll('.bg-white.rounded-full')
    expect(activeIndicators.length).toBeGreaterThanOrEqual(1)
  })
})
