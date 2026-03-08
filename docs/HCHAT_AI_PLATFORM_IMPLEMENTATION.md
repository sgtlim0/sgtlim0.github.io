# H Chat AI Platform - Implementation Guide

> Date: 2026-03-08
> Based on: 5-agent parallel analysis (Architect + Planner x2 + Deep Analysis v3)
> Current: Phase 62 (CRITICAL/HIGH resolved) | 970+ tests | 7 apps | 160 components

---

## 1. Current State vs Target Architecture

### Layer Coverage Assessment

| AI Platform Layer | Current | Target | Gap | Priority |
|-------------------|---------|--------|-----|----------|
| **UI Layer** | 80% | 95% | Code editor, Research panel | LOW |
| **Agent Layer** | 30% | 90% | Orchestration engine, Planner/Critic | HIGH |
| **Research Layer** | 20% | 85% | Crawler, Extractor, Ranker | HIGH |
| **Memory Layer** | 15% | 80% | Vector DB, Knowledge Graph | CRITICAL |
| **Optimizer Layer** | 5% | 75% | Token compression, Context selection | HIGH |
| **Router Layer** | 70% | 95% | Real API calls, Fallback chain | MEDIUM |

### Reusable Assets (Already Built)

| Asset | Current State | AI Platform Use | Effort to Extend |
|-------|--------------|-----------------|-----------------|
| LLM Router (86 models) | UI + mock catalog | Model Router backend | Medium |
| Service Registry (33 svc) | Mock service management | Agent Registry | Low |
| MSW (39 endpoints) | API mocking | AI service prototyping | Low |
| ROI Dashboard (9 pages) | Cost analysis UI | Token cost tracking | Low |
| Desktop App (5 pages) | Basic chat + agents | AI Browser foundation | High |
| Zod Schemas | auth + roi + common | API validation layer | Low |
| tokenStorage | Session-based auth | Agent session management | Low |
| Chat Service (SSE) | Mock streaming | Real LLM streaming | Medium |

### Existing AI-Related Code

```
packages/ui/src/
  llm-router/
    services/apiKeyUtils.ts     -> estimateTokenCount(), calculateCost()
    services/streamingService.ts -> SSE streaming patterns
    mockModels.ts               -> 86 model specifications
    ModelTable.tsx              -> Model comparison UI
    StreamingPlayground.tsx     -> Streaming test UI
  admin/
    services/ragService.ts      -> RAG search (mock)
    services/knowledgeGraphService.ts -> Knowledge graph (mock)
    RAGSearchPage.tsx           -> RAG UI
    KnowledgeGraphView.tsx      -> Knowledge graph UI
    AdminAgentMonitoring.tsx    -> Agent status UI
  desktop/
    types.ts                    -> DesktopAgent, SwarmAgent types
    SwarmPanel.tsx              -> Multi-agent UI
    DebateArena.tsx             -> Agent debate UI
  roi/
    ROIAnalysis.tsx             -> Cost analysis (extensible)
```

---

## 2. Token Optimizer Implementation Plan

### Module Structure

```
packages/ui/src/optimizer/          <- NEW directory
  types.ts                          <- Optimization types
  stopwordFilter.ts                 <- Stopword removal (ko/en)
  sentenceRanker.ts                 <- TF-IDF sentence scoring
  contextSelector.ts                <- Relevant context selection
  promptBuilder.ts                  <- Optimized prompt assembly
  cacheManager.ts                   <- Prompt/response cache
  config.ts                         <- Optimization settings
  optimizerService.ts               <- Unified service

packages/ui/src/llm-router/services/  <- EXTEND
  tokenCounter.ts                   <- Accurate token counting
  tokenTypes.ts                     <- Token-related types
  tokenizerMap.ts                   <- Model -> tokenizer mapping
  useTokenCounter.ts                <- React hook
  modelRouter.ts                    <- Smart routing engine
  taskClassifier.ts                 <- Task type classification
  fallbackChain.ts                  <- Model fallback logic
```

### Key Interfaces

```typescript
// Token Counter
interface TokenCounter {
  count(text: string, model: string): number
  estimateCost(tokens: number, model: string): CostEstimate
}

// Prompt Optimizer
interface PromptOptimizer {
  optimize(input: PromptInput, strategy: Strategy): OptimizedPrompt
  estimateSavings(original: string, optimized: string): TokenSavings
}

// Model Router
interface ModelRouter {
  route(prompt: string, options?: RoutingOptions): RoutingResult
  classify(prompt: string): TaskType
  getFallbackChain(model: string): string[]
}

// Task Types
type TaskType = 'chat' | 'code' | 'analysis' | 'creative' | 'translation' | 'summary'
```

### Implementation Priority

| Step | Module | Files | LOC | Days |
|------|--------|-------|-----|------|
| 1 | Token Counter | 4 | 600 | 2 |
| 2 | Prompt Optimizer (8 modules) | 8 | 1,200 | 4 |
| 3 | Smart Model Router | 5 | 800 | 3 |
| 4 | UI Integration | 6 | 700 | 2 |
| 5 | Testing & Docs | 8 | 1,000 | 3 |
| **Total** | | **31** | **4,300** | **14 days** |

### Optimization Pipeline

```
User Input (preserve)
    |
System Prompt --> Stopword Filter --> Sentence Ranker --> Compressed
    |
RAG Context --> Context Selector --> Top-K Relevant --> Compressed
    |
Prompt Builder (merge all) --> Token Budget Check
    |
Model Router (classify task --> select model --> fallback chain)
    |
LLM API Call --> Cost Tracking --> Response
```

### Expected Impact

| Optimization | Target Area | Token Savings |
|-------------|-------------|---------------|
| Stopword filter | System prompt | 15-25% |
| Sentence ranking | RAG context | 30-50% |
| Context selection | Chat history | 20-40% |
| Smart routing | Model selection | 30-50% cost |
| **Combined** | **All** | **40-60%** |

---

## 3. Phase 71-80 Roadmap Summary

### Timeline

```
2026 Q2 (Phase 62-70 완료 후)
  Phase 71: Token Intelligence      [3주] - 토큰 카운터 + 비용 대시보드
  Phase 72: Prompt Optimization      [3주] - 압축 엔진 + A/B 테스트
  Phase 73: Smart Model Router       [3주] - 자동 라우팅 + Fallback

2026 Q3
  Phase 74: Research Agent MVP       [3주] - 웹 검색 + 리포트 생성
  Phase 75: Knowledge Base           [3주] - 벡터 DB + RAG 파이프라인
  Phase 76: AI Browser Agent         [3주] - Playwright + 웹 자동화

2026 Q4
  Phase 77: Multi-Agent System       [4주] - 에이전트 오케스트레이션
  Phase 78: Self-Improving Loop      [4주] - 자동 코드 개선

2027 Q1
  Phase 79: Enterprise Platform      [4주] - SSO + RBAC + Compliance
  Phase 80: AI OS                    [6주] - Desktop + Extension + Mobile
```

### Cumulative Growth

| Metric | Phase 61 (Now) | Phase 70 | Phase 75 | Phase 80 |
|--------|---------------|----------|----------|----------|
| LOC | 57,207 | ~80,000 | ~110,000 | ~150,000 |
| Components | 160 | ~200 | ~280 | ~350 |
| Services | 42 | ~50 | ~80 | ~120 |
| Tests | 970 | ~2,500 | ~3,500 | ~4,500 |
| AI Models (real) | 0 | 3 | 6 | 10+ |
| Token Savings | 0% | 0% | 40% | 60% |
| Cost Reduction | 0% | 0% | 50% | 70% |
| Platforms | 7 web apps | 7 web | +Desktop | +Mobile+Ext |

### Phase Dependencies

```
[NOW] Phase 62-64 (Security + Tests + Server Components)
  |
  v
Phase 65-66 (Real API + AI Providers) <-- PREREQUISITE for all below
  |
  v
Phase 71-73 (Token + Prompt + Router) -- Intelligence Layer
  |
  v
Phase 74-76 (Research + Knowledge + Browser) -- Advanced Capabilities
  |
  v
Phase 77-78 (Multi-Agent + Self-Improving) -- Autonomous Systems
  |
  v
Phase 79-80 (Enterprise + AI OS) -- Platform Integration
```

---

## 4. Architecture Strategy

### Monorepo Extension Approach

```
hchat-wiki/                        (existing Next.js monorepo)
  packages/
    tokens/                        (existing - CSS tokens)
    ui/                            (existing - shared components)
    ui-core/                       (existing - base components)
    ui-admin/                      (existing - admin components)
    ui-user/                       (existing - user components)
    ui-roi/                        (existing - ROI components)
    ui-llm-router/                 (existing - LLM router)
    ai-engine/          <- NEW     (Python FastAPI backend)
      optimizer/                   (token + prompt optimization)
      research/                    (web search + crawling)
      agents/                      (multi-agent orchestration)
      knowledge/                   (vector DB + RAG)
      router/                      (model routing + fallback)
    cli/                <- NEW     (CLI tool, Phase 80)
  apps/
    wiki/                          (existing)
    admin/                         (existing)
    user/                          (existing)
    llm-router/                    (existing)
    desktop/                       (existing -> AI Browser)
    mobile/                        (existing)
    storybook/                     (existing)
    electron/           <- NEW     (Phase 80)
    extension/          <- NEW     (Phase 80)
```

### Backend Integration Pattern

```
Frontend (Next.js)  <-->  API Gateway  <-->  AI Engine (FastAPI)
                                                |
                              +-----------------+-----------------+
                              |                 |                 |
                        PostgreSQL          Redis           Vector DB
                        (pgvector)         (cache)         (embeddings)
```

### Tech Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| AI Backend | FastAPI (Python) | AI ecosystem, async |
| Vector DB | pgvector (PostgreSQL) | Existing DB, no new infra |
| Task Queue | Celery + Redis | Parallel agent execution |
| Browser Automation | Playwright | Async, reliable |
| Token Counting | tiktoken (server) | Accurate, official |
| Embedding | OpenAI text-embedding-3-small | Cost-effective |
| RAG Framework | LangChain | Comprehensive, maintained |
| Desktop | Electron | Cross-platform |

---

## 5. Risk Analysis

### Critical Path Risks

| Risk | Phase | Impact | Probability | Mitigation |
|------|-------|--------|-------------|-----------|
| Semantic loss from compression | 72 | High | Medium | User input 보존, A/B 테스트 |
| Vector DB performance at scale | 75 | High | Medium | Indexing, caching, sharding |
| Web scraping blocked | 74,76 | Medium | High | API-first, rate limiting |
| Wrong model routing | 73 | Medium | Medium | Fallback chain, monitoring |
| Self-improving uncontrolled changes | 78 | Very High | Low | Sandbox, approval process |
| Enterprise compliance complexity | 79 | High | High | Expert consultation |

### Go/No-Go Criteria per Phase

| Phase | Go Criteria | No-Go Criteria |
|-------|------------|----------------|
| 71 | Token counting accuracy >95% | Bundle size >5MB |
| 72 | Quality degradation <5% | Response quality drops >10% |
| 73 | Cost reduction >30% | User satisfaction drops >5% |
| 74 | Report accuracy >80% | Generation time >60s |
| 75 | Search precision >85% | Index build >1hr for 10k docs |

---

## 6. Success Metrics

### Business KPIs

| KPI | Phase 73 Target | Phase 76 Target | Phase 80 Target |
|-----|----------------|-----------------|-----------------|
| API Cost Reduction | 40% | 50% | 70% |
| Response Time | <3s | <3s | <2s |
| User Productivity | 1.5x | 2x | 3x |
| Automation Rate | 20% | 50% | 80% |

### Technical KPIs

| KPI | Target |
|-----|--------|
| Test Coverage | >85% |
| Code Quality | 9.5/10 |
| P95 Latency | <100ms |
| Availability | 99.99% |
| Security Score | 9/10 |

---

## 7. Immediate Next Steps

### This Sprint (Phase 62 completion)
- [x] CRITICAL issues fixed (CSRF, Zod, CSP, dead code, tests)
- [x] HIGH issues in progress (eslint, CI, tokenStorage, server components)
- [ ] Complete Phase 62-64 (remaining tests + server components)

### Next Sprint (Phase 65-66)
- [ ] Real Backend API (PostgreSQL + Redis)
- [ ] Real LLM Integration (Claude + GPT + Gemini)
- [ ] This unlocks ALL Phase 71-80 capabilities

### AI Platform Kickoff (Phase 71)
- [ ] Token counting infrastructure
- [ ] Cost tracking database schema
- [ ] ROI dashboard token metrics
- [ ] Begin prompt optimization research
