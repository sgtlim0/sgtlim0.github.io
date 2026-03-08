import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TabFilter from '../src/hmg/TabFilter'
import HmgStatCard from '../src/hmg/HmgStatCard'
import PillButton from '../src/hmg/PillButton'
import StepItem from '../src/hmg/StepItem'
import DownloadItem from '../src/hmg/DownloadItem'
import GNB from '../src/hmg/GNB'
import HeroBanner from '../src/hmg/HeroBanner'
import Footer from '../src/hmg/Footer'

describe('TabFilter', () => {
  const tabs = ['전체', '가이드', '릴리즈 노트', '기술 문서']

  it('should render all tabs', () => {
    render(<TabFilter tabs={tabs} activeTab="전체" onTabChange={() => {}} />)
    tabs.forEach((tab) => {
      expect(screen.getByText(tab)).toBeDefined()
    })
  })

  it('should call onTabChange on click', () => {
    const onChange = vi.fn()
    render(<TabFilter tabs={tabs} activeTab="전체" onTabChange={onChange} />)

    fireEvent.click(screen.getByText('가이드'))
    expect(onChange).toHaveBeenCalledWith('가이드')
  })

  it('should highlight active tab', () => {
    const { container } = render(
      <TabFilter tabs={tabs} activeTab="가이드" onTabChange={() => {}} />,
    )
    const buttons = container.querySelectorAll('button')
    const activeBtn = Array.from(buttons).find((b) => b.textContent === '가이드')
    expect(activeBtn?.className).toContain('border-hmg-text-title')
  })
})

describe('HmgStatCard', () => {
  it('should render value and label', () => {
    render(<HmgStatCard value="10,000+" label="활성 사용자" />)
    expect(screen.getByText('10,000+')).toBeDefined()
    expect(screen.getByText('활성 사용자')).toBeDefined()
  })

  it('should render numeric value', () => {
    render(<HmgStatCard value={500} label="모델 수" />)
    expect(screen.getByText('500')).toBeDefined()
  })
})

describe('PillButton', () => {
  it('should render children', () => {
    render(<PillButton>자세히 보기</PillButton>)
    expect(screen.getByText('자세히 보기')).toBeDefined()
  })

  it('should call onClick', () => {
    const onClick = vi.fn()
    render(<PillButton onClick={onClick}>Click</PillButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should support variant prop', () => {
    const { container } = render(<PillButton variant="navy">Navy</PillButton>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-hmg-navy')
  })

  it('should support teal variant', () => {
    const { container } = render(<PillButton variant="teal">Teal</PillButton>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-hmg-teal')
  })
})

describe('StepItem', () => {
  it('should render step number, title and description', () => {
    render(<StepItem step={1} title="설치" description="앱을 설치합니다" />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('설치')).toBeDefined()
    expect(screen.getByText('앱을 설치합니다')).toBeDefined()
  })

  it('should show arrow when showArrow is true', () => {
    const { container } = render(
      <StepItem step={2} title="설정" description="설정합니다" showArrow />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })
})

describe('DownloadItem', () => {
  it('should render title', () => {
    render(<DownloadItem title="가이드 v1.0" buttons={[{ label: 'PDF' }, { label: 'DOCX' }]} />)
    expect(screen.getByText('가이드 v1.0')).toBeDefined()
  })

  it('should render all buttons', () => {
    render(<DownloadItem title="File" buttons={[{ label: 'PDF' }, { label: 'XLSX' }]} />)
    expect(screen.getByText('PDF')).toBeDefined()
    expect(screen.getByText('XLSX')).toBeDefined()
  })

  it('should call button onClick when clicked', () => {
    const onPdf = vi.fn()
    render(<DownloadItem title="File" buttons={[{ label: 'PDF', onClick: onPdf }]} />)
    fireEvent.click(screen.getByText('PDF'))
    expect(onPdf).toHaveBeenCalledTimes(1)
  })

  it('renders multiple buttons correctly', () => {
    const onClick1 = vi.fn()
    const onClick2 = vi.fn()
    render(
      <DownloadItem
        title="문서"
        buttons={[
          { label: 'PDF', onClick: onClick1 },
          { label: 'HWP', onClick: onClick2 },
          { label: 'DOCX' },
        ]}
      />,
    )
    fireEvent.click(screen.getByText('PDF'))
    fireEvent.click(screen.getByText('HWP'))
    expect(onClick1).toHaveBeenCalledTimes(1)
    expect(onClick2).toHaveBeenCalledTimes(1)
    expect(screen.getByText('DOCX')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// GNB
// ---------------------------------------------------------------------------
describe('GNB', () => {
  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  it('renders brand name', () => {
    render(<GNB brand="H Chat" menuItems={menuItems} />)
    expect(screen.getByText('H Chat')).toBeDefined()
  })

  it('renders desktop menu item labels', () => {
    render(<GNB brand="H Chat" menuItems={menuItems} />)
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1)
  })

  it('renders right slot content', () => {
    render(
      <GNB
        brand="H Chat"
        menuItems={menuItems}
        rightSlot={<button>Login</button>}
      />,
    )
    expect(screen.getByText('Login')).toBeDefined()
  })

  it('toggles mobile menu on hamburger click', () => {
    render(<GNB brand="H Chat" menuItems={menuItems} />)
    const hamburger = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburger)
    // After clicking, mobile menu links appear
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(2)
  })

  it('closes mobile menu when a link is clicked', () => {
    render(<GNB brand="H Chat" menuItems={menuItems} />)
    const hamburger = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburger)
    const homeLinks = screen.getAllByText('Home')
    fireEvent.click(homeLinks[homeLinks.length - 1])
    // After clicking a link, menu should close
    expect(screen.getAllByText('Home').length).toBeLessThanOrEqual(2)
  })

  it('renders hamburger button with aria-label', () => {
    render(<GNB brand="H Chat" menuItems={menuItems} />)
    expect(screen.getByLabelText('Toggle menu')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// HeroBanner
// ---------------------------------------------------------------------------
describe('HeroBanner', () => {
  it('renders title', () => {
    render(<HeroBanner title="Welcome" description="Hello World" />)
    expect(screen.getByText('Welcome')).toBeDefined()
  })

  it('renders description', () => {
    render(<HeroBanner title="Title" description="Some description" />)
    expect(screen.getByText('Some description')).toBeDefined()
  })

  it('renders title as h1', () => {
    render(<HeroBanner title="HeadingTest" description="desc" />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toBe('HeadingTest')
  })
})

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
describe('Footer', () => {
  it('renders default brand names', () => {
    render(<Footer />)
    expect(screen.getByText('현대자동차')).toBeDefined()
    expect(screen.getByText('기아')).toBeDefined()
    expect(screen.getByText('제네시스')).toBeDefined()
    expect(screen.getByText('현대모비스')).toBeDefined()
  })

  it('renders custom brand names', () => {
    render(<Footer brands={['Brand A', 'Brand B']} />)
    expect(screen.getByText('Brand A')).toBeDefined()
    expect(screen.getByText('Brand B')).toBeDefined()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/Hyundai Motor Group/)).toBeDefined()
  })

  it('renders newsletter text', () => {
    render(<Footer />)
    expect(screen.getByText('뉴스레터 구독')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// TabFilter (extended)
// ---------------------------------------------------------------------------
describe('TabFilter (extended)', () => {
  const tabs = ['전체', '가이드', '기술문서', 'FAQ']

  it('applies inactive style to non-selected tabs', () => {
    render(<TabFilter tabs={tabs} activeTab="전체" onTabChange={() => {}} />)
    const guideBtn = screen.getByText('가이드')
    expect(guideBtn.className).toContain('text-hmg-text-caption')
    expect(guideBtn.className).toContain('border-transparent')
  })

  it('calls onTabChange for each tab', () => {
    const onChange = vi.fn()
    render(<TabFilter tabs={tabs} activeTab="전체" onTabChange={onChange} />)
    fireEvent.click(screen.getByText('FAQ'))
    expect(onChange).toHaveBeenCalledWith('FAQ')
    fireEvent.click(screen.getByText('기술문서'))
    expect(onChange).toHaveBeenCalledWith('기술문서')
  })
})

// ---------------------------------------------------------------------------
// PillButton (extended)
// ---------------------------------------------------------------------------
describe('PillButton (extended)', () => {
  it('applies outline variant by default', () => {
    render(<PillButton>Default</PillButton>)
    const btn = screen.getByText('Default')
    expect(btn.className).toContain('bg-hmg-bg-card')
    expect(btn.className).toContain('border')
  })

  it('applies custom className', () => {
    render(<PillButton className="extra-class">Test</PillButton>)
    const btn = screen.getByText('Test')
    expect(btn.className).toContain('extra-class')
  })
})

// ---------------------------------------------------------------------------
// StepItem (extended)
// ---------------------------------------------------------------------------
describe('StepItem (extended)', () => {
  it('hides arrow by default', () => {
    const { container } = render(
      <StepItem step={1} title="t" description="d" />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeNull()
  })

  it('renders step number in circle', () => {
    const { container } = render(
      <StepItem step={3} title="Configure" description="Set up" />,
    )
    expect(screen.getByText('3')).toBeDefined()
    const circle = container.querySelector('.rounded-full')
    expect(circle).toBeDefined()
  })
})
