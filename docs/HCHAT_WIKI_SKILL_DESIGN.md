# H Chat Wiki — Skill 설계방안

> **작성일**: 2026-03-16
> **분석 기반**: 프로젝트 내 100개 MD 파일 (docs/ 79개 + content/ 21개) 병렬 분석
> **분석 방법**: PM/Worker 4-Agent 병렬 처리 (설계기획 19 + 구현개발 31 + Wiki콘텐츠 21 + 개발계획 29)

---

## 1. Executive Summary

| 항목 | 수치 |
|------|------|
| 분석 대상 MD 파일 | 100개 (~50,000줄) |
| 도출된 Skill 후보 | 32개 |
| 핵심 Skill (즉시 구현 권장) | 12개 |
| 확장 Skill (Phase별 추가) | 20개 |
| 참조 아키텍처 패턴 | 18개 |
| 참조 템플릿 | 9개 |

### 핵심 발견

1. **프로젝트 고유의 반복 패턴 7가지**가 Skill로 자동화 가능
2. **4-Layer Stack** (Extension→Smart DOM→DataFrame→MARS) 파이프라인이 모든 기능의 근간
3. **PM-Worker 병렬 패턴**이 문서 작성/코드 생성/테스트 모두에 일관 적용
4. **Service Provider + Mock/Real 전환**이 10개 앱 전체에 동일 구조로 반복

---

## 2. 분석 결과 종합

### 2.1 문서 분류별 핵심 인사이트

```
┌─────────────────────────────────────────────────────────────┐
│                    100개 MD 파일 분석 맵                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  설계/기획     │  구현/개발     │  Wiki 콘텐츠   │  개발계획/비전    │
│  19개 문서     │  31개 문서     │  21개 파일     │  29개 문서       │
│  ~15,000줄    │  ~16,000줄    │  ~3,500줄     │  ~15,500줄      │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ 4-Layer 아키텍처│ Service Layer │ 사용자 기능 맵  │ Phase 진화 여정   │
│ Chrome Extension│ Design Token │ UX 패턴 8종   │ PM-Worker 패턴   │
│ Smart DOM 핵심 │ Mock/Real 전환 │ 프라이버시 퍼스트│ Worktree 병렬    │
│ Zero Trust 보안│ Storybook 자동화│ 멀티프로바이더  │ Self-Healing 루프 │
│ ROI $645K     │ 번들 최적화    │ 비용 의식 설계  │ 에이전트 권한 모델 │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### 2.2 반복 패턴 7가지 (Skill 자동화 대상)

| # | 반복 패턴 | 발생 빈도 | 자동화 ROI |
|---|----------|----------|-----------|
| P1 | Service Layer 생성 (types→mock→hooks→provider) | 10개 앱 모두 | **최고** |
| P2 | 디자인 토큰 → Tailwind 테마 브릿지 | 7개 앱 접두사 | 높음 |
| P3 | 페이지 스캐폴딩 (Next.js page + 서비스 + 스토리) | 50+ 페이지 | **최고** |
| P4 | Storybook 스토리 자동 생성 | 209 스토리 | 높음 |
| P5 | 보안 레이어 적용 (Zod + PII + CSP) | 모든 엔드포인트 | 높음 |
| P6 | PM-Worker 병렬 문서 작성 | 모든 설계 문서 | 중간 |
| P7 | 테스트 커버리지 갭 분석 → 우선순위 테스트 생성 | 235 테스트 파일 | 높음 |

---

## 3. Skill 설계 체계

### 3.1 Skill 카테고리 구조

```
hchat-wiki-skills/
├── core/                    # 핵심 개발 스킬 (즉시 구현)
│   ├── service-layer-gen    # Service Layer 일괄 생성
│   ├── page-scaffold        # Next.js 페이지 스캐폴딩
│   ├── story-gen            # Storybook 스토리 자동 생성
│   ├── token-bridge         # 디자인 토큰 → Tailwind 브릿지
│   ├── security-layer       # 보안 레이어 자동 적용
│   └── test-prioritizer     # 테스트 커버리지 갭 → 우선순위 테스트
├── analysis/                # 분석/감사 스킬
│   ├── codebase-audit       # 5영역 코드 감사
│   ├── catalog-auditor      # 컴포넌트 카탈로그 감사
│   ├── gap-analyzer         # 아키텍처 갭 분석
│   └── bundle-optimizer     # 번들 최적화 분석
├── planning/                # 기획/계획 스킬
│   ├── sprint-planner       # Sprint 계획 + Day별 태스크
│   ├── feature-spec         # 기능 명세 자동 생성
│   ├── demo-scenario        # 데모 시나리오 구조화
│   └── risk-register        # 리스크 레지스터 관리
├── extension/               # Chrome Extension 전용 스킬
│   ├── ext-scaffold         # Extension 프로젝트 스캐폴딩
│   ├── manifest-gen         # Manifest V3 생성/검증
│   ├── pii-sanitizer        # PII 살균 룰 관리
│   └── cws-checklist        # CWS 심사 체크리스트
├── ai-platform/             # AI 플랫폼 스킬
│   ├── model-router         # 멀티 모델 라우팅 설계
│   ├── token-optimizer      # 토큰 최적화 파이프라인
│   ├── agent-orchestrator   # 에이전트 오케스트레이션
│   └── self-healing         # Self-Healing 시스템 설계
├── docs/                    # 문서화 스킬
│   ├── pm-worker-doc        # PM-Worker 병렬 문서 작성
│   ├── presentation-gen     # HTML 프레젠테이션 생성
│   ├── claudemd-sync        # CLAUDE.md 동기화
│   └── changelog-gen        # Changelog 자동 생성
└── devops/                  # DevOps 스킬
    ├── deploy-validator     # 배포 전 검증
    ├── canary-playbook      # Canary 배포 플레이북
    ├── quality-gate         # 품질 게이트 검증
    └── worktree-parallel    # Worktree 병렬 실행
```

---

## 4. 핵심 Skill 상세 설계 (12개)

### 4.1 `service-layer-gen` — Service Layer 일괄 생성

**트리거**: 새로운 도메인/기능 추가 시
**우선순위**: P0 (즉시 구현)

```
Input:  API 인터페이스 정의 (엔드포인트 + 타입)
Output: 6개 파일 일괄 생성
```

| 산출물 | 파일명 패턴 | 내용 |
|--------|-----------|------|
| 타입 정의 | `types.ts` | 인터페이스 + Zod 스키마 |
| Mock 서비스 | `mock{Domain}Service.ts` | 페이커 데이터 + 지연 시뮬레이션 |
| Real 서비스 | `real{Domain}Service.ts` | fetch + 에러 처리 |
| Provider | `{Domain}ServiceProvider.tsx` | Context + Mock/Real 전환 |
| Hooks | `use{Domain}.ts` | useQuery/useMutation 래핑 |
| Index | `index.ts` | barrel export |

**핵심 규칙** (프로젝트에서 추출):
- `NEXT_PUBLIC_API_MODE` 환경변수로 Mock/Real 전환
- 불변성 패턴 (spread 연산자, 절대 직접 변경 않음)
- Zod `.parse()` 로 런타임 입력 검증
- Mock 서비스에 50-200ms 랜덤 지연 추가
- 에러 시 `throw new Error('상세한 사용자 친화적 메시지')`

**참조 문서**: `ADMIN_SERVICE_LAYER.md`, `CHROME_EXTENSION_IMPLEMENTATION.md`, `API_SPEC.md`

---

### 4.2 `page-scaffold` — Next.js 페이지 스캐폴딩

**트리거**: 새 페이지 추가 시
**우선순위**: P0

```
Input:  페이지명 + 데이터 모델 + 레이아웃 유형
Output: 5개 파일 생성
```

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
- Skeleton fallback과 함께 `dynamic(() => import(), { loading })` 사용
- `@hchat/ui`에서 공유 컴포넌트 import
- 다크 모드: ThemeProvider + `.dark` 클래스 토글

**참조 문서**: `HCHAT_USER_FEATURES_IMPLEMENTATION.md`, `HCHAT_ADMIN_DESIGN.md`, `SCREEN_DESIGN.md`

---

### 4.3 `story-gen` — Storybook 스토리 자동 생성

**트리거**: 컴포넌트 생성/수정 직후
**우선순위**: P0

```
Input:  컴포넌트 파일 경로 (Props 인터페이스 자동 분석)
Output: {Component}.stories.tsx
```

**생성 변형**:
- Default (기본 상태)
- WithData (데이터 로드됨)
- Loading (로딩 스켈레톤)
- Error (에러 상태)
- Dark (다크 모드)
- Mobile (반응형 뷰포트)
- Interactive (play function 테스트)

**핵심 규칙**:
- Storybook 9 + `@storybook/nextjs-vite` 프레임워크
- `addon-themes` + `addon-a11y` 필수 포함
- Play function으로 인터랙션 테스트 작성
- Mock Service Worker(MSW) handler 연동
- vite aliases로 모노레포 모듈 해석

**참조 문서**: `STORYBOOK_IMPLEMENTATION.md`, `MONOREPO_STORYBOOK_PLAN.md`, `COMPONENT_CATALOG.md`

---

### 4.4 `token-bridge` — 디자인 토큰 → Tailwind 브릿지

**트리거**: 디자인 토큰 변경 시
**우선순위**: P1

```
Input:  packages/tokens/styles/tokens.css 변경 감지
Output: 앱별 globals.css @theme 블록 업데이트
```

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
- Tailwind CSS 4: `@theme inline` + `@source "../../../packages/ui/src";`
- `@source`에 glob 패턴 불가 — 디렉토리 경로만 사용
- 다크 모드: `.dark` 클래스 내 CSS 변수 오버라이드
- 새 토큰 추가 시 light + dark 쌍으로 반드시 정의

**참조 문서**: `DESIGN_TOKENS.md`, `HMG_DESIGN_GUIDE_PLAN.md`, `tokens.css`

---

### 4.5 `security-layer` — 보안 레이어 자동 적용

**트리거**: API 엔드포인트/사용자 입력 처리 코드 작성 시
**우선순위**: P0

```
Input:  엔드포인트 경로 또는 컴포넌트 파일
Output: 보안 코드 삽입/검증 결과
```

**6계층 보안 체크리스트**:

| 계층 | 항목 | 자동화 |
|------|------|--------|
| L1 입력 검증 | Zod `.parse()` 적용 | 스키마 자동 생성 |
| L2 PII 살균 | 11패턴 마스킹 (주민번호/카드/이메일/전화/사업자/여권...) | 정규식 룰 적용 |
| L3 CSP | nonce + Trusted Types | middleware.ts 생성 |
| L4 API 프록시 | 서버사이드 API Key 보호 | Route Handler 생성 |
| L5 Rate Limiting | 엔드포인트별 제한 | 미들웨어 추가 |
| L6 블록리스트 | 20 도메인 + 6 패턴 차단 | blocklist.ts 업데이트 |

**참조 문서**: `IMPL_05_SECURITY_GOVERNANCE_FRAMEWORK.md`, `RISK_MITIGATION_AND_QUICK_WINS.md`, `CHROME_EXTENSION_DESIGN.md`

---

### 4.6 `test-prioritizer` — 테스트 커버리지 갭 → 우선순위 테스트

**트리거**: `npm run test:coverage` 실행 후
**우선순위**: P1

```
Input:  커버리지 보고서 (istanbul JSON)
Output: 우선순위별 테스트 생성 목록 + 자동 생성된 테스트 파일
```

**우선순위 분류 기준** (프로젝트에서 추출):

| 우선순위 | 대상 | 전략 |
|---------|------|------|
| P0 Critical | 보안 관련 코드 (sanitize, auth, PII) | 즉시 TDD |
| P1 High | 서비스 훅 (useChat, useAuth 등) | 에러 시나리오 중심 |
| P2 Medium | UI 컴포넌트 (로직 포함) | 로직 추출 → 순수 함수 테스트 |
| P3 Low | 브라우저 API 의존 (DraggableList 등) | JSDOM mock + 최소 테스트 |

**참조 문서**: `COVERAGE_REPORT.md`, `DEV_PLAN_04_TEST_CICD_TEAM.md`, `DEEP_ANALYSIS_REPORT_v3.md`

---

### 4.7 `codebase-audit` — 5영역 코드 감사

**트리거**: Phase 전환 / 코드 리뷰 / 정기 감사 시
**우선순위**: P1

```
Input:  감사 대상 범위 (전체 / 앱별 / 패키지별)
Output: 5영역 점수 + CRITICAL/HIGH/MEDIUM 이슈 목록
```

**5영역 점수 체계** (프로젝트 실측 기반):

| 영역 | 측정 항목 | 최근 점수 |
|------|---------|----------|
| 아키텍처 | 의존성 그래프, 파일 크기, 결합도 | B+ |
| 코드 품질 | 중복, any 사용, 파일당 줄 수, 패턴 일관성 | B |
| 보안 | OWASP Top 10, 하드코딩 시크릿, PII 노출 | C+ |
| 테스트 | 커버리지 %, 브랜치 %, Flaky 비율 | A- |
| 빌드/인프라 | 번들 크기, 빌드 시간, 타입 에러 | B+ |

**병렬 에이전트 패턴**:
```
PM Agent (총괄)
  ├── W1: 아키텍처 분석 (knip + 의존성)
  ├── W2: 코드 품질 (ESLint + 중복 + 패턴)
  ├── W3: 보안 (secrets scan + Zod 검증)
  ├── W4: 테스트 (커버리지 + Flaky)
  └── W5: 빌드 (번들 + 타입 체크)
→ PM이 5개 결과 통합 → 종합 점수 산출
```

**참조 문서**: `DEEP_ANALYSIS_REPORT_v3.md`, `DEEP_ANALYSIS_REPORT_2026-03-08.md`, `PROJECT_ANALYSIS.md`

---

### 4.8 `sprint-planner` — Sprint 계획 자동 생성

**트리거**: 새 스프린트 시작 시
**우선순위**: P1

```
Input:  에픽 목록 + 팀 인력 + 기간
Output: Day별 태스크 테이블 + 의존성 그래프 + Go/No-Go 체크리스트
```

**산출물 구조** (프로젝트 패턴에서 추출):

| 섹션 | 내용 |
|------|------|
| 에픽 분해 | 에픽 → 스토리 → 태스크 (SP 배정) |
| Day별 계획 | 태스크-담당자-의존성 Gantt |
| 의존성 그래프 | Mermaid 기반 크리티컬 패스 |
| 인력 매핑 | FE/BE/Infra 병렬 작업 배분 |
| Go/No-Go | Must 4 + Should 4 체크리스트 |
| Scope 축소 | Level 1~3 점진적 축소 전략 |
| 리스크 | 리스크 + Recovery Action |
| 데모 시나리오 | 중간/최종 데모 스크립트 |

**참조 문서**: `DEV_PLAN_01_SPRINT_0.md`, `DEV_PLAN_02_PHASE_1_2.md`, `WORKTREE_AGENT_PLAN.md`

---

### 4.9 `ext-scaffold` — Chrome Extension 스캐폴딩

**트리거**: Extension 새 기능/페이지 추가 시
**우선순위**: P1

```
Input:  기능 요구사항
Output: MV3 호환 Extension 코드 세트
```

**산출물**:

| 파일 | 역할 |
|------|------|
| `manifest.json` | MV3 최소 권한 |
| `background.ts` | Service Worker (5분 비활성 종료 대응) |
| `content.ts` | Content Script (Isolated World) |
| `sidepanel/` | Side Panel UI (주 인터페이스) |
| `popup/` | Popup (400x600 퀵 액션) |
| `services/` | 서비스 인터페이스 + Mock |
| `types/` | 메시지/컨텍스트/설정 타입 |

**MV3 제약 체크리스트**:
- [ ] Service Worker 5분 비활성 종료 대응 (alarm API)
- [ ] CSP: 인라인 스크립트 금지
- [ ] Content Script: Isolated World (메인 페이지 변수 접근 불가)
- [ ] `chrome.storage.local` 사용 (localStorage X)
- [ ] Host Permissions 최소 범위
- [ ] CWS 번들 <5MB
- [ ] Side Panel 로드 <1s

**참조 문서**: `CHROME_EXTENSION_DESIGN.md`, `CHROME_EXTENSION_IMPLEMENTATION.md`, `SERVICE_PLAN_03_ARCHITECTURE.md`

---

### 4.10 `model-router` — 멀티 모델 라우팅 설계

**트리거**: AI 기능 추가 / 모델 비용 최적화 시
**우선순위**: P2

```
Input:  태스크 유형 + 모델 카탈로그
Output: 라우팅 알고리즘 + 프로바이더 어댑터 코드
```

**복합 점수 라우팅 알고리즘**:

```typescript
score = quality * 0.40 + latency * 0.30 + cost * 0.20 + availability * 0.10
// 또는 Browser OS 변형:
score = reliability * 0.30 + cost * 0.25 + latency * 0.25 + specialization * 0.20
```

**5모델 전문 영역**:

| 모델 | 전문 영역 | 비용/M tokens |
|------|---------|--------------|
| Claude Opus | 추론, 분석 | $15/$75 |
| Claude Sonnet | 범용 코딩 | $3/$15 |
| Claude Haiku | 경량, 분류 | $0.25/$1.25 |
| GPT-4o | 코드 생성 | $2.50/$10 |
| Gemini Flash | 장문, 고속 | $0.075/$0.30 |

**Fallback 체인**: Primary → Secondary → Tertiary → Mock (월 $2K 초과 시)

**참조 문서**: `IMPL_BROWSER_OS_03_MULTIMODEL_HEALING.md`, `content/settings/models.md`, `LLM_ROUTER_IMPLEMENTATION_PLAN.md`

---

### 4.11 `pm-worker-doc` — PM-Worker 병렬 문서 작성

**트리거**: 대규모 설계/분석 문서 작성 시
**우선순위**: P1

```
Input:  문서 주제 + 섹션 분할 기준
Output: PM 총괄 + Worker별 병렬 작성 → 통합 문서
```

**실행 패턴**:

```
Phase 1: PM이 문서 구조 설계
  ├── 섹션 분할 (3~5개)
  ├── Worker별 담당 영역 배정
  └── 통합 규칙 정의 (용어, 포맷, 교차 참조)

Phase 2: Worker 병렬 작성 (Agent tool, run_in_background)
  ├── Worker A: 섹션 1 분석/작성
  ├── Worker B: 섹션 2 분석/작성
  ├── Worker C: 섹션 3 분석/작성
  └── Worker D: 섹션 4 분석/작성

Phase 3: PM 통합
  ├── 중복 제거 + 일관성 검증
  ├── 교차 참조 링크 생성
  ├── Executive Summary 작성
  └── 최종 품질 검증
```

**참조 문서**: `DEV_PLAN_00_MASTER.md`, `IMPL_00_AGENTIC_ENTERPRISE_BLUEPRINT.md`, `WORKTREE_AGENT_PLAN.md`

---

### 4.12 `quality-gate` — 품질 게이트 검증

**트리거**: Phase 전환 / 배포 전 / PR 머지 전
**우선순위**: P1

```
Input:  검증 레벨 (PR / Phase / Production)
Output: Go/No-Go 판정 + 이슈 목록
```

**3단계 게이트**:

| 레벨 | 항목 | 임계값 |
|------|------|--------|
| **PR** | 타입 체크 통과 | 에러 0 |
| | Lint 통과 | warning만 허용 |
| | 테스트 통과 | 변경 파일 관련 테스트 100% |
| | 번들 크기 변화 | +10% 이내 |
| **Phase** | 커버리지 | stmts 40%+, branches 25%+ |
| | E2E 통과율 | 95%+ |
| | Flaky 테스트 | 5% 이하 |
| | 보안 스캔 | CRITICAL 0 |
| **Production** | Lighthouse 성능 | FCP<3s, LCP<4s, CLS<0.1 |
| | 부하 테스트 | P95 <2s |
| | Canary 에러율 | <0.1% |
| | Self-Healing 성공률 | 61%+ |

**참조 문서**: `DEV_PLAN_04_TEST_CICD_TEAM.md`, `DEV_PLAN_03_PHASE_3_4.md`, `DEPLOYMENT_CHECKLIST.md`

---

## 5. 확장 Skill 목록 (20개)

### 5.1 분석/감사 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `catalog-auditor` | 컴포넌트/훅/서비스 카탈로그 자동 생성 + 미사용 탐지 | COMPONENT_CATALOG.md |
| `gap-analyzer` | 현재 상태 스캔 → 목표 아키텍처까지 GAP 분석 | HCHAT_AI_PLATFORM_IMPLEMENTATION.md |
| `bundle-optimizer` | barrel import 분석 + dynamic import 추천 | BUNDLE_ANALYSIS.md |
| `a11y-enhancer` | ARIA 속성 자동 추가 + a11y 테스트 생성 | A11Y_ENHANCEMENTS.md |

### 5.2 Extension 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `manifest-gen` | MV3 Manifest 생성 + 최소 권한 검증 | CHROME_EXTENSION_DESIGN.md |
| `pii-sanitizer` | PII 11패턴 살균 룰 관리 + 테스트 | IMPL_05_SECURITY_GOVERNANCE_FRAMEWORK.md |
| `cws-checklist` | Chrome Web Store 심사 체크리스트 | SERVICE_PLAN_04_BUSINESS.md |

### 5.3 AI 플랫폼 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `token-optimizer` | 프롬프트 영역별 토큰 압축 (System/RAG만, User 불변) | TOKEN_OPTIMIZER_PLAN.md |
| `agent-orchestrator` | LangGraph+CrewAI 하이브리드 에이전트 설계 | IMPL_BROWSER_OS_02_INTELLIGENCE_LAYER.md |
| `self-healing` | 4단계 치유 루프 설계 + Circuit Breaker 연동 | IMPL_04_SELF_HEALING_SYSTEM.md |

### 5.4 문서화 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `presentation-gen` | 다크 테마 HTML 프레젠테이션 자동 생성 | MEMORY.md (HTML 공통 패턴) |
| `claudemd-sync` | CLAUDE.md ↔ 코드베이스 불일치 자동 탐지/수정 | DEEP_ANALYSIS_REPORT_2026-03-08.md |
| `changelog-gen` | git log → 구조화된 Changelog 자동 생성 | content/changelog.md |
| `feature-spec` | 기능 명세 (F01-F16 패턴) 자동 생성 | SERVICE_PLAN_02_FEATURES.md |

### 5.5 DevOps 카테고리

| Skill | 설명 | 참조 문서 |
|-------|------|----------|
| `deploy-validator` | 배포 전 보안/성능/DB 자동 검증 | DEPLOYMENT_CHECKLIST.md |
| `canary-playbook` | 5%→25%→100% 배포 + 자동 롤백 조건 | DEV_PLAN_03_PHASE_3_4.md |
| `worktree-parallel` | Git Worktree + Agent 병렬 실행 자동화 | WORKTREE_AGENT_PLAN.md |
| `risk-register` | 리스크 레지스터 CRUD + 대응 전략 추적 | RISK_MITIGATION_AND_QUICK_WINS.md |
| `demo-scenario` | 데모 시나리오 구조화 (시간 배분 + Q&A) | DEMO.md |

---

## 6. 참조 아키텍처 패턴 (18개)

### 6.1 개발 패턴

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A1 | Service Provider + Mock/Real 전환 | ADMIN_SERVICE_LAYER.md | service-layer-gen |
| A2 | 디자인 토큰 Single Source of Truth | DESIGN_TOKENS.md | token-bridge |
| A3 | Next.js 16 Static Export + catch-all route | ARCHITECTURE.md | page-scaffold |
| A4 | Storybook 9 + play function 테스트 | STORYBOOK_IMPLEMENTATION.md | story-gen |
| A5 | Zod 런타임 검증 + TypeScript 타입 추론 | CONTRIBUTING.md | security-layer |
| A6 | MSW 42 엔드포인트 Mock 체계 | API_SPEC.md | service-layer-gen |

### 6.2 아키텍처 패턴

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A7 | 4-Layer Stack (Extension→DOM→DataFrame→MARS) | TECHNICAL_SPECIFICATION.md | ext-scaffold |
| A8 | LangGraph + CrewAI 하이브리드 | IMPL_BROWSER_OS_02.md | agent-orchestrator |
| A9 | Dynamic Multi-Model 복합 점수 라우팅 | IMPL_BROWSER_OS_03.md | model-router |
| A10 | Self-Healing 4단계 루프 | IMPL_04_SELF_HEALING_SYSTEM.md | self-healing |
| A11 | Zero Trust L1~L4 에이전트 권한 | IMPL_05_SECURITY_GOVERNANCE.md | security-layer |
| A12 | Feature Flag 기반 점진적 마이그레이션 | ECOSYSTEM_INTEGRATION_STRATEGY.md | quality-gate |

### 6.3 운영 패턴

| # | 패턴 | 출처 | 적용 스킬 |
|---|------|------|----------|
| A13 | PM-Worker 병렬 작성 | DEV_PLAN_00_MASTER.md | pm-worker-doc |
| A14 | Worktree + Agent 병렬 실행 | WORKTREE_AGENT_PLAN.md | worktree-parallel |
| A15 | 3단계 Scope 축소 전략 | DEV_PLAN_01_SPRINT_0.md | sprint-planner |
| A16 | Canary 5%→25%→100% + 자동 롤백 | DEV_PLAN_03_PHASE_3_4.md | canary-playbook |
| A17 | 5영역 코드 감사 체계 | DEEP_ANALYSIS_REPORT_v3.md | codebase-audit |
| A18 | RACI 매트릭스 + 스킬 매핑 | DEV_PLAN_04_TEST_CICD_TEAM.md | sprint-planner |

---

## 7. 구현 로드맵

### Phase 1: 핵심 Skill (2주)

```
Week 1:
  ├── service-layer-gen     (P0, 가장 높은 ROI)
  ├── page-scaffold         (P0, 10개 앱 모두 활용)
  └── security-layer        (P0, 보안 필수)

Week 2:
  ├── story-gen             (P0, 209 스토리 관리)
  ├── test-prioritizer      (P1, 커버리지 유지)
  └── token-bridge          (P1, 디자인 토큰 동기화)
```

### Phase 2: 분석/계획 Skill (2주)

```
Week 3:
  ├── codebase-audit        (P1, 정기 품질 관리)
  ├── sprint-planner        (P1, 개발 계획 자동화)
  └── quality-gate          (P1, 배포 안전성)

Week 4:
  ├── pm-worker-doc         (P1, 문서 작성 효율화)
  ├── ext-scaffold          (P1, Extension 개발)
  └── model-router          (P2, AI 비용 최적화)
```

### Phase 3: 확장 Skill (4주)

```
Week 5-6: 분석/Extension 스킬 8개
Week 7-8: AI 플랫폼/문서화/DevOps 스킬 12개
```

---

## 8. Skill 실행 모델

### 8.1 단독 실행

```
사용자 요청 → 트리거 매칭 → 단일 Skill 실행 → 결과 반환
예: "Admin에 새 Provider Status 페이지 추가해줘"
    → page-scaffold 트리거 → 5개 파일 생성
```

### 8.2 체인 실행

```
사용자 요청 → Skill A → Skill B → Skill C → 최종 결과
예: "User 앱에 결제 기능 추가"
    → service-layer-gen (API + Mock + Hooks)
    → page-scaffold (결제 페이지 + 스토리)
    → security-layer (Zod 검증 + PII 살균)
    → test-prioritizer (우선순위 테스트 생성)
```

### 8.3 병렬 실행 (PM-Worker)

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

## 9. 참고: Wiki 콘텐츠에서 추출한 H Chat 기능 맵

### 핵심 사용자 기능 10개 영역

| # | 기능 영역 | 핵심 기능 | Skill 연관 |
|---|----------|---------|-----------|
| 1 | AI 채팅 | 멀티 프로바이더 스트리밍, 페르소나 6+커스텀 | model-router |
| 2 | 모델 비교 | 그룹 채팅(병렬), 크로스 모델 토론(3라운드) | model-router |
| 3 | 자율 에이전트 | XML 도구 호출, 10스텝 자동 실행 | agent-orchestrator |
| 4 | 정보 검색 | 웹검색+RAG, 자동 의도 감지, 캐싱 | token-optimizer |
| 5 | 문서 분석 | PDF Q&A(클라이언트 전용), YouTube 자막/댓글 | ext-scaffold |
| 6 | 브라우저 통합 | 검색 AI 카드, 글쓰기 어시스턴트, 스마트 북마크 | ext-scaffold |
| 7 | 프롬프트 관리 | 8기본+커스텀, `/` 단축어, 변수 치환 | feature-spec |
| 8 | 대화 관리 | 검색/태그/고정/포크, 5형식 내보내기 | service-layer-gen |
| 9 | 비용 관리 | 프로바이더별 토큰/비용 추적, 예산 알림 | model-router |
| 10 | 모델 라우팅 | 패턴 자동 감지 → 최적 모델 선택 | model-router |

### UX 설계 원칙 (Skill에 내장할 원칙)

1. **프라이버시 퍼스트**: 로컬 저장, 서버 업로드 없음, 텔레메트리 없음
2. **점진적 복잡도 노출**: 기본 기능 → 고급 기능 자연스러운 이동
3. **컨텍스트 인식**: 현재 페이지/선택 텍스트/입력 중 textarea 자동 감지
4. **비용 의식**: 모델 비교, 가격 테이블, 토큰 추정, 예산 알림
5. **데이터 이식성**: 대화 5형식, 프롬프트 JSON, 사용량 CSV/JSON/Excel 내보내기

---

## 부록: 분석 대상 문서 인덱스

### A. 설계/기획 문서 (19개)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | COMPREHENSIVE_ANALYSIS.md | 921 | 종합 판단 보고서 |
| 2 | INVESTMENT_PROPOSAL.md | 856 | 투자 승인 요청서 |
| 3 | IMPLEMENTATION_ROADMAP.md | 1,186 | 30주 구현 로드맵 |
| 4 | SERVICE_PLAN.md | 1,503 | 서비스 기획서 통합본 |
| 5 | TECHNICAL_SPECIFICATION.md | 2,670 | 4-Layer 기술 명세 |
| 6 | SPEC_DRIVEN_DESIGN.md | 1,547 | 스펙 주도 설계 |
| 7 | SCREEN_DESIGN.md | 1,685 | UI 화면 설계서 |
| 8 | H_CHAT_BROWSER_OS_DESIGN.md | 652 | Browser OS 설계안 |
| 9 | SERVICE_PLAN_00~04 | 2,977 | 서비스 기획 4파트 |
| 10 | ECOSYSTEM 시리즈 (3건) | 874 | 에코시스템 분석/전략/리스크 |
| 11 | 심층분석 시리즈 (3건) | 1,140 | 프로젝트 분석 보고서 |

### B. 구현/개발 문서 (31개)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | ARCHITECTURE.md | 329 | 시스템 아키텍처 |
| 2 | API_SPEC.md | 307 | API 엔드포인트 사양 |
| 3 | HMG 시리즈 (2건) | 2,195 | HMG 디자인 구현 |
| 4 | Admin 시리즈 (3건) | 640 | Admin 설계/서비스/인증 |
| 5 | ROI_DASHBOARD_DESIGN.md | 741 | ROI 대시보드 설계 |
| 6 | LLM Router 시리즈 (2건) | 3,749 | LLM Router 구현 |
| 7 | Enterprise/User/AI 구현 (3건) | 1,765 | 앱별 구현 설계 |
| 8 | Extension 시리즈 (3건) | 2,750 | Chrome Extension |
| 9 | Monorepo/Storybook (3건) | 1,994 | 모노레포 구조 |
| 10 | 토큰/성능/커버리지 (6건) | 1,352 | 품질 보고서 |
| 11 | 배포/기여 (3건) | 320 | 운영 가이드 |

### C. Wiki 콘텐츠 (21개)

| 카테고리 | 파일 수 | 총 줄 수 |
|---------|--------|---------|
| 루트 (home/quickstart/faq/changelog) | 4 | ~700 |
| chat/ | 6 | ~1,200 |
| tools/ | 4 | ~400 |
| browser/ | 3 | ~300 |
| settings/ | 3 | ~850 |
| storybook-design-plan | 1 | ~641 |

### D. 개발계획/비전 문서 (29개)

| # | 문서 | 줄 수 | 역할 |
|---|------|-------|------|
| 1 | DEV_PLAN 시리즈 (6건) | 2,408 | 개발 계획 |
| 2 | NEXT_PHASE 시리즈 (3건) | 647 | Phase별 계획 |
| 3 | WORKTREE_AGENT_PLAN.md | 387 | 병렬 에이전트 실행 |
| 4 | 마일스톤 시리즈 (3건) | 670 | 완료 보고서 |
| 5 | IMPL 시리즈 (9건) | 9,923 | 구현 설계서 |
| 6 | 분석 문서 (3건) | 1,401 | 전략 분석 |
| 7 | 기타 (4건) | 719 | 삭제로그/데모/TODO |
| 8 | CLAUDE.md | 249 | 프로젝트 가이드 |
