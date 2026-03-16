---
name: token-bridge
description: packages/tokens/styles/tokens.css 변경 시 7개 앱의 Tailwind CSS 4 @theme 블록을 자동 동기화합니다. 앱별 접두사 네임스페이스와 다크 모드 매핑을 관리합니다.
---

# Token Bridge

디자인 토큰 Single Source of Truth(tokens.css) → 7개 앱 Tailwind 테마 동기화 스킬.

## 활성화 시점

- 디자인 토큰 추가/수정/삭제
- 새 앱 추가 시 토큰 네임스페이스 설정
- 다크 모드 관련 이슈 해결

## 7개 앱 접두사

| 앱 | 접두사 | 토큰 수 | globals.css 위치 |
|----|--------|--------|----------------|
| Wiki | `--wiki-` | 16 | `apps/wiki/app/globals.css` |
| HMG | `--hmg-` | 14 | `apps/hmg/app/globals.css` |
| Admin | `--admin-` | 12 | `apps/admin/app/globals.css` |
| ROI | `--roi-` | 18 | (admin 내 공유) |
| User | `--user-` | 9 | `apps/user/app/globals.css` |
| LLM Router | `--lr-` | 11 | `apps/llm-router/app/globals.css` |
| Desktop | `--dt-` | 21 | `apps/desktop/app/globals.css` |

## Tailwind CSS 4 규칙

### globals.css 필수 구조

```css
@import "tailwindcss";
@import "../../../packages/tokens/styles/tokens.css";

/* 중요: @source는 디렉토리 경로만, glob 패턴 불가 */
@source "../../../packages/ui/src";

@theme inline {
  --color-primary: var(--{prefix}-primary);
  --color-bg: var(--{prefix}-bg);
  --color-text: var(--{prefix}-text);
  --color-border: var(--{prefix}-border);
  --color-accent: var(--{prefix}-accent);
}
```

### 다크 모드 패턴

tokens.css에서 light + dark 쌍 정의:

```css
:root {
  --wiki-bg: #ffffff;
  --wiki-text: #1a1a2e;
}

.dark {
  --wiki-bg: #0a0a1a;
  --wiki-text: #e0e0e0;
}
```

## 토큰 추가 워크플로우

1. `packages/tokens/styles/tokens.css`에 light + dark 쌍 추가
2. 해당 앱의 `globals.css` `@theme inline` 블록에 매핑 추가
3. 컴포넌트에서 `className="bg-{semantic-name}"` 사용
4. Storybook Dark 변형에서 시각적 검증

## 참조 문서

- `docs/DESIGN_TOKENS.md` — 194개 토큰 레퍼런스
- `packages/tokens/styles/tokens.css` — 원본
