# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-05

---

## 현재 배포 상태

| 앱 | URL | 플랫폼 | 상태 |
|---|---|---|---|
| Wiki (포트폴리오 허브) | https://sgtlim0.github.io | GitHub Pages | ✅ |
| HMG 공식사이트 | https://hchat-hmg.vercel.app | Vercel | ✅ |
| Admin 관리자 패널 | https://hchat-admin.vercel.app | Vercel | ✅ |
| User 사용자 앱 | https://hchat-user.vercel.app | Vercel | ✅ |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel | ✅ |
| Storybook | https://hchat-storybook.vercel.app | Vercel | ✅ |
| Desktop (별도 레포) | https://hchat-desktop.vercel.app | Vercel | ✅ |

---

## 프로젝트 수치 현황

| 항목 | 수량 |
|------|------|
| 앱 (모노레포) | 7개 (Wiki, HMG, Admin, User, LLM Router, Storybook, Desktop) |
| 별도 레포 | 2개 (hchat-v2-extension, hchat-desktop) |
| UI 패키지 | 2개 (@hchat/tokens, @hchat/ui) |
| UI 컴포넌트 | 100개+ |
| 페이지 | 60개+ |
| Storybook 스토리 | 73개+ |
| 프로젝트 문서 | 7개 (CLAUDE, TODO, PLAN, CONTRIBUTING, ARCHITECTURE, DEPLOYMENT, API_SPEC, DEMO) |
| CSS 디자인 토큰 | 80개+ |
| E2E 테스트 파일 | 18개 |
| Wiki 콘텐츠 | 31 페이지 (5개 섹션: chat, tools, browser, settings, desktop) |
| AI 모델 (LLM Router) | 86개 |

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

---

## 다음 계획 (Phase 26+)

→ 상세 계획: [`docs/NEXT_PHASE_PLAN.md`](./NEXT_PHASE_PLAN.md)

| Phase | 작업 | 설명 |
|-------|------|------|
| 26 | 단위 테스트 | Vitest + Testing Library, 80%+ 커버리지, packages/ui 컴포넌트 |
| 27 | 실시간 대시보드 | WebSocket 기반 Admin 실시간 모니터링, SSE → WS 전환 |
| 28 | 다국어 확장 | 일본어, 중국어 추가 (현재 한/영) |
| 29 | AI 모델 실연동 | LLM Router 실제 API 호출, API 키 관리 보안 |
| 30 | Desktop 모노레포 통합 | hchat-desktop을 모노레포 서브패키지로 이전 |

---

## 기술 부채

| # | 항목 | 상태 |
|---|------|------|
| 1 | 단위 테스트 | 현재 0%, Phase 26에서 Vitest + Testing Library 도입 예정 |
| 2 | Desktop 모노레포 통합 | 현재 별도 레포, Phase 30에서 통합 예정 |
| 3 | AI 모델 실제 API 연동 | 현재 Mock 데이터, Phase 29에서 실연동 예정 |
