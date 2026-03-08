# @hchat/admin

H Chat 관리자 패널. 사용자 관리, AI 모델/프로바이더 설정, 사용량 통계, ROI 대시보드 등
엔터프라이즈 관리 기능을 제공하는 Next.js 앱.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4
- Lucide React (아이콘)

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:admin        # http://localhost:3002
npm run build:admin      # 정적 빌드 → apps/admin/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | Dashboard |
| `/login` | 로그인 (admin@hchat.ai / Admin123!) |
| `/usage` | 사용량 이력 |
| `/statistics` | 통계 |
| `/users` | 사용자 관리 |
| `/settings` | 설정 |
| `/providers` | AI 프로바이더 상태 |
| `/models` | 모델 가격 정책 |
| `/features` | 기능 사용량 |
| `/prompts` | 프롬프트 라이브러리 |
| `/agents` | 에이전트 모니터링 |
| `/departments` | 부서 관리 |
| `/audit-logs` | 감사 로그 |
| `/sso` | SSO 설정 |
| `/notifications` | 알림 |
| `/realtime` | 실시간 모니터링 |
| `/workflows` | 워크플로우 |
| `/customize` | 커스터마이즈 |
| `/roi/*` | ROI 대시보드 (overview, adoption, productivity, analysis, organization, sentiment, reports, settings, upload) |

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (admin, ROI)

## 배포

Vercel -- https://hchat-admin.vercel.app
