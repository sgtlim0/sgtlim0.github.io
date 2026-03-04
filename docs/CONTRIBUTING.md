# 기여 가이드

## 개발 환경 설정

### 필수 조건
- Node.js 20+
- npm 11+

### 설치
```bash
git clone https://github.com/sgtlim0/sgtlim0.github.io.git hchat-wiki
cd hchat-wiki
npm install
```

### 개발 서버
```bash
npm run dev:admin     # Admin (localhost:3002)
npm run dev:user      # User (localhost:3003)
npm run dev:hmg       # HMG (localhost:3001)
npm run dev:llm-router # LLM Router (localhost:3004)
npm run dev:wiki      # Wiki (localhost:3000)
npm run dev:storybook # Storybook (localhost:6006)
```

## 코드 규칙

### 커밋 메시지
Conventional Commits 형식:
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서 업데이트
test: 테스트 추가/수정
chore: 빌드/설정 변경
perf: 성능 개선
ci: CI/CD 변경
```

### 코드 스타일
- **Prettier**: 자동 포맷팅 (pre-commit hook)
- **ESLint**: `eslint-config-next/core-web-vitals` + TypeScript
- **불변성**: 항상 새 객체 생성, 절대 변경하지 않음
- **파일 크기**: 200-400줄 권장, 최대 800줄

### 컴포넌트 작성
- 공유 컴포넌트: `packages/ui/src/` 에 작성
- 앱 전용 컴포넌트: `apps/*/components/` 에 작성
- export: `packages/ui/src/*/index.ts`에서 export
- Storybook 스토리 추가 권장

### 스타일링
- Tailwind CSS 4 사용
- CSS 변수는 `packages/tokens/styles/tokens.css`에서 관리
- 다크 모드: `.dark` 클래스 기반 (ThemeProvider)
- 반응형: mobile-first 접근

## 브랜치 전략

```
main ← 직접 push (프로토타입 단계)
```

프로덕션 전환 시:
```
main (protected)
  ↑ PR
feature/xxx
  ↑ PR
hotfix/xxx
```

## 테스트

### E2E 테스트
```bash
npm run test:e2e          # 전체 E2E
npm run test:e2e:admin    # Admin 전용
npm run test:e2e:ui       # UI 모드
```

### Lighthouse CI
```bash
npm run lighthouse        # 성능/접근성 측정
```

### 빌드 검증
```bash
npm run build             # Turborepo 전체 빌드
npm run lint              # ESLint 검사
```

## 디렉터리 구조

```
packages/tokens/    → CSS 변수 (80+ 토큰)
packages/ui/src/    → 공유 UI 컴포넌트 (100+)
apps/*/app/         → Next.js App Router 페이지
apps/*/components/  → 앱 전용 컴포넌트
tests/e2e/          → Playwright E2E 테스트
docs/               → 설계 문서
```

## 배포

| 앱 | 플랫폼 | 자동 배포 |
|---|---|---|
| Wiki | GitHub Pages | push to main → GitHub Actions |
| Admin, HMG, User, LLM Router, Storybook | Vercel | push to main → 자동 |

## 번들 분석

```bash
npm run analyze:admin     # Admin 번들 크기 분석
npm run analyze:hmg       # HMG 번들 크기 분석
npm run analyze:user      # User 번들 크기 분석
npm run analyze:llm-router # LLM Router 번들 크기 분석
```
