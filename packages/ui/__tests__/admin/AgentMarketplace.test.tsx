import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentMarketplace } from '../../src/admin/AgentMarketplace'

// Mock the service hooks
vi.mock('../../src/admin/services/marketplaceHooks', () => ({
  useMarketplaceAgents: vi.fn(() => ({
    agents: [
      {
        id: 'agent-1',
        name: 'Test Agent',
        description: 'A test agent for unit testing',
        category: 'research',
        provider: 'Test Provider',
        version: '1.0.0',
        rating: 4.5,
        downloads: 1000,
        status: 'published',
        tags: ['test', 'research'],
        pricing: 'free',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    refresh: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    stats: { total: 1, published: 1, avgRating: 4.5 },
  })),
  useMarketplaceStats: vi.fn(() => ({
    stats: {
      totalAgents: 4,
      publishedAgents: 3,
      totalDownloads: 26170,
      averageRating: 4.5,
      categoryDistribution: { research: 1, coding: 1, data: 1, writing: 1 },
    },
    loading: false,
    refresh: vi.fn(),
  })),
}))

describe('AgentMarketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('페이지 제목을 렌더링한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByText('에이전트 마켓플레이스')).toBeInTheDocument()
  })

  it('에이전트 카드를 렌더링한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('Test Provider · v1.0.0')).toBeInTheDocument()
  })

  it('통계 바를 렌더링한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByText('전체 에이전트')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('26,170')).toBeInTheDocument()
  })

  it('등록 버튼이 존재한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByText('+ 에이전트 등록')).toBeInTheDocument()
  })

  it('검색 입력이 동작한다', async () => {
    const user = userEvent.setup()
    render(<AgentMarketplace />)

    const searchInput = screen.getByPlaceholderText('에이전트 검색...')
    await user.type(searchInput, 'Research')

    expect(searchInput).toHaveValue('Research')
  })

  it('필터 셀렉트가 존재한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByLabelText('카테고리 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('가격 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('정렬')).toBeInTheDocument()
  })

  it('태그를 렌더링한다', () => {
    render(<AgentMarketplace />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('research')).toBeInTheDocument()
  })
})
