/**
 * Prompt Version Management types
 */

export interface PromptVersion {
  readonly id: string
  readonly promptId: string
  readonly version: number
  readonly content: string
  readonly systemPrompt: string
  readonly model: string
  readonly temperature: number
  readonly maxTokens: number
  readonly createdAt: string
  readonly createdBy: string
  readonly changeNote: string
}

export interface PromptWithVersions {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string
  readonly currentVersion: number
  readonly activeVersion: number
  readonly versions: PromptVersion[]
  readonly createdAt: string
  readonly updatedAt: string
  readonly sharedWith: string[]
  readonly tags: string[]
}

export interface ABTest {
  readonly id: string
  readonly promptId: string
  readonly name: string
  readonly versionA: number
  readonly versionB: number
  readonly trafficSplitA: number
  readonly status: 'draft' | 'running' | 'completed' | 'cancelled'
  readonly startDate: string
  readonly endDate?: string
  readonly results?: ABTestResult
}

export interface ABTestResult {
  readonly versionAMetrics: PromptMetrics
  readonly versionBMetrics: PromptMetrics
  readonly winner: 'A' | 'B' | 'tie'
  readonly confidence: number
}

export interface PromptMetrics {
  readonly avgResponseTime: number
  readonly avgTokens: number
  readonly avgRating: number
  readonly totalRequests: number
  readonly errorRate: number
}

export interface PromptDiff {
  readonly type: 'added' | 'removed' | 'unchanged'
  readonly content: string
}
