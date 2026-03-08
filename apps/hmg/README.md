# @hchat/hmg

현대차그룹(HMG) 공식 사이트. H Chat 서비스 소개, 발간물, 사용 가이드,
대시보드를 제공하는 랜딩 사이트.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4
- Lucide React (아이콘)

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:hmg          # http://localhost:3001
npm run build:hmg        # 정적 빌드 → apps/hmg/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | Home (히어로 배너, 서비스 소개) |
| `/publications` | 발간물 (탭 필터링, 다운로드) |
| `/guide` | 사용 가이드 (단계별 안내) |
| `/dashboard` | 대시보드 |

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (hmg: GNB, HeroBanner, TabFilter, Footer 등)

## 배포

Vercel -- https://hchat-hmg.vercel.app
