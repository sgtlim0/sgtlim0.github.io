# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-06

---

## 현재 배포 상태

| 앱 | URL | 플랫폼 | 상태 |
|---|---|---|---|
| Wiki (포트폴리오 허브) | https://sgtlim0.github.io | GitHub Pages | ✅ |
| HMG 공식사이트 | https://hchat-hmg.vercel.app | Vercel | ✅ |
| Admin 관리자 패널 | https://hchat-admin.vercel.app | Vercel | ✅ |
| User 사용자 앱 | https://hchat-user.vercel.app | Vercel | ✅ |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel | ✅ |
| Storybook | https://hchat-wiki-storybook.vercel.app | Vercel | ✅ |
| Desktop (별도 레포) | https://hchat-desktop.vercel.app | Vercel | ✅ |

---

## 프로젝트 수치 현황

| 항목 | 수량 |
|------|------|
| 앱 (모노레포) | 6개 (Wiki, HMG, Admin, User, LLM Router, Storybook) |
| 별도 레포 | 2개 (hchat-v2-extension, hchat-desktop) |
| UI 패키지 | 2개 (@hchat/tokens, @hchat/ui) |
| 전체 소스 파일 | 510개 (409 TS/TSX + 83 MD + 18 CSS) |
| 총 코드 라인 | 27,983줄 (TS/TSX) |
| UI 컴포넌트 | 94개 |
| 페이지 | 46개 (page.tsx 기준) |
| Storybook 스토리 | 106개 (97% 커버리지) |
| 프로젝트 문서 | 23개 (12,940줄) |
| CSS 디자인 토큰 | 155개 (light + dark) |
| E2E 테스트 | 18개 파일 (728줄) |
| 단위 테스트 | 13개 파일, 182 테스트 (Vitest) |
| Wiki 콘텐츠 | 28 페이지 (5개 섹션) |
| AI 모델 (LLM Router) | 86개 |
| 커스텀 훅 | 47개 (Admin 23, User 7, LLM Router 8+) |

---

## 완료된 Phase (1~20)

### Phase 1~2: Wiki 사이트 ✅
Next.js 16 + Tailwind CSS 4, 마크다운 파이프라인, GitHub Pages 배포

### Phase 3~5: wiki.pen 디자인 + Storybook ✅
Wiki 6개 + HMG 8개 + Admin 10개 화면, Storybook 9, 33개 스토리

### Phase 6~9: Extension 분석 + Admin 구현 + 접근성 ✅
Admin 컴포넌트 12개 + 페이지 5개, ARIA 접근성

### Phase 10: 모노레포 전환 + HMG + 배포 ✅
npm workspaces + Turborepo, HMG 8개 컴포넌트 + 4 페이지

### Phase 11~12: ROI 대시보드 + 데이터 업로드 ✅
9개 ROI 페이지, 5종 SVG 차트, Excel 업로드, ROIDataContext

### Phase 13~15: LLM Router 설계 + Enterprise API 구현 ✅
wiki.pen 10개 화면, 부서관리/감사로그/SSO 구현

### Phase 16: User 앱 구현 ✅
5개 페이지, 12개 컴포넌트, 8종 AI 비서, 번역/OCR/문서작성

### Phase 17: User 다크모드 + 반응형 + Storybook ✅
User 다크모드 CSS 토큰, 반응형 레이아웃, 12개 스토리

### Phase 18: 채팅 인터랙션 ✅
SSE 스트리밍, 커스텀 비서 생성, 대화 검색, 마크다운 렌더링

### Phase 19: LLM Router 앱 ✅
10개 페이지, 86개 모델 가격표, Playground, Dashboard, API 키 관리

### Phase 20: E2E 테스트 + 접근성 + Lighthouse CI ✅
12개 E2E 테스트, WCAG 2.1 AA, skip nav, Lighthouse CI

### 추가: 문서 정리 + 배포 ✅
- Wiki 콘텐츠 v4 업데이트 (Extension/Desktop 분석 반영)
- Desktop 섹션 신규 생성 (overview, features, backend)
- 도구 페이지 4개 추가 (OCR, 번역, 심층리서치, 템플릿)
- README + 패키지별 README 전면 업데이트
- LLM Router + Storybook Vercel 프로젝트 생성
- 랜딩페이지 프로젝트 포트폴리오 구현

### Phase 21: Storybook 완성 + 디자인 시스템 정리 ✅
73개+ 스토리 (Wiki 13, Admin 17, HMG 8, LLM Router 6, ROI 3, Design System 1), 디자인 토큰 문서

### Phase 22: API 서비스 레이어 + UX 폴리싱 ✅
Admin/User/LLM Router Provider Pattern 서비스 레이어, Skeleton/Toast/ErrorBoundary/EmptyState 공통 컴포넌트

### Phase 23: 성능 최적화 + 번들 분석 ✅
- @next/bundle-analyzer 설정 (admin, hmg, user, llm-router)
- Dynamic import 코드 스플리팅 23개 페이지 (Admin 16, User 5, LLM Router 2)
- Turbo 빌드 캐시 최적화 (inputs/env 필드)
- Lighthouse CI URL 추가 (llm-router, desktop)
- OpenGraph 메타데이터 보강

### Phase 24: CI/CD 파이프라인 강화 ✅
- CI: Lighthouse CI job 추가, E2E workflow 확장 (user 프로젝트, concurrency, artifact retention)
- 코드 품질: Prettier + Husky + lint-staged (pre-commit hook)

### Phase 25: 통합 테스트 + 문서 최종화 ✅
- E2E 테스트 확장: responsive (4앱), dark-mode-all (4앱), a11y-all (axe-core 4앱) → 18개 파일
- 프로젝트 문서: CONTRIBUTING.md, ARCHITECTURE.md (Mermaid), DEPLOYMENT.md, API_SPEC.md, DEMO.md
- Playwright config: llm-router 배포 URL로 전환

### Phase 26: Storybook 103개 완성 ✅
- 30개 신규 스토리 추가 (Shared 5, ROI 원자 6, ROI 페이지 9, Admin/User 페이지 6, User 컴포넌트 4)
- Shared 카테고리 신규 (Skeleton, Toast, EmptyState, ErrorBoundary, LanguageToggle)
- main.ts에 @hchat/ui/i18n alias 추가
- 97% UI 컴포넌트 커버리지 달성

### Phase 27: 프로젝트 심층 분석 + 문서 정비 ✅
- PROJECT_ANALYSIS.md 신규 작성 (아키텍처, 패턴, 통계, 기술 부채 심층 분석)
- README.md 통계 업데이트 (116 토큰, 138 소스 파일)
- 기능별 README 7개 교차 참조 추가
- MEMORY.md 전면 업데이트 (6개 앱 + 규모 데이터)
- TODO.md 신규 기능 기획 추가

---

### Phase 28: 단위 테스트 기반 구축 ✅
- Vitest 4 + @testing-library/react 16 + jsdom 28 설정
- 9개 테스트 파일, 123개 테스트 케이스 (전체 통과)
- 테스트 대상: 공통 컴포넌트 (Badge, EmptyState, Skeleton, FeatureCard), 유틸리티 (validation), 서비스 레이어 (Admin MockApi, User chatService, LLM Router MockService, ROI aggregateData)
- @vitest/coverage-v8 커버리지 리포트 (v8, lcov, html)
- CI 통합: GitHub Actions ci.yml에 `npm test` 단계 추가
- Turbo test task 등록

### Phase 29: 실시간 대시보드 ✅
- Mock 기반 실시간 데이터 스트리밍 서비스 (setInterval 시뮬레이션)
- 4종 실시간 컴포넌트: LiveMetricCard, LiveLineChart, LiveActivityFeed, LiveModelDistribution
- AdminRealtimeDashboard 페이지 (실시간 모니터링 대시보드)
- 4개 커스텀 훅: useRealtimeMetrics, useRealtimeTimeSeries, useRealtimeActivities, useRealtimeStats
- Storybook 스토리 + 단위 테스트 (realtimeService, realtimeHooks)
- Dynamic import (ssr: false) + ProtectedRoute

---

### Phase 30: AI 모델 실연동 (SSE 스트리밍) ✅
- SSE 스트리밍 시뮬레이션 (토큰 단위 30-80ms, 프로바이더별 지연 프로파일 7종)
- StreamingPlayground 컴포넌트 (모델 선택, Temperature/MaxTokens/TopP, 채팅 히스토리)
- ModelComparison 컴포넌트 (2-3개 모델 나란히 비교, 가격/컨텍스트 시각화)
- API 키 유틸리티 (maskAPIKey, validateAPIKey, generateAPIKey, estimateTokens, calculateCost)
- useStreamingChat 훅 (onComplete 콜백, abort 지원, mountedRef 안전 업데이트)
- 단위 테스트: streamingService (6개), apiKeyUtils (22개)
- Storybook: ModelComparison 2개 스토리
- apps/llm-router/app/compare/page.tsx 신규 페이지

---

## 다음 계획 (Phase 31+)

→ 상세 계획: [`docs/NEXT_PHASE_PLAN.md`](./NEXT_PHASE_PLAN.md)

| Phase | 작업 | 설명 |
|-------|------|------|
| 31 | Desktop 모노레포 통합 | hchat-desktop 서브패키지 이전, 공유 UI 통합 |
| 32 | 알림 시스템 | WebSocket 푸시 알림 + 이메일, Admin/User 통합 |
| 33 | 대시보드 커스터마이징 | react-grid-layout 드래그앤드롭, 위젯 시스템 |
| 34 | AI 워크플로우 빌더 | ReactFlow 기반 비주얼 노드 파이프라인 편집기 |
| 35 | 모바일 앱 | React Native 또는 Capacitor PWA 네이티브 래퍼 |
| 36 | 멀티테넌트 | 조직별 격리, 커스텀 브랜딩, 데이터 파티셔닝 |
| 37 | AI 에이전트 마켓플레이스 | 커뮤니티 에이전트 공유, 설치, 평가 시스템 |
| 38 | 분석 엔진 고도화 | ML 기반 이상 탐지, 예측 분석, 자동 인사이트 |
| 39 | 단위 테스트 커버리지 80% | Vitest 컴포넌트 테스트 확장, MSW 모킹, CI 임계값 강화 |
| 40 | Storybook Interaction Tests | play() 함수 기반 사용자 시나리오 자동 검증, 폼 제출/모달 테스트 |
| 41 | RAG 문서 검색 | 벡터 DB 기반 사내 문서 검색, 임베딩 파이프라인, 청킹 전략 |
| 42 | 프롬프트 버전 관리 | 프롬프트 히스토리, A/B 테스트, 성과 비교 대시보드 |
| 43 | SSO/SAML 실연동 | Okta/Azure AD SAML 2.0, JWT 토큰 관리, 세션 갱신 |
| 44 | 채팅 히스토리 분석 | 대화 패턴 시각화, 주제 클러스터링, 사용자 행동 인사이트 대시보드 |
| 45 | Admin 권한 관리 고도화 | RBAC (역할 기반 접근 제어), 세분화된 권한 매트릭스, 감사 추적 |
| 46 | AI 모델 벤치마크 | 모델별 응답 품질/속도/비용 자동 벤치마크, 비교 리포트 생성 |
| 47 | 피드백 루프 시스템 | 사용자 만족도 수집, 모델 응답 평가, A/B 테스트 자동화 |
| 48 | 모니터링 알림 규칙 엔진 | 커스텀 알림 조건 빌더, Slack/Teams 웹훅, 에스컬레이션 정책 |

---

## 기술 부채

| # | 항목 | 상태 |
|---|------|------|
| 1 | 단위 테스트 | ✅ Phase 28 완료 (9파일, 123 테스트, 커버리지 17% → 80% 목표 진행 중) |
| 2 | Desktop 모노레포 통합 | 현재 별도 레포, Phase 32에서 통합 예정 |
| 3 | AI 모델 실제 API 연동 | 현재 Mock 데이터, Phase 31에서 실연동 예정 |
| 4 | Storybook interaction tests | 현재 visual only, 인터랙션 테스트 추가 필요 |
| 5 | 서비스 레이어 실제 API 전환 | Admin/User/LLM Router Mock → Real API 전환 |
| 6 | 모바일 반응형 테스트 자동화 | 현재 수동 테스트, E2E 모바일 viewport 자동화 필요 |
| 7 | PROJECT_ANALYSIS 자동 생성 | 수동 작성 중, CI에서 자동 생성 스크립트 도입 검토 |
| 8 | i18n 키 커버리지 | HMG 49키만 지원, Admin/User/LLM Router 확장 필요 |
| 9 | Storybook 인터랙션 테스트 | play() 함수 기반 사용자 시나리오 자동 검증 필요 |
