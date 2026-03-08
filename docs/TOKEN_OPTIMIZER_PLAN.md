# H Chat Token Optimizer & AI Platform Evolution Plan

> Date: 2026-03-08
> Based on: token_entropy_encoder analysis + H Chat monorepo current state
> Status: Phase 62 진행 중 (CRITICAL/HIGH 이슈 수정 완료)

---

## 1. 분석 요약: token_entropy_encoder

### 핵심 아이디어
LLM 토큰은 정보량(entropy)이 서로 다르다. 고빈도 저정보 토큰(the, is, a)을 압축하고 고정보 토큰(transformer, entropy)을 보존하면 **프롬프트를 30-60% 압축**할 수 있다.

### 알고리즘
```
Text -> Tokenizer -> P(token) 추정 -> H(token) = -p*log2(p) -> threshold 기반 필터 -> 압축된 프롬프트
```

### 한계점
- token probability estimation의 정확도 문제 (frequency-based vs LM-based)
- semantic loss 가능성 (문맥 의존적 토큰 제거 시)
- LLM tokenizer mismatch (GPT vs Claude vs Gemini 각각 다른 tokenizer)
- 실험적 프로젝트 수준, 프로덕션 검증 부족

### 실용적 가치 평가

| 적용 영역 | 효과 | 난이도 | H Chat 적용 가능성 |
|-----------|------|--------|-------------------|
| Prompt compression | 30-60% 토큰 절감 | 중 | HIGH |
| RAG document filtering | 불필요 문장 제거 | 하 | HIGH |
| System prompt 최적화 | 고정 비용 절감 | 하 | MEDIUM |
| Context window 확장 | 더 많은 문서 사용 | 중 | HIGH |
| 실시간 채팅 최적화 | 응답 속도 향상 | 상 | LOW (semantic loss 위험) |

---

## 2. H Chat 현재 상태 vs 필요 기술

### 현재 완료된 것 (Phase 61 + CRITICAL/HIGH 수정)

| 영역 | 상태 | 비고 |
|------|------|------|
| 프론트엔드 7개 앱 | 완료 | wiki, hmg, admin, user, llm-router, desktop, mobile |
| UI 컴포넌트 160개 | 완료 | @hchat/ui + 5개 서브패키지 |
| Mock 서비스 27개 | 완료 | MSW 39 핸들러 |
| LLM Router (86 모델) | 완료 | 모델 카탈로그 + 비교 UI |
| 보안 강화 | 완료 | CSP, CSRF, Zod, tokenStorage |
| 테스트 970+ | 완료 | 51.81% -> 60%+ 목표 |

### 아직 없는 것 (Token Optimizer 적용에 필요)

| 영역 | 상태 | 필요 시점 |
|------|------|----------|
| Real Backend API | 없음 | Phase 65 |
| Real LLM 호출 | 없음 | Phase 66 |
| Token counting | 없음 | Phase 66 이후 |
| Cost tracking | 없음 | Phase 66 이후 |
| Streaming 최적화 | Mock만 | Phase 66 이후 |

---

## 3. 단계별 적용 계획

### Phase A: Token Utility Library (Phase 66과 병행)

LLM Router에 토큰 관련 유틸리티를 추가한다.

```
packages/ui/src/llm-router/utils/
  tokenCounter.ts    - 모델별 토큰 수 추정
  tokenPricing.ts    - 모델별 토큰 비용 계산
  tokenBudget.ts     - 대화별 토큰 예산 관리
```

**이미 있는 것**: `apiKeyUtils.ts`의 `estimateTokenCount()`, `calculateCost()` - 확장 가능

**구현 범위**:
- tiktoken-lite (클라이언트) 또는 서버사이드 토큰 카운팅
- 모델별 pricing 데이터 (86개 모델 이미 카탈로그에 있음)
- 대화 UI에 실시간 토큰/비용 표시

### Phase B: Prompt Optimizer (Phase 67과 병행)

경량 프롬프트 최적화 레이어를 추가한다.

```
packages/ui/src/optimizer/
  stopwordFilter.ts      - 불필요 토큰 제거 (stopword 기반)
  sentenceRanker.ts      - 문장 중요도 순위 (TF-IDF 기반)
  contextSelector.ts     - context window 최적 활용
  promptBuilder.ts       - 시스템 프롬프트 + 사용자 입력 조합
```

**주의**: Entropy-based compression은 semantic loss 위험이 있으므로,
안전한 방식(stopword + sentence ranking)부터 시작한다.

**효과 예측**:
- System prompt: 20-30% 토큰 절감 (반복적 지시문 최적화)
- RAG context: 40-60% 절감 (저관련 문장 필터)
- User input: 건드리지 않음 (semantic loss 방지)

### Phase C: Server-side Token Optimization (Phase 66 이후)

실제 LLM API 호출 시 서버에서 최적화한다.

```
Backend API Layer:
  middleware/tokenOptimizer.ts  - 요청 전 프롬프트 최적화
  middleware/costTracker.ts     - 요청/응답 토큰 비용 추적
  middleware/budgetGuard.ts     - 부서/사용자별 예산 제한
```

**아키텍처**:
```
User Input
  -> Prompt Builder (system + user + context)
  -> Token Optimizer (compress system/context, preserve user)
  -> Model Router (최적 모델 선택)
  -> LLM API Call
  -> Response Streaming
  -> Cost Tracking
```

### Phase D: Advanced Optimization (Phase 70 이후)

프로덕션 데이터 기반 고급 최적화:

1. **Prompt Caching**: 동일/유사 프롬프트 캐싱 (Redis)
2. **Semantic Compression**: embedding 기반 중복 문장 제거
3. **Adaptive Routing**: 질문 복잡도에 따른 모델 자동 선택
4. **Token Budget Auto-tuning**: 사용 패턴 분석 후 예산 자동 조정

---

## 4. AI Platform 확장 로드맵 (Phase 71-80)

token_entropy_encoder 분석에서 도출된 아이디어를 H Chat 로드맵에 반영한다.

### Phase 71: Token Intelligence Layer
- Token counter + cost tracker 프로덕션 적용
- 부서별 토큰 사용량 대시보드 (ROI에 통합)
- 모델별 비용 최적화 리포트

### Phase 72: Prompt Optimization Engine
- Stopword filter + Sentence ranker 적용
- System prompt 자동 최적화
- RAG context 압축 (벡터 검색 결과 필터링)

### Phase 73: Smart Model Router
- 질문 유형별 자동 모델 선택
  - 간단한 질문 -> Haiku/Flash (저비용)
  - 코딩 -> Claude Sonnet (고품질)
  - 분석 -> GPT-4o (균형)
- Fallback chain: primary -> secondary -> tertiary
- A/B 테스트 프레임워크

### Phase 74: Research Agent (Deep Research lite)
- 멀티 소스 검색 (사내 문서 + 웹)
- 자동 요약 + 인용
- 리포트 생성
- 기존 ROI 대시보드와 통합

### Phase 75: Knowledge Base
- 사내 문서 벡터화 (pgvector)
- RAG 파이프라인
- 자동 인덱싱 (Confluence, Notion 연동)
- 지식 그래프 (entity-relation)

### Phase 76-80: Enterprise AI Platform
- SSO + RBAC + Audit 완성
- Multi-tenant 아키텍처
- API Gateway + Rate Limiting
- On-premise 배포 옵션
- Compliance (SOC2, ISO27001)

---

## 5. 기술 선택 가이드

### Token Counting
| Option | Size | Accuracy | Recommendation |
|--------|------|----------|----------------|
| tiktoken (OpenAI) | 2MB | 정확 (GPT only) | Server-side |
| @anthropic-ai/tokenizer | 1MB | 정확 (Claude only) | Server-side |
| 글자수 기반 추정 | 0KB | 80% | Client-side fallback |
| API response usage | 0KB | 100% | 사후 추적 |

### Prompt Compression
| Method | 효과 | 위험 | Recommendation |
|--------|------|------|----------------|
| Stopword removal | 10-20% | 낮음 | Phase B 즉시 적용 |
| Sentence ranking | 20-40% | 중간 | Phase B RAG context에 적용 |
| Entropy-based | 30-60% | 높음 | Phase D 이후 실험적 적용 |
| LLM summarization | 50-70% | 중간 | Phase C 서버에서 적용 |

### Model Router
| Strategy | Complexity | Saving | Recommendation |
|----------|-----------|--------|----------------|
| Manual selection | 낮음 | 0% | 현재 (LLM Router UI) |
| Rule-based routing | 중간 | 20-40% | Phase 73 |
| ML-based routing | 높음 | 40-60% | Phase 76+ |

---

## 6. 우선순위 & 의존성

```
현재 (Phase 62 진행중)
  |
  v
Phase 62-64: 보안 + 테스트 + 서버 컴포넌트 [현재 작업]
  |
  v
Phase 65-66: Real API + AI Provider [필수 선행]
  |
  v
Phase 71-72: Token Intelligence + Prompt Optimizer [Token Optimizer 핵심]
  |
  v
Phase 73: Smart Model Router [비용 최적화]
  |
  v
Phase 74-75: Research Agent + Knowledge Base [AI Platform]
```

### 핵심 원칙
1. **User input은 건드리지 않는다** - semantic loss 방지
2. **System prompt + RAG context만 최적화** - 안전한 영역
3. **서버사이드 우선** - 클라이언트 번들 증가 방지
4. **측정 가능한 효과** - 최적화 전후 토큰/비용/속도 비교

---

## 7. 예상 효과

### Token/Cost Reduction

| Phase | 토큰 절감 | 비용 절감 | 응답 속도 |
|-------|----------|----------|----------|
| 현재 (Mock) | - | - | - |
| Phase 66 (Real API) | 0% | 0% | baseline |
| Phase 71 (Token Intel) | 0% | 10% (모델 선택 최적화) | - |
| Phase 72 (Prompt Opt) | 30-40% | 25-35% | 10-20% 향상 |
| Phase 73 (Smart Router) | - | 40-50% | 20-30% 향상 |
| Phase 74-75 (RAG) | 50-60% (context) | 50-60% | 유지 |

### H Chat ROI Dashboard 연동
기존 ROI 대시보드에 다음 KPI 추가:
- 토큰 사용량 트렌드 (모델별, 부서별)
- 비용 절감 효과 (최적화 전후 비교)
- 모델 라우팅 분포
- 프롬프트 압축률

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Semantic loss from compression | 답변 품질 저하 | User input 보존, A/B 테스트 |
| Tokenizer mismatch | 잘못된 토큰 수 추정 | 모델별 공식 tokenizer 사용 |
| Over-optimization | 컨텍스트 부족 | 최소 토큰 보장 threshold |
| Latency from optimization | 응답 지연 | 캐싱, 비동기 처리 |
| Cost of optimization infra | ROI 불명확 | Phase B에서 효과 측정 후 확대 |
