---
name: model-router
description: 멀티 모델 라우팅 알고리즘을 설계하고 프로바이더 어댑터를 생성합니다. 복합 점수 기반으로 최적 AI 모델을 자동 선택합니다.
---

# Model Router

멀티 모델 라우팅 + 프로바이더 어댑터 + 비용 최적화 스킬.

## 활성화 시점

- AI 기능 추가
- 모델 비용 최적화
- 새 프로바이더/모델 추가
- Fallback 체인 설계

## 복합 점수 라우팅

```typescript
interface ModelScore {
  quality: number    // 0-1, 응답 품질
  latency: number    // 0-1, 응답 속도 (역수)
  cost: number       // 0-1, 비용 효율 (역수)
  availability: number // 0-1, 가용성
}

function calculateScore(score: ModelScore): number {
  return (
    score.quality * 0.40 +
    score.latency * 0.30 +
    score.cost * 0.20 +
    score.availability * 0.10
  )
}

// Browser OS 변형 (신뢰성 중시)
function calculateBrowserOSScore(score: ModelScore & { reliability: number; specialization: number }): number {
  return (
    score.reliability * 0.30 +
    score.cost * 0.25 +
    score.latency * 0.25 +
    score.specialization * 0.20
  )
}
```

## 모델 카탈로그

| 모델 | 전문 영역 | Input/1M | Output/1M | 컨텍스트 |
|------|---------|---------|----------|---------|
| Claude Opus | 추론, 분석 | $15 | $75 | 200K |
| Claude Sonnet | 범용 코딩 | $3 | $15 | 200K |
| Claude Haiku | 경량, 분류 | $0.25 | $1.25 | 200K |
| GPT-4o | 코드 생성 | $2.50 | $10 | 128K |
| GPT-4o mini | 빠른 응답 | $0.15 | $0.60 | 128K |
| Gemini Flash | 장문, 고속 | $0.075 | $0.30 | 1M |
| Gemini Pro | 멀티모달 | $1.25 | $5 | 2M |

## 태스크 자동 분류

```typescript
type TaskType = 'code' | 'reasoning' | 'document' | 'quick'

function classifyTask(prompt: string): TaskType {
  if (/```|function|class|import|const |let |var /.test(prompt)) return 'code'
  if (/왜|분석|비교|추론|장단점|근거/.test(prompt)) return 'reasoning'
  if (/요약|번역|작성|보고서|이메일/.test(prompt)) return 'document'
  return 'quick'
}

const TASK_MODEL_MAP: Record<TaskType, string[]> = {
  code: ['claude-sonnet', 'gpt-4o', 'claude-haiku'],
  reasoning: ['claude-opus', 'claude-sonnet', 'gemini-pro'],
  document: ['gemini-flash', 'claude-sonnet', 'gpt-4o'],
  quick: ['claude-haiku', 'gpt-4o-mini', 'gemini-flash'],
}
```

## Fallback 체인

```typescript
async function routeWithFallback(prompt: string, models: string[]): Promise<Response> {
  for (const model of models) {
    try {
      return await callModel(model, prompt)
    } catch (error) {
      console.error(`${model} 실패, 다음 모델로 전환`)
      continue
    }
  }
  throw new Error('모든 모델이 실패했습니다')
}
```

**비용 캡**: 월 $2K 초과 시 자동 Mock 전환

## Provider Factory 패턴

```typescript
interface AIProvider {
  chat(messages: Message[]): AsyncGenerator<string>
  models(): string[]
}

function createAllProviders(config: Config): Map<string, AIProvider> {
  const providers = new Map<string, AIProvider>()
  if (config.bedrock) providers.set('bedrock', new BedrockProvider(config.bedrock))
  if (config.openai) providers.set('openai', new OpenAIProvider(config.openai))
  if (config.gemini) providers.set('gemini', new GeminiProvider(config.gemini))
  return providers
}

function getProviderForModel(model: string): AIProvider {
  // 모델명에서 프로바이더 자동 매핑
  if (model.startsWith('claude')) return providers.get('bedrock')!
  if (model.startsWith('gpt')) return providers.get('openai')!
  if (model.startsWith('gemini')) return providers.get('gemini')!
  throw new Error(`알 수 없는 모델: ${model}`)
}
```

## SSE 스트리밍 어댑터

```typescript
async function* streamToSSE(
  generator: AsyncGenerator<string>
): AsyncGenerator<string> {
  for await (const chunk of generator) {
    yield `data: ${JSON.stringify({ content: chunk })}\n\n`
  }
  yield 'data: [DONE]\n\n'
}
```

## 참조 문서

- `docs/IMPL_BROWSER_OS_03_MULTIMODEL_HEALING.md`
- `content/settings/models.md` — 모델 상세 가이드
- `content/settings/providers.md` — 프로바이더 설정
- `docs/LLM_ROUTER_IMPLEMENTATION_PLAN.md`
