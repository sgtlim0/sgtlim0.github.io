# Design Tokens Reference

Source: `packages/tokens/styles/tokens.css`

## Overview

CSS 변수 기반 디자인 토큰 시스템. `:root`(light)와 `.dark` 선택자로 테마 전환을 지원한다. 7개 앱이 동일한 토큰 파일을 공유하며, 각 앱은 접두사로 네임스페이스를 분리한다.

| 접두사 | 앱 | 토큰 수 (light / dark) |
|--------|-----|----------------------|
| (없음) | Wiki | 16 / 11 |
| `--hmg-*` | HMG | 14 / 12 |
| `--admin-*` | Admin | 12 / 6 |
| `--roi-*` | ROI Dashboard | 18 / 10 |
| `--user-*` | User | 9 / 9 |
| `--lr-*` | LLM Router | 11 / 8 |
| `--dt-*` | Desktop | 21 / 16 |

---

## 1. Wiki Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--primary` | `#2563eb` | `#3b82f6` | 주요 액션, 링크 |
| `--primary-hover` | `#1d4ed8` | `#2563eb` | 주요 액션 호버 |
| `--primary-light` | `#eff6ff` | `#1e3a5f` | 주요 색상 배경 |
| `--accent-emerald` | `#10b981` | -- | 강조 (녹색) |
| `--accent-purple` | `#8b5cf6` | -- | 강조 (보라) |
| `--success` | `#22c55e` | -- | 성공 상태 |
| `--warning` | `#f59e0b` | -- | 경고 상태 |
| `--danger` | `#ef4444` | -- | 오류 상태 |
| `--bg-page` | `#ffffff` | `#111827` | 페이지 배경 |
| `--bg-sidebar` | `#f8fafc` | `#1f2937` | 사이드바 배경 |
| `--bg-card` | `#f8fafc` | `#1f2937` | 카드 배경 |
| `--bg-hero` | `#eff6ff` | `#1e3a5f` | 히어로 섹션 |
| `--bg-hover` | `#f1f5f9` | `#374151` | 호버 배경 |
| `--bg-code` | `#f1f5f9` | `#1f2937` | 코드 블록 배경 |
| `--text-primary` | `#0f172a` | `#f1f5f9` | 본문 텍스트 |
| `--text-secondary` | `#64748b` | `#94a3b8` | 보조 텍스트 |
| `--text-tertiary` | `#94a3b8` | `#64748b` | 비활성 텍스트 |
| `--text-white` | `#ffffff` | -- | 흰색 텍스트 |
| `--border` | `#e2e8f0` | `#374151` | 기본 보더 |
| `--border-light` | `#f1f5f9` | `#1f2937` | 연한 보더 |

## 2. HMG Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--hmg-navy` | `#002c5f` | -- | 브랜드 네이비 |
| `--hmg-teal` | `#00b4d8` | -- | 브랜드 틸 |
| `--hmg-teal-light` | `#e0f7fa` | `#004d5a` | 틸 배경 |
| `--hmg-blue` | `#3a5bc5` | -- | 블루 포인트 |
| `--hmg-accent` | `#e15c39` | -- | 액센트 (오렌지) |
| `--hmg-green` | `#118762` | -- | 그린 포인트 |
| `--hmg-cover-bg` | `#d5cebf` | -- | 커버 배경 |
| `--hmg-bg-card` | `#ffffff` | `#2a2a2a` | 카드 배경 |
| `--hmg-bg-section` | `#f5f5f5` | `#1a1a1a` | 섹션 배경 |
| `--hmg-border` | `#eaeaea` | `#333333` | 보더 |
| `--hmg-text-title` | `#000000` | `#f1f1f1` | 제목 텍스트 |
| `--hmg-text-body` | `#111111` | `#e0e0e0` | 본문 텍스트 |
| `--hmg-text-caption` | `#949494` | `#666666` | 캡션 텍스트 |
| `--hmg-footer-bg` | `#1f1f1f` | `#0a0a0a` | 푸터 배경 |
| `--hmg-input-bg` | `#f5f5f5` | `#2a2a2a` | 입력 배경 |
| `--hmg-input-border` | `#e0e0e0` | `#444444` | 입력 보더 |
| `--hmg-table-stripe` | `#fafafa` | `#222222` | 테이블 줄무늬 |
| `--hmg-table-hover` | `#f0f7ff` | `#1a2a3a` | 테이블 호버 |

## 3. Admin Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--admin-teal` | `#00aac1` | -- | 메인 브랜드 |
| `--admin-navy` | `#002c5f` | -- | 네이비 포인트 |
| `--admin-blue` | `#3a5bc5` | -- | 블루 포인트 |
| `--admin-accent` | `#e15c39` | -- | 액센트 (오렌지) |
| `--admin-green` | `#118762` | -- | 그린 포인트 |
| `--admin-status-success` | `#4caf50` | -- | 상태: 성공 |
| `--admin-status-error` | `#e53935` | -- | 상태: 오류 |
| `--admin-status-pending` | `#ffa726` | -- | 상태: 대기 |
| `--admin-table-stripe` | `#fafafa` | `#222222` | 테이블 줄무늬 |
| `--admin-table-hover` | `#f0f7ff` | `#1a2a3a` | 테이블 호버 |
| `--admin-input-bg` | `#f5f5f5` | `#2a2a2a` | 입력 배경 |
| `--admin-input-border` | `#e0e0e0` | `#444444` | 입력 보더 |
| `--admin-bg-section` | `#ffffff` | `#1a1a2e` | 섹션 배경 |
| `--admin-bg-card` | `#ffffff` | `#1e1e2e` | 카드 배경 |

## 4. ROI Dashboard Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--roi-sidebar-bg` | `#0f172a` | `#020617` | 사이드바 배경 |
| `--roi-sidebar-text` | `rgba(255,255,255,0.7)` | -- | 사이드바 텍스트 |
| `--roi-sidebar-active` | `#ffffff` | -- | 사이드바 활성 |
| `--roi-sidebar-hover` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.08)` | 사이드바 호버 |
| `--roi-body-bg` | `#f1f5f9` | `#0f172a` | 본문 배경 |
| `--roi-card-bg` | `#ffffff` | `#1e293b` | 카드 배경 |
| `--roi-card-border` | `#e2e8f0` | `#334155` | 카드 보더 |
| `--roi-text-primary` | `#0f172a` | `#f1f5f9` | 본문 텍스트 |
| `--roi-text-secondary` | `#64748b` | `#94a3b8` | 보조 텍스트 |
| `--roi-text-muted` | `#94a3b8` | `#64748b` | 비활성 텍스트 |
| `--roi-divider` | `#e2e8f0` | `#334155` | 구분선 |
| `--roi-positive` | `#10b981` | -- | 긍정 지표 |
| `--roi-negative` | `#ef4444` | -- | 부정 지표 |
| `--roi-chart-1` | `#3763f4` | -- | 차트 색상 1 |
| `--roi-chart-2` | `#00aad2` | -- | 차트 색상 2 |
| `--roi-chart-3` | `#10b981` | -- | 차트 색상 3 |
| `--roi-chart-4` | `#f59e0b` | -- | 차트 색상 4 |
| `--roi-chart-5` | `#ec4899` | -- | 차트 색상 5 |
| `--roi-kpi-bg` | `#ffffff` | `#1e293b` | KPI 카드 배경 |
| `--roi-heatmap-high` | `#10b981` | -- | 히트맵: 높음 |
| `--roi-heatmap-mid` | `#f59e0b` | -- | 히트맵: 중간 |
| `--roi-heatmap-low` | `#ef4444` | -- | 히트맵: 낮음 |

## 5. User Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--user-primary` | `#4f6ef7` | `#6b8aff` | 주요 액션 |
| `--user-primary-light` | `#ebf0ff` | `#1e2a4a` | 주요 배경 |
| `--user-accent` | `#10b981` | `#34d399` | 강조 |
| `--user-bg` | `#ffffff` | `#0f172a` | 페이지 배경 |
| `--user-bg-section` | `#f8fafc` | `#1e293b` | 섹션 배경 |
| `--user-border` | `#e2e8f0` | `#334155` | 보더 |
| `--user-text-primary` | `#1e293b` | `#f1f5f9` | 본문 텍스트 |
| `--user-text-secondary` | `#64748b` | `#94a3b8` | 보조 텍스트 |
| `--user-text-muted` | `#94a3b8` | `#64748b` | 비활성 텍스트 |

## 6. LLM Router Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--lr-nav-bg` | `#0f172a` | `#020617` | 내비게이션 배경 |
| `--lr-nav-text` | `rgba(255,255,255,0.7)` | -- | 내비게이션 텍스트 |
| `--lr-primary` | `#3b82f6` | -- | 주요 액션 |
| `--lr-primary-hover` | `#2563eb` | -- | 주요 액션 호버 |
| `--lr-bg` | `#ffffff` | `#0f172a` | 페이지 배경 |
| `--lr-bg-section` | `#f8fafc` | `#1e293b` | 섹션 배경 |
| `--lr-bg-code` | `#1f2937` | `#111827` | 코드 블록 배경 |
| `--lr-bg-table` | `#ffffff` | `#1e293b` | 테이블 배경 |
| `--lr-border` | `#e2e8f0` | `#334155` | 보더 |
| `--lr-text-primary` | `#0f172a` | `#f1f5f9` | 본문 텍스트 |
| `--lr-text-secondary` | `#64748b` | `#94a3b8` | 보조 텍스트 |
| `--lr-text-muted` | `#94a3b8` | `#64748b` | 비활성 텍스트 |

## 7. Desktop Tokens

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--dt-primary` | `#6366f1` | `#818cf8` | 주요 액션 |
| `--dt-primary-hover` | `#4f46e5` | `#6366f1` | 주요 액션 호버 |
| `--dt-primary-light` | `#eef2ff` | `#1e1b4b` | 주요 배경 |
| `--dt-accent` | `#10b981` | `#34d399` | 강조 |
| `--dt-accent-light` | `#ecfdf5` | `#064e3b` | 강조 배경 |
| `--dt-bg` | `#ffffff` | `#0f172a` | 페이지 배경 |
| `--dt-bg-sidebar` | `#0f172a` | `#020617` | 사이드바 배경 |
| `--dt-bg-section` | `#f8fafc` | `#1e293b` | 섹션 배경 |
| `--dt-bg-card` | `#ffffff` | `#1e293b` | 카드 배경 |
| `--dt-border` | `#e2e8f0` | `#334155` | 보더 |
| `--dt-text-primary` | `#0f172a` | `#f1f5f9` | 본문 텍스트 |
| `--dt-text-secondary` | `#64748b` | `#94a3b8` | 보조 텍스트 |
| `--dt-text-muted` | `#94a3b8` | `#64748b` | 비활성 텍스트 |
| `--dt-text-sidebar` | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.5)` | 사이드바 텍스트 |
| `--dt-text-sidebar-active` | `#ffffff` | `#ffffff` | 사이드바 활성 |
| `--dt-sidebar-hover` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.08)` | 사이드바 호버 |
| `--dt-status-idle` | `#94a3b8` | -- | 에이전트: 대기 |
| `--dt-status-thinking` | `#f59e0b` | -- | 에이전트: 사고 중 |
| `--dt-status-responding` | `#3b82f6` | -- | 에이전트: 응답 중 |
| `--dt-status-done` | `#10b981` | -- | 에이전트: 완료 |
| `--dt-for` | `#10b981` | -- | 찬성 |
| `--dt-against` | `#ef4444` | -- | 반대 |
| `--dt-moderator` | `#6366f1` | -- | 중재자 |

---

## 의미적 분류

### 배경 (Background)

`--bg-page`, `--bg-sidebar`, `--bg-card`, `--bg-hero`, `--bg-hover`, `--bg-code` 및 각 앱의 `--{prefix}-bg`, `--{prefix}-bg-section`, `--{prefix}-bg-card`.

### 텍스트 (Text)

3단계 계층: `primary` > `secondary` > `tertiary/muted`. 모든 앱이 동일한 패턴을 따른다.

### 보더 (Border)

`--border`, `--border-light` 및 각 앱의 `--{prefix}-border`. 다크 모드에서 `#e2e8f0` -> `#334155` 또는 `#374151`로 전환.

### 상태 (Status)

| 상태 | Wiki | Admin | ROI | Desktop |
|------|------|-------|-----|---------|
| 성공 | `--success` #22c55e | `--admin-status-success` #4caf50 | `--roi-positive` #10b981 | `--dt-status-done` #10b981 |
| 경고 | `--warning` #f59e0b | `--admin-status-pending` #ffa726 | `--roi-heatmap-mid` #f59e0b | `--dt-status-thinking` #f59e0b |
| 오류 | `--danger` #ef4444 | `--admin-status-error` #e53935 | `--roi-negative` #ef4444 | -- |

---

## Tailwind CSS 4 연동

### 1단계: globals.css에서 토큰 import + Tailwind 등록

```css
@import 'tailwindcss';
@import '../../../packages/tokens/styles/tokens.css';

@source "../../../packages/ui/src";

@theme inline {
  --color-primary: var(--primary);
  --color-bg-page: var(--bg-page);
  --color-text-primary: var(--text-primary);
  --color-border: var(--border);
}
```

### 2단계: 컴포넌트에서 Tailwind 클래스로 사용

```tsx
<div className="bg-bg-page text-text-primary border-border">
  <button className="bg-primary hover:bg-primary-hover text-text-white">
    Action
  </button>
</div>
```

### 핵심 규칙

- `@theme inline` 블록 안에서 `--color-*` 접두사로 Tailwind 색상 등록
- CSS 변수를 `var(--token)`으로 참조하면 다크 모드가 자동 적용됨
- `@source` 디렉티브에 패키지 경로를 지정해야 크로스 패키지 클래스가 스캔됨 (glob 패턴 불가, 디렉토리 경로만 가능)

### CSS 변수 -> Tailwind 클래스 매핑 예시

| CSS 변수 등록 | Tailwind 클래스 |
|--------------|----------------|
| `--color-primary: var(--primary)` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-bg-page: var(--bg-page)` | `bg-bg-page` |
| `--color-text-secondary: var(--text-secondary)` | `text-text-secondary` |
| `--color-admin-teal: var(--admin-teal)` | `bg-admin-teal`, `text-admin-teal` |
| `--color-roi-chart-1: var(--roi-chart-1)` | `bg-roi-chart-1`, `text-roi-chart-1` |

---

## 다크 모드 동작

`ThemeProvider`가 `<html>` 태그에 `.dark` 클래스를 토글한다. `.dark` 선택자에서 동일한 CSS 변수명을 재선언하므로, `var()` 참조만으로 자동 전환된다.

```
:root { --bg-page: #ffffff; }     /* light */
.dark { --bg-page: #111827; }     /* dark  */
```

`@theme inline`에서 `--color-bg-page: var(--bg-page)`로 등록했으므로, `bg-bg-page` 클래스를 사용하면 테마에 따라 값이 자동으로 변경된다. 컴포넌트 코드 수정 없이 테마 전환이 가능하다.
