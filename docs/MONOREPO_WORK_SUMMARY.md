# HChat Wiki 모노레포 전환 작업 요약

> 작업일: 2026-03-02

## 개요

단일 Next.js 앱(Wiki)이었던 프로젝트를 **npm workspaces + Turborepo** 모노레포로 전환하고, wiki.pen 디자인 기반으로 **HMG 사이트**와 **Admin 사이트**를 React로 구현하여 각각 독립 배포하였습니다.

---

## 배포 URL

| 앱 | URL | 플랫폼 |
|---|---|---|
| **Wiki** | https://sgtlim0.github.io | GitHub Pages |
| **HMG** | https://hchat-hmg.vercel.app | Vercel |
| **Admin** | https://hchat-admin.vercel.app | Vercel |
| **Storybook** | https://hchat-wiki-storybook.vercel.app | Vercel |

---

## 프로젝트 구조

```
hchat-wiki/
├── package.json              # workspaces: ["packages/*", "apps/*"]
├── turbo.json                # Turborepo 파이프라인
├── tsconfig.base.json        # 공유 TypeScript 설정
│
├── packages/
│   ├── tokens/               # @hchat/tokens — 디자인 토큰
│   │   ├── src/index.ts
│   │   └── styles/tokens.css # Wiki + HMG + Admin CSS 변수 (light/dark)
│   │
│   └── ui/                   # @hchat/ui — 공유 UI 컴포넌트 (24개)
│       └── src/
│           ├── index.ts      # Wiki 공용: Badge, FeatureCard, ThemeToggle 등
│           ├── hmg/          # HMG 전용 컴포넌트 (8개)
│           └── admin/        # Admin 전용 컴포넌트 (12개)
│
├── apps/
│   ├── wiki/                 # @hchat/wiki — Next.js 16, Static Export
│   ├── hmg/                  # @hchat/hmg — Next.js 16, Static Export (신규)
│   ├── admin/                # @hchat/admin — Next.js 16, Static Export (신규)
│   └── storybook/            # @hchat/storybook — Storybook 9 (이동)
│
├── design/                   # wiki.pen, design1.pen
└── docs/
```

## 패키지 의존성

```
@hchat/tokens  ←  @hchat/ui  ←  @hchat/wiki
                       ↑        ←  @hchat/hmg
                       ↑        ←  @hchat/admin
               @hchat/storybook
```

---

## 구현 상세

### Phase 0: 모노레포 전환

- 루트 `package.json`에 workspaces 설정 (`packages/*`, `apps/*`)
- `turbo.json` 생성 (build, dev, lint 파이프라인)
- `tsconfig.base.json` 공유 TypeScript 설정
- `packages/tokens/` — globals.css에서 CSS 변수 분리 (Wiki + HMG + Admin, light/dark)
- `packages/ui/` — 공유 컴포넌트 패키지 생성, barrel export
- 기존 Wiki 앱 → `apps/wiki/`로 이동
- 기존 Storybook → `apps/storybook/`로 이동

### Phase 1: HMG 디자인 토큰 + 컴포넌트 (8개)

wiki.pen 디자인 기반으로 구현:

| 컴포넌트 | 설명 |
|----------|------|
| `GNB` | 글로벌 네비게이션 바 (navy 배경, 메뉴 링크) |
| `HeroBanner` | 히어로 섹션 (teal 그라데이션 배경) |
| `TabFilter` | 탭 네비게이션 (전체/가이드/릴리즈 노트 등) |
| `Footer` | 페이지 푸터 (다크 배경) |
| `HmgStatCard` | 통계 카드 (아이콘 + 숫자 + 라벨) |
| `StepItem` | 스텝 가이드 항목 (번호 + 제목 + 설명) |
| `DownloadItem` | 다운로드 항목 (제목 + 버튼 리스트) |
| `PillButton` | 둥근 CTA 버튼 (navy/teal 변형) |

HMG CSS 토큰 (18개 light/dark):
- `--hmg-navy`, `--hmg-teal`, `--hmg-bg-card`, `--hmg-bg-section`
- `--hmg-border`, `--hmg-text-title`, `--hmg-text-body`, `--hmg-text-caption`
- `--hmg-footer-bg` 등

### Phase 2: HMG 사이트 앱 (4 페이지)

| 라우트 | 페이지 | 내용 |
|--------|--------|------|
| `/` | HMG-Home | GNB + HeroBanner + 카드 그리드 6개 + Footer |
| `/publications` | HMG-Publications | 탭 필터 + 섹션별 다운로드 리스트 |
| `/guide` | HMG-StepGuide | 2열 레이아웃, 5단계 가이드 + 스크린샷 |
| `/dashboard` | HMG-Dashboard | Welcome + StatCard 4개 + 검색바 + 히어로 |

### Phase 3: Admin 사이트 앱 (5 페이지)

| 라우트 | 페이지 | 내용 |
|--------|--------|------|
| `/` | Admin-Dashboard | 통계 카드 4개 + 차트 + 최근 활동 테이블 |
| `/usage` | Usage History | 월별 필터 + 사용량 테이블 |
| `/statistics` | Statistics | 차트 행 + 기간별 통계 |
| `/users` | User Management | 사용자 카드 그리드 + 검색 |
| `/settings` | Settings | 설정 행 리스트 + 토글 |

Admin 컴포넌트 (12개): StatusBadge, DataTable, BarChartRow, StatCard, MonthPicker, SettingsRow, UserCard, + 5개 페이지 컴포넌트

### Phase 4: Storybook 통합

- 전체 **33개 스토리** (Wiki + HMG + Admin)
- HMG 컴포넌트 스토리 8개 + 페이지 스토리 4개
- Admin 컴포넌트/페이지 스토리 기존 유지
- Vite alias 설정으로 모노레포 모듈 해석

### Phase 5: 배포

- Wiki → GitHub Pages (GitHub Actions)
- HMG → Vercel (REST API 배포)
- Admin → Vercel (REST API 배포)
- Storybook → Vercel (기존 연결 유지)

---

## npm 스크립트

```bash
npm run dev:wiki          # Wiki dev (localhost:3000)
npm run dev:hmg           # HMG dev (localhost:3001)
npm run dev:admin         # Admin dev (localhost:3002)
npm run dev:storybook     # Storybook dev (localhost:6006)
npm run build             # turbo: 전체 빌드
npm run build:wiki        # Wiki만
npm run build:hmg         # HMG만
npm run build:admin       # Admin만
npm run build:storybook   # Storybook만
```

---

## 해결한 주요 이슈

| 이슈 | 원인 | 해결 |
|------|------|------|
| CSS import 경로 오류 | `app/` 하위에서 `../../` 부족 | `../../../packages/tokens/styles/tokens.css`로 수정 |
| Server Component 이벤트 핸들러 오류 | barrel export에서 client 컴포넌트 재수출 | 모든 barrel `index.ts`에 `'use client'` 추가 |
| Storybook 모듈 해석 실패 | 모노레포 subpath export 미지원 | `viteFinal`에 Vite alias 추가 + wildcard exports |
| Turbo `packageManager` 경고 | 루트 package.json에 필드 누락 | `"packageManager": "npm@11.6.4"` 추가 |
| GitHub PAT workflow scope | Fine-grained PAT는 workflow scope 미지원 | Classic PAT로 remote URL 변경 |
| Vercel 빌드 `cd ../..` 실패 | Vercel은 루트 디렉토리만 업로드 | `rootDirectory` 프로젝트 설정 + git 소스 배포 |
| Vercel output directory 오류 | `out` 설정 시 `.next` 감지 실패 | output directory 비워서 Next.js 기본값 사용 |

---

## 커밋 히스토리

```
211bc97 fix: add transpilePackages to HMG next config
b1789c5 fix: update GitHub Actions workflow for monorepo wiki build path
2eb5a29 feat: convert to npm workspaces monorepo with HMG + Admin apps
```

---

## 수치 요약

| 항목 | 수량 |
|------|------|
| 앱 | 4개 (Wiki, HMG, Admin, Storybook) |
| 패키지 | 2개 (tokens, ui) |
| UI 컴포넌트 | 24개 (공용 4 + HMG 8 + Admin 12) |
| 페이지 | 10개 (Wiki 동적 + HMG 4 + Admin 5) |
| Storybook 스토리 | 33개 |
| CSS 토큰 변수 | ~50개 (Wiki + HMG + Admin, light/dark) |
| 소스 파일 | 121개 (.ts/.tsx/.css/.json) |
| 배포 플랫폼 | 2개 (GitHub Pages, Vercel) |
