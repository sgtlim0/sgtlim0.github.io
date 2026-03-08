# @hchat/llm-router

LLM 라우터 앱. 86개 AI 모델(OpenAI, Anthropic, Cohere 등)의 비교, 가격, 성능 정보와
API 플레이그라운드를 제공하는 Next.js 앱.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4
- Lucide React (아이콘)

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:llm-router   # http://localhost:3004
npm run build:llm-router # 정적 빌드 → apps/llm-router/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | Home |
| `/models` | 모델 목록 (86개, 필터/검색) |
| `/compare` | 모델 비교 |
| `/playground` | API 플레이그라운드 |
| `/docs` | API 문서 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/dashboard/usage` | 사용량 |
| `/dashboard/keys` | API 키 관리 |
| `/dashboard/billing` | 결제 |
| `/dashboard/settings` | 설정 |

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (llm-router: ModelTable, ProviderBadge 등)

## 배포

Vercel -- https://hchat-llm-router.vercel.app
