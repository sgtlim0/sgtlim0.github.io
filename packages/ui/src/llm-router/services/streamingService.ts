/**
 * Mock SSE Streaming Chat Completion Service
 *
 * Simulates real LLM API streaming behavior with token-by-token delivery,
 * provider-specific latency profiles, and realistic cost calculation.
 */

import type { LLMModel } from '../types'
import type { StreamingOptions, StreamingResult, StreamingController } from './streamingTypes'
import { models as mockModels } from '../mockData'

// ========== Token Estimation ==========

/**
 * Estimate token count from text.
 * English: ~1 token per 4 chars, Korean: ~1 token per 2 chars.
 */
function estimateTokens(text: string): number {
  let koreanChars = 0
  let otherChars = 0

  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x3130 && code <= 0x318f) ||
      (code >= 0x1100 && code <= 0x11ff)
    ) {
      koreanChars += 1
    } else {
      otherChars += 1
    }
  }

  return Math.max(1, Math.ceil(koreanChars / 2) + Math.ceil(otherChars / 4))
}

// ========== Provider Latency Profiles ==========

interface LatencyProfile {
  baseDelayMs: number
  minTokenDelayMs: number
  maxTokenDelayMs: number
}

const PROVIDER_LATENCY: Record<string, LatencyProfile> = {
  OpenAI: { baseDelayMs: 300, minTokenDelayMs: 35, maxTokenDelayMs: 65 },
  Anthropic: { baseDelayMs: 250, minTokenDelayMs: 25, maxTokenDelayMs: 55 },
  Google: { baseDelayMs: 400, minTokenDelayMs: 45, maxTokenDelayMs: 75 },
  Meta: { baseDelayMs: 200, minTokenDelayMs: 30, maxTokenDelayMs: 60 },
  Mistral: { baseDelayMs: 280, minTokenDelayMs: 30, maxTokenDelayMs: 55 },
  Cohere: { baseDelayMs: 350, minTokenDelayMs: 40, maxTokenDelayMs: 70 },
  DeepSeek: { baseDelayMs: 320, minTokenDelayMs: 35, maxTokenDelayMs: 65 },
}

const DEFAULT_LATENCY: LatencyProfile = {
  baseDelayMs: 350,
  minTokenDelayMs: 40,
  maxTokenDelayMs: 70,
}

function getLatencyProfile(provider: string): LatencyProfile {
  return PROVIDER_LATENCY[provider] ?? DEFAULT_LATENCY
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ========== Response Templates ==========

interface ResponseTemplate {
  keywords: string[]
  responses: string[]
}

const RESPONSE_TEMPLATES: readonly ResponseTemplate[] = [
  {
    keywords: [
      '코드',
      'code',
      'function',
      '함수',
      'programming',
      '프로그래밍',
      'javascript',
      'typescript',
      'python',
    ],
    responses: [
      '네, 코드 작성을 도와드리겠습니다.\n\n```typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\nfunction createUser(name: string, email: string): User {\n  return {\n    id: crypto.randomUUID(),\n    name,\n    email,\n    createdAt: new Date(),\n  };\n}\n\nfunction updateUser(user: User, updates: Partial<Omit<User, "id">>): User {\n  return { ...user, ...updates };\n}\n```\n\n이 코드는 불변성 패턴을 따르며, 타입 안전성을 보장합니다. `updateUser` 함수는 원본 객체를 변경하지 않고 새 객체를 반환합니다.',
      '다음은 요청하신 기능의 구현 예시입니다.\n\n```python\nfrom dataclasses import dataclass\nfrom typing import Optional\nimport asyncio\n\n@dataclass(frozen=True)\nclass Task:\n    id: str\n    title: str\n    completed: bool = False\n\nasync def process_tasks(tasks: list[Task]) -> list[Task]:\n    results = []\n    for task in tasks:\n        await asyncio.sleep(0.1)\n        results.append(Task(\n            id=task.id,\n            title=task.title,\n            completed=True\n        ))\n    return results\n```\n\n`frozen=True`로 불변 데이터 클래스를 사용하고, 비동기 처리로 효율성을 높였습니다.',
    ],
  },
  {
    keywords: ['번역', 'translate', 'translation', '영어', 'english', '한국어', 'korean'],
    responses: [
      '번역을 도와드리겠습니다.\n\n기술 문서 번역 시 주요 고려사항:\n\n1. **전문 용어 일관성**: API, SDK, 엔드포인트 등 기술 용어는 원문 유지\n2. **문맥 적합성**: 직역보다 의역으로 자연스러운 한국어 표현 사용\n3. **코드 블록 보존**: 코드 내 주석만 번역, 변수명/함수명은 원문 유지\n4. **톤 일관성**: 격식체(합니다)로 통일\n\n번역할 텍스트를 알려주시면 위 원칙에 따라 번역해드리겠습니다.',
      'I would be happy to help with translation.\n\nHere are some tips for effective Korean-English translation:\n\n- **Context matters**: Korean sentence structure (SOV) differs from English (SVO)\n- **Honorifics**: Korean has multiple levels of formality\n- **Technical terms**: Keep industry-standard terms in English\n- **Nuance**: Some Korean expressions have no direct English equivalent\n\nPlease share the text you would like translated, and I will provide an accurate translation maintaining the original tone and meaning.',
    ],
  },
  {
    keywords: ['요약', 'summary', 'summarize', '정리', '분석', 'analyze', 'analysis'],
    responses: [
      '요청하신 내용을 분석하고 요약하겠습니다.\n\n## 핵심 요약\n\n현재 상황을 다음과 같이 정리할 수 있습니다:\n\n| 구분 | 현황 | 개선 방향 |\n|------|------|----------|\n| 성능 | 응답 시간 평균 1.2초 | 캐싱 도입으로 0.3초 목표 |\n| 비용 | 월 평균 850만원 | 모델 최적화로 30% 절감 |\n| 안정성 | 가용성 99.5% | 이중화로 99.9% 목표 |\n\n### 권장 사항\n\n1. **단기(1-2주)**: 캐시 레이어 도입, 요청 배치 처리\n2. **중기(1-2개월)**: 모델 라우팅 최적화, A/B 테스트 프레임워크\n3. **장기(분기)**: 자체 fine-tuned 모델 도입 검토\n\n추가 분석이 필요한 부분이 있으시면 말씀해주세요.',
      '다음은 요청하신 분석 결과입니다.\n\n## 주요 발견사항\n\n**강점:**\n- 다양한 모델 지원 (86개 AI 모델)\n- 유연한 라우팅 전략\n- 실시간 사용량 모니터링\n\n**개선 기회:**\n- 응답 지연 시간 최적화 가능\n- 비용 효율적인 모델 자동 선택\n- 장애 대응 자동화\n\n## 결론\n\n전반적으로 안정적인 운영 상태이며, 비용 최적화와 자동화 강화를 통해 운영 효율성을 20-30% 개선할 수 있을 것으로 판단됩니다.',
    ],
  },
  {
    keywords: ['안녕', 'hello', 'hi', '반갑', 'help', '도움', '뭐', 'what', 'how', '어떻게'],
    responses: [
      '안녕하세요! 무엇을 도와드릴까요?\n\n저는 다양한 작업을 지원할 수 있습니다:\n\n- **코드 작성 및 리뷰**: 여러 프로그래밍 언어 지원\n- **문서 작성**: 기술 문서, 보고서, 이메일 등\n- **번역**: 한영, 영한 번역\n- **데이터 분석**: 데이터 정리, 시각화 제안\n- **문제 해결**: 디버깅, 아키텍처 설계 조언\n\n구체적으로 어떤 도움이 필요하신지 알려주세요!',
      'Hello! How can I assist you today?\n\nI can help with a variety of tasks:\n\n- **Code generation**: Write, review, and debug code\n- **Content creation**: Technical docs, reports, presentations\n- **Translation**: Korean-English bidirectional\n- **Analysis**: Data interpretation, trend analysis\n- **Problem solving**: Architecture design, optimization strategies\n\nFeel free to describe what you need, and I will do my best to help.',
    ],
  },
  {
    keywords: ['설명', 'explain', '차이', 'difference', '비교', 'compare', 'vs'],
    responses: [
      '좋은 질문입니다. 자세히 설명드리겠습니다.\n\n## 개념 비교\n\n두 접근 방식의 차이점을 정리하면 다음과 같습니다:\n\n### 방식 A: 동기 처리\n- 요청을 순차적으로 처리\n- 구현이 단순하고 디버깅 용이\n- 처리량이 제한적\n\n### 방식 B: 비동기 처리\n- 요청을 병렬로 처리\n- 높은 처리량과 응답성\n- 복잡도가 증가하지만 확장성 우수\n\n### 선택 기준\n\n| 기준 | 동기 | 비동기 |\n|------|------|--------|\n| 복잡도 | 낮음 | 높음 |\n| 처리량 | 낮음 | 높음 |\n| 디버깅 | 쉬움 | 어려움 |\n| 확장성 | 제한적 | 우수 |\n\n프로젝트 요구사항에 따라 적절한 방식을 선택하시면 됩니다.',
      'Let me explain the key differences.\n\n## Comparison Overview\n\n**Approach 1: Monolithic Architecture**\n- Single deployable unit\n- Simpler development and testing\n- Scaling requires replicating entire application\n- Best for: Small teams, early-stage projects\n\n**Approach 2: Microservices Architecture**\n- Independent, loosely coupled services\n- Each service can scale independently\n- Higher operational complexity\n- Best for: Large teams, high-scale applications\n\n**Key Tradeoffs:**\n1. Simplicity vs. Flexibility\n2. Development speed vs. Operational overhead\n3. Consistency vs. Autonomy\n\nThe right choice depends on your team size, scale requirements, and operational maturity.',
    ],
  },
]

/**
 * Select a response template based on the last user message content.
 */
function selectResponse(messages: readonly { role: string; content: string }[]): string {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  const content = lastUserMessage?.content.toLowerCase() ?? ''

  for (const template of RESPONSE_TEMPLATES) {
    const matched = template.keywords.some((keyword) => content.includes(keyword))
    if (matched) {
      const index = Math.floor(Math.random() * template.responses.length)
      return template.responses[index]
    }
  }

  // Default fallback response
  const fallbackResponses = [
    '말씀하신 내용을 이해했습니다. 좀 더 구체적으로 설명해주시면 더 정확한 답변을 드릴 수 있겠습니다.\n\n현재 제가 도움을 드릴 수 있는 영역은 다음과 같습니다:\n\n1. **코드 작성 및 리뷰**\n2. **기술 문서 작성**\n3. **데이터 분석 및 요약**\n4. **번역 (한/영)**\n5. **아키텍처 설계 조언**\n\n어떤 부분에 대해 더 자세히 알고 싶으신가요?',
    'Thank you for your question. Let me provide a comprehensive response.\n\nBased on my understanding, here are the key points to consider:\n\n1. **Clarity**: Define the problem scope clearly before diving into solutions\n2. **Iteration**: Start with a minimal viable approach and iterate\n3. **Validation**: Test assumptions early with real data or feedback\n4. **Documentation**: Keep track of decisions and their rationale\n\nWould you like me to elaborate on any specific aspect? I am here to help with detailed explanations, code examples, or strategic recommendations.',
  ]

  const index = Math.floor(Math.random() * fallbackResponses.length)
  return fallbackResponses[index]
}

// ========== Cost Calculation ==========

/**
 * Calculate estimated cost in KRW based on model pricing and token usage.
 */
function calculateCost(model: LLMModel, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * model.inputPrice
  const outputCost = (outputTokens / 1_000_000) * model.outputPrice
  return Math.round((inputCost + outputCost) * 100) / 100
}

// ========== Token Splitting ==========

/**
 * Split response text into token-like chunks for streaming simulation.
 * Splits on word boundaries and punctuation for realistic delivery.
 */
function splitIntoTokenChunks(text: string): readonly string[] {
  const chunks: string[] = []
  const pattern = /(\s+|[^\s\uAC00-\uD7AF]+|[\uAC00-\uD7AF]{1,2}|[.,!?;:(){}[\]"'`])/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    chunks.push(match[0])
  }

  // Ensure we captured everything; fallback to character-level split
  if (chunks.join('') !== text) {
    return text.split('').reduce<string[]>((acc, char, i) => {
      if (i % 3 === 0) {
        return [...acc, char]
      }
      const last = acc[acc.length - 1]
      return [...acc.slice(0, -1), last + char]
    }, [])
  }

  return chunks
}

// ========== Main Streaming Function ==========

/**
 * Stream a mock chat completion, delivering tokens one at a time via callbacks.
 *
 * @param options - Streaming configuration including model, messages, and callbacks
 * @returns A controller with an abort method to cancel the stream
 */
export function streamChatCompletion(options: StreamingOptions): StreamingController {
  const { model: modelId, messages, maxTokens = 2048, onToken, onComplete, onError } = options

  let aborted = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const abort = (): void => {
    aborted = true
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const controller: StreamingController = { abort }

  // Look up model from mock data
  const modelData = mockModels.find((m) => m.id === modelId)

  if (!modelData) {
    const error = new Error(`Model not found: ${modelId}`)
    if (onError) {
      // Defer error callback to next tick for consistent async behavior
      timeoutId = setTimeout(() => {
        if (!aborted) {
          onError(error)
        }
      }, 0)
    }
    return controller
  }

  const latency = getLatencyProfile(modelData.provider)
  const fullResponse = selectResponse(messages)
  const chunks = splitIntoTokenChunks(fullResponse)

  // Calculate input tokens from all messages
  const inputText = messages.map((m) => m.content).join(' ')
  const inputTokens = estimateTokens(inputText)

  // Respect maxTokens by limiting output
  const maxOutputChunks = Math.min(chunks.length, maxTokens)

  const startTime = Date.now()
  let emittedContent = ''
  let chunkIndex = 0

  const emitNextChunk = (): void => {
    if (aborted) {
      // Emit partial result on abort
      const outputTokens = estimateTokens(emittedContent)
      const result: StreamingResult = {
        content: emittedContent,
        model: modelId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        responseTimeMs: Date.now() - startTime,
        estimatedCostKRW: calculateCost(modelData, inputTokens, outputTokens),
        finishReason: 'stop',
      }
      if (onComplete) {
        onComplete(result)
      }
      return
    }

    if (chunkIndex >= maxOutputChunks) {
      // Streaming complete
      const outputTokens = estimateTokens(emittedContent)
      const finishReason = chunkIndex < chunks.length ? 'length' : 'stop'
      const result: StreamingResult = {
        content: emittedContent,
        model: modelId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        responseTimeMs: Date.now() - startTime,
        estimatedCostKRW: calculateCost(modelData, inputTokens, outputTokens),
        finishReason,
      }
      if (onComplete) {
        onComplete(result)
      }
      return
    }

    const chunk = chunks[chunkIndex]
    emittedContent = emittedContent + chunk
    chunkIndex += 1

    if (onToken) {
      onToken(chunk)
    }

    const delay = randomDelay(latency.minTokenDelayMs, latency.maxTokenDelayMs)
    timeoutId = setTimeout(emitNextChunk, delay)
  }

  // Start with base delay to simulate initial model loading
  timeoutId = setTimeout(emitNextChunk, latency.baseDelayMs)

  return controller
}
