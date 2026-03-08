# @hchat/user

H Chat 사용자 앱. AI 채팅(SSE 스트리밍), 문서 검색, OCR, 번역 등
사용자 대면 기능을 제공하는 Next.js 앱.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4
- Zod (입력 검증)
- Lucide React (아이콘)

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:user         # http://localhost:3003
npm run build:user       # 정적 빌드 → apps/user/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 채팅 (SSE 스트리밍, localStorage 저장) |
| `/docs` | 문서 검색 |
| `/my-page` | 마이 페이지 |
| `/ocr` | OCR (이미지 텍스트 추출) |
| `/translate` | 번역 |

## 주요 기능

- 실시간 SSE 스트리밍 채팅
- localStorage 기반 대화 저장
- 커스텀 어시스턴트 생성
- 파일 업로드
- 서비스 레이어 (Mock/Real 전환: UserServiceProvider)

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (user, services)

## 배포

Vercel -- https://hchat-user.vercel.app
