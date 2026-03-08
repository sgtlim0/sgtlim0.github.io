# H Chat 프로토타입 통합 구현방안

> 5개 병렬 에이전트 분석 결과 통합 (2026-03-08)

---

## 1. 분석 요약

프로토타입(Python FastAPI + Token Entropy Encoder + Research)을 현재 hchat-wiki 모노레포에 통합하기 위한 5개 영역 심층분석을 수행했다.

| 분석 영역 | 핵심 결론 |
|-----------|----------|
| 아키텍처 매핑 | **Option C (하이브리드)** 권장 — AI 핵심은 Python, Gateway는 Next.js |
| Token Encoder | TypeScript 포팅 가능, `Math.log2` 직접 매핑, 한국어 stopword 별도 필요 |
| FastAPI 백엔드 | Docker 서비스로 추가, 포트 8000, ServiceFactory 즉시 연동 가능 |
| Research 기능 | User 앱 API Routes 사용 가능 (Static Export 미사용), cheerio로 크롤링 |
| 프론트엔드 통합 | ChatPage에 모드 전환 탭 추가, MessageBubble 확장으로 출처/압축 통계 표시 |

---

## 2. 권장 아키텍처: 하이브리드 (Option C)

### 2.1 전략 근거

| 기준 | Option A (Python 전용) | Option B (TS 전용) | **Option C (하이브리드)** |
|------|----------------------|-------------------|------------------------|
| AI 라이브러리 | Python 풍부 | JS 미성숙 | **Python AI + TS UI** |
| 타입 안정성 | 약함 | 강함 | **Gateway에서 강함** |
| 배포 복잡도 | Docker 필수 | Vercel 단일 | Docker + Vercel |
| 점진적 전환 | 어려움 | 어려움 | **용이** |
| 기존 코드 활용 | 프로토타입 재사용 | 전면 재작성 | **양쪽 활용** |

### 2.2 통합 아키텍처

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js Apps)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ User App │ │ Desktop  │ │ Admin + ROI      │ │
│  │ :3003    │ │ :5173    │ │ :3002            │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────────────┘ │
│       │             │            │                │
│       ▼             ▼            ▼                │
│  ┌──────────────────────────────────────────┐    │
│  │  API Gateway (Next.js API Routes)        │    │
│  │  /api/chat, /api/research, /api/optimize │    │
│  │  - 인증/CSRF 검증                         │    │
│  │  - Redis 캐싱                             │    │
│  │  - Rate Limiting                         │    │
│  └────────────────┬─────────────────────────┘    │
└───────────────────┼──────────────────────────────┘
                    │ HTTP/SSE
                    ▼
┌───────────────────────────────────────────────────┐
│  AI Core (Python FastAPI) :8000                    │
│  ┌────────────┐ ┌────────────┐ ┌───────────────┐  │
│  │ /chat      │ │ /research  │ │ /optimize     │  │
│  │ LLM Stream │ │ Search     │ │ Token Encoder │  │
│  │            │ │ Crawl      │ │ Prompt Build  │  │
│  │            │ │ Summarize  │ │               │  │
│  └────────────┘ └────────────┘ └───────────────┘  │
│       │              │                             │
│       ▼              ▼                             │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Claude/  │  │ Serper   │                        │
│  │ OpenAI   │  │ API      │                        │
│  └──────────┘  └──────────┘                        │
└───────────────────────────────────────────────────┘
       │                    │
       ▼                    ▼
┌──────────┐          ┌──────────┐
│ Postgres │          │  Redis   │
│ :5432    │          │  :6379   │
└──────────┘          └──────────┘
```

### 2.3 디렉토리 구조

```
hchat-wiki/
├── apps/
│   ├── ai-core/                    # 신규: Python FastAPI
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   └── research.py
│   │   ├── services/
│   │   │   ├── llm_client.py
│   │   │   ├── searcher.py
│   │   │   ├── crawler.py
│   │   │   └── summarizer.py
│   │   ├── optimizer/
│   │   │   ├── entropy_encoder.py
│   │   │   └── prompt_builder.py
│   │   └── models/
│   │       └── schemas.py
│   ├── user/
│   │   └── app/api/                # 신규: API Gateway
│   │       ├── chat/route.ts
│   │       ├── research/route.ts
│   │       └── optimize/route.ts
│   └── ... (기존 앱)
├── packages/
│   └── ui/src/
│       ├── utils/text/             # 신규: TS Token Encoder
│       │   ├── tokenEntropyEncoder.ts
│       │   ├── stopwords.ts
│       │   └── index.ts
│       ├── user/
│       │   ├── services/
│       │   │   ├── researchService.ts    # 신규
│       │   │   └── mockResearchService.ts # 신규
│       │   └── components/
│       │       ├── ResearchPanel.tsx      # 신규
│       │       └── SourceAttribution.tsx  # 신규
│       └── schemas/
│           └── text.ts             # 신규: Zod 스키마
└── docker-compose.yml              # ai-core 서비스 추가
```

---

## 3. Token Entropy Encoder (TypeScript 포팅)

### 3.1 핵심 변환 사항

| Python | TypeScript | 비고 |
|--------|-----------|------|
| `np.log2(p)` | `Math.log2(p)` | 네이티브 지원 |
| `dict` | `Map<string, number>` | 타입 안전 |
| `STOPWORDS set` | `Set<string>` | 영어/한국어 분리 |
| `text.split()` | `text.split(/\s+/)` | 정규식 사용 |

### 3.2 한국어 지원 전략

- **1단계**: 공백 기반 토큰화 (즉시 구현 가능)
- **2단계**: 조사/어미 분리 정규식 (`은/는/이/가/을/를` 등)
- **3단계**: 형태소 분석기 통합 (선택, hangul.js 등)

### 3.3 배치 위치

```
packages/ui/src/utils/text/
├── tokenEntropyEncoder.ts   # 핵심 로직
├── stopwords.ts              # 언어별 stopword 세트
├── tokenizer.ts              # 토큰화 전략 (Strategy Pattern)
└── index.ts                  # barrel export
```

### 3.4 인터페이스 설계

```typescript
interface EncoderOptions {
  entropyThreshold?: number     // 기본 0.3
  language?: 'ko' | 'en' | 'auto'
  minWords?: number             // 기본 5
  compressionFloor?: number     // 기본 0.4 (40% 미만이면 원본 반환)
}

interface CompressionResult {
  text: string
  stats: {
    originalTokens: number
    compressedTokens: number
    reductionPct: number
  }
}
```

### 3.5 Web Worker 활용

기존 `xlsxWorker.ts` 패턴 참조:
- 텍스트 > 10,000자: Worker 위임
- 그 외: 메인 스레드 동기 처리
- Timeout 30초, 에러 핸들링 통일

### 3.6 Zod 스키마 연동

```typescript
// packages/ui/src/schemas/text.ts
const textEncoderInputSchema = z.object({
  text: z.string().min(1).max(100_000),
  options: z.object({
    entropyThreshold: z.number().min(0).max(1).default(0.3),
    language: z.enum(['ko', 'en', 'auto']).default('auto'),
  }).optional()
})
```

---

## 4. FastAPI 백엔드 통합

### 4.1 Docker 서비스 추가

```yaml
# docker-compose.yml 확장
services:
  postgres:
    # ... 기존 설정 유지

  redis:
    # ... 기존 설정 유지

  ai-core:
    build:
      context: ./apps/ai-core
      dockerfile: Dockerfile
    ports:
      - '8000:8000'
    environment:
      DATABASE_URL: postgresql://hchat:${POSTGRES_PASSWORD:-hchat_dev_2026}@postgres:5432/hchat
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
      SEARCH_API_KEY: ${SEARCH_API_KEY:-}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/health']
      interval: 10s
      timeout: 5s
      retries: 5
```

### 4.2 ServiceFactory 연동

현재 `packages/ui/src/client/serviceFactory.ts`의 Mock/Real 패턴과 즉시 호환:

```typescript
// 환경변수만 변경하면 전환 완료
// .env.local
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4.3 SSE 스트리밍 호환성

| 항목 | 현재 (Mock SSE) | FastAPI SSE |
|------|----------------|-------------|
| 프로토콜 | `text/event-stream` | `text/event-stream` |
| 형식 | `data: {text}\n\n` | `data: {json}\n\n` |
| 종료 | `data: [DONE]` | `data: [DONE]` |
| 호환성 | - | **즉시 호환** |

현재 `sseService.ts`의 `streamResponse()` 함수가 동일 프로토콜 사용 중이므로 URL만 변경하면 실제 AI 스트리밍으로 전환 가능.

### 4.4 DB 스키마 활용

기존 `docker/init.sql` 스키마가 이미 완벽:

| 테이블 | FastAPI 활용 |
|--------|------------|
| `users` | 인증/인가 |
| `conversations` | 대화 관리 |
| `messages` | 메시지 저장 (tokens, model 필드 활용) |
| `api_keys` | API 키 관리 |
| `audit_logs` | 감사 로그 (JSONB details 활용) |

### 4.5 환경변수 확장

```env
# .env.example 추가 항목
# AI Core
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SEARCH_API_KEY=              # Serper API

# Next.js → AI Core 연동
NEXT_PUBLIC_API_MODE=real    # mock → real 전환
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. Research 기능 (검색 + 크롤링 + 요약)

### 5.1 Static Export 확인 결과

| 앱 | output: 'export' | API Routes |
|----|-------------------|------------|
| wiki | O | 불가 |
| desktop | O | 불가 |
| mobile | O | 불가 |
| **user** | **X** | **가능** |
| **admin** | **X** | **가능** |
| **llm-router** | **X** | **가능** |
| **hmg** | **X** | **가능** |

User, Admin, HMG, LLM Router는 서버 모드이므로 API Routes 사용 가능.

### 5.2 API Gateway (Next.js API Routes)

```
apps/user/app/api/
├── research/
│   ├── search/route.ts       # Serper API 프록시
│   ├── crawl/route.ts        # 크롤링 프록시
│   └── summarize/route.ts    # LLM 요약 프록시
```

API Gateway 역할:
1. **인증/CSRF 검증** (기존 csrf.ts 활용)
2. **Redis 캐시 체크** (중복 검색 방지)
3. **Rate Limiting** (IP/사용자별)
4. **SSRF 방지** (Private IP 차단)
5. **AI Core로 프록시**

### 5.3 TypeScript 라이브러리 대안

| Python 원본 | TypeScript 대안 | 상태 |
|-------------|----------------|------|
| requests + BeautifulSoup | **cheerio** | npm install 필요 |
| Serper API (requests) | **fetch()** | 네이티브 |
| Playwright | **@playwright/test** | 이미 설치됨 |

### 5.4 MCP 서버 중복 분석

- **Exa MCP**: 시맨틱 검색 특화 — Research와 **부분 중복**
- **Context7 MCP**: 문서화 전용 — 중복 없음

**제안**: Exa를 개발 도구용, Research를 사용자 대면용으로 차별화.

### 5.5 보안 체크리스트

- [ ] Zod 스키마로 URL/쿼리 입력 검증
- [ ] Private IP 범위 차단 (10.x, 172.16-31.x, 192.168.x)
- [ ] Redirect 횟수 제한 (최대 3회)
- [ ] API 키 서버사이드 전용 (NEXT_PUBLIC_ 접두사 미사용)
- [ ] Rate Limiting (분당 10회/IP)
- [ ] 크롤링 결과 최대 크기 제한 (3,000자)

---

## 6. 프론트엔드 통합

### 6.1 ChatPage 모드 전환

현재 ChatPage에 모드 전환 탭 추가:

```
┌──────────────────────────────────────────┐
│  [Chat] [Research]              🔍 검색   │
├──────────────────────────────────────────┤
│                                          │
│  Chat 모드: 기존 대화 기능               │
│  Research 모드: 검색 + 요약 + 출처       │
│                                          │
├──────────────────────────────────────────┤
│  메시지 입력...                    [전송] │
└──────────────────────────────────────────┘
```

### 6.2 MessageBubble 확장

현재 `MessageBubble.tsx` (42줄)에 추가할 기능:

**a. 압축 통계 표시:**
```
┌─────────────────────────────────────┐
│  AI 응답 내용...                     │
│                                     │
│  ─────────────────────────────────  │
│  📊 토큰 35% 압축 (150 → 97)       │
└─────────────────────────────────────┘
```

**b. 출처 표시 (Research 모드):**
```
┌─────────────────────────────────────┐
│  요약 응답 내용...                   │
│                                     │
│  📚 출처:                           │
│  [1] Claude vs GPT-4o 비교 - site.com│
│  [2] AI 모델 벤치마크 - blog.dev     │
└─────────────────────────────────────┘
```

### 6.3 타입 확장

```typescript
// ChatMessage 확장 (하위 호환 유지)
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  assistantId?: string
  // 신규 필드 (optional로 기존 코드 영향 없음)
  compressionStats?: {
    originalTokens: number
    compressedTokens: number
    reductionPct: number
  }
  sources?: {
    title: string
    url: string
    snippet?: string
  }[]
  mode?: 'chat' | 'research'
}
```

### 6.4 Desktop 앱 즉시 활용 가능 항목

Desktop의 `DesktopChatBubble`에 이미 `tokens` 필드 존재:
- `DesktopMessage.tokens` → 토큰 카운트 표시 기능 준비 완료
- `modelName` prop → 모델명 배지 표시 준비 완료

### 6.5 디자인 토큰 활용

| 앱 | 토큰 접두사 | 활용 |
|----|-----------|------|
| User | `--user-*` | ChatPage, MessageBubble, ResearchPanel |
| Desktop | `--dt-*` | DesktopChatBubble 확장 |
| Admin ROI | `--roi-*` | AI 비용 분석 대시보드 |

### 6.6 Storybook 스토리 계획

| 스토리 파일 | 시나리오 |
|------------|---------|
| MessageBubble.compression.stories.tsx | 압축 통계 표시 |
| MessageBubble.research.stories.tsx | 출처 표시 |
| ChatPage.modes.stories.tsx | Chat/Research 모드 전환 |
| ResearchPanel.stories.tsx | 검색 결과 카드 |

---

## 7. 구현 로드맵

### Phase 1: 기반 구축 (Week 1)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| FastAPI 기본 앱 + Dockerfile | `apps/ai-core/` | 낮음 |
| docker-compose.yml 확장 | `docker-compose.yml` | 낮음 |
| Token Encoder TS 포팅 (영어) | `packages/ui/src/utils/text/` | 낮음 |
| .env.example 업데이트 | `.env.example` | 낮음 |

**검증**: `docker-compose up -d` → `/health` 응답 확인

### Phase 2: 핵심 기능 (Week 2)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| /chat 엔드포인트 + SSE | `apps/ai-core/routers/chat.py` | 중간 |
| /research 엔드포인트 | `apps/ai-core/routers/research.py` | 중간 |
| API Gateway (Next.js Routes) | `apps/user/app/api/` | 중간 |
| ServiceFactory 연동 | `packages/ui/src/client/` | 낮음 |

**검증**: `curl POST /chat` → AI 응답 수신, `curl POST /research` → 검색 결과

### Phase 3: 프론트엔드 통합 (Week 3)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| ChatPage 모드 전환 | `packages/ui/src/user/pages/ChatPage.tsx` | 중간 |
| MessageBubble 확장 | `packages/ui/src/user/components/MessageBubble.tsx` | 낮음 |
| ResearchPanel 컴포넌트 | 신규 | 중간 |
| SourceAttribution 컴포넌트 | 신규 | 낮음 |
| Token Encoder 한국어 지원 | `packages/ui/src/utils/text/` | 중간 |

**검증**: Chat/Research 모드 전환, 출처 표시, 압축 통계 표시

### Phase 4: 품질 강화 (Week 4)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| Vitest 단위 테스트 | `packages/ui/__tests__/` | 중간 |
| Storybook 스토리 | `apps/storybook/` | 낮음 |
| 보안 강화 (SSRF, Rate Limit) | API Routes | 중간 |
| Redis 캐싱 | API Gateway | 중간 |
| E2E 테스트 | `tests/e2e/` | 중간 |

**검증**: 커버리지 60%+, Storybook 빌드 성공, E2E 통과

---

## 8. 비용 예측 (월간)

| 항목 | 예상 비용 | 비고 |
|------|----------|------|
| Claude API (1,000 req/일) | $10~30 | Token Encoder 압축 시 절반 |
| Serper Search API | $0~5 | 무료 2,500건/월 |
| Docker 서버 (Railway) | $5 | 프로토타입 수준 |
| Vercel (기존) | $0 | 무료 플랜 유지 |
| **합계** | **$15~40** | 프로토타입 기준 |

---

## 9. 위험 요소 및 대응

| 위험 | 영향도 | 대응 |
|------|--------|------|
| Python-TS 타입 불일치 | 높음 | OpenAPI 스펙 자동 생성 → TS 타입 생성 |
| Vercel 함수 실행 시간 제한 | 중간 | AI Core 직접 호출 또는 Streaming 활용 |
| 크롤링 차단 (robots.txt) | 중간 | User-Agent 설정, 대체 소스 준비 |
| API 키 노출 | 높음 | 서버사이드 전용, 환경변수, CSP 헤더 |
| 동시 요청 과부하 | 중간 | Redis Rate Limiting, 큐 시스템 |

---

## 10. 다음 단계 (프로토타입 이후)

프로토타입이 안정적으로 동작한 후 검토할 항목:

1. **Vector DB 추가** (Qdrant/Chroma) → 문서 기반 Q&A
2. **Playwright 비동기 크롤링** → JavaScript 렌더링 페이지 지원
3. **대화 히스토리 DB 저장** → localStorage 탈피
4. **Multi-source 병렬 요약** → Research 품질 향상
5. **React Query 도입** → 서버 상태 캐싱
6. **Multi-Agent 병렬 처리** → 복잡한 질문 분할 응답

> Multi-Agent, Self-Improving Loop, AGI 관련 기술은 기본 시스템이 안정적으로 동작한 **이후**에 검토한다.
