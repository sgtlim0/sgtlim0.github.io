# H Chat Wiki 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-04

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
| `docs/LLM_ROUTER_UI_DESIGN.md` | LLM-Router 화면 설계안 | 완료 |
| `docs/LLM_ROUTER_IMPLEMENTATION_PLAN.md` | LLM-Router 구현 계획서 | 완료 |
| `docs/HCHAT_ENTERPRISE_API_IMPLEMENTATION.md` | 기업 API 연동 구현 설계 | 완료 |
| `docs/HCHAT_USER_FEATURES_IMPLEMENTATION.md` | H Chat 사용자 기능 구현 설계 | 완료 |
| `CLAUDE.md` | 프로젝트 가이드라인 | ✅ 완료 |

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

### Phase 13: LLM-Router 화면 설계 ✅ 완료
- wiki.pen에 LLM-Router 10개 화면 디자인 (Landing, Models, Docs, Playground, UsageStats, APIKeys, OrgSettings, Billing, Login, Signup)
- 실제 서비스 스크린샷 20장 분석 → 화면 설계 반영
- 설계 문서: `docs/LLM_ROUTER_UI_DESIGN.md`, `docs/LLM_ROUTER_IMPLEMENTATION_PLAN.md`

### Phase 14: 기업 API 연동 설계 ✅ 완료
- H Chat 기업 사용자용 API 가이드 심층 분석
- 부서 관리, 사용자 관리, 감사 로그, SSO 연동 설계
- API 프록시 아키텍처 (서버사이드 API Key 보호)
- 구현 설계 문서: `docs/HCHAT_ENTERPRISE_API_IMPLEMENTATION.md`

### Phase 15: 기업 API 연동 구현 ✅ 완료
- 부서 관리 (DepartmentManagement): 계층 트리뷰, 검색, 추가, 동기화
- 감사 로그 (AuditLogViewer): 날짜/이벤트 필터, 검색, 페이지네이션, Excel 다운로드
- SSO 설정 (SSOConfigPanel): 토글, 회사코드, 암호화키, 테스트 URL 생성
- Enterprise API 서비스 레이어: 타입, 클라이언트, Mock 데이터
- Admin 25개 라우트 정적 빌드 성공

### Phase 16: H Chat 사용자 기능 구현 ✅ 완료
- 별도 `apps/user` 앱 생성 (Next.js 16, port 3003)
- 사용자 UI 컴포넌트 12개: UserGNB, ChatSidebar, AssistantCard, AssistantGrid, CategoryFilter, ChatSearchBar, FileUploadZone, StepProgress, EngineSelector, ProjectTable, SubscriptionCard, UsageTable
- 페이지 5개: ChatPage (업무 비서 채팅), TranslationPage (문서 번역), DocsPage (문서 작성), OCRPage (텍스트 추출), MyPage (마이페이지)
- AI 비서 8종 카드 + 카테고리 필터 (8개) + 공식/커스텀 탭
- 대화 인터페이스 (메시지 버블, 시뮬레이션 응답)
- 번역 엔진 선택 (자체 vs DeepL) + 파일 업로드 드래그앤드롭
- 문서 작성 5단계 워크플로우 + 프로젝트 테이블
- OCR 모드 전환 (추출 최대 5장 / 번역 최대 20장) + 결과 테이블
- 마이페이지 요금제 카드 + 9개 모델 사용량 테이블
- wiki.pen에 User 5개 화면 디자인 추가 (y=16300)
- Mock 데이터: 비서 8종, 모델 사용량 9종, 구독, 대화 3개, 프로젝트 2개, OCR 작업 3개

---

## 현재 배포 URL

| 앱 | URL | 플랫폼 | 상태 |
|---|---|---|---|
| Wiki | https://sgtlim0.github.io | GitHub Pages | ✅ |
| HMG | https://hchat-hmg.vercel.app | Vercel | ✅ |
| Admin | https://hchat-admin.vercel.app | Vercel | ✅ |
| Admin ROI | https://hchat-admin.vercel.app/roi/upload | Vercel | ✅ |
| Admin 부서관리 | https://hchat-admin.vercel.app/departments | Vercel | ✅ |
| Admin 감사로그 | https://hchat-admin.vercel.app/audit-logs | Vercel | ✅ |
| Admin SSO | https://hchat-admin.vercel.app/sso | Vercel | ✅ |
| Storybook | https://hchat-wiki-storybook.vercel.app | Vercel | ✅ |
| User | (미배포) localhost:3003 | Vercel (예정) | ⬜ |

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

### 우선순위 낮음 — 모두 완료

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 13 | Admin 실데이터 연동 | 현재 mock 데이터 → API 연결 (hchat-v2-extension 백엔드) | ✅ 완료 (API 서비스 레이어) |
| 14 | Admin 인증/인가 | 관리자 로그인 + 권한 관리 | ✅ 완료 (AuthContext + LoginPage) |
| 15 | HMG PDF 다운로드 기능 | Publications 페이지 다운로드 핸들러 + 탭 필터링 | ✅ 완료 |
| 16 | i18n 다국어 지원 | 한국어/영어 전환 (I18nProvider + LanguageToggle) | ✅ 완료 |
| 17 | Admin 확장 화면: FeatureUsage | 기능별 사용량 대시보드 | ✅ 완료 |
| 18 | Admin 확장 화면: PromptLibrary | 조직 공용 프롬프트 템플릿 관리 | ✅ 완료 |
| 19 | Admin 확장 화면: AgentMonitoring | 에이전트 실행 모니터링 | ✅ 완료 |
| 20 | CI/CD 파이프라인 강화 | lint + type-check + build 자동화 (GitHub Actions + turbo) | ✅ 완료 |

### 신규 — Phase 16 이후 작업

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 21 | User 앱 Vercel 배포 | `apps/user` Vercel 프로젝트 생성 + Git 연동 | ⬜ |
| 22 | User Storybook 스토리 | User 컴포넌트 12개 스토리 추가 | ⬜ |
| 23 | User 다크모드 지원 | 사용자 앱 다크모드 CSS 토큰 + ThemeToggle | ⬜ |
| 24 | User 반응형 레이아웃 | 모바일/태블릿 대응 (GNB 햄버거, 사이드바 슬라이드) | ⬜ |
| 25 | 채팅 실시간 스트리밍 | SSE/WebSocket 기반 AI 응답 스트리밍 UI | ⬜ |
| 26 | 비서 커스텀 생성 UI | "내가 만든 비서" 생성/편집 폼 | ⬜ |
| 27 | LLM-Router 코드 구현 | wiki.pen 10개 화면 → React 컴포넌트 구현 | ⬜ |
| 28 | 전체 앱 통합 테스트 | E2E 테스트 확장 (User + Admin + HMG) | ⬜ |

---

## 기술 부채

| # | 항목 | 설명 | 상태 |
|---|------|------|------|
| 1 | `output: 'export'` 제거됨 | HMG/Admin에서 Vercel 호환을 위해 제거 | 유지 |
| 2 | ~~Vercel Git 자동 배포~~ | ~~현재 CLI 수동 배포~~ | ✅ 해결 |
| 3 | ~~`.vercel-hmg/` 미정리~~ | ~~루트에 임시 디렉토리~~ | ✅ .gitignore 추가 |
| 4 | ~~Storybook 모노레포 재빌드~~ | ~~Storybook Root Directory 설정 필요~~ | ✅ Enterprise 스토리 추가 |
| 5 | ~~ROI 데이터 상태 관리~~ | ~~업로드 데이터 페이지 이동 시 유실~~ | ✅ ROIDataContext 도입 |

---

## 프로젝트 수치 현황

| 항목 | 수량 |
|------|------|
| 앱 | 5개 (Wiki, HMG, Admin, User, Storybook) |
| 패키지 | 2개 (tokens, ui) |
| UI 컴포넌트 | 60개+ (공용 4 + HMG 8 + Admin 15 + ROI 18 + Enterprise 3 + User 12) |
| 페이지 | 40개+ (Wiki 동적 + HMG 5 + Admin 14 + ROI 9 + User 6 + _not-found) |
| ROI 차트 컴포넌트 | 5개 (MiniLine, Donut, MiniBar, Area, Radar) |
| Storybook 스토리 | 46개+ (Wiki 13 + Admin 12 + HMG 12 + ROI 6 + Enterprise 3) |
| CSS 토큰 변수 | ~80개 (light/dark, ROI, User 포함) |
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
| LR-Landing | `yaGNg` | (0, 13000) |
| LR-Models | `xn0B4` | (1640, 13000) |
| LR-Docs | `q3LCL` | (3280, 13000) |
| LR-Playground | `2xbMg` | (4920, 13000) |
| LR-UsageStats | `WW4ED` | (0, 14100) |
| LR-APIKeys | `yWcUT` | (1640, 14100) |
| LR-OrgSettings | `seSOm` | (3280, 14100) |
| LR-Billing | `wlLLR` | (4920, 14100) |
| LR-Login | `a7p1z` | (0, 15200) |
| LR-Signup | `9rSHt` | (1640, 15200) |
| User-ChatPage | `wXaTq` | (0, 16300) |
| User-TranslationPage | `AReFe` | (1540, 16300) |
| User-DocsPage | `FiDov` | (3080, 16300) |
| User-OCRPage | `h8gJ3` | (4620, 16300) |
| User-MyPage | `QT0Nr` | (6160, 16300) |

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
