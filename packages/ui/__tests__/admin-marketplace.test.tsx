import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AgentMarketCard from '../src/admin/marketplace/AgentMarketCard'
import AgentMarketGrid from '../src/admin/marketplace/AgentMarketGrid'
import type { MarketplaceAgent } from '../src/admin/marketplace/marketplaceTypes'

const makeAgent = (overrides: Partial<MarketplaceAgent> = {}): MarketplaceAgent => ({
  id: 'agent-1',
  name: 'Code Reviewer',
  description: '코드 리뷰를 자동으로 수행합니다.',
  longDescription: 'AI 기반 코드 리뷰 에이전트',
  author: 'H Chat Team',
  category: 'development',
  icon: '🔍',
  iconColor: '#3b82f6',
  version: '1.0.0',
  rating: 4.5,
  reviewCount: 120,
  installs: 3500,
  model: 'GPT-4o',
  tools: [{ id: 't1', name: 'Lint', description: 'Linting tool' }],
  systemPrompt: 'You are a code reviewer.',
  changelog: ['v1.0.0 Initial release'],
  tags: ['code', 'review'],
  createdAt: '2026-01-01',
  updatedAt: '2026-03-01',
  ...overrides,
})

describe('AgentMarketCard', () => {
  it('should render agent name', () => {
    const onInstall = vi.fn()
    const onDetail = vi.fn()
    render(<AgentMarketCard agent={makeAgent()} onInstall={onInstall} onDetail={onDetail} />)
    expect(screen.getByText('Code Reviewer')).toBeDefined()
  })

  it('should render agent description', () => {
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('코드 리뷰를 자동으로 수행합니다.')).toBeDefined()
  })

  it('should render author', () => {
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('H Chat Team')).toBeDefined()
  })

  it('should render star rating', () => {
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('4.5')).toBeDefined()
  })

  it('should render install count', () => {
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText(/3,500/)).toBeDefined()
  })

  it('should render model badge', () => {
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('GPT-4o')).toBeDefined()
  })

  it('should show install button when not installed', () => {
    render(
      <AgentMarketCard agent={makeAgent()} installed={false} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('설치')).toBeDefined()
  })

  it('should show installed label when installed', () => {
    render(
      <AgentMarketCard agent={makeAgent()} installed={true} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('설치됨')).toBeDefined()
  })

  it('should call onInstall with agent id', () => {
    const onInstall = vi.fn()
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={onInstall} onDetail={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('설치'))
    expect(onInstall).toHaveBeenCalledWith('agent-1')
  })

  it('should call onDetail when name clicked', () => {
    const onDetail = vi.fn()
    render(
      <AgentMarketCard agent={makeAgent()} onInstall={vi.fn()} onDetail={onDetail} />,
    )
    fireEvent.click(screen.getByText('Code Reviewer'))
    expect(onDetail).toHaveBeenCalledWith('agent-1')
  })

  it('should disable install button when installed', () => {
    render(
      <AgentMarketCard agent={makeAgent()} installed={true} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const btn = screen.getByText('설치됨')
    expect(btn.hasAttribute('disabled') || (btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('should render half star for rating like 3.5', () => {
    const agent = makeAgent({ rating: 3.5 })
    render(
      <AgentMarketCard agent={agent} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('3.5')).toBeDefined()
  })
})

describe('AgentMarketGrid', () => {
  const agents = [
    makeAgent({ id: 'a1', name: 'Alpha Agent', category: 'development', rating: 4.5, installs: 3000, createdAt: '2026-01-01' }),
    makeAgent({ id: 'a2', name: 'Beta Agent', category: 'writing', rating: 3.8, installs: 5000, createdAt: '2026-02-01' }),
    makeAgent({ id: 'a3', name: 'Gamma Agent', category: 'productivity', rating: 4.9, installs: 1000, createdAt: '2026-03-01' }),
  ]

  it('should render all agents', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText('Alpha Agent')).toBeDefined()
    expect(screen.getByText('Beta Agent')).toBeDefined()
    expect(screen.getByText('Gamma Agent')).toBeDefined()
  })

  it('should display total agent count', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={['a1']} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    expect(screen.getByText(/3개 에이전트/)).toBeDefined()
    expect(screen.getByText(/1개 설치됨/)).toBeDefined()
  })

  it('should filter agents by search', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const input = screen.getByPlaceholderText('에이전트 검색...')
    fireEvent.change(input, { target: { value: 'Beta' } })
    expect(screen.getByText('Beta Agent')).toBeDefined()
    expect(screen.queryByText('Alpha Agent')).toBeNull()
  })

  it('should filter agents by category', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    // Click the development category filter button (contains icon + label)
    const filterButtons = screen.getAllByRole('button')
    const devBtn = filterButtons.find((btn) => btn.textContent?.includes('개발') && btn.classList.contains('rounded-full'))
    expect(devBtn).toBeDefined()
    fireEvent.click(devBtn!)
    expect(screen.getByText('Alpha Agent')).toBeDefined()
    expect(screen.queryByText('Beta Agent')).toBeNull()
  })

  it('should show empty state when no results', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const input = screen.getByPlaceholderText('에이전트 검색...')
    fireEvent.change(input, { target: { value: 'zzznonexistent' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeDefined()
  })

  it('should sort by rating', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const sortSelect = screen.getByLabelText('정렬')
    fireEvent.change(sortSelect, { target: { value: 'rating' } })
    // Should still show all three agents, just sorted differently
    expect(screen.getByText('Alpha Agent')).toBeDefined()
    expect(screen.getByText('Gamma Agent')).toBeDefined()
  })

  it('should sort by name', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const sortSelect = screen.getByLabelText('정렬')
    fireEvent.change(sortSelect, { target: { value: 'name' } })
    expect(screen.getByText('Alpha Agent')).toBeDefined()
  })

  it('should sort by newest', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    const sortSelect = screen.getByLabelText('정렬')
    fireEvent.change(sortSelect, { target: { value: 'newest' } })
    expect(screen.getByText('Gamma Agent')).toBeDefined()
  })

  it('should reset to all when clicking 전체 filter', () => {
    render(
      <AgentMarketGrid agents={agents} installedIds={[]} onInstall={vi.fn()} onDetail={vi.fn()} />,
    )
    // First filter by category
    const filterButtons = screen.getAllByRole('button')
    const devBtn = filterButtons.find((btn) => btn.textContent?.includes('개발') && btn.classList.contains('rounded-full'))
    fireEvent.click(devBtn!)
    expect(screen.queryByText('Beta Agent')).toBeNull()
    // Then reset
    fireEvent.click(screen.getByText('전체'))
    expect(screen.getByText('Beta Agent')).toBeDefined()
  })
})
