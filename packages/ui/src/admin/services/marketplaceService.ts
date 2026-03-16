/**
 * Marketplace Service — Agent Marketplace management
 *
 * Mock implementation with localStorage persistence.
 * Follows service-layer-gen skill pattern: CRUD + filtering + delay simulation.
 */

import type {
  MarketplaceAgent,
  CreateAgentInput,
  UpdateAgentInput,
  MarketplaceFilters,
} from './marketplaceTypes'

const STORAGE_KEY = 'hchat-marketplace-agents'

const MOCK_AGENTS: MarketplaceAgent[] = [
  {
    id: 'agent-research-01',
    name: 'Deep Research Agent',
    description: '웹 검색과 문서 분석을 결합한 자율형 리서치 에이전트. 복잡한 질문에 대해 다각도 분석 보고서를 생성합니다.',
    category: 'research',
    provider: 'H Chat Official',
    version: '2.1.0',
    rating: 4.7,
    downloads: 12450,
    status: 'published',
    tags: ['research', 'web-search', 'analysis', 'report'],
    pricing: 'freemium',
    monthlyPrice: 9.99,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'agent-coding-01',
    name: 'Code Review Agent',
    description: '코드 품질, 보안 취약점, 성능 이슈를 자동 분석하는 코드 리뷰 에이전트.',
    category: 'coding',
    provider: 'H Chat Official',
    version: '1.5.0',
    rating: 4.5,
    downloads: 8920,
    status: 'published',
    tags: ['code-review', 'security', 'quality'],
    pricing: 'free',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'agent-data-01',
    name: 'Data Pipeline Agent',
    description: 'CSV, Excel, JSON 데이터를 자동 정제하고 시각화 대시보드를 생성하는 데이터 파이프라인 에이전트.',
    category: 'data',
    provider: 'Community',
    version: '1.0.2',
    rating: 4.2,
    downloads: 3560,
    status: 'published',
    tags: ['data', 'visualization', 'ETL', 'dashboard'],
    pricing: 'paid',
    monthlyPrice: 19.99,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'agent-writing-01',
    name: 'Technical Writer Agent',
    description: '기술 문서, API 레퍼런스, 사용자 가이드를 자동 생성하는 기술 문서 작성 에이전트.',
    category: 'writing',
    provider: 'Community',
    version: '0.9.1',
    rating: 3.8,
    downloads: 1240,
    status: 'reviewing',
    tags: ['documentation', 'technical-writing', 'API'],
    pricing: 'free',
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
]

function getStoredAgents(): MarketplaceAgent[] {
  if (typeof window === 'undefined') return MOCK_AGENTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_AGENTS
  } catch {
    return MOCK_AGENTS
  }
}

function saveAgents(agents: MarketplaceAgent[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const randomDelay = () => delay(50 + Math.random() * 150)

function applyFilters(agents: MarketplaceAgent[], filters: MarketplaceFilters): MarketplaceAgent[] {
  let result = [...agents]

  if (filters.category) {
    result = result.filter((a) => a.category === filters.category)
  }
  if (filters.pricing) {
    result = result.filter((a) => a.pricing === filters.pricing)
  }
  if (filters.status) {
    result = result.filter((a) => a.status === filters.status)
  }
  if (filters.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query)),
    )
  }

  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'downloads':
      result.sort((a, b) => b.downloads - a.downloads)
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  return result
}

export async function getMarketplaceAgents(filters?: MarketplaceFilters): Promise<MarketplaceAgent[]> {
  await randomDelay()
  const agents = getStoredAgents()
  return filters ? applyFilters(agents, filters) : agents
}

export async function getMarketplaceAgentById(id: string): Promise<MarketplaceAgent | null> {
  await randomDelay()
  return getStoredAgents().find((a) => a.id === id) ?? null
}

export async function createMarketplaceAgent(input: CreateAgentInput): Promise<MarketplaceAgent> {
  await delay(300)
  const agents = getStoredAgents()
  const newAgent: MarketplaceAgent = {
    ...input,
    id: `agent-${Date.now()}`,
    rating: 0,
    downloads: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveAgents([...agents, newAgent])
  return newAgent
}

export async function updateMarketplaceAgent(
  id: string,
  input: UpdateAgentInput,
): Promise<MarketplaceAgent | null> {
  await randomDelay()
  const agents = getStoredAgents()
  let updated: MarketplaceAgent | null = null

  const newAgents = agents.map((a) => {
    if (a.id !== id) return a
    updated = { ...a, ...input, updatedAt: new Date().toISOString() }
    return updated
  })

  if (updated) saveAgents(newAgents)
  return updated
}

export async function deleteMarketplaceAgent(id: string): Promise<boolean> {
  await randomDelay()
  const agents = getStoredAgents()
  const filtered = agents.filter((a) => a.id !== id)
  if (filtered.length === agents.length) return false
  saveAgents(filtered)
  return true
}

export async function getMarketplaceStats(): Promise<{
  readonly totalAgents: number
  readonly publishedAgents: number
  readonly totalDownloads: number
  readonly averageRating: number
  readonly categoryDistribution: Record<string, number>
}> {
  await randomDelay()
  const agents = getStoredAgents()
  const published = agents.filter((a) => a.status === 'published')

  const categoryDistribution: Record<string, number> = {}
  for (const agent of agents) {
    categoryDistribution[agent.category] = (categoryDistribution[agent.category] ?? 0) + 1
  }

  return {
    totalAgents: agents.length,
    publishedAgents: published.length,
    totalDownloads: agents.reduce((sum, a) => sum + a.downloads, 0),
    averageRating: published.length > 0
      ? Number((published.reduce((sum, a) => sum + a.rating, 0) / published.length).toFixed(1))
      : 0,
    categoryDistribution,
  }
}
