# @hchat/tokens

H Chat 모노레포의 디자인 토큰 패키지. 모든 앱에서 일관된 시각적 정체성을 보장하는 CSS 변수 시스템입니다.

## 구조

```
packages/tokens/
├── styles/
│   └── tokens.css      # 80+ CSS 변수 (light/dark)
├── src/
│   └── index.ts         # Tailwind @theme inline 매핑
└── package.json
```

## 사용법

### 1. CSS 변수 Import

각 앱의 `globals.css`에서 토큰 파일을 import합니다:

```css
@import 'tailwindcss';
@import '../../../packages/tokens/styles/tokens.css';
```

### 2. Tailwind 매핑

`@theme inline`으로 CSS 변수를 Tailwind 유틸리티에 매핑합니다:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-bg-page: var(--bg-page);
  --color-text-primary: var(--text-primary);
}
```

이렇게 하면 `bg-primary`, `text-text-primary` 같은 Tailwind 클래스를 사용할 수 있습니다.

### 3. 직접 CSS 변수 사용

```css
.custom-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
```

## 토큰 네임스페이스

| 네임스페이스 | 접두사 | 앱 | 토큰 수 |
|-------------|--------|-----|---------|
| Wiki | `--` | Wiki, 공통 | 20개 |
| HMG | `--hmg-*` | HMG 공식사이트 | 14개 |
| Admin | `--admin-*` | Admin 관리자 패널 | 14개 |
| ROI | `--roi-*` | ROI 대시보드 | 22개 |
| User | `--user-*` | User 사용자 앱 | 9개 |
| LLM Router | `--lr-*` | LLM Router | 12개 |

## 색상 팔레트

### Wiki (공통)

| 변수 | Light | Dark | 용도 |
|------|-------|------|------|
| `--primary` | `#2563EB` | `#3B82F6` | 주요 액센트 |
| `--primary-hover` | `#1D4ED8` | `#2563EB` | 호버 상태 |
| `--accent-emerald` | `#10B981` | `#10B981` | 성공/긍정 |
| `--accent-purple` | `#8B5CF6` | `#8B5CF6` | 보조 액센트 |
| `--success` | `#22C55E` | `#22C55E` | 성공 상태 |
| `--warning` | `#F59E0B` | `#F59E0B` | 경고 상태 |
| `--danger` | `#EF4444` | `#EF4444` | 오류 상태 |
| `--bg-page` | `#FFFFFF` | `#111827` | 페이지 배경 |
| `--bg-sidebar` | `#F8FAFC` | `#1F2937` | 사이드바 배경 |
| `--bg-card` | `#F8FAFC` | `#1F2937` | 카드 배경 |
| `--bg-hero` | `#EFF6FF` | `#1E3A5F` | 히어로 배경 |
| `--text-primary` | `#0F172A` | `#F1F5F9` | 본문 텍스트 |
| `--text-secondary` | `#64748B` | `#94A3B8` | 보조 텍스트 |
| `--border` | `#E2E8F0` | `#374151` | 테두리 |

### ROI Dashboard

| 변수 | Light | Dark | 용도 |
|------|-------|------|------|
| `--roi-chart-1` | `#3763F4` | `#3763F4` | 차트 색상 1 (파랑) |
| `--roi-chart-2` | `#00AAD2` | `#00AAD2` | 차트 색상 2 (청록) |
| `--roi-chart-3` | `#10B981` | `#10B981` | 차트 색상 3 (초록) |
| `--roi-chart-4` | `#F59E0B` | `#F59E0B` | 차트 색상 4 (노랑) |
| `--roi-chart-5` | `#EC4899` | `#EC4899` | 차트 색상 5 (분홍) |
| `--roi-positive` | `#10B981` | `#10B981` | 긍정 지표 |
| `--roi-negative` | `#EF4444` | `#EF4444` | 부정 지표 |

### 앱별 커스텀 토큰

각 앱은 `globals.css`에서 추가 커스텀 토큰을 정의할 수 있습니다:

- **LLM Router** (`apps/llm-router/app/globals.css`): `--lr-primary`, `--lr-accent` 등
- **Admin** (`apps/admin/app/globals.css`): `--admin-bg-hover` 등

## 다크 모드

모든 토큰은 `.dark` 클래스로 자동 전환됩니다:

```css
:root {
  --bg-page: #FFFFFF;      /* 라이트 모드 */
}
.dark {
  --bg-page: #111827;      /* 다크 모드 */
}
```

`ThemeProvider`가 `<html>` 태그에 `.dark` 클래스를 토글합니다.

## Storybook 미리보기

Storybook의 "Design System/Tokens" 스토리에서 전체 색상 팔레트를 시각적으로 확인할 수 있습니다.

- **Storybook URL**: https://hchat-wiki-storybook.vercel.app
- **103개 스토리**: 전체 UI 컴포넌트 97% 커버리지

## 앱별 토큰 추가 시

1. `packages/tokens/styles/tokens.css`의 `:root`와 `.dark`에 변수 추가
2. 앱의 `globals.css`에서 `@theme inline` 매핑 추가
3. Storybook `DesignTokens.stories.tsx` 업데이트

## 최근 업데이트

### Phase 23: 성능 최적화
- **번들 분석**: `@next/bundle-analyzer` 설정으로 앱별 번들 크기 분석
- **Turbo Cache**: 디자인 토큰 변경 시 필요한 앱만 리빌드

### Phase 24: CI/CD 파이프라인
- **Lighthouse CI**: 모든 앱에서 디자인 토큰 적용 성능 검증
- **코드 품질**: Prettier 자동 포맷팅으로 일관된 코드 스타일

### Phase 25: 통합 테스트
- **E2E 테스트**: 다크모드 전환, 반응형 레이아웃 테스트에서 토큰 검증
- **접근성**: WCAG 2.1 AA 색상 대비 검증 (axe-core)

### Phase 26: Storybook 완성
- **103개 스토리**: 전체 UI 컴포넌트 97% 커버리지
- **Design Tokens 카테고리**: 색상 팔레트 시각화
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app
