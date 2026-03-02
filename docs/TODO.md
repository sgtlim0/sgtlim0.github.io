# H Chat Wiki 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-03

---

## 프로젝트 문서 현황

| 파일 | 목적 | 상태 |
|------|------|------|
| `docs/MONOREPO_WORK_SUMMARY.md` | 모노레포 전환 작업 요약 | 완료 |
| `docs/STORYBOOK_IMPLEMENTATION.md` | Wiki 컴포넌트 Storybook 문서화 방안 | 완료 (참고) |
| `docs/MONOREPO_STORYBOOK_PLAN.md` | npm workspaces 모노레포 전환 방안 | 완료 (채택/구현) |
| `docs/HMG_DESIGN_GUIDE_PLAN.md` | HMG 공식 사이트 디자인 분석 | 완료 |
| `docs/HMG_DESIGN_IMPLEMENTATION.md` | wiki.pen HMG 화면 구현 방안 | 완료 |
| `docs/HCHAT_ADMIN_DESIGN.md` | Admin 관리자 페이지 디자인 설계 | 완료 |
| `docs/HCHAT_ROI_DASHBOARD_DESIGN.md` | ROI 대시보드 디자인 설계 | 완료 |
| `CLAUDE.md` | 프로젝트 가이드라인 | 업데이트 필요 |

---

## 완료된 작업 (Phase 1~12)

### Phase 1~2: Wiki 사이트 ✅ 100%
- Next.js 16 + Tailwind CSS 4, 마크다운 파이프라인, GitHub Pages 배포

### Phase 3: wiki.pen 디자인 시스템 ✅ 100%
- Wiki 6개 + HMG 8개 + Admin 10개 화면, 재사용 컴포넌트 31개

### Phase 4~5: Storybook + Admin 디자인 ✅ 100%
- Storybook 9, Admin 5개 화면 (Light/Dark), 33개 스토리

### Phase 6~7: Extension 분석 + Admin Storybook ✅ 완료
- hchat-v2-extension 기능 분석, Admin 스토리 12개

### Phase 8: React 코드 구현 ✅ 완료
- Admin 컴포넌트 12개 + 페이지 5개

### Phase 9: 접근성 ✅ 완료
- aria-label, role, aria-checked, aria-hidden 추가

### Phase 10: 모노레포 전환 + 배포 ✅ 완료
- npm workspaces + Turborepo 모노레포
- HMG 컴포넌트 8개 + 페이지 4개 구현
- Admin 앱 분리 (5개 페이지)
- 전체 배포 완료

### Phase 11: ROI 대시보드 ✅ 완료
- 9개 페이지: 데이터 업로드, 개요, 도입 현황, 생산성 효과, ROI 분석, 조직 분석, 만족도, 리포트, 설정
- 순수 SVG/CSS 차트 5종: MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart
- 공통 필터: DateFilter, DepartmentFilter
- ROI 시뮬레이터 (인터랙티브 계산)
- Mock 데이터 11개 시계열 데이터셋
- 전체 17개 라우트 정적 빌드 성공

### Phase 12: 데이터 업로드 기능 ✅ 완료
- Excel 파일 업로드 (.xlsx, .xls) — 브라우저 로컬 처리 (SheetJS)
- 드래그앤드롭 + 파일 선택
- 샘플 데이터 적재 (10,433건 mock 레코드)
- 데이터 미리보기 테이블 + 요약 통계
- Vercel 배포 완료

---

## 현재 배포 URL

| 앱 | URL | 플랫폼 | 상태 |
|---|---|---|---|
| Wiki | https://sgtlim0.github.io | GitHub Pages | ✅ |
| HMG | https://hchat-hmg.vercel.app | Vercel | ✅ |
| Admin | https://hchat-admin.vercel.app | Vercel | ✅ |
| Admin ROI | https://hchat-admin.vercel.app/roi/upload | Vercel | ✅ |
| Storybook | https://hchat-wiki-storybook.vercel.app | Vercel | ✅ |

---

## 앞으로 할 일

### 우선순위 높음 — 모두 완료

| # | 작업 | 상태 |
|---|------|------|
| 1 | CLAUDE.md 업데이트 | ✅ 완료 |
| 2 | HMG/Admin 다크모드 토글 동작 확인 | ✅ 완료 |
| 3 | Storybook HMG 스토리 추가 | ✅ 완료 (4개 페이지 스토리) |
| 4 | Vercel Git 연동 설정 | ✅ 완료 (Admin, HMG, Storybook 3개 프로젝트) |
| 5 | HMG/Admin 페이지 간 네비게이션 | ✅ 완료 |
| 6 | 업로드 데이터 → 차트 연동 | ✅ 완료 (ROIDataContext + aggregateData.ts) |

### 우선순위 중간

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 7 | 반응형 레이아웃 | HMG/Admin 모바일/태블릿 대응 | ✅ 완료 |
| 8 | Admin 확장 화면 추가 | ProviderStatus, ModelPricing 화면 | ✅ 완료 (2개 화면 + 라우트) |
| 9 | E2E 테스트 | Playwright 주요 사용자 흐름 | ✅ 완료 (4개 테스트 스위트) |
| 10 | SEO 메타태그 | OpenGraph, robots 설정 | ✅ 완료 |
| 11 | 성능 최적화 | Lighthouse 점수 측정 및 개선 | ✅ 완료 (font swap, viewport) |
| 12 | ROI Storybook 스토리 | ROI 차트/컴포넌트 6개 스토리 | ✅ 완료 |

### 우선순위 낮음

| # | 작업 | 설명 | 예상 난이도 |
|---|------|------|------------|
| 13 | Admin 실데이터 연동 | 현재 mock 데이터 → API 연결 (hchat-v2-extension 백엔드) | 높음 |
| 14 | Admin 인증/인가 | 관리자 로그인 + 권한 관리 | 높음 |
| 15 | HMG PDF 다운로드 기능 | Publications 페이지 실제 PDF 다운로드 | 중간 |
| 16 | i18n 다국어 지원 | 한국어/영어 전환 | 중간 |
| 17 | Admin 확장 화면: FeatureUsage | 기능별 사용량 대시보드 | 중간 |
| 18 | Admin 확장 화면: PromptLibrary | 조직 공용 프롬프트 템플릿 관리 | 중간 |
| 19 | Admin 확장 화면: AgentMonitoring | 에이전트 실행 모니터링 | 높음 |
| 20 | CI/CD 파이프라인 강화 | lint + type-check + test 자동화 (turbo 파이프라인) | 중간 |

---

## 기술 부채

| # | 항목 | 설명 | 상태 |
|---|------|------|------|
| 1 | `output: 'export'` 제거됨 | HMG/Admin에서 Vercel 호환을 위해 제거 | 유지 |
| 2 | ~~Vercel Git 자동 배포~~ | ~~현재 CLI 수동 배포~~ | ✅ 해결 |
| 3 | ~~`.vercel-hmg/` 미정리~~ | ~~루트에 임시 디렉토리~~ | ✅ .gitignore 추가 |
| 4 | Storybook 모노레포 재빌드 | Storybook Root Directory 설정 필요 (Vercel 대시보드) | 보류 |
| 5 | ~~ROI 데이터 상태 관리~~ | ~~업로드 데이터 페이지 이동 시 유실~~ | ✅ ROIDataContext 도입 |

---

## 프로젝트 수치 현황

| 항목 | 수량 |
|------|------|
| 앱 | 4개 (Wiki, HMG, Admin, Storybook) |
| 패키지 | 2개 (tokens, ui) |
| UI 컴포넌트 | 42개+ (공용 4 + HMG 8 + Admin 12 + ROI 18) |
| 페이지 | 25개+ (Wiki 동적 + HMG 4 + Admin 7 + ROI 9 + _not-found) |
| ROI 차트 컴포넌트 | 5개 (MiniLine, Donut, MiniBar, Area, Radar) |
| Storybook 스토리 | 43개+ (Wiki 13 + Admin 12 + HMG 12 + ROI 6) |
| CSS 토큰 변수 | ~70개 (light/dark, ROI 포함) |
| 배포 플랫폼 | 2개 (GitHub Pages, Vercel) |
| Vercel Git 연동 | 3개 (Admin, HMG, Storybook) |

---

## wiki.pen 노드 ID 참조

| 화면/컴포넌트 | ID | 위치 |
|---------------|-----|------|
| Admin-Dashboard | `Vi4NJ` | (0, 5000) |
| Admin-UsageHistory | `7Ucys` | (1540, 5000) |
| Admin-Statistics | `icrLs` | (3080, 5000) |
| Admin-UserManagement | `xfASO` | (4620, 5000) |
| Admin-Settings | `T1HB0` | (6160, 5000) |
| Admin Dark 5개 | `44O0p`, `Kq2zH`, `ANP2B`, `CRTVS`, `bCQBV` | y=6100 |

---

## 참고: hchat-v2-extension 주요 데이터 모델

```typescript
interface UsageRecord {
  date: string
  provider: 'bedrock' | 'openai' | 'gemini'
  model: string
  feature: 'chat' | 'group' | 'tool' | 'agent' | 'debate' | 'report'
  inputTokens: number
  outputTokens: number
  requests: number
  estimatedCost: number
}

interface ModelDef {
  id: string
  provider: 'bedrock' | 'openai' | 'gemini'
  label: string
  contextWindow: number
  inputCostPer1M: number
  outputCostPer1M: number
}
```
