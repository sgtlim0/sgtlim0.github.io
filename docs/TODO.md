# H Chat Wiki 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-02

---

## 프로젝트 문서 현황

| 파일 | 목적 | 상태 |
|------|------|------|
| `docs/STORYBOOK_IMPLEMENTATION.md` | Wiki 컴포넌트 9개를 Storybook으로 문서화하는 방안 | 완료 (참고 문서) |
| `docs/MONOREPO_STORYBOOK_PLAN.md` | npm workspaces 모노레포 전환 + 공유 UI 패키지 분리 방안 | 완료 (참고 문서, 미채택) |
| `docs/HMG_DESIGN_GUIDE_PLAN.md` | HMG 공식 사이트 + Brand Home 2.0 디자인 분석 및 설계 방안 | 완료 |
| `docs/HMG_DESIGN_IMPLEMENTATION.md` | wiki.pen에 HMG 스타일 화면/컴포넌트 실제 구현 방안 | 완료 |
| `docs/HCHAT_ADMIN_DESIGN.md` | H Chat 사용내역 관리자 페이지 디자인 설계 (MoneyFlow 참조) | 완료 |
| `content/storybook-design-plan.md` | H Chat v3 Extension 컴포넌트 Storybook 설계 방안 | 완료 (참고 문서) |
| `CLAUDE.md` | 프로젝트 가이드라인 (Claude Code 용) | 완료 |
| `README.md` | 프로젝트 소개 | 완료 |

---

## Phase 1: Wiki 사이트 기본 구현

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 1.1 | Next.js 16 + Tailwind CSS 4 프로젝트 세팅 | ✅ 완료 | |
| 1.2 | 마크다운 파이프라인 구축 (gray-matter, react-markdown) | ✅ 완료 | `lib/markdown.ts` |
| 1.3 | Catch-all 라우트 + Static Export | ✅ 완료 | `app/[[...slug]]/page.tsx` |
| 1.4 | 사이드바 네비게이션 | ✅ 완료 | `components/Sidebar.tsx` |
| 1.5 | 마크다운 렌더러 (syntax highlight 포함) | ✅ 완료 | `components/MarkdownRenderer.tsx` |
| 1.6 | GitHub Pages 배포 (GitHub Actions) | ✅ 완료 | `.github/workflows/deploy.yml` |

---

## Phase 2: H Chat 브랜드 Wiki 전환

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 2.1 | 디자인 토큰 + 다크모드 CSS 변수 | ✅ 완료 | `app/globals.css` |
| 2.2 | ThemeProvider + ThemeToggle | ✅ 완료 | `components/ThemeProvider.tsx`, `ThemeToggle.tsx` |
| 2.3 | 사이드바 리디자인 (로고, 검색, 아이콘 네비게이션) | ✅ 완료 | `components/Sidebar.tsx` |
| 2.4 | HomePage 히어로 + 기능 카드 | ✅ 완료 | `components/HomePage.tsx` |
| 2.5 | DocsLayout (브레드크럼 + TOC + prev/next) | ✅ 완료 | `components/DocsLayout.tsx` |
| 2.6 | 한국어 콘텐츠 작성 (21개 페이지) | ✅ 완료 | `content/**/*.md` |
| 2.7 | lib/navigation.ts (사이드바 구조, 페이지 순서) | ✅ 완료 | |

---

## Phase 3: wiki.pen 디자인 시스템

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 3.1 | wiki.pen 기본 화면 6개 (Light 3 + Dark 3) | ✅ 완료 | WikiHome, DocsPage, QuickStart |
| 3.2 | 기본 재사용 컴포넌트 6개 | ✅ 완료 | |
| 3.3 | HMG 디자인 변수 18개 추가 | ✅ 완료 | Light/Dark 테마 |
| 3.4 | HMG 재사용 컴포넌트 18개 추가 | ✅ 완료 | GNB, TabFilter, StatCard 등 |
| 3.5 | HMG 화면 8개 (Light 4 + Dark 4) | ✅ 완료 | y=2500 영역 |

---

## Phase 4: Storybook 세팅 & 배포

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 4.1 | Storybook 9 + @storybook/nextjs-vite 설치 | ✅ 완료 | `.storybook/main.ts` |
| 4.2 | 다크모드 Addon 설정 | ✅ 완료 | `addon-themes`, `.storybook/preview.ts` |
| 4.3 | 접근성 Addon (a11y) | ✅ 완료 | |
| 4.4 | manager.ts 브랜딩 (create() 함수) | ✅ 완료 | blank page 버그 수정 완료 |
| 4.5 | Wiki 컴포넌트 스토리 작성 | ✅ 완료 | 50개 스토리, 13개 컴포넌트 |
| 4.6 | Vercel 배포 | ✅ 완료 | https://hchat-wiki-storybook.vercel.app |
| 4.7 | 배포 후 렌더링 검증 (Light/Dark) | ✅ 완료 | |

---

## Phase 5: Admin 관리자 페이지 디자인 (wiki.pen)

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 5.1 | MoneyFlow 앱 분석 | ✅ 완료 | 5개 페이지 구조 분석 |
| 5.2 | Admin 디자인 변수 3개 추가 | ✅ 완료 | status-pending, table-stripe, table-hover |
| 5.3 | Admin 재사용 컴포넌트 7개 | ✅ 완료 | StatusBadge x3, TableRow, BarChartRow, UserCard, SettingsRow |
| 5.4 | Admin-Dashboard 화면 | ✅ 완료 | (0, 5000) 1440x900 |
| 5.5 | Admin-UsageHistory 화면 | ✅ 완료 | (1540, 5000) 1440x1200 |
| 5.6 | Admin-Statistics 화면 | ✅ 완료 | (3080, 5000) 1440x1100 |
| 5.7 | Admin-UserManagement 화면 | ✅ 완료 | (4620, 5000) 1440x1000 |
| 5.8 | Admin-Settings 화면 | ✅ 완료 | 일반/모델(5개)/비용 설정 + 액션 버튼 |
| 5.9 | Admin 다크모드 화면 5개 | ✅ 완료 | y=6100 영역 |

---

## Phase 6: hchat-v2-extension 기능 분석 & 화면 확장

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 6.1 | hchat-v2-extension 레포 md 파일 분석 (12개) | ✅ 완료 | 전체 기능 목록 추출 |
| 6.2 | Admin 기능 요구사항 도출 | ✅ 완료 | 아래 기능 목록 참조 |
| 6.3 | Admin-Settings 모델 설정 섹션 추가 | ✅ 완료 | SettingsRow x5 (Claude/GPT-4o/Gemini/Haiku/mini) |
| 6.4 | Admin-Settings 비용 설정 섹션 추가 | ✅ 완료 | 월 예산, 경고 임계값, 일일 토큰 한도 |
| 6.5 | Admin-Settings 액션 버튼 추가 | ✅ 완료 | 저장/초기화 버튼 |
| 6.6 | 확장 기능 화면 추가 (선택) | ❌ 미시작 | 아래 세부 항목 참조 |
| 6.7 | Admin 다크모드 화면 5개 생성 | ✅ 완료 | 각 Light 화면 복사 + theme: dark |

### 6.6 확장 기능 화면 후보

hchat-v2-extension 분석 결과 추가 가능한 Admin 화면:

| 화면 | 설명 | 우선순위 |
|------|------|----------|
| Admin-ProviderStatus | AWS/OpenAI/Gemini 프로바이더별 연결 상태, API 키 관리 | 높음 |
| Admin-ModelPricing | 7개 모델별 가격표, 토큰 단가, 자동 라우팅 설정 | 높음 |
| Admin-FeatureUsage | 기능별 사용량 (AI채팅/그룹채팅/토론/에이전트/PDF/유튜브) | 중간 |
| Admin-PromptLibrary | 조직 공용 프롬프트 템플릿 관리 (8개 기본 + 커스텀) | 중간 |
| Admin-AgentMonitoring | 에이전트 실행 단계 모니터링, 도구 호출 통계 | 낮음 |
| Admin-ContentPolicy | 기능 토글 관리 (웹검색, 검색카드, 글쓰기 어시스턴트 등) | 낮음 |

---

## Phase 7: Admin Storybook 스토리 작성

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 7.1 | Atoms: StatusBadge 스토리 | ❌ 미시작 | Success/Error/Pending 3가지 |
| 7.2 | Atoms: MonthPicker 스토리 | ❌ 미시작 | Default/Selected |
| 7.3 | Molecules: DataTable 스토리 | ❌ 미시작 | UsageHistory/EmptyState |
| 7.4 | Molecules: BarChartRow 스토리 | ❌ 미시작 | ModelUsage/UserRanking |
| 7.5 | Molecules: UserCard 스토리 | ❌ 미시작 | Active/Inactive |
| 7.6 | Molecules: SettingsRow 스토리 | ❌ 미시작 | Toggle/Input |
| 7.7 | Organisms: AdminDashboard 스토리 | ❌ 미시작 | Default/DarkMode |
| 7.8 | Organisms: AdminUsageHistory 스토리 | ❌ 미시작 | Default/Filtered/DarkMode |
| 7.9 | Organisms: AdminStatistics 스토리 | ❌ 미시작 | Default/DarkMode |
| 7.10 | Organisms: AdminUserManagement 스토리 | ❌ 미시작 | Default/DarkMode |
| 7.11 | Organisms: AdminSettings 스토리 | ❌ 미시작 | Default/DarkMode |

---

## Phase 8: React 코드 구현

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 8.1 | Admin React 컴포넌트 구현 | ❌ 미시작 | StatusBadge, DataTable, BarChart, UserCard, SettingsRow, MonthPicker |
| 8.2 | Admin 페이지 구현 | ❌ 미시작 | AdminDashboard, AdminUsageHistory, AdminStatistics, AdminUserManagement, AdminSettings |
| 8.3 | 라우팅 + 네비게이션 연결 | ❌ 미시작 | /admin/* 경로 |
| 8.4 | 빌드 검증 | ❌ 미시작 | `npm run build` + `npm run build-storybook` |
| 8.5 | Vercel 배포 | ❌ 미시작 | 메인 사이트 + Storybook |

---

## Phase 9: 품질 보증

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 9.1 | 코드 리뷰 | ❌ 미시작 | code-reviewer 에이전트 |
| 9.2 | 접근성 검증 (a11y) | ❌ 미시작 | Storybook addon-a11y |
| 9.3 | 다크모드 시각적 검증 | ❌ 미시작 | 모든 화면 Light/Dark 확인 |
| 9.4 | 반응형 검증 | ❌ 미시작 | 모바일/태블릿/데스크톱 |

---

## 진행률 요약

| Phase | 완료 | 전체 | 진행률 |
|-------|------|------|--------|
| 1. Wiki 기본 구현 | 6 | 6 | 100% |
| 2. H Chat 브랜드 전환 | 7 | 7 | 100% |
| 3. wiki.pen 디자인 시스템 | 5 | 5 | 100% |
| 4. Storybook 세팅 & 배포 | 7 | 7 | 100% |
| 5. Admin 디자인 (wiki.pen) | 9 | 9 | 100% |
| 6. Extension 분석 & 확장 | 6 | 7 | 86% |
| 7. Admin Storybook 스토리 | 0 | 11 | 0% |
| 8. React 코드 구현 | 0 | 5 | 0% |
| 9. 품질 보증 | 0 | 4 | 0% |
| **총합** | **40** | **61** | **66%** |

---

## 다음 우선순위 작업

1. **확장 기능 화면 추가** — ProviderStatus, ModelPricing 등 (hchat-v2-extension 분석 기반)
2. **Admin Storybook 스토리 작성** — Atoms → Molecules → Organisms 순서
3. **Admin React 컴포넌트 구현** — 디자인 → 코드 변환
4. **빌드 검증 + Vercel 배포** — `npm run build` + `npm run build-storybook`
5. **품질 보증** — 코드 리뷰, 접근성, 다크모드, 반응형 검증

---

## 참고: hchat-v2-extension 주요 데이터 모델

```typescript
// 사용 기록 (Admin 대시보드의 핵심 데이터)
interface UsageRecord {
  date: string
  provider: 'bedrock' | 'openai' | 'gemini'
  model: string
  feature: 'chat' | 'group' | 'tool' | 'agent' | 'debate' | 'report'
  inputTokens: number
  outputTokens: number
  requests: number
  estimatedCost: number  // USD
}

// 모델 정의 (가격표)
interface ModelDef {
  id: string
  provider: 'bedrock' | 'openai' | 'gemini'
  label: string
  contextWindow: number
  inputCostPer1M: number   // USD
  outputCostPer1M: number  // USD
}

// 모델별 가격 (USD per 1M tokens)
// Claude Sonnet 4.6: $3 / $15
// Claude Opus 4.6: $15 / $75
// Claude Haiku 4.5: $0.8 / $4
// GPT-4o: $2.5 / $10
// GPT-4o mini: $0.15 / $0.6
// Gemini Flash 2.0: Free
// Gemini Pro 1.5: $1.25 / $5
```

---

## wiki.pen 노드 ID 참조

| 화면/컴포넌트 | ID | 위치 |
|---------------|-----|------|
| Admin-Dashboard | `Vi4NJ` | (0, 5000) |
| Admin-UsageHistory | `7Ucys` | (1540, 5000) |
| Admin-Statistics | `icrLs` | (3080, 5000) |
| Admin-UserManagement | `xfASO` | (4620, 5000) |
| Admin-Settings | `T1HB0` | (6160, 5000) |
| Admin-Dashboard - Dark | `44O0p` | (0, 6100) |
| Admin-UsageHistory - Dark | `Kq2zH` | (1540, 6100) |
| Admin-Statistics - Dark | `ANP2B` | (3080, 6100) |
| Admin-UserManagement - Dark | `CRTVS` | (4620, 6100) |
| Admin-Settings - Dark | `bCQBV` | (6160, 6100) |
| StatusBadge-Success | `QC86G` | 재사용 컴포넌트 |
| StatusBadge-Error | `ooJ3f` | 재사용 컴포넌트 |
| StatusBadge-Pending | `N8jW6` | 재사용 컴포넌트 |
| TableRow | `NB4D6` | 재사용 컴포넌트 |
| BarChartRow | `LFmKE` | 재사용 컴포넌트 |
| UserCard | `ggEoz` | 재사용 컴포넌트 |
| SettingsRow | `01ml5` | 재사용 컴포넌트 |
