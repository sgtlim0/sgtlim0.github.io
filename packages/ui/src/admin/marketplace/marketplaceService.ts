/**
 * Marketplace Service — AI Agent marketplace operations
 */

import type { MarketplaceAgent, AgentFilter, AgentReview } from './marketplaceTypes'
import { MOCK_AGENTS } from './marketplaceMockData'

const INSTALLED_KEY = 'hchat-installed-agents'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getInstalledIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(INSTALLED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveInstalledIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(ids))
}

export async function getAgents(
  filter?: AgentFilter,
): Promise<{ agents: MarketplaceAgent[]; total: number }> {
  await delay(200)
  let agents = [...MOCK_AGENTS]

  if (filter?.category) {
    agents = agents.filter((a) => a.category === filter.category)
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase()
    agents = agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  if (filter?.installedOnly) {
    const installed = getInstalledIds()
    agents = agents.filter((a) => installed.includes(a.id))
  }

  switch (filter?.sortBy) {
    case 'rating':
      agents.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      agents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'name':
      agents.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'popular':
    default:
      agents.sort((a, b) => b.installs - a.installs)
  }

  return { agents, total: agents.length }
}

export async function getAgentById(id: string): Promise<MarketplaceAgent | null> {
  await delay(100)
  return MOCK_AGENTS.find((a) => a.id === id) ?? null
}

export async function installAgent(id: string): Promise<boolean> {
  await delay(300)
  const ids = getInstalledIds()
  if (ids.includes(id)) return false
  saveInstalledIds([...ids, id])
  return true
}

export async function uninstallAgent(id: string): Promise<boolean> {
  await delay(200)
  const ids = getInstalledIds()
  const filtered = ids.filter((i) => i !== id)
  if (filtered.length === ids.length) return false
  saveInstalledIds(filtered)
  return true
}

export function isInstalled(id: string): boolean {
  return getInstalledIds().includes(id)
}

export async function getAgentReviews(agentId: string): Promise<AgentReview[]> {
  await delay(150)
  return [
    {
      id: 'r1',
      userId: 'u1',
      userName: '홍길동',
      rating: 5,
      comment: '정말 유용한 에이전트입니다!',
      createdAt: '2026-03-01',
    },
    {
      id: 'r2',
      userId: 'u2',
      userName: '김철수',
      rating: 4,
      comment: '번역 품질이 좋아요.',
      createdAt: '2026-02-28',
    },
    {
      id: 'r3',
      userId: 'u3',
      userName: '이영희',
      rating: 5,
      comment: '업무 시간이 크게 줄었습니다.',
      createdAt: '2026-02-25',
    },
  ]
}
