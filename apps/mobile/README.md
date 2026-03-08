# @hchat/mobile

H Chat 모바일 웹 앱. PWA 지원과 모바일 최적화 UI를 제공하는 Next.js 앱.
MobileApp 컴포넌트를 동적 임포트로 렌더링한다.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:mobile       # http://localhost:3005
npm run build:mobile     # 정적 빌드 → apps/mobile/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 모바일 메인 (MobileApp 동적 로드, SSR 비활성) |

UI 컴포넌트는 `@hchat/ui/mobile`에서 관리되며,
앱은 thin wrapper로 동작한다.

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (mobile)

## 배포

Vercel
