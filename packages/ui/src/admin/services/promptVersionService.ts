/**
 * Prompt Version Service — version history, A/B testing, diff
 */

import type { PromptWithVersions, PromptVersion, ABTest, PromptDiff } from './promptVersionTypes'

const STORAGE_KEY = 'hchat-prompt-versions'
const AB_STORAGE_KEY = 'hchat-ab-tests'
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_PROMPTS: PromptWithVersions[] = [
  {
    id: 'prompt-translate',
    name: '번역 프롬프트',
    description: '다국어 번역 시스템 프롬프트',
    category: '번역',
    currentVersion: 3,
    activeVersion: 2,
    versions: [
      {
        id: 'pv-1',
        promptId: 'prompt-translate',
        version: 1,
        content: '다음 텍스트를 번역해주세요.',
        systemPrompt: 'You are a translator.',
        model: 'GPT-4o-mini',
        temperature: 0.3,
        maxTokens: 2000,
        createdAt: '2026-01-10',
        createdBy: '홍길동',
        changeNote: '초기 버전',
      },
      {
        id: 'pv-2',
        promptId: 'prompt-translate',
        version: 2,
        content: '다음 텍스트를 정확하고 자연스럽게 번역해주세요. 전문 용어는 원어를 병기하세요.',
        systemPrompt: 'You are a professional translator specializing in technical documents.',
        model: 'GPT-4o',
        temperature: 0.2,
        maxTokens: 4000,
        createdAt: '2026-02-05',
        createdBy: '홍길동',
        changeNote: '전문 용어 처리 개선',
      },
      {
        id: 'pv-3',
        promptId: 'prompt-translate',
        version: 3,
        content:
          '다음 텍스트를 정확하고 자연스럽게 번역해주세요. 전문 용어는 원어를 병기하고, 문화적 맥락을 고려하세요.',
        systemPrompt:
          'You are a professional translator specializing in technical documents for Hyundai Motor Group.',
        model: 'GPT-4o',
        temperature: 0.2,
        maxTokens: 4000,
        createdAt: '2026-03-01',
        createdBy: '김철수',
        changeNote: '문화적 맥락 추가',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-01',
    sharedWith: ['개발팀', '마케팅팀'],
    tags: ['번역', '다국어', '기술문서'],
  },
  {
    id: 'prompt-summary',
    name: '문서 요약 프롬프트',
    description: '긴 문서를 핵심 요점으로 정리',
    category: '요약',
    currentVersion: 2,
    activeVersion: 2,
    versions: [
      {
        id: 'pv-4',
        promptId: 'prompt-summary',
        version: 1,
        content: '다음 문서를 요약해주세요.',
        systemPrompt: 'You are a document summarizer.',
        model: 'GPT-4o-mini',
        temperature: 0.5,
        maxTokens: 1000,
        createdAt: '2026-01-20',
        createdBy: '이영희',
        changeNote: '초기 버전',
      },
      {
        id: 'pv-5',
        promptId: 'prompt-summary',
        version: 2,
        content: '다음 문서를 3가지 핵심 포인트로 요약하고, 액션 아이템을 추출해주세요.',
        systemPrompt:
          'You are an expert document analyst. Provide structured summaries with key points and action items.',
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2000,
        createdAt: '2026-02-15',
        createdBy: '이영희',
        changeNote: '구조화된 요약 + 액션 아이템',
      },
    ],
    createdAt: '2026-01-20',
    updatedAt: '2026-02-15',
    sharedWith: ['전체'],
    tags: ['요약', '문서', '생산성'],
  },
  {
    id: 'prompt-code-review',
    name: '코드 리뷰 프롬프트',
    description: '코드 품질, 보안, 성능 검토',
    category: '개발',
    currentVersion: 2,
    activeVersion: 2,
    versions: [
      {
        id: 'pv-6',
        promptId: 'prompt-code-review',
        version: 1,
        content: '다음 코드를 리뷰해주세요.',
        systemPrompt: 'You are a code reviewer.',
        model: 'Claude 3.5 Sonnet',
        temperature: 0.1,
        maxTokens: 3000,
        createdAt: '2026-02-01',
        createdBy: '박개발',
        changeNote: '초기 버전',
      },
      {
        id: 'pv-7',
        promptId: 'prompt-code-review',
        version: 2,
        content:
          '다음 코드를 보안, 성능, 가독성 관점에서 리뷰해주세요. OWASP Top 10 취약점도 확인해주세요.',
        systemPrompt:
          'You are a senior software engineer and security expert. Review code for bugs, security vulnerabilities, performance issues, and code quality.',
        model: 'Claude 3.5 Sonnet',
        temperature: 0.1,
        maxTokens: 4000,
        createdAt: '2026-03-01',
        createdBy: '박개발',
        changeNote: 'OWASP 보안 검사 추가',
      },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-03-01',
    sharedWith: ['개발팀'],
    tags: ['코드리뷰', '보안', '품질'],
  },
]

const MOCK_AB_TESTS: ABTest[] = [
  {
    id: 'ab-1',
    promptId: 'prompt-translate',
    name: '번역 v2 vs v3 비교',
    versionA: 2,
    versionB: 3,
    trafficSplitA: 50,
    status: 'completed',
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    results: {
      versionAMetrics: {
        avgResponseTime: 1200,
        avgTokens: 450,
        avgRating: 4.5,
        totalRequests: 500,
        errorRate: 0.02,
      },
      versionBMetrics: {
        avgResponseTime: 1350,
        avgTokens: 520,
        avgRating: 4.7,
        totalRequests: 500,
        errorRate: 0.01,
      },
      winner: 'B',
      confidence: 92,
    },
  },
  {
    id: 'ab-2',
    promptId: 'prompt-summary',
    name: '요약 모델 비교',
    versionA: 1,
    versionB: 2,
    trafficSplitA: 50,
    status: 'running',
    startDate: '2026-03-05',
  },
]

function getStoredPrompts(): PromptWithVersions[] {
  if (typeof window === 'undefined') return MOCK_PROMPTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : MOCK_PROMPTS
  } catch {
    return MOCK_PROMPTS
  }
}

function savePrompts(prompts: PromptWithVersions[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
}

export async function getPromptVersions(): Promise<PromptWithVersions[]> {
  await delay(200)
  return getStoredPrompts()
}

export async function getPromptById(id: string): Promise<PromptWithVersions | null> {
  await delay(100)
  return getStoredPrompts().find((p) => p.id === id) ?? null
}

export async function createVersion(
  promptId: string,
  content: string,
  systemPrompt: string,
  model: string,
  changeNote: string,
): Promise<PromptVersion | null> {
  await delay(300)
  const prompts = getStoredPrompts()
  const prompt = prompts.find((p) => p.id === promptId)
  if (!prompt) return null

  const newVersion: PromptVersion = {
    id: `pv-${Date.now()}`,
    promptId,
    version: prompt.currentVersion + 1,
    content,
    systemPrompt,
    model,
    temperature: 0.3,
    maxTokens: 4000,
    createdAt: new Date().toISOString(),
    createdBy: '현재 사용자',
    changeNote,
  }

  const updated = prompts.map((p) =>
    p.id === promptId
      ? {
          ...p,
          currentVersion: newVersion.version,
          versions: [...p.versions, newVersion],
          updatedAt: newVersion.createdAt,
        }
      : p,
  )
  savePrompts(updated)
  return newVersion
}

export async function rollbackToVersion(promptId: string, version: number): Promise<boolean> {
  await delay(200)
  const prompts = getStoredPrompts()
  let found = false

  const updated = prompts.map((p) => {
    if (p.id === promptId && p.versions.some((v) => v.version === version)) {
      found = true
      return { ...p, activeVersion: version, updatedAt: new Date().toISOString() }
    }
    return p
  })

  if (found) savePrompts(updated)
  return found
}

export function diffVersions(versionA: string, versionB: string): PromptDiff[] {
  const linesA = versionA.split('\n')
  const linesB = versionB.split('\n')
  const diffs: PromptDiff[] = []

  const maxLen = Math.max(linesA.length, linesB.length)
  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i]
    const b = linesB[i]

    if (a === b) {
      diffs.push({ type: 'unchanged', content: a ?? '' })
    } else {
      if (a !== undefined) diffs.push({ type: 'removed', content: a })
      if (b !== undefined) diffs.push({ type: 'added', content: b })
    }
  }

  return diffs
}

export async function getABTests(promptId?: string): Promise<ABTest[]> {
  await delay(150)
  if (typeof window === 'undefined')
    return promptId ? MOCK_AB_TESTS.filter((t) => t.promptId === promptId) : MOCK_AB_TESTS
  try {
    const stored = localStorage.getItem(AB_STORAGE_KEY)
    const tests: ABTest[] = stored ? JSON.parse(stored) : MOCK_AB_TESTS
    return promptId ? tests.filter((t) => t.promptId === promptId) : tests
  } catch {
    return MOCK_AB_TESTS
  }
}

export async function createABTest(
  test: Omit<ABTest, 'id' | 'status' | 'startDate'>,
): Promise<ABTest> {
  await delay(300)
  const newTest: ABTest = {
    ...test,
    id: `ab-${Date.now()}`,
    status: 'draft',
    startDate: new Date().toISOString(),
  }
  return newTest
}
