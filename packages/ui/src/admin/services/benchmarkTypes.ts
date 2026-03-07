/**
 * AI Model Benchmark types
 */

export interface BenchmarkTest {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: 'quality' | 'speed' | 'cost' | 'safety'
  readonly prompts: string[]
}

export interface BenchmarkResult {
  readonly modelId: string
  readonly modelName: string
  readonly provider: string
  readonly scores: Record<string, number>
  readonly avgResponseTime: number
  readonly avgTokens: number
  readonly costPer1kTokens: number
  readonly overallScore: number
  readonly rank: number
}

export interface BenchmarkRun {
  readonly id: string
  readonly name: string
  readonly models: string[]
  readonly tests: string[]
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly progress: number
  readonly results: BenchmarkResult[]
  readonly startedAt: string
  readonly completedAt?: string
}

export interface ModelRecommendation {
  readonly useCase: string
  readonly recommendedModel: string
  readonly reason: string
  readonly alternativeModels: string[]
  readonly confidence: number
}

export interface BenchmarkHistory {
  readonly date: string
  readonly modelId: string
  readonly overallScore: number
}
