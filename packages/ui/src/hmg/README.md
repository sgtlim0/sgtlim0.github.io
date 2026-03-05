# HMG 공식사이트 컴포넌트

현대자동차그룹(HMG) 공식사이트에 사용되는 UI 컴포넌트 패키지입니다. 4개 페이지(홈, 발행물, 가이드, 대시보드)의 전체 레이아웃 및 인터랙티브 컴포넌트를 제공합니다.

## 사용 앱

- **apps/hmg** — H Chat 공식사이트 (https://hchat-hmg.vercel.app)
  - 로컬 개발: `npm run dev:hmg` (localhost:3001)

## 설치

```bash
npm install @hchat/ui
```

## 빠른 시작

### 레이아웃 구성

```tsx
import { GNB, Footer } from '@hchat/ui/hmg';
import { ThemeProvider } from '@hchat/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <GNB />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 컴포넌트 사용

```tsx
import { HeroBanner, TabFilter, HmgStatCard, StepItem } from '@hchat/ui/hmg';

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroBanner
        title="H Chat 생성형 AI"
        subtitle="업무 혁신을 위한 스마트 솔루션"
        image="/hero.jpg"
      />

      <section className="max-w-6xl mx-auto px-4">
        <TabFilter
          tabs={['개요', '기능', '사용 사례']}
          onTabChange={(tab) => console.log(tab)}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HmgStatCard title="생산성 증대" value="45%" unit="향상" />
        <HmgStatCard title="활용 시간" value="6.2" unit="시간/주" />
        <HmgStatCard title="만족도" value="92%" unit="긍정적" />
      </section>
    </div>
  );
}
```

## 페이지 구조

| 페이지 | 경로 | 설명 |
|--------|------|------|
| **홈** | `/` | 공식사이트 메인페이지 |
| **발행물** | `/publications` | H Chat 관련 뉴스, 블로그, 사례 |
| **가이드** | `/guide` | 단계별 사용 방법 및 튜토리얼 |
| **대시보드** | `/dashboard` | 사용량 통계 및 분석 |

## 컴포넌트 목록

### 레이아웃 컴포넌트

| 컴포넌트 | 설명 | Props |
|---------|------|-------|
| **GNB** | 페이지 상단 네비게이션 바 | 자동 라우팅, 활성 링크 강조 |
| **Footer** | 페이지 하단 푸터 | 저작권, 링크, 소셜 미디어 |

### 콘텐츠 컴포넌트

| 컴포넌트 | 설명 | 용도 |
|---------|------|------|
| **HeroBanner** | 대형 배너 (이미지 + 텍스트) | 페이지 상단 시각적 임팩트 |
| **TabFilter** | 탭 기반 필터링 인터페이스 | 콘텐츠 카테고리 전환 |
| **HmgStatCard** | 통계 정보 표시 카드 | KPI, 지표 시각화 |
| **StepItem** | 단계별 가이드 항목 | 튜토리얼, 온보딩 플로우 |
| **DownloadItem** | 다운로드 리스트 항목 | 리소스, 문서 배포 |
| **PillButton** | 알약 형태 버튼 | 필터링, 태그 선택 |

## 컴포넌트 상세

### GNB (Global Navigation Bar)

```tsx
<GNB />
```

- 반응형 네비게이션 (데스크톱/모바일)
- 자동 활성 링크 강조
- ThemeToggle 통합
- 모바일 햄버거 메뉴

### HeroBanner

```tsx
<HeroBanner
  title="제목"
  subtitle="부제목"
  image="/image.jpg"
  cta={{ label: "시작하기", href: "/guide" }}
/>
```

### TabFilter

```tsx
<TabFilter
  tabs={['전체', '뉴스', '가이드', '사례']}
  defaultTab="전체"
  onTabChange={(tab) => handleFilter(tab)}
/>
```

### HmgStatCard

```tsx
<HmgStatCard
  title="사용자 수"
  value="2,345"
  unit="명"
  icon="users"
  trend={{ up: true, percent: 12 }}
/>
```

### StepItem

```tsx
<StepItem
  number={1}
  title="설치"
  description="브라우저 확장 프로그램 설치"
  completed={true}
/>
```

### DownloadItem

```tsx
<DownloadItem
  title="사용 설명서"
  description="PDF, 2024년 11월"
  size="2.4 MB"
  href="/downloads/guide.pdf"
/>
```

### PillButton

```tsx
<PillButton
  label="필터"
  selected={true}
  onClick={() => handleFilter('filter')}
/>
```

## 디자인 특징

- **반응형**: 모바일(320px+), 태블릿, 데스크톱 최적화
- **다크모드**: `<html class="dark">` 토글로 자동 전환
- **Tailwind CSS**: 유틸리티 기반 일관된 스타일
- **토큰 기반**: 색상/타이포그래피는 @hchat/tokens에서 관리
- **접근성**: ARIA 레이블, 키보드 네비게이션, 시맨틱 마크업

## 배포

| 환경 | URL | 로컬 포트 |
|------|-----|----------|
| Production | https://hchat-hmg.vercel.app | - |
| Development | localhost | 3001 |

Vercel 배포 설정: `apps/hmg/vercel.json`

## 색상 체계

HMG 공식 브랜드 색상을 사용합니다:

- **주색상**: 현대차 navy
- **강조색**: HMG teal
- **중성색**: Gray palette
- **다크모드**: 별도 색상 세트

@hchat/tokens의 CSS 변수로 정의되어 있습니다.

## 최근 업데이트

### Phase 23: 성능 최적화
- **Bundle Analyzer**: `npm run analyze:hmg`으로 컴포넌트 번들 크기 분석
- **Turbo Cache**: 컴포넌트 변경 시 필요한 앱만 리빌드

### Phase 24: CI/CD 파이프라인
- **Lighthouse CI**: HMG 앱 성능(≥80), 접근성(≥85) 자동 검증
- **E2E 확장**: 반응형, 다크모드, 접근성(axe-core) 테스트

### Phase 25: 통합 테스트 + 문서
- **18개 E2E 테스트**: responsive, dark-mode-all, a11y-all (WCAG 2.1 AA)
- **Storybook 스토리**: 12개 HMG 컴포넌트 스토리

### Phase 26: Storybook 완성
- **103개 스토리**: 전체 UI 컴포넌트 97% 커버리지
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰 (색상, 타이포그래피, 스페이싱)
- **@hchat/ui** — 기본 컴포넌트 (Badge, ThemeProvider, ThemeToggle)
