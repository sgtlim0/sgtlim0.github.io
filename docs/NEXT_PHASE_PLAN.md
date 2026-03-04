# H Chat 다음 단계 계획 (Phase 26~30)

> 작성일: 2026-03-05
> 현재 상태: Phase 25 완료, 모노레포 7개 앱 + 별도 레포 2개
> 완료 현황: 7개 앱 배포, 100+ 컴포넌트, 60+ 페이지, 73+ 스토리, 18 E2E 테스트

---

## Phase 21: Storybook 완성 + 디자인 시스템 정리 ✅

**목표**: 전체 컴포넌트 카탈로그 완성 및 디자인 시스템 문서화

### 21-1. 누락된 Storybook 스토리 추가
- [x] LLM Router 컴포넌트 스토리 6개
- [x] ROI 차트 컴포넌트 스토리 보강
- [x] Enterprise 컴포넌트 스토리 3개
- [x] 달성: 73개+ 스토리

### 21-2. 디자인 토큰 문서화
- [x] `packages/tokens/` 토큰 README
- [x] 토큰 미리보기 Storybook 페이지
- [x] 앱별 커스텀 토큰 정리

### 21-3. Storybook 배포 검증
- [x] Vercel 배포 확인
- [x] 모든 스토리 렌더링 정상 확인

**산출물**: 73개+ 스토리, 디자인 토큰 문서, Storybook 배포 검증

---

## Phase 22: API 서비스 레이어 + UX 폴리싱 ✅

**목표**: Mock 데이터를 API 서비스 레이어로 추상화, 로딩/에러 상태 UI 완성

### 22-1. API 서비스 레이어 통합
- [x] Admin: Enterprise API Provider Pattern 서비스 레이어
- [x] User: API-ready 서비스 인터페이스 (7 hooks)
- [x] LLM Router: Provider Pattern 서비스 레이어 (7 hooks)

### 22-2. 로딩/에러 상태 UI
- [x] 스켈레톤 로더 5종 (Pulse, Text, Card, Table, Chart)
- [x] ErrorBoundary + ErrorFallback
- [x] EmptyState 컴포넌트
- [x] Toast Provider + useToast

### 22-3. 폼 유효성 검증
- [x] validate() + useFormValidation() + patterns

**산출물**: 3개 앱 서비스 레이어, Skeleton/Toast/ErrorBoundary/EmptyState, 폼 검증

---

## Phase 23: 성능 최적화 + 번들 분석 ✅

**목표**: Core Web Vitals 개선 및 빌드 크기 최적화

### 23-1. 번들 분석
- [x] 4개 앱 `@next/bundle-analyzer` 설정 (admin, hmg, user, llm-router)
- [x] analyze 스크립트 추가 (`ANALYZE=true npm run build:admin`)

### 23-2. 코드 스플리팅
- [x] Dynamic import 23개 페이지 (Admin 16, User 5, LLM Router 2)
- [x] Skeleton 로딩 fallback (SkeletonChart, SkeletonCard, SkeletonTable)

### 23-3. OG 메타데이터 + SEO
- [x] LLM Router OpenGraph URL 추가
- [x] 전 앱 OG 메타데이터 확인 (기존 Phase에서 이미 구현됨)

### 23-4. Lighthouse CI 보강
- [x] llm-router URL 추가
- [x] desktop URL 추가

### 23-5. Turbo 빌드 캐시 최적화
- [x] inputs 필드 추가 (관련 없는 파일 변경 시 리빌드 방지)
- [x] ANALYZE env 변수 등록

**산출물**: 번들 분석 도구, 23개 dynamic import, Lighthouse CI 보강, Turbo 캐시 최적화

---

## Phase 24: CI/CD 파이프라인 강화 ✅

**목표**: 자동화된 품질 게이트 및 배포 파이프라인

### 24-1. GitHub Actions 워크플로우 확장
- [x] CI: lint + type-check + build + Lighthouse CI job
- [x] E2E: user 프로젝트 추가, concurrency, artifact retention 7일
- [x] Lighthouse CI: 배포 URL 6개 대상

### 24-2. 배포 자동화
- [x] Vercel Git 연동 자동 배포 (이미 구성됨)
- [x] GitHub Pages 자동 배포 (deploy.yml)

### 24-3. 코드 품질
- [x] ESLint 통일 (eslint-config-next, root 설정)
- [x] Prettier 자동 적용 (.prettierrc)
- [x] Husky pre-commit hook + lint-staged

**산출물**: CI/CD 워크플로우, Prettier + Husky, Lighthouse CI

---

## Phase 25: 통합 테스트 + 문서 최종화 ✅

**목표**: 전체 플랫폼 품질 검증 및 프로젝트 문서 마무리

### 25-1. E2E 테스트 확장
- [x] 반응형 레이아웃 테스트 (responsive.spec.ts — 모바일/태블릿/데스크톱)
- [x] 다크모드 일관성 테스트 (dark-mode-all.spec.ts — 4개 앱)
- [x] 접근성 자동 테스트 (a11y-all.spec.ts — axe-core WCAG 2.1 AA)
- [x] Playwright config: llm-router 배포 URL 전환
- [x] 달성: 18개 E2E 테스트 파일

### 25-2. 단위 테스트
- [ ] 향후 과제: Vitest + Testing Library 설정 (Phase 26+)

### 25-3. 프로젝트 문서 최종화
- [x] ARCHITECTURE.md — Mermaid 다이어그램 (시스템, 패키지, 서비스, CI/CD)
- [x] CONTRIBUTING.md — 개발 환경, 코드 규칙, 브랜치 전략
- [x] DEPLOYMENT.md — Vercel/GitHub Pages 배포 가이드, 프로젝트 ID
- [x] API_SPEC.md — Enterprise API 스펙 (Admin, User, LLM Router)

### 25-4. 데모 시나리오
- [x] DEMO.md — 15-20분 발표 스크립트, 9개 섹션, Q&A 준비

**산출물**: 18개 E2E 테스트, 5개 프로젝트 문서, 데모 시나리오

---

## 우선순위 및 의존성

```
Phase 21 (Storybook 완성)    ──┐
Phase 22 (API 추상화)         ──┼── 병렬 실행 가능
Phase 24 (CI/CD)              ──┘
                                ↓
Phase 23 (성능 최적화)         ── Phase 22 이후 권장
                                ↓
Phase 25 (통합 테스트 + 문서)  ── 최종 마무리
```

---

## Phase 26: 단위 테스트 [ ]

**목표**: Vitest + Testing Library 기반 80%+ 커버리지

### 26-1. 테스트 환경 설정
- [ ] Vitest 설정 (vitest.config.ts, packages/ui + apps)
- [ ] @testing-library/react + jsdom 설정
- [ ] 커버리지 리포트 설정 (v8)

### 26-2. 컴포넌트 단위 테스트
- [ ] @hchat/ui 공통 컴포넌트 (Badge, ThemeToggle, FeatureCard 등)
- [ ] @hchat/ui/hmg 컴포넌트 (GNB, Footer, TabFilter 등)
- [ ] @hchat/ui/admin 컴포넌트 (StatCard, DataTable, MonthPicker 등)
- [ ] @hchat/ui ROI 컴포넌트 (KPICard, DateFilter, DepartmentFilter 등)

### 26-3. 유틸리티 및 서비스 테스트
- [ ] Admin 서비스 레이어 (enterpriseApi, apiService)
- [ ] User 서비스 레이어 (hooks, chatService)
- [ ] LLM Router 서비스 레이어 (modelService, playgroundService)
- [ ] 폼 검증 로직 (validate, patterns)

### 26-4. CI 통합
- [ ] GitHub Actions test job 추가
- [ ] 커버리지 리포트 업로드
- [ ] PR 코멘트 커버리지 요약

**산출물**: 80%+ 테스트 커버리지, Vitest CI 통합

---

## Phase 27: 실시간 대시보드 [ ]

**목표**: WebSocket 기반 Admin 실시간 모니터링

### 27-1. WebSocket 백엔드
- [ ] Socket.io 서버 설정 (별도 서비스 또는 Next.js API)
- [ ] 이벤트 타입 정의 (usage, status, alert)
- [ ] Admin 인증 연동

### 27-2. 실시간 업데이트 UI
- [ ] Dashboard 실시간 KPI 업데이트
- [ ] Usage History 실시간 로그
- [ ] Provider Status 실시간 헬스체크
- [ ] Agent Monitoring 실시간 상태

### 27-3. SSE → WS 마이그레이션
- [ ] User 채팅 SSE → WebSocket 전환
- [ ] 양방향 통신 지원 (중단/재시도)

**산출물**: WebSocket 서버, 실시간 Admin 대시보드, User 채팅 WS 전환

---

## Phase 28: 다국어 확장 [ ]

**목표**: 일본어, 중국어 지원 (현재 한/영)

### 28-1. i18n 설정
- [ ] next-intl 또는 i18next 설정
- [ ] 로케일 라우팅 (/ko, /en, /ja, /zh)
- [ ] 언어 선택 UI (GNB, Footer)

### 28-2. 번역 파일 생성
- [ ] Admin 앱 번역 (일본어, 중국어)
- [ ] User 앱 번역
- [ ] HMG 앱 번역
- [ ] LLM Router 앱 번역
- [ ] Wiki 콘텐츠 번역 (주요 페이지)

### 28-3. RTL 레이아웃 대응
- [ ] 아랍어 등 RTL 언어 대비 (향후 확장)

**산출물**: 4개 언어 지원, 언어 선택 UI, 번역 파일

---

## Phase 29: AI 모델 실연동 [ ]

**목표**: LLM Router 실제 API 호출, API 키 관리 보안

### 29-1. API 키 관리
- [ ] 환경 변수 또는 Vault 통합
- [ ] Admin에서 API 키 등록/조회 UI
- [ ] API 키 암호화 저장

### 29-2. LLM 프로바이더 통합
- [ ] OpenAI API 연동
- [ ] Anthropic API 연동
- [ ] Google Gemini API 연동
- [ ] Azure OpenAI 연동

### 29-3. Playground 실시간 호출
- [ ] 스트리밍 응답 처리 (SSE → WS)
- [ ] 토큰 사용량 실시간 추적
- [ ] 오류 처리 (rate limit, quota 초과)

### 29-4. User 채팅 AI 연동
- [ ] AI 비서별 프롬프트 템플릿
- [ ] 대화 히스토리 컨텍스트 관리
- [ ] 실시간 스트리밍 응답

**산출물**: 4개 LLM 프로바이더 연동, API 키 관리, Playground + User 실시간 AI 호출

---

## Phase 30: Desktop 모노레포 통합 [ ]

**목표**: hchat-desktop을 모노레포 서브패키지로 이전

### 30-1. 레포 통합 전략
- [ ] hchat-desktop을 `apps/desktop-pwa/`로 이전
- [ ] Git 히스토리 보존 (git subtree 또는 git filter-repo)
- [ ] 별도 레포 아카이브

### 30-2. 의존성 정리
- [ ] @hchat/ui 패키지 참조로 전환
- [ ] @hchat/tokens 디자인 토큰 공유
- [ ] Turborepo 빌드 통합

### 30-3. 배포 파이프라인
- [ ] GitHub Actions 워크플로우 통합
- [ ] Vercel 배포 설정 (apps/desktop-pwa)

### 30-4. Storybook 통합
- [ ] Desktop 컴포넌트 스토리 추가

**산출물**: 모노레포 8개 앱, Desktop 통합, Turborepo 빌드 통합

---

## 우선순위 및 의존성

```
Phase 26 (단위 테스트)        ──┐
Phase 28 (다국어 확장)         ──┼── 병렬 실행 가능
Phase 30 (Desktop 통합)        ──┘
                                ↓
Phase 27 (실시간 대시보드)     ── Phase 26 이후 권장
                                ↓
Phase 29 (AI 모델 실연동)      ── Phase 27 이후 권장
```

---

## 성공 지표

| 지표 | 현재 | Phase 26-30 목표 |
|------|------|------------------|
| 앱 배포 | 7개 | 8개 (Desktop 통합) ✅ |
| Storybook 스토리 | 73개+ | 90개+ |
| E2E 테스트 | 18개 | 25개+ |
| 단위 테스트 커버리지 | 0% | 80%+ |
| 지원 언어 | 2개 (한/영) | 4개 (한/영/일/중) |
| AI 프로바이더 연동 | 0개 (Mock) | 4개 (OpenAI, Anthropic, Google, Azure) |
| 컴포넌트 | 100개+ | 120개+ |
| 페이지 | 60개+ | 70개+ |
