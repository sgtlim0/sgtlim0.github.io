# H Chat Wiki — Skill 설계방안 v2

> **작성일**: 2026-03-22
> **이전 버전**: v1 (2026-03-16, 725줄, 커밋 61c3cc7)
> **분석 기반**: 프로젝트 내 111개 MD 파일 (docs/ 82개 + content/ 28개 + CLAUDE.md) 병렬 분석
> **분석 방법**: PM/Worker 4-Agent 병렬 처리
> **변경 사유**: 신규 문서 추가, Browser OS 아키텍처 반영, 감사 결과 통합, Wiki v4 콘텐츠 반영

---

## 1. Executive Summary

| 항목 | v1 (03-16) | v2 (03-22) | 변화 |
|------|-----------|-----------|------|
| 분석 대상 MD 파일 | 100개 (~50,000줄) | 111개 (~55,000줄) | +11개 |
| 도출된 Skill 후보 | 32개 | 40개 | +8개 |
| 핵심 Skill (즉시 구현 권장) | 12개 | 16개 | +4개 |
| 확장 Skill (Phase별 추가) | 20개 | 24개 | +4개 |
| 참조 아키텍처 패턴 | 18개 | 24개 | +6개 |
| 참조 템플릿 | 9개 | 12개 | +3개 |
| Skill 테스트 완료 | 0개 | 3개 | +3개 |

### v2 핵심 변경점

1. **Browser OS 4-Layer Stack** 반영 — L1 Extension → L2 Smart DOM → L3 DataFrame → L4 MARS 계층별 Skill 추가
2. **코드베이스 감사 결과** 통합 — 85/100 (A-), CRITICAL 1건 해소, HIGH 7건 Skill 연계
3. **Wiki v4 콘텐츠** 반영 — Desktop PWA (15페이지), 배치 OCR, 심층 리서치, 문서 번역 등 신규 기능
4. **Enterprise API** 패턴 추가 — Bulk API, LLM Router Gateway (86개 모델), SSE 프로토콜 통일
5. **Phase 진화 맵** 정리 — Phase 1→100 달성 수치 + Phase 101+ Browser OS 로드맵
6. **3건 Skill 테스트 결과** 반영 — service-layer-gen, page-scaffold, codebase-audit 검증 완료

### 핵심 발견

1. **프로젝트 고유의 반복 패턴 10가지**가 Skill로 자동화 가능 (v1 대비 +3)
2. **4-Layer Stack** (Extension → Smart DOM → DataFrame → MARS) 파이프라인이 모든 기능의 근간
3. **PM-Worker 병렬 패턴**이 문서 작성/코드 생성/테스트 모두에 일관 적용
4. **Service Provider + Mock/Real 전환**이 10개 앱 전체에 동일 구조로 반복
5. **Zero Trust 보안이 L1부터 내장** — 3중 PII 검증, CSP `'self'`, HMAC-SHA256 JWT
6. **DataFrame Engine (L3)**이 최대 차별화 요소 — 웹 자동 데이터셋 변환, 경쟁사 6개월 추격 불가

---

## 2. 분석 결과 종합

### 2.1 Worker별 분석 결과

```
┌──────────────────────────────────────────────────────────────────┐
│                   111개 MD 파일 분석 맵 (v2)                       │
├───────────────┬───────────────┬───────────────┬──────────────────┤
│  W1 설계/기획   │  W2 구현/개발   │  W3 Wiki 콘텐츠 │  W4 개발계획/비전  │
│  19개 문서      │  31개 문서      │  28개 파일      │  33개 문서        │
│  ~15,000줄     │  ~12,290줄     │  ~4,200줄      │  ~16,000줄       │
├───────────────┼───────────────┼───────────────┼──────────────────┤
│ 4-Layer 아키텍처 │ Service Layer  │ v4 기능 맵      │ Phase 1→100 여정  │
│ Browser OS 비전 │ MV3 재설계      │ UX 패턴 5종     │ PM-Worker 패턴    │
│ Zero Trust 내장 │ SSE 프로토콜 통일│ Desktop PWA 15p │ Self-Healing 루프  │
│ GTM 3단계      │ Enterprise API  │ 프라이버시 퍼스트 │ Worktree 병렬     │
│ ROI $645.5K    │ SVG 순수 차트   │ 에이전트 10스텝  │ Zero Trust 에이전트│
│ MARS 파이프라인  │ Zod 40+ 타입   │ v1→v4 진화 추적 │ 감사 85점 (A-)    │
│ 10 Skill 후보   │ 12 Skill 후보   │ 6 Skill 후보    │ 12 Skill 후보     │
└───────────────┴───────────────┴───────────────┴──────────────────┘
```

### 2.2 반복 패턴 10가지 (Skill 자동화 대상)

| # | 반복 패턴 | 발생 빈도 | 자동화 ROI | v1 대비 |
|---|----------|----------|-----------|---------|
| P1 | Service Layer 생성 (types→mock→hooks→provider) | 10개 앱 모두 | **최고** | 유지 |
| P2 | 디자인 토큰 → Tailwind 테마 브릿지 | 7개 앱 접두사 | 높음 | 유지 |
| P3 | 페이지 스캐폴딩 (Next.js page + 서비스 + 스토리) | 50+ 페이지 | **최고** | 유지 |
| P4 | Storybook 스토리 자동 생성 | 209 스토리 | 높음 | 유지 |
| P5 | 보안 레이어 적용 (Zod + PII + CSP) | 모든 엔드포인트 | 높음 | 유지 |
| P6 | PM-Worker 병렬 문서 작성 | 모든 설계 문서 | 중간 | 유지 |
| P7 | 테스트 커버리지 갭 분석 → 우선순위 테스트 생성 | 239 테스트 파일 | 높음 | 유지 |
| **P8** | **SSE 스트리밍 청크 변환** (Chat/Responses/Anthropic 3형식) | Chat, Research, Agent | **높음** | **신규** |
| **P9** | **Enterprise Bulk API** (부서/사용자 트리 구조 CRUD) | Admin, Enterprise | **중간** | **신규** |
| **P10** | **4-Layer Stack 계층별 코드 생성** (L1→L4 파이프라인) | Browser OS 전체 | **최고** | **신규** |

---

## 3. Skill 설계 체계

### 3.1 Skill 카테고리 구조 (v2)

```
hchat-wiki-skills/
├── core/                       # 핵심 개발 스킬 (P0, 테스트 완료 3건)
│   ├── service-layer-gen ✅     # Service Layer 일괄 생성 (테스트 완료)
│   ├── page-scaffold ✅         # Next.js 페이지 스캐폴딩 (테스트 완료)
│   ├── story-gen                # Storybook 스토리 자동 생성
│   ├── token-bridge             # 디자인 토큰 → Tailwind 브릿지
│   ├── security-layer           # 보안 레이어 자동 적용
│   └── test-prioritizer         # 테스트 커버리지 갭 → 우선순위 테스트
├── analysis/                    # 분석/감사 스킬 (P1)
│   ├── codebase-audit ✅        # 5영역 코드 감사 (테스트 완료)
│   ├── catalog-auditor          # 컴포넌트 카탈로그 감사
│   ├── gap-analyzer             # 아키텍처 갭 분석
│   └── bundle-optimizer         # 번들 최적화 분석
├── planning/                    # 기획/계획 스킬 (P1)
│   ├── sprint-planner           # Sprint 계획 + Day별 태스크
│   ├── feature-spec             # 기능 명세 자동 생성 (F01-F16)
│   ├── demo-scenario            # 데모 시나리오 구조화
│   └── risk-register            # 리스크 레지스터 관리
├── extension/                   # Chrome Extension 전용 스킬 (P1)
│   ├── ext-scaffold             # Extension 프로젝트 스캐폴딩
│   ├── manifest-validator       # Manifest V3 생성/보안 감사 [v2 신규]
│   ├── pii-sanitizer            # PII 살균 룰 관리
│   └── cws-checklist            # CWS 심사 체크리스트
├── ai-platform/                 # AI 플랫폼 스킬 (P2)
│   ├── model-router             # 멀티 모델 라우팅 설계
│   ├── token-optimizer          # 토큰 최적화 파이프라인
│   ├── agent-orchestrator       # 에이전트 오케스트레이션
│   ├── self-healing             # Self-Healing 시스템 설계
│   └── streaming-handler-gen    # SSE 청크 변환 자동 생성 [v2 신규]
├── enterprise/                  # 엔터프라이즈 스킬 [v2 신규 카테고리]
│   ├── api-gateway-gen          # Hono 라우터 + 미들웨어 자동 생성
│   ├── bulkapi-generator        # Bulk API 요청/응답 자동 생성
│   └── admin-form-builder       # Admin 폼 + Zod 스키마 자동 생성
├── docs/                        # 문서화 스킬 (P1)
│   ├── pm-worker-doc            # PM-Worker 병렬 문서 작성
│   ├── presentation-gen         # HTML 프레젠테이션 생성
│   ├── claudemd-sync            # CLAUDE.md 동기화
│   ├── changelog-gen            # Changelog 자동 생성
│   └── mdx-docs-gen             # MDX API 문서 자동 생성 [v2 신규]
├── wiki/                        # Wiki 콘텐츠 스킬 [v2 신규 카테고리]
│   ├── wiki-content-generator   # Wiki 기능 문서 자동 생성
│   ├── wiki-faq-updater         # FAQ 항목 추가/수정
│   └── wiki-content-validator   # frontmatter/링크/배지 검증
└── devops/                      # DevOps 스킬 (P1)
    ├── deploy-validator         # 배포 전 검증
    ├── canary-playbook          # Canary 배포 플레이북
    ├── quality-gate             # 품질 게이트 검증
    └── worktree-parallel        # Worktree 병렬 실행
```

---

## 4. 핵심 Skill 상세 설계 (16개)

### 4.1 `service-layer-gen` — Service Layer 일괄 생성 ✅ 테스트 완료

**트리거**: 새로운 도메인/기능 추가 시
**우선순위**: P0 (즉시 구현) | **상태**: 테스트 완료 (커밋 fcd6f2b, 8/8 패턴)

| 산출물 | 파일명 패턴 | 내용 |
|--------|-----------|------|
| 타입 정의 | `types.ts` | 인터페이스 + Zod 스키마 |
| Mock 서비스 | `mock{Domain}Service.ts` | 페이커 데이터 + 지연 시뮬레이션 |
| Real 서비스 | `real{Domain}Service.ts` | fetch + 에러 처리 |
| Provider | `{Domain}ServiceProvider.tsx` | Context + Mock/Real 전환 |
| Hooks | `use{Domain}.ts` | useQuery/useMutation 래핑 |
| Index | `index.ts` | barrel export |

**핵심 규칙**:
- `NEXT_PUBLIC_API_MODE` 환경변수로 Mock/Real 전환
- 불변성 패턴 (spread 연산자, 절대 직접 변경 않음)
- Zod `.parse()` 로 런타임 입력 검증
- Mock 서비스에 50-200ms 랜덤 지연 추가

**참조 문서**: `ADMIN_SERVICE_LAYER.md`, `CHROME_EXTENSION_IMPLEMENTATION.md`, `API_SPEC.md`

---

### 4.2 `page-scaffold` — Next.js 페이지 스캐폴딩 ✅ 테스트 완료

**트리거**: 새 페이지 추가 시
**우선순위**: P0 | **상태**: 테스트 완료 (커밋 81ab69c, 타입 0 에러, 7/7 테스트)

| 산출물 | 설명 |
|--------|------|
| `app/{route}/page.tsx` | Server Component + dynamic import |
| `{PageName}.tsx` | Client Component (UI) |
| `use{PageName}.ts` | 페이지 전용 훅 |
| `{PageName}.stories.tsx` | Storybook 스토리 (3+ 변형) |
| `{PageName}.test.tsx` | Vitest 단위 테스트 |

**핵심 규칙**:
- Next.js 16 App Router + Static Export (`output: 'export'`)
- async/await for params (Next.js 15+ 요구사항)
- `@hchat/ui`에서 공유 컴포넌트 import
- 다크 모드: ThemeProvider + `.dark` 클래스 토글

**참조 문서**: `HCHAT_USER_FEATURES_IMPLEMENTATION.md`, `HCHAT_ADMIN_DESIGN.md`, `SCREEN_DESIGN.md`

---

### 4.3 `story-gen` — Storybook 스토리 자동 생성

**트리거**: 컴포넌트 생성/수정 직후
**우선순위**: P0

**생성 변형**: Default, WithData, Loading, Error, Dark, Mobile, Interactive (7종)

**핵심 규칙**:
- Storybook 9 + `@storybook/nextjs-vite` 프레임워크
- CSF 3.0 포맷, Play function으로 인터랙션 테스트 작성
- MSW handler 연동, vite aliases로 모노레포 모듈 해석

**참조 문서**: `STORYBOOK_IMPLEMENTATION.md`, `MONOREPO_STORYBOOK_PLAN.md`

---

### 4.4 `security-layer` — 보안 레이어 자동 적용

**트리거**: API 엔드포인트/사용자 입력 처리 코드 작성 시
**우선순위**: P0

**6계층 보안 + Zero Trust 확장 (v2)**:

| 계층 | 항목 | 자동화 |
|------|------|--------|
| L1 입력 검증 | Zod `.parse()` 적용 | 스키마 자동 생성 |
| L2 PII 살균 | 11패턴 마스킹 | 정규식 룰 적용 |
| L3 CSP | nonce + `'self'` only (eval 차단) | middleware.ts 생성 |
| L4 API 프록시 | 서버사이드 API Key 보호 | Route Handler 생성 |
| L5 Rate Limiting | 엔드포인트별 제한 | 미들웨어 추가 |
| L6 블록리스트 | 20 도메인 + 6 패턴 차단 | blocklist.ts 업데이트 |

**v2 추가**: Zero Trust 3중 PII 검증 (Content Script → Background SW → AI Core 서버)

**참조 문서**: `IMPL_05_SECURITY_GOVERNANCE_FRAMEWORK.md`, `SERVICE_PLAN_03_ARCHITECTURE.md`

---

### 4.5 `token-bridge` — 디자인 토큰 → Tailwind 브릿지

**트리거**: 디자인 토큰 변경 시
**우선순위**: P1

**7개 앱 접두사 네임스페이스**:

| 앱 | 접두사 | 토큰 수 |
|----|--------|--------|
| Wiki | `--wiki-` | 16 |
| HMG | `--hmg-` | 14 |
| Admin | `--admin-` | 12 |
| ROI | `--roi-` | 18 |
| User | `--user-` | 9 |
| LLM Router | `--lr-` | 11 |
| Desktop | `--dt-` | 21 |

**핵심 규칙**:
- Tailwind CSS 4: `@theme inline` + `@source` (디렉토리 경로만, glob 불가)
- 194개 CSS 변수 (light/dark 쌍)
- 새 토큰 추가 시 light + dark 쌍으로 반드시 정의

**참조 문서**: `DESIGN_TOKENS.md`, `HMG_DESIGN_GUIDE_PLAN.md`

---

### 4.6 `test-prioritizer` — 테스트 커버리지 갭 → 우선순위 테스트

**트리거**: `npm run test:coverage` 실행 후
**우선순위**: P1

| 우선순위 | 대상 | 전략 |
|---------|------|------|
| P0 Critical | 보안 관련 코드 (sanitize, auth, PII) | 즉시 TDD |
| P1 High | 서비스 훅 (useChat, useAuth 등) | 에러 시나리오 중심 |
| P2 Medium | UI 컴포넌트 (로직 포함) | 로직 추출 → 순수 함수 테스트 |
| P3 Low | 브라우저 API 의존 (DraggableList 등) | JSDOM mock + 최소 테스트 |

**참조 문서**: `COVERAGE_REPORT.md`, `DEV_PLAN_04_TEST_CICD_TEAM.md`

---

### 4.7 `codebase-audit` — 5영역 코드 감사 ✅ 테스트 완료

**트리거**: Phase 전환 / 코드 리뷰 / 정기 감사 시
**우선순위**: P1 | **상태**: 테스트 완료 (커밋 a78dc3d, 종합 A- 85점)

**5영역 점수 체계 (최근 실측)**:

| 영역 | 측정 항목 | 실측 점수 |
|------|---------|----------|
| 아키텍처 | 순환의존 0, 800줄+ 0건 | A- (88점) |
| 코드 품질 | any 1건, console.log(runtime) 2건 | A- (88점) |
| 보안 | CRITICAL 0건 (1건 해소), HIGH 1건 (Zod 미적용) | B+ (83점) |
| 테스트 | 6,004 테스트 99.63% 통과 | A- (88점) |
| 빌드/인프라 | Docker 보안 강화 완료 | B+ (80점) |

**참조 문서**: `CODEBASE_AUDIT_2026-03-16.md`, `DEEP_ANALYSIS_REPORT_v3.md`

---

### 4.8 `sprint-planner` — Sprint 계획 자동 생성

**트리거**: 새 스프린트 시작 시
**우선순위**: P1

| 섹션 | 내용 |
|------|------|
| 에픽 분해 | 에픽 → 스토리 → 태스크 (SP 배정) |
| Day별 계획 | 태스크-담당자-의존성 Gantt |
| 의존성 그래프 | Mermaid 기반 크리티컬 패스 |
| Go/No-Go | Must 4 + Should 4 체크리스트 |
| Scope 축소 | Level 1~3 점진적 축소 전략 |

**참조 문서**: `DEV_PLAN_01_SPRINT_0.md`, `DEV_PLAN_02_PHASE_1_2.md`

---

### 4.9 `ext-scaffold` — Chrome Extension 스캐폴딩

**트리거**: Extension 새 기능/페이지 추가 시
**우선순위**: P1

| 파일 | 역할 |
|------|------|
| `manifest.json` | MV3 최소 권한 |
| `background.ts` | Service Worker (5분 비활성 종료 대응) |
| `content.ts` | Content Script (Isolated World) |
| `sidepanel/` | Side Panel UI (주 인터페이스) |
| `popup/` | Popup (400x600 퀵 액션) |
| `services/` | 서비스 인터페이스 + Mock (ExtensionServiceProvider) |
| `types/` | 메시지/컨텍스트/설정 타입 |

**참조 문서**: `CHROME_EXTENSION_DESIGN.md`, `CHROME_EXTENSION_IMPLEMENTATION.md`

---

### 4.10 `model-router` — 멀티 모델 라우팅 설계

**트리거**: AI 기능 추가 / 모델 비용 최적화 시
**우선순위**: P2

**복합 점수 라우팅 (v2 업데이트)**:

```
score = quality * 0.40 + latency * 0.30 + cost * 0.20 + availability * 0.10

availability_score = f(waitTime):
  waitTime = 0      → 1.0
  waitTime < 5s     → 0.8
  waitTime < 30s    → 0.4
  waitTime >= 30s   → 0.0 (자동 제외)
```

**Fallback 체인**: Primary → Secondary → Tertiary → Mock (월 $2K 초과 시)
**효과**: LLM 비용 $45K/년 제어 (vs. 단일 모델 $80K+)

**참조 문서**: `IMPL_BROWSER_OS_03_MULTIMODEL_HEALING.md`, `LLM_ROUTER_IMPLEMENTATION_PLAN.md`

---

### 4.11 `pm-worker-doc` — PM-Worker 병렬 문서 작성

**트리거**: 대규모 설계/분석 문서 작성 시
**우선순위**: P1

```
Phase 1: PM — 문서 구조 설계 + Worker별 담당 영역 배정
Phase 2: Worker 병렬 작성 (Agent tool, run_in_background)
Phase 3: PM 통합 — 중복 제거 + 일관성 검증 + Executive Summary
```

**참조 문서**: `DEV_PLAN_00_MASTER.md`, `WORKTREE_AGENT_PLAN.md`

---

### 4.12 `quality-gate` — 품질 게이트 검증

**트리거**: Phase 전환 / 배포 전 / PR 머지 전
**우선순위**: P1

| 레벨 | 항목 | 임계값 |
|------|------|--------|
| **PR** | 타입 체크 + Lint + 테스트 | 에러 0, 번들 +10% 이내 |
| **Phase** | 커버리지 + E2E + 보안 스캔 | stmts 40%+, CRITICAL 0 |
| **Production** | Lighthouse + 부하 + Canary | FCP<3s, P95<2s, 에러<0.1% |

**참조 문서**: `DEV_PLAN_04_TEST_CICD_TEAM.md`, `DEPLOYMENT_CHECKLIST.md`

---

### 4.13 `streaming-handler-gen` — SSE 청크 변환 자동 생성 [v2 신규]

**트리거**: 스트리밍 기능 추가 시
**우선순위**: P1

**3가지 청크 형식 자동 변환**:

| 형식 | 구조 | 사용처 |
|------|------|--------|
| Chat Completions | `{"choices":[{"delta":{"content":"token"}}]}` | OpenAI 호환 |
| Responses API | `{"type":"content_block_delta","delta":{"text":"token"}}` | Anthropic 신규 |
| Anthropic Messages | `{"type":"content_block_delta_event","delta":{"type":"text_delta","text":"token"}}` | Anthropic 레거시 |

**산출물**: Reader/decoder + 청크 변환 미들웨어 + 에러 복구 로직 + 테스트

**참조 문서**: `PROTOTYPE_IMPLEMENTATION_PLAN.md`, `LLM_ROUTER_IMPLEMENTATION_PLAN.md`

---

### 4.14 `api-gateway-gen` — API Gateway 자동 생성 [v2 신규]

**트리거**: 신규 API 게이트웨이 필요 시
**우선순위**: P1

**산출물**:
- Hono 라우터 + 미들웨어 (인증, Rate Limit, CORS)
- 프로바이더 어댑터 (OpenAI/Anthropic/Google/xAI)
- Zod 요청/응답 스키마
- PII 마스킹 미들웨어
- 과금 엔진 (USD → KRW 환산)

**참조 문서**: `LLM_ROUTER_IMPLEMENTATION_PLAN.md` (705줄, 86개 모델)

---

### 4.15 `manifest-validator` — MV3 Manifest 보안 감사 [v2 신규]

**트리거**: manifest.json 변경 시
**우선순위**: P1

**검증 항목**:
- 최소 권한 원칙 (불필요 permission 탐지)
- CSP 규칙 (`'self'` only, eval 차단 확인)
- Host Permissions 범위 검증
- Service Worker 5분 비활성 종료 대응 확인
- CWS 번들 <5MB, Side Panel 로드 <1s

**참조 문서**: `SERVICE_PLAN_03_ARCHITECTURE.md`, `CHROME_EXTENSION_DESIGN.md`

---

### 4.16 `wiki-content-generator` — Wiki 기능 문서 자동 생성 [v2 신규]

**트리거**: 새 기능 문서화 필요 시
**우선순위**: P1

**산출물**: frontmatter(title, description, badges) + 마크다운 본문

**일관성 규칙** (28개 Wiki 파일에서 추출):
- 제목 계층: H1(기능명) → H2(섹션) → H3(상세)
- badges: 버전 + 카테고리
- 표 형식: 기능 비교, 모델 비교, 단축키
- 코드 블록: 사용 예시 포함

**참조 문서**: `content/chat/agent.md` (323줄), `content/settings/usage.md` (468줄)

---

## 5. 확장 Skill 목록 (24개)

### 5.1 분석/감사 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `catalog-auditor` | 컴포넌트/훅/서비스 카탈로그 자동 생성 + 미사용 탐지 | COMPONENT_CATALOG.md |
| `gap-analyzer` | 현재 상태 → 목표 아키텍처 GAP 분석 | H_CHAT_BROWSER_OS_DESIGN.md |
| `bundle-optimizer` | barrel import 분석 + dynamic import 추천 | BUNDLE_ANALYSIS.md |
| `a11y-enhancer` | ARIA 속성 자동 추가 + WCAG 2.1 AA 검증 | A11Y_ENHANCEMENTS.md |

### 5.2 Extension 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `pii-sanitizer` | PII 11패턴 살균 + 3중 검증 (CS→BG→Server) | IMPL_05, CHROME_EXTENSION_IMPLEMENTATION.md |
| `cws-checklist` | Chrome Web Store 심사 체크리스트 | SERVICE_PLAN_04_BUSINESS.md |
| `chrome-admin-policy` | ExtensionInstallForcelist 정책 생성 [v2 신규] | SERVICE_PLAN_04 (2.2 배포 모델) |

### 5.3 AI 플랫폼 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `token-optimizer` | 프롬프트 압축 (System/RAG만, User 불변) | TOKEN_OPTIMIZER_PLAN.md |
| `agent-orchestrator` | LangGraph + CrewAI 하이브리드 에이전트 설계 | IMPL_BROWSER_OS_02.md |
| `self-healing` | 4단계 치유 루프 (진단→치유→검증→복원) + Circuit Breaker | IMPL_04_SELF_HEALING_SYSTEM.md |
| `roi-chart-gen` | 순수 SVG/CSS 차트 자동 생성 (Chart.js 미사용) [v2 신규] | HCHAT_ROI_DASHBOARD_DESIGN.md |

### 5.4 Enterprise 카테고리 [v2 신규]

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `bulkapi-generator` | Bulk API 요청/응답 + implicitDeletion 처리 | HCHAT_ENTERPRISE_API_IMPLEMENTATION.md |
| `admin-form-builder` | Admin 폼 + Zod 스키마 + 서비스 연동 | HCHAT_ADMIN_DESIGN.md |

### 5.5 문서화/Wiki 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `presentation-gen` | 다크 테마 HTML 프레젠테이션 자동 생성 | MEMORY (HTML 공통 패턴) |
| `claudemd-sync` | CLAUDE.md ↔ 코드베이스 불일치 자동 탐지/수정 | DEEP_ANALYSIS_REPORT_2026-03-08.md |
| `changelog-gen` | git log → 구조화된 Changelog 자동 생성 | content/changelog.md |
| `feature-spec` | 기능 명세 (F01-F16 패턴) 자동 생성 | SERVICE_PLAN_02_FEATURES.md |
| `mdx-docs-gen` | MDX API 문서 + CodeBlock (cURL/Python/JS) | LLM_ROUTER_UI_DESIGN.md |
| `wiki-faq-updater` | FAQ 항목 카테고리별 추가/수정 [v2 신규] | content/faq.md |
| `wiki-content-validator` | frontmatter/링크/배지 자동 검증 [v2 신규] | content/ 전체 |

### 5.6 DevOps 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `deploy-validator` | 배포 전 보안/성능/DB 자동 검증 | DEPLOYMENT_CHECKLIST.md |
| `canary-playbook` | 5%→25%→100% + 자동 롤백 조건 | DEV_PLAN_03_PHASE_3_4.md |
| `worktree-parallel` | Git Worktree + Agent 병렬 실행 자동화 | WORKTREE_AGENT_PLAN.md |

---

## 6. 참조 아키텍처 패턴 (24개)

### 6.1 개발 패턴 (6개, v1 유지)

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A1 | Service Provider + Mock/Real 전환 | ADMIN_SERVICE_LAYER.md | service-layer-gen |
| A2 | 디자인 토큰 Single Source of Truth (194개 변수) | DESIGN_TOKENS.md | token-bridge |
| A3 | Next.js 16 Static Export + catch-all route | ARCHITECTURE.md | page-scaffold |
| A4 | Storybook 9 CSF 3.0 + play function 테스트 | STORYBOOK_IMPLEMENTATION.md | story-gen |
| A5 | Zod 런타임 검증 + TypeScript 타입 추론 (40+ 타입) | API_SPEC.md | security-layer |
| A6 | MSW 42 엔드포인트 Mock 체계 (8 domains) | API_SPEC.md | service-layer-gen |

### 6.2 아키텍처 패턴 (6개, v1 유지)

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A7 | 4-Layer Stack (Extension→DOM→DataFrame→MARS) | TECHNICAL_SPECIFICATION.md | ext-scaffold |
| A8 | LangGraph + CrewAI 하이브리드 에이전트 | IMPL_BROWSER_OS_02.md | agent-orchestrator |
| A9 | Dynamic Multi-Model 복합 점수 라우팅 | IMPL_BROWSER_OS_03.md | model-router |
| A10 | Self-Healing 4단계 루프 (진단→치유→검증→복원) | IMPL_04.md | self-healing |
| A11 | Zero Trust L1~L4 + 3중 PII 검증 | IMPL_05, SERVICE_PLAN_03 | security-layer |
| A12 | Feature Flag localStorage 기반 런타임 토글 | featureFlags.ts | quality-gate |

### 6.3 운영 패턴 (6개, v1 유지)

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A13 | PM-Worker 병렬 작성 | DEV_PLAN_00_MASTER.md | pm-worker-doc |
| A14 | Worktree + Agent 병렬 실행 (9 Phase, 5 type) | WORKTREE_AGENT_PLAN.md | worktree-parallel |
| A15 | 3단계 Scope 축소 전략 | DEV_PLAN_01_SPRINT_0.md | sprint-planner |
| A16 | Canary 5%→25%→100% + 자동 롤백 | DEV_PLAN_03.md | canary-playbook |
| A17 | 5영역 코드 감사 (아키텍처/품질/보안/테스트/빌드) | CODEBASE_AUDIT.md | codebase-audit |
| A18 | RACI 매트릭스 + 스킬 매핑 | DEV_PLAN_04.md | sprint-planner |

### 6.4 v2 신규 패턴 (6개)

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A19 | SSE 3형식 청크 자동 변환 | LLM_ROUTER_IMPLEMENTATION_PLAN.md | streaming-handler-gen |
| A20 | Enterprise Bulk API (트리 구조 + implicitDeletion) | HCHAT_ENTERPRISE_API_IMPLEMENTATION.md | bulkapi-generator |
| A21 | LLM Router Gateway (86개 모델 + USD→KRW 과금) | LLM_ROUTER_IMPLEMENTATION_PLAN.md | api-gateway-gen |
| A22 | Chrome Admin 강제 배포 (ExtensionInstallForcelist) | SERVICE_PLAN_04.md | chrome-admin-policy |
| A23 | 순수 SVG/CSS 차트 (Chart.js 미사용, 번들 절약) | HCHAT_ROI_DASHBOARD_DESIGN.md | roi-chart-gen |
| A24 | MARS 6단계 파이프라인 (Planner→Search→Web→Data→Analysis→Report) | TECHNICAL_SPECIFICATION.md | agent-orchestrator |

---

## 7. 코드베이스 감사 결과 ↔ Skill 연계 [v2 신규 섹션]

### 7.1 감사 종합 (2026-03-16 실측)

| 영역 | 점수 | 등급 | 핵심 지표 |
|------|------|------|----------|
| 아키텍처 | 88 | A- | 순환의존 0, 800줄+ 0건, 509 소스 파일 |
| 코드 품질 | 88 | A- | any 1건, console.log(runtime) 2건 |
| 보안 | 83 | B+ | CRITICAL 0건 (1건 해소), HIGH 1건 |
| 테스트 | 88 | A- | 6,004 테스트, 99.63% 통과율 |
| 빌드/인프라 | 80 | B+ | Docker 보안 강화 완료 |
| **종합** | **85** | **A-** | **28건 이슈 (C1+H7+M14+L6)** |

### 7.2 HIGH 이슈 → Skill 매핑

| 이슈 | 심각도 | 연관 Skill | 자동 해소 가능 |
|------|--------|-----------|--------------|
| S1: Zod 검증 부족 (9/10 앱 미적용) | HIGH | **security-layer** | 예 |
| Q1: Admin 12개 컴포넌트 useAsyncData 반복 | HIGH | **service-layer-gen** | 예 |
| B2/B3: TypeScript 376개 에러 | HIGH | build-error-resolver agent | 부분 |
| T1+T2+T3: 테스트 22건 실패 | HIGH | **test-prioritizer** | 예 |

---

## 8. Phase 진화 맵 ↔ Skill 적용 시점 [v2 신규 섹션]

```
Phase 100 (현재 완료)
│  5,997 테스트, 89% 커버리지, 10 앱, 509 소스 파일
│  ├── service-layer-gen ✅ (10개 앱 서비스 레이어 자동화)
│  ├── page-scaffold ✅ (50+ 페이지 스캐폴딩)
│  └── codebase-audit ✅ (5영역 감사 85점)
│
Phase 101+ (Browser OS 신규)
├── Sprint 0 (2주): 4-Layer MVP
│   ├── ext-scaffold → L1 Extension 생성
│   ├── security-layer → Zero Trust L1 내장
│   └── streaming-handler-gen → SSE 프로토콜 통합
│
├── Phase 1-2 (16주): 기반 + 핵심 기능
│   ├── api-gateway-gen → LLM Router Gateway
│   ├── model-router → 복합 점수 라우팅
│   ├── service-layer-gen → 소버린 데이터 서비스
│   └── test-prioritizer → 80%+ 커버리지 확보
│
├── Phase 3 (8주): 통합 + 자동화
│   ├── self-healing → 4단계 치유 루프
│   ├── quality-gate → Phase 전환 품질 검증
│   └── sprint-planner → 인력 배분 + 의존성 관리
│
└── Phase 4 (4주): 프로덕션 준비
    ├── canary-playbook → 5%→25%→100% 배포
    ├── deploy-validator → 프로덕션 체크리스트
    └── codebase-audit → 최종 품질 감사
```

---

## 9. Skill 실행 모델 (3종)

### 9.1 단독 실행

```
사용자 요청 → 트리거 매칭 → 단일 Skill 실행 → 결과 반환
예: "Admin에 새 Marketplace 페이지 추가해줘"
    → page-scaffold → 5개 파일 생성
```

### 9.2 체인 실행

```
사용자 요청 → Skill A → B → C → D → 최종 결과
예: "User 앱에 결제 기능 추가"
    → service-layer-gen (API + Mock + Hooks)
    → page-scaffold (결제 페이지 + 스토리)
    → security-layer (Zod 검증 + PII 살균)
    → test-prioritizer (우선순위 테스트 생성)
    → streaming-handler-gen (결제 상태 SSE 스트리밍) [v2 추가]
```

### 9.3 병렬 실행 (PM-Worker)

```
PM Skill → Worker Skill 1 ─┐
         → Worker Skill 2 ──┼→ PM 통합 → 최종 결과
         → Worker Skill 3 ──┤
         → Worker Skill 4 ─┘
예: "전체 코드 감사 실행"
    → codebase-audit(PM)
      ├── W1: 아키텍처 분석
      ├── W2: 코드 품질 분석
      ├── W3: 보안 분석
      ├── W4: 테스트 분석
      └── W5: 빌드 분석
    → PM 통합 → 종합 보고서
```

---

## 10. Wiki 콘텐츠에서 추출한 H Chat 기능 맵 (v2 업데이트)

### 핵심 사용자 기능 12개 영역

| # | 기능 영역 | 핵심 기능 | Skill 연관 | 버전 |
|---|----------|---------|-----------|------|
| 1 | AI 채팅 | 멀티 프로바이더 스트리밍, 6+커스텀 페르소나 | model-router | v3+ |
| 2 | 모델 비교 | 그룹 채팅(병렬), 크로스 모델 토론(3라운드) | model-router | v3+ |
| 3 | 자율 에이전트 | XML 도구 호출, 8개 내장 도구, 10스텝 자동 실행 | agent-orchestrator | v4 |
| 4 | 정보 검색 | 웹검색+RAG, 자동 의도 감지, 1시간 캐싱 | token-optimizer | v2+ |
| 5 | 문서 분석 | PDF Q&A(클라이언트), YouTube 자막/댓글 | ext-scaffold | v3+ |
| 6 | 브라우저 통합 | 검색 AI 카드, 글쓰기 어시스턴트, 스마트 북마크 | ext-scaffold | v3+ |
| 7 | 프롬프트 관리 | 8기본+커스텀, `/` 단축어, 변수 치환 | feature-spec | v2+ |
| 8 | 대화 관리 | 검색/태그/고정/포크, 5형식 내보내기 | service-layer-gen | v2+ |
| 9 | 비용 관리 | 프로바이더별 토큰/비용 추적, 예산 알림 | model-router | v4 |
| 10 | 모델 라우팅 | 패턴 자동 감지 → 최적 모델 선택 | model-router | v3+ |
| **11** | **배치 문서 처리** | **OCR(10개), 번역(50언어), 템플릿** | **wiki-content-generator** | **v4** |
| **12** | **심층 리서치** | **비동기 웹 리서치 파이프라인, 종합 보고서** | **agent-orchestrator** | **v4** |

### UX 설계 원칙 (Skill에 내장할 원칙)

1. **프라이버시 퍼스트**: 로컬 저장, 서버 업로드 없음, 텔레메트리 없음
2. **점진적 복잡도 노출**: 기본 기능 → 고급 기능 자연스러운 이동
3. **컨텍스트 인식**: 현재 페이지/선택 텍스트/입력 중 textarea 자동 감지
4. **비용 의식**: 모델 비교, 가격 테이블, 토큰 추정, 예산 알림
5. **데이터 이식성**: 대화 5형식, 프롬프트 JSON, 사용량 CSV/JSON/Excel 내보내기

---

## 11. 구현 로드맵

### Phase 1: 핵심 Skill (2주) — P0 4개 + P1 2개

```
Week 1:
  ├── service-layer-gen     (P0, ✅ 테스트 완료)
  ├── page-scaffold         (P0, ✅ 테스트 완료)
  └── security-layer        (P0, 보안 필수)

Week 2:
  ├── story-gen             (P0, 209 스토리 관리)
  ├── test-prioritizer      (P1, 커버리지 유지)
  └── token-bridge          (P1, 디자인 토큰 동기화)
```

### Phase 2: 분석/엔터프라이즈 Skill (2주) — P1 8개

```
Week 3:
  ├── codebase-audit        (P1, ✅ 테스트 완료)
  ├── sprint-planner        (P1, 개발 계획 자동화)
  ├── quality-gate          (P1, 배포 안전성)
  └── streaming-handler-gen (P1, SSE 프로토콜 통합)

Week 4:
  ├── pm-worker-doc         (P1, 문서 작성 효율화)
  ├── ext-scaffold          (P1, Extension 개발)
  ├── api-gateway-gen       (P1, LLM Router Gateway)
  └── manifest-validator    (P1, MV3 보안 감사)
```

### Phase 3: 확장 Skill (4주) — P2 + 나머지

```
Week 5-6:
  ├── model-router          (P2, AI 비용 최적화)
  ├── wiki-content-generator (P1, Wiki 자동 문서화)
  ├── bulkapi-generator     (P1, Enterprise Bulk API)
  └── roi-chart-gen         (P2, SVG 차트 생성)

Week 7-8:
  ├── 나머지 확장 Skill 20개
  └── Skill 간 체인 실행 최적화
```

---

## 부록 A: 분석 대상 문서 인덱스 (111개)

### A. 설계/기획 문서 (19개, ~15,000줄)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | COMPREHENSIVE_ANALYSIS.md | 920 | 종합 판단 보고서 (ROI $645.5K) |
| 2 | INVESTMENT_PROPOSAL.md | 855 | 투자 승인 요청서 |
| 3 | IMPLEMENTATION_ROADMAP.md | 1,185 | 30주 구현 로드맵 (14 스프린트) |
| 4 | SERVICE_PLAN.md | 1,503 | 서비스 기획서 통합본 |
| 5 | TECHNICAL_SPECIFICATION.md | 2,670 | 4-Layer 기술 명세 |
| 6 | SPEC_DRIVEN_DESIGN.md | 1,547 | 스펙 주도 설계 |
| 7 | SCREEN_DESIGN.md | 1,685 | UI 화면 설계서 (Side Panel 320~600px) |
| 8 | H_CHAT_BROWSER_OS_DESIGN.md | 651 | Browser OS 설계안 (12 재사용 + 19 신규) |
| 9 | SERVICE_PLAN_00~04 | 2,976 | 서비스 기획 4파트 (F01-F16, GTM 3단계) |
| 10 | ECOSYSTEM 시리즈 (3건) | 874 | 에코시스템 분석/전략/리스크 (R1~R6) |
| 11 | 심층분석 시리즈 (3건) | 1,140 | 프로젝트 분석 보고서 |

### B. 구현/개발 문서 (31개, ~12,290줄)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | ARCHITECTURE.md | 280 | 시스템 아키텍처 (8앱 + 패키지) |
| 2 | API_SPEC.md | 420 | API 설계 (REST + GraphQL + WebSocket) |
| 3 | HMG 시리즈 (2건) | 520 | HMG 디자인 구현 |
| 4 | Admin 시리즈 (3건) | 862 | Admin 설계/서비스/인증 (23페이지) |
| 5 | ROI_DASHBOARD_DESIGN.md | 620 | ROI 대시보드 (순수 SVG, 9페이지) |
| 6 | LLM Router 시리즈 (2건) | 1,045 | LLM Router (86개 모델, Hono Gateway) |
| 7 | Enterprise/User/AI 구현 (3건) | 1,750 | 앱별 구현 (Bulk API, SSE) |
| 8 | Extension 시리즈 (3건) | 2,739 | Chrome Extension MV3 (5 Phase, 1,399줄) |
| 9 | Monorepo/Storybook (3건) | 1,070 | 모노레포 구조 (209 스토리) |
| 10 | 토큰/성능/커버리지 (6건) | 1,540 | 품질 보고서 (194 토큰, 89.24%) |
| 11 | 배포/기여/PWA/프로토타입 (4건) | 1,530 | 운영 가이드 + 하이브리드 아키텍처 |

### C. Wiki 콘텐츠 (28개, ~4,200줄)

| 카테고리 | 파일 수 | 총 줄 수 | 주요 내용 |
|---------|--------|---------|----------|
| 루트 (home/quickstart/faq/changelog) | 4 | ~940 | 진입점 + v4.5 변경이력 |
| chat/ (ai-chat/group/debate/agent/history/prompts) | 6 | ~1,442 | 핵심 대화 기능 |
| tools/ (panel/youtube/pdf/web-search) | 4 | ~340 | AI 도구 |
| browser/ (search-card/writing/bookmarks) | 3 | ~186 | 브라우저 통합 |
| settings/ (providers/models/usage) | 3 | ~831 | 설정/비용 관리 |
| v4 신규 (research/ocr/translate/doc-template) | 4 | ~130 | v4 신규 기능 |
| desktop/ (overview/features/backend) | 3 | ~178 | Desktop PWA |
| storybook-design-plan | 1 | 641 | Storybook 설계 |

### D. 개발계획/비전 문서 (33개, ~16,000줄)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | DEV_PLAN 시리즈 (6건) | 2,409 | 30주 개발 계획 (315+ SP) |
| 2 | NEXT_PHASE 시리즈 (3건) | 647 | Phase 55→70 계획 |
| 3 | WORKTREE_AGENT_PLAN.md | 387 | 병렬 에이전트 실행 (9 Phase, 5 type) |
| 4 | 마일스톤 시리즈 (3건) | 670 | Phase 99/100 완료 보고서 |
| 5 | IMPL 시리즈 (9건) | 9,923 | Browser OS 구현 설계서 |
| 6 | 분석 시리즈 (3건) | 1,401 | Agentic Enterprise 전략 분석 |
| 7 | CODEBASE_AUDIT_2026-03-16.md | 214 | 코드베이스 감사 (85/100, A-) |
| 8 | 기타 (5건) | 968 | TODO/DEMO/삭제로그/CLAUDE.md |

---

## 부록 B: Skill 테스트 결과 (3건)

| Skill | 테스트 일자 | 산출물 | 결과 | 커밋 |
|-------|-----------|--------|------|------|
| service-layer-gen | 2026-03-16 | Marketplace 서비스 3파일 (395줄) | 8/8 패턴 통과 | fcd6f2b |
| page-scaffold | 2026-03-16 | Marketplace 페이지 4파일 | 타입 0에러, 테스트 7/7 | 81ab69c |
| codebase-audit | 2026-03-16 | 5 Worker 병렬 감사, 종합 보고서 | A- 85점 (28건 이슈) | a78dc3d |
