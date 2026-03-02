# LLM-Router 클론 구현 계획서

> 작성일: 2026-03-03
> 참조: https://llm-router.ai/docs, https://llm-router.ai/models

---

## 1. LLM-Router 서비스 분석

### 1.1 서비스 개요

LLM-Router는 **한국 시장 특화 기업용 LLM 게이트웨이**로, 여러 AI 제공업체의 모델을 통합 API로 제공한다.

| 항목 | 내용 |
|------|------|
| **핵심 가치** | 모델 원가 + 수수료 0% (마진 없음) |
| **API 호환성** | OpenAI SDK 그대로 사용 (base_url만 변경) |
| **가격 표시** | KRW 원화 환산 (실시간 환율 반영) |
| **보안** | 개인정보 자동 마스킹, 금지어 필터링, PIPA 준수 |
| **과금** | 선불/후불 크레딧, 조직/키별 한도, 자동 KRW 비용 계산 |

### 1.2 지원 모델 현황 (86개 + 이미지 3개)

| 제공자 | 모델 수 | 주요 모델 | 특이사항 |
|--------|---------|----------|---------|
| **Anthropic (Bedrock)** | 9 | Claude Opus 4.6/4.5, Sonnet 4.6/4.5/4/3.7/3.5, Haiku 4.5/3 | **10% 할인** |
| **Anthropic (Direct)** | 10 | 동일 라인업 + Opus 4.1/4, Haiku 3.5 | 정가 |
| **OpenAI** | 20 | GPT-5.3/5.2/5.1/5 시리즈, o3/o1 시리즈 | Codex, Pro, Nano 변형 |
| **Google Gemini** | 8 | Gemini 3.1/3/2.5/2.0 Pro/Flash | 최대 1M 컨텍스트 |
| **Perplexity** | 4 | Sonar Reasoning Pro, Sonar Pro, Deep Research | 실시간 웹 검색 |
| **xAI** | 6 | Grok 4.1/4/3, Code Fast | 최대 2M 컨텍스트 |
| **Upstage** | 3 | Solar Pro 3 Beta, Solar Pro 2, Solar Mini | Solar Pro 3 **100% 무료** |
| **LG AI** | 2 | EXAONE 4.0.1/4.0 32b | 국산 모델 |
| **Z.AI** | 9 | GLM 5/4.7/4.6/4.5 시리즈 | 중국 모델 |
| **DeepSeek** | 2 | DeepSeek V3.2/V3.2 Speciale | |
| **Qwen** | 3 | Qwen3.5 397B, Qwen3 Coder Next/480B | |
| **MoonshotAI** | 3 | Kimi K2.5, K2 Thinking/0905 | |
| **MiniMax** | 3 | MiniMax M2.5/M2.1/M2 | |
| **이미지 생성** | 3 | Gemini 3.1/3/2.5 Flash Image | aspect_ratio, image_size |

### 1.3 가격 구조 (KRW, 백만 토큰당)

| 등급 | 대표 모델 | 입력 | 출력 | 비고 |
|------|----------|------|------|------|
| **Ultra** | o1-pro | 216,750원 | 867,000원 | 최고가 |
| **Premium** | Claude Opus 4.6 | 7,225원 | 36,125원 | >200K 2배 |
| **Standard** | GPT-5.1 | 1,806원 | 14,450원 | |
| **Economy** | Gemini 2.5 Flash | 434원 | 3,613원 | |
| **Budget** | GPT-5 Nano | 72원 | 578원 | 최저가 |
| **Free** | Solar Pro 3 Beta | 0원 | 0원 | 100% 할인 |

### 1.4 API 엔드포인트 구조

```
Base URL: https://api.llm-router.ai/

POST /v1/chat/completions    ← 핵심 (OpenAI 호환)
POST /v1/responses           ← OpenAI Responses API
POST /v1/completions         ← 레거시 (OpenAI/xAI만)
POST /v1/messages            ← Anthropic Messages API
GET  /v1/models              ← 모델 목록 + 가격
POST /v1/audio/speech        ← TTS
POST /v1/video/generation    ← 비디오 생성

특수 경로:
/claude/v1/messages          ← Claude Code 전용
/ai-sdk/chat/completions     ← Vercel AI SDK 전용
```

### 1.5 인증 체계

| 방식 | 헤더 | 용도 |
|------|------|------|
| Bearer Token | `Authorization: Bearer sk-br-v1-*` | OpenAI SDK 호환 (권장) |
| API Key | `X-API-Key: sk-br-v1-*` | 레거시 |
| Anthropic | `x-api-key: sk-br-v1-*` | Claude Code/Anthropic SDK |

### 1.6 핵심 기능 상세

#### 보안
- API 키: `sk-br-v1-` 접두사, 해시 저장, 생성 시에만 전체 키 확인
- 개인정보 자동 마스킹: 주민번호, 여권번호
- 사내 금지어 필터링 (조직별 설정)
- 모델 블랙리스트 (조직별)
- 파일 업로드 차단 (조직별)

#### 과금
- 선불/후불 크레딧 시스템
- 조직별 월 사용량 한도
- API 키별 크레딧 한도
- 실시간 KRW 비용 계산 (`usage.cost` 필드)
- Rate limiting (분당/동시 요청 수)

#### 프로바이더 라우팅
- 가중치 기반 로드 밸런싱
- 자동 장애 복구 (failover)
- Responses API 자동 변환 (Chat Completions → Responses)
- Claude Code 모델 자동 매핑 (claude-sonnet-* → 내부 모델)
- 조직별 모델 오버라이드

#### 스트리밍
- SSE (Server-Sent Events) 지원
- Chat Completions 청크 형식
- Responses API 이벤트 형식
- Anthropic 이벤트 형식
- 이미지 청크 스트리밍 (1KB 단위)

---

## 2. 구현 아키텍처

### 2.1 시스템 구성

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │  Models  │  │   Docs   │  │Dashboard│ │
│  │  Page    │  │  Page    │  │  (MDX)   │  │ (Auth)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  API Gateway (Node.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth    │  │  Router  │  │ Billing  │  │Security │ │
│  │Middleware│  │  Engine  │  │  Engine   │  │ Filter  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Stream   │  │ Rate     │  │ Usage    │              │
│  │ Handler  │  │ Limiter  │  │ Tracker  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Provider Adapters                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │OpenAI  │ │Anthropic│ │Gemini │ │Bedrock │ ...       │
│  │Adapter │ │Adapter  │ │Adapter│ │Adapter │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    Data Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │ InfluxDB │              │
│  │(Users,   │  │(Sessions,│  │(Metrics, │              │
│  │ Credits) │  │ Cache)   │  │ Usage)   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택

| 레이어 | 기술 | 근거 |
|--------|------|------|
| **Frontend** | Next.js 16 + Tailwind CSS 4 | 기존 hchat-wiki 모노레포 활용 |
| **API Gateway** | Node.js + Hono | 경량, SSE 네이티브, Edge 호환 |
| **DB** | PostgreSQL (Supabase) | 조직/사용자/키/크레딧 |
| **Cache** | Redis (Upstash) | Rate limiting, 세션 |
| **Metrics** | InfluxDB 또는 ClickHouse | 시계열 사용량 데이터 |
| **인증** | JWT + API Key | 대시보드 + API 이중 인증 |
| **배포** | Vercel (Frontend) + Fly.io/Railway (API) | SSE 스트리밍 필요 |

---

## 3. 구현 단계

### Phase 1: 프론트엔드 — 마케팅 사이트 (1주)

기존 hchat-wiki 모노레포에 `apps/llm-router` 앱 추가.

#### 1-1. 랜딩 페이지 (`/`)
- 히어로 섹션: "기업용 LLM 라우터" + 빠른 시작 코드 블록
- 주요 기능 4개 카드: 보안, 사용량 관리, 고성능, OpenAI 호환
- API 엔드포인트 요약 테이블
- CTA: 회원가입 / 개발 문서

#### 1-2. 모델 가격표 (`/models`)
- 86개 모델 테이블 (정렬/필터 가능)
  - 컬럼: 제공자 아이콘, 모델명, 모델ID, 최대입력, 최대출력, 입력가격, 출력가격
  - 할인 배지: "10% OFF", "100% OFF"
  - >200K 가격 2단 표시
- 이미지 생성 모델 별도 섹션
- 환율 표시 + 마지막 업데이트 날짜
- 제공자별 필터 탭
- 반응형 (모바일: 카드 뷰)

#### 1-3. 개발 문서 (`/docs/*`)
- MDX 기반 문서 시스템
- 좌측 사이드바 네비게이션:
  ```
  시작하기
  ├── 개요
  └── 인증
  API 레퍼런스
  ├── Chat Completions
  ├── Responses API
  ├── Messages API
  ├── 모델 목록
  └── 미디어 생성
      └── 이미지
  가이드
  ├── 외부 연동
  └── 에러 처리
  ```
- 코드 블록: cURL / Python / JavaScript 탭 전환
- TypeScript 인터페이스 구문 강조
- 파라미터 테이블 자동 생성
- 앵커 링크 + 목차(TOC)

#### 1-4. 모델 테스트 (`/playground`)
- Chat 인터페이스 (모델 선택 드롭다운)
- 스트리밍 응답 표시
- 파라미터 사이드바 (temperature, top_p, max_tokens 등)
- 토큰 사용량 + 비용 실시간 표시
- API 키 입력 또는 로그인 세션

#### 1-5. 인증 페이지
- 로그인 (`/login`)
- 회원가입 (`/signup`)
- 비밀번호 찾기

### Phase 2: API Gateway — 핵심 프록시 (2주)

#### 2-1. 프로젝트 구조

```
packages/gateway/
├── src/
│   ├── index.ts                 # Hono 앱 엔트리
│   ├── middleware/
│   │   ├── auth.ts              # API 키 검증
│   │   ├── rateLimiter.ts       # 분당/동시 제한
│   │   ├── securityFilter.ts    # PII 마스킹, 금지어
│   │   ├── creditCheck.ts       # 크레딧 확인
│   │   └── logging.ts           # 요청/응답 로깅
│   ├── routes/
│   │   ├── chatCompletions.ts   # POST /v1/chat/completions
│   │   ├── responses.ts         # POST /v1/responses
│   │   ├── messages.ts          # POST /v1/messages
│   │   ├── completions.ts       # POST /v1/completions (레거시)
│   │   ├── models.ts            # GET /v1/models
│   │   ├── claude.ts            # /claude/* (Claude Code)
│   │   └── media.ts             # 이미지/오디오/비디오
│   ├── providers/
│   │   ├── base.ts              # Provider 인터페이스
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── bedrock.ts
│   │   ├── gemini.ts
│   │   ├── perplexity.ts
│   │   ├── xai.ts
│   │   ├── upstage.ts
│   │   ├── deepseek.ts
│   │   └── ...
│   ├── streaming/
│   │   ├── sseHandler.ts        # SSE 스트림 관리
│   │   ├── chatChunker.ts       # Chat Completions 청크 변환
│   │   ├── responsesChunker.ts  # Responses API 이벤트 변환
│   │   └── imageChunker.ts      # 이미지 청크 분할
│   ├── billing/
│   │   ├── costCalculator.ts    # 토큰 → KRW 비용 계산
│   │   ├── creditManager.ts     # 크레딧 차감/확인
│   │   └── exchangeRate.ts      # 환율 관리
│   ├── security/
│   │   ├── piiMasker.ts         # 주민번호, 여권번호 마스킹
│   │   ├── forbiddenWords.ts    # 금지어 필터
│   │   └── modelBlacklist.ts    # 모델 차단
│   └── db/
│       ├── schema.ts            # Drizzle ORM 스키마
│       └── queries.ts
```

#### 2-2. 핵심 미들웨어 파이프라인

```
Request → Auth → RateLimit → CreditCheck → SecurityFilter
       → Router (모델 ID → 프로바이더 매핑)
       → Provider Adapter (요청 변환)
       → Upstream API 호출
       → Response 변환 (스트리밍/비스트리밍)
       → 비용 계산 + 크레딧 차감
       → Usage 기록
       → Response
```

#### 2-3. Chat Completions 라우터 (핵심)

```typescript
// 모델 ID 파싱: "openai/gpt-5.1" → provider="openai", model="gpt-5.1"
// 모델 ID 파싱: "bedrock/claude-opus-4.6" → provider="bedrock", model="claude-opus-4.6"

interface RouterConfig {
  modelId: string;          // "openai/gpt-5.1"
  provider: ProviderType;   // "openai" | "anthropic" | "bedrock" | ...
  upstreamModel: string;    // 실제 프로바이더에 보낼 모델명
  inputPriceUSD: number;    // 백만 토큰당 USD
  outputPriceUSD: number;
  contextLength: number;
  maxOutputTokens: number;
  supportedParams: string[]; // 프로바이더별 지원 파라미터
}
```

#### 2-4. 프로바이더 어댑터 패턴

각 프로바이더별 요청/응답 변환:

| 프로바이더 | 요청 변환 | 응답 변환 | 특수 처리 |
|-----------|----------|----------|----------|
| OpenAI | 거의 패스스루 | `usage.cost` 추가 | Responses API 자동 변환 |
| Anthropic | messages → Anthropic format | Anthropic → OpenAI format | `thinking`, `cache_control` |
| Bedrock | messages → Bedrock Converse | Bedrock → OpenAI format | 10% 할인 적용 |
| Gemini | messages → Gemini format | Gemini → OpenAI format | `thinking_budget`, `thinking_level` |
| Perplexity | 패스스루 + 검색 파라미터 | 검색 결과 메타데이터 추가 | `search_domain_filter` |
| xAI | 패스스루 | `usage.cost` 추가 | >128K 가격 2단계 |

#### 2-5. Responses API 자동 변환

```
Chat Completions 요청 (messages 형식)
  ↓ Responses 전용 모델 감지
  ↓ 자동 변환
Responses API 요청 (input 형식)
  ↓ OpenAI Responses API 호출
  ↓ 응답 역변환
Chat Completions 응답 (choices 형식)
```

변환 매핑:
- `messages[system]` → `instructions`
- `messages[user/assistant]` → `input`
- `max_tokens` → `max_output_tokens`
- `tools` → Responses tools 형식
- 스트리밍: Responses SSE 이벤트 → Chat Completions 청크

#### 2-6. Claude Code 전용 경로

```
/claude/v1/messages
  ↓ 모델명 매핑 (claude-sonnet-4-5-* → 내부 모델)
  ↓ 조직별 오버라이드 확인
  ↓ Anthropic/Bedrock 프로바이더 호출
  ↓ 응답 패스스루 (Anthropic 형식 유지)
```

### Phase 3: 대시보드 — 관리 기능 (1주)

#### 3-1. 사용자 대시보드 (`/dashboard`)
- 사용량 요약: 오늘/이번 달 토큰, 비용 (KRW)
- 모델별 사용량 차트
- 일별/주별/월별 추이
- 크레딧 잔액 + 충전 이력

#### 3-2. API 키 관리 (`/dashboard/keys`)
- 키 생성/삭제/비활성화
- 키별 크레딧 한도 설정
- 키별 사용량 조회
- 키 이름 + 마지막 사용 시간

#### 3-3. 조직 설정 (`/dashboard/settings`)
- 조직 정보 수정
- 멤버 관리 (owner/member 권한)
- 보안 설정:
  - 금지어 목록 관리
  - 모델 블랙리스트
  - 파일 업로드 차단 토글
  - PII 마스킹 설정
- Claude Code 모델 오버라이드 (family별)

#### 3-4. 요금/결제 (`/dashboard/billing`)
- 크레딧 충전 (선불)
- 청구 내역 (후불)
- 요금 계산기
- 인보이스 다운로드

### Phase 4: 데이터베이스 스키마 (Phase 2와 병행)

```sql
-- 조직
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  monthly_credit_limit DECIMAL(12,2),
  settings JSONB DEFAULT '{}',  -- 금지어, 모델블랙리스트, 파일업로드 등
  claude_code_overrides JSONB,  -- {haiku: "model_id", sonnet: "model_id", opus: "model_id"}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  org_id UUID REFERENCES organizations(id),
  role VARCHAR(20) DEFAULT 'member',  -- owner | member
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API 키
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL,     -- bcrypt 해시
  key_prefix VARCHAR(20) NOT NULL,    -- "sk-br-v1-xxxx" (처음 일부만 저장)
  name VARCHAR(255),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  credit_limit DECIMAL(12,2),         -- 키별 한도 (NULL = 무제한)
  credit_used DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용 기록
CREATE TABLE usage_logs (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  org_id UUID REFERENCES organizations(id),
  model_id VARCHAR(100) NOT NULL,     -- "openai/gpt-5.1"
  provider VARCHAR(50) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  thinking_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6),
  cost_krw DECIMAL(10,2),
  exchange_rate DECIMAL(8,2),
  latency_ms INTEGER,
  status VARCHAR(20),                 -- success | error | client_disconnected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 크레딧 거래
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  amount DECIMAL(12,2) NOT NULL,      -- 양수: 충전, 음수: 사용
  type VARCHAR(20) NOT NULL,          -- topup | usage | refund
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 모델 정보
CREATE TABLE models (
  id VARCHAR(100) PRIMARY KEY,        -- "openai/gpt-5.1"
  provider VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  context_length INTEGER NOT NULL,
  max_output_tokens INTEGER NOT NULL,
  input_price_usd DECIMAL(10,6),      -- per 1M tokens
  output_price_usd DECIMAL(10,6),
  input_price_extended_usd DECIMAL(10,6),  -- >200K 가격
  output_price_extended_usd DECIMAL(10,6),
  discount_percent INTEGER DEFAULT 0,
  input_modalities TEXT[] DEFAULT '{text}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 환율
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  usd_to_krw DECIMAL(8,2) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 5: 보안 기능 (Phase 2와 병행)

#### 5-1. PII 마스킹

```typescript
// 주민번호: 123456-1234567 → 123456-*******
// 여권번호: M12345678 → M********
const PII_PATTERNS = [
  { name: 'rrn', regex: /(\d{6})-(\d{7})/g, mask: '$1-*******' },
  { name: 'passport', regex: /([A-Z])(\d{8})/g, mask: '$1********' },
  { name: 'phone', regex: /(\d{3})-(\d{3,4})-(\d{4})/g, mask: '$1-****-$3' },
  { name: 'email_body', regex: /([a-zA-Z0-9._%+-]+)@/g, mask: '***@' },
];
```

#### 5-2. 금지어 필터

```typescript
// 조직 설정에서 금지어 목록 로드
// 요청 messages 내 content 스캔
// 매칭 시 403 forbidden_content 에러 반환
```

#### 5-3. Rate Limiting

```typescript
// Redis 기반 슬라이딩 윈도우
// 조직별: 분당 N 요청, 동시 M 요청
// API 키별: 분당 N 요청 (선택적)
// 초과 시: 429 + Retry-After 헤더
```

---

## 4. 프론트엔드 상세 설계

### 4.1 모델 가격표 페이지 UI 구조

```
┌─────────────────────────────────────────────────────┐
│ 통합 모델 가격표                                      │
│ LLM-Router는 표기된 모델 가격 외에 수수료를 부과하지 않습니다│
│ 총 86개 모델 (2026년 3월 3일 현재. 환율: 1 USD = ₩1,445)│
├─────────────────────────────────────────────────────┤
│ [전체] [Anthropic] [OpenAI] [Google] [xAI] [기타]    │
├──────┬──────┬──────┬──────┬──────┬──────────────────┤
│제공자│모델  │최대  │최대  │입력  │출력 가격          │
│      │      │입력  │출력  │가격  │                  │
├──────┼──────┼──────┼──────┼──────┼──────────────────┤
│ 🔵   │Claude│1M   │128K  │7,225 │36,125원          │
│anthr │Opus  │     │      │>200K │>200K 54,188원     │
│opic  │4.6   │     │      │14,450│                  │
│      │10%OFF│     │      │⬇6,503│⬇32,513원         │
├──────┼──────┼──────┼──────┼──────┼──────────────────┤
│ ...  │      │     │      │      │                  │
└──────┴──────┴──────┴──────┴──────┴──────────────────┘
│                                                      │
│ 이미지 생성 모델 3개                                   │
│ ┌──────┬──────┬──────┬──────┬───────────────────┐    │
│ │모델  │입력  │텍스트│이미지 출력 가격            │    │
│ │      │가격  │출력  │                          │    │
│ └──────┴──────┴──────┴──────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 4.2 문서 페이지 구조

```
┌──────────┬──────────────────────────────────────┐
│ 사이드바  │  컨텐츠 영역                          │
│          │                                      │
│ 시작하기  │  Chat Completions API                │
│  개요    │                                      │
│  인증    │  OpenAI 호환 Chat Completions...      │
│          │                                      │
│ API 레퍼 │  엔드포인트 개요                       │
│  Chat... │  ┌──────────────────────────┐        │
│  Respo...│  │ POST /v1/chat/completions│        │
│  Messa...│  └──────────────────────────┘        │
│  모델목록│                                      │
│  이미지  │  요청 형식                             │
│          │  ┌─[cURL]─[Python]─[JS]────┐        │
│ 가이드   │  │ curl https://api...      │        │
│  외부연동│  │   -H "Authorization..."  │        │
│  에러처리│  │   -d '{...}'             │        │
│          │  └──────────────────────────┘        │
└──────────┴──────────────────────────────────────┘
```

### 4.3 컴포넌트 목록

| 컴포넌트 | 용도 |
|---------|------|
| `ModelTable` | 모델 가격표 테이블 (정렬/필터) |
| `ModelCard` | 모바일용 모델 카드 뷰 |
| `ProviderBadge` | 제공자 아이콘 + 이름 |
| `DiscountBadge` | "10% OFF", "100% OFF" 배지 |
| `PriceCell` | 가격 표시 (할인가, >200K 2단) |
| `CodeBlock` | 코드 블록 (탭 전환, 복사) |
| `DocsSidebar` | 문서 좌측 네비게이션 |
| `ParamTable` | API 파라미터 테이블 |
| `TypeDef` | TypeScript 인터페이스 표시 |
| `ApiEndpoint` | 엔드포인트 배지 (POST /v1/...) |
| `Playground` | 모델 테스트 인터페이스 |
| `CreditGauge` | 크레딧 잔액 게이지 |
| `UsageChart` | 사용량 차트 (SVG) |

---

## 5. 구현 우선순위

### MVP (4주)

| 주차 | 작업 | 산출물 |
|------|------|--------|
| **1주** | 프론트엔드: 랜딩 + 모델 가격표 + 문서 | 마케팅 사이트 |
| **2주** | API Gateway: Chat Completions + OpenAI/Anthropic 프로바이더 | 핵심 프록시 |
| **3주** | 인증 + 대시보드 + API 키 관리 | 사용자 관리 |
| **4주** | 과금 + Rate Limiting + 보안 필터 | 엔터프라이즈 기능 |

### Post-MVP

| 단계 | 작업 |
|------|------|
| **v1.1** | Gemini/xAI/Perplexity 프로바이더 추가 |
| **v1.2** | Responses API + Claude Code 전용 경로 |
| **v1.3** | 이미지 생성 (Gemini Image) |
| **v1.4** | Playground (모델 테스트) |
| **v1.5** | Vercel AI SDK Provider 패키지 (`@llm-router/ai-sdk-provider`) |
| **v2.0** | 멀티 조직, SSO, 감사 로그 |

---

## 6. hchat-wiki 모노레포 통합 방안

### 옵션 A: 기존 모노레포에 추가 (권장)

```
hchat-wiki/
├── packages/
│   ├── tokens/
│   ├── ui/
│   └── gateway/           ← 신규: API Gateway 패키지
├── apps/
│   ├── wiki/
│   ├── hmg/
│   ├── admin/
│   ├── storybook/
│   └── llm-router/         ← 신규: LLM-Router 프론트엔드
```

장점:
- 기존 디자인 토큰, UI 컴포넌트 재사용
- ThemeProvider, 다크모드 즉시 적용
- Turborepo 빌드 오케스트레이션

### 옵션 B: 별도 레포지토리

```
llm-router/
├── apps/
│   ├── web/               ← Next.js 프론트엔드
│   └── gateway/           ← Hono API 서버
├── packages/
│   ├── sdk-provider/      ← @llm-router/ai-sdk-provider
│   └── shared/            ← 공통 타입/유틸
```

장점:
- 독립적 배포 사이클
- 별도 도메인/인프라

---

## 7. 핵심 구현 난이도 평가

| 기능 | 난이도 | 예상 공수 | 비고 |
|------|--------|----------|------|
| 모델 가격표 페이지 | ⭐⭐ | 2일 | 정적 데이터, 필터/정렬 |
| 문서 사이트 (MDX) | ⭐⭐⭐ | 3일 | 코드탭, 파라미터 테이블 |
| Chat Completions 프록시 | ⭐⭐⭐⭐ | 5일 | SSE 스트리밍, 다중 프로바이더 |
| Anthropic Messages 프록시 | ⭐⭐⭐ | 3일 | 형식 변환 |
| Responses API 자동 변환 | ⭐⭐⭐⭐⭐ | 5일 | 양방향 변환, 스트리밍 |
| Claude Code 전용 경로 | ⭐⭐⭐ | 2일 | 모델 매핑, 오버라이드 |
| API 키 인증 | ⭐⭐ | 2일 | 해시 저장, Bearer/X-API-Key |
| Rate Limiting | ⭐⭐⭐ | 2일 | Redis 슬라이딩 윈도우 |
| PII 마스킹 | ⭐⭐ | 1일 | 정규식 기반 |
| 금지어 필터 | ⭐⭐ | 1일 | 조직 설정 연동 |
| 크레딧/과금 시스템 | ⭐⭐⭐⭐ | 4일 | 트랜잭션 안전성 |
| 사용량 대시보드 | ⭐⭐⭐ | 3일 | 차트, 통계 |
| 이미지 생성 (청크 스트리밍) | ⭐⭐⭐⭐ | 3일 | 1KB 청크 분할, 재조합 |
| Playground | ⭐⭐⭐ | 3일 | 실시간 채팅 UI |
| AI SDK Provider 패키지 | ⭐⭐⭐ | 2일 | npm 배포 |

**총 예상: ~40일 (1명 기준)**

---

## 8. 참고: LLM-Router 에러 코드 전체 목록

| HTTP | 코드 | 설명 | 재시도 |
|------|------|------|--------|
| 400 | `forbidden_content` | 금지어 포함 | ❌ |
| 401 | `invalid_api_key` | 잘못된 API 키 | ❌ |
| 403 | `credit_limit_exceeded` | 크레딧 부족 | ❌ |
| 403 | `file_upload_blocked` | 파일 업로드 차단 | ❌ |
| 403 | `model_blacklisted` | 모델 차단됨 | ❌ |
| 404 | `model_not_found` | 모델 없음 | ❌ |
| 404 | `completions_not_supported` | Completions API 미지원 | ❌ |
| 429 | `rate_limit_exceeded` | 요청 제한 초과 | ✅ (Retry-After) |
| 499 | `client_disconnected` | 클라이언트 연결 해제 | - |
| 500 | `service_unavailable` | 서버 오류 | ✅ |
| 502 | - | 업스트림 오류 | ✅ |
| 503 | `service_unavailable` | 서비스 중단 | ✅ |
| - | `provider_error` | 제공자 원본 에러 (패스스루) | 상황별 |

---

## 9. 결론

LLM-Router는 **LLM 프록시 + 기업 관리 기능 + 마케팅 사이트**의 3중 구조이다.

**핵심 경쟁력:**
1. 수수료 0% — 모델 원가 그대로
2. OpenAI SDK 호환 — base_url만 변경
3. KRW 원화 과금 — 한국 기업 친화
4. 다중 프로바이더 통합 — 86개 모델 하나의 API
5. 기업 보안 — PII 마스킹, 금지어, 모델 차단

**구현 시 가장 복잡한 부분:**
1. SSE 스트리밍 프록시 (다중 프로바이더 형식 변환)
2. Responses API ↔ Chat Completions 자동 변환
3. 크레딧 시스템의 트랜잭션 안전성
4. 프로바이더별 파라미터 호환성 매핑
