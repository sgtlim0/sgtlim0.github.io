/**
 * AI Model Benchmark Service
 */

import type {
  BenchmarkTest,
  BenchmarkResult,
  BenchmarkRun,
  ModelRecommendation,
  BenchmarkHistory,
} from './benchmarkTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const BENCHMARK_TESTS: BenchmarkTest[] = [
  {
    id: 'test-quality',
    name: '응답 품질',
    description: '정확성, 완전성, 일관성 평가',
    category: 'quality',
    prompts: ['기술 문서를 요약하세요', '복잡한 질문에 답하세요'],
  },
  {
    id: 'test-speed',
    name: '응답 속도',
    description: '첫 토큰 시간, 전체 응답 시간',
    category: 'speed',
    prompts: ['간단한 인사에 답하세요', '긴 문서를 분석하세요'],
  },
  {
    id: 'test-cost',
    name: '비용 효율',
    description: '토큰당 비용, 품질 대비 가격',
    category: 'cost',
    prompts: ['비용 최적화된 응답을 생성하세요'],
  },
  {
    id: 'test-safety',
    name: '안전성',
    description: '유해 콘텐츠 필터링, 편향 검사',
    category: 'safety',
    prompts: ['민감한 주제에 대해 답하세요'],
  },
]

const MOCK_RESULTS: BenchmarkResult[] = [
  {
    modelId: 'gpt-4o',
    modelName: 'GPT-4o',
    provider: 'OpenAI',
    scores: { quality: 92, speed: 85, cost: 70, safety: 95 },
    avgResponseTime: 1.2,
    avgTokens: 450,
    costPer1kTokens: 15,
    overallScore: 88,
    rank: 1,
  },
  {
    modelId: 'claude-3.5-sonnet',
    modelName: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    scores: { quality: 94, speed: 80, cost: 65, safety: 97 },
    avgResponseTime: 1.5,
    avgTokens: 520,
    costPer1kTokens: 18,
    overallScore: 87,
    rank: 2,
  },
  {
    modelId: 'gemini-pro',
    modelName: 'Gemini Pro',
    provider: 'Google',
    scores: { quality: 88, speed: 90, cost: 80, safety: 90 },
    avgResponseTime: 0.9,
    avgTokens: 380,
    costPer1kTokens: 10,
    overallScore: 86,
    rank: 3,
  },
  {
    modelId: 'gpt-4o-mini',
    modelName: 'GPT-4o Mini',
    provider: 'OpenAI',
    scores: { quality: 82, speed: 95, cost: 95, safety: 88 },
    avgResponseTime: 0.6,
    avgTokens: 300,
    costPer1kTokens: 3,
    overallScore: 85,
    rank: 4,
  },
  {
    modelId: 'claude-3.5-haiku',
    modelName: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    scores: { quality: 80, speed: 96, cost: 92, safety: 90 },
    avgResponseTime: 0.5,
    avgTokens: 280,
    costPer1kTokens: 2.5,
    overallScore: 84,
    rank: 5,
  },
  {
    modelId: 'mistral-large',
    modelName: 'Mistral Large',
    provider: 'Mistral',
    scores: { quality: 85, speed: 82, cost: 75, safety: 82 },
    avgResponseTime: 1.3,
    avgTokens: 400,
    costPer1kTokens: 12,
    overallScore: 81,
    rank: 6,
  },
]

const MOCK_RECOMMENDATIONS: ModelRecommendation[] = [
  {
    useCase: '일반 채팅',
    recommendedModel: 'GPT-4o Mini',
    reason: '빠른 응답과 낮은 비용으로 일반 대화에 최적',
    alternativeModels: ['Claude 3.5 Haiku', 'Gemini Pro'],
    confidence: 0.92,
  },
  {
    useCase: '복잡한 분석',
    recommendedModel: 'Claude 3.5 Sonnet',
    reason: '최고 품질의 추론과 분석 능력',
    alternativeModels: ['GPT-4o', 'Gemini Pro'],
    confidence: 0.88,
  },
  {
    useCase: '코드 리뷰',
    recommendedModel: 'Claude 3.5 Sonnet',
    reason: '코드 이해력과 보안 감지 최우수',
    alternativeModels: ['GPT-4o', 'Mistral Large'],
    confidence: 0.9,
  },
  {
    useCase: '대량 번역',
    recommendedModel: 'GPT-4o Mini',
    reason: '비용 효율적인 다국어 번역',
    alternativeModels: ['Claude 3.5 Haiku', 'Gemini Pro'],
    confidence: 0.85,
  },
  {
    useCase: '문서 요약',
    recommendedModel: 'GPT-4o',
    reason: '긴 컨텍스트 처리와 정확한 요약',
    alternativeModels: ['Claude 3.5 Sonnet', 'Gemini Pro'],
    confidence: 0.87,
  },
]

export function getBenchmarkTests(): BenchmarkTest[] {
  return BENCHMARK_TESTS
}

export async function getLatestResults(): Promise<BenchmarkResult[]> {
  await delay(200)
  return MOCK_RESULTS
}

export async function getResultByModel(modelId: string): Promise<BenchmarkResult | null> {
  await delay(100)
  return MOCK_RESULTS.find((r) => r.modelId === modelId) ?? null
}

export async function runBenchmark(modelIds: string[], testIds: string[]): Promise<BenchmarkRun> {
  await delay(500)
  return {
    id: `run-${Date.now()}`,
    name: `벤치마크 ${new Date().toLocaleDateString('ko-KR')}`,
    models: modelIds,
    tests: testIds,
    status: 'running',
    progress: 0,
    results: [],
    startedAt: new Date().toISOString(),
  }
}

export async function getBenchmarkHistory(
  modelId: string,
  days: number = 30,
): Promise<BenchmarkHistory[]> {
  await delay(200)
  const result: BenchmarkHistory[] = []
  const now = new Date()
  const baseScore = MOCK_RESULTS.find((r) => r.modelId === modelId)?.overallScore ?? 80

  for (let i = days; i >= 0; i -= 7) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      modelId,
      overallScore: baseScore + (Math.random() - 0.5) * 4,
    })
  }
  return result
}

export async function getRecommendations(): Promise<ModelRecommendation[]> {
  await delay(250)
  return MOCK_RECOMMENDATIONS
}

export function compareModels(modelIds: string[]): BenchmarkResult[] {
  return MOCK_RESULTS.filter((r) => modelIds.includes(r.modelId))
}
