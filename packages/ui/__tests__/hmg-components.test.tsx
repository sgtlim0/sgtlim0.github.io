import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TabFilter from '../src/hmg/TabFilter'
import HmgStatCard from '../src/hmg/HmgStatCard'
import PillButton from '../src/hmg/PillButton'
import StepItem from '../src/hmg/StepItem'
import DownloadItem from '../src/hmg/DownloadItem'

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
})
