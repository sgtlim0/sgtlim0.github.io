/**
 * AI Agent Marketplace types
 */

export interface AgentReview {
  readonly id: string
  readonly userId: string
  readonly userName: string
  readonly rating: number
  readonly comment: string
  readonly createdAt: string
}

export interface AgentTool {
  readonly id: string
  readonly name: string
  readonly description: string
}

export interface MarketplaceAgent {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly longDescription: string
  readonly author: string
  readonly category: AgentCategory
  readonly icon: string
  readonly iconColor: string
  readonly version: string
  readonly rating: number
  readonly reviewCount: number
  readonly installs: number
  readonly model: string
  readonly tools: AgentTool[]
  readonly systemPrompt: string
  readonly changelog: string[]
  readonly tags: string[]
  readonly createdAt: string
  readonly updatedAt: string
}

export type AgentCategory =
  | 'productivity'
  | 'development'
  | 'writing'
  | 'translation'
  | 'analysis'
  | 'creative'
  | 'education'
  | 'business'

export const AGENT_CATEGORIES: Record<AgentCategory, { label: string; icon: string }> = {
  productivity: { label: '생산성', icon: '⚡' },
  development: { label: '개발', icon: '💻' },
  writing: { label: '글쓰기', icon: '✏️' },
  translation: { label: '번역', icon: '🌐' },
  analysis: { label: '분석', icon: '📊' },
  creative: { label: '크리에이티브', icon: '🎨' },
  education: { label: '교육', icon: '📚' },
  business: { label: '비즈니스', icon: '💼' },
}

export type AgentSortBy = 'popular' | 'rating' | 'newest' | 'name'

export interface AgentFilter {
  category?: AgentCategory
  search?: string
  sortBy?: AgentSortBy
  installedOnly?: boolean
}
