# @hchat/desktop

H Chat 데스크톱 인터페이스. 에이전트 관리, 도구 통합, 토론(debate) 모드,
스웜(swarm) 모드를 제공하는 Next.js 앱.

## 기술 스택

- Next.js 16 (App Router, Static Export)
- React 19, TypeScript 5
- Tailwind CSS 4

## 시작하기

```bash
# 프로젝트 루트에서
npm install
npm run dev:desktop      # http://localhost:5173
npm run build:desktop    # 정적 빌드 → apps/desktop/out/
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 채팅 |
| `/agents` | 에이전트 목록/관리 |
| `/tools` | 도구 그리드 (활성/비활성 상태) |
| `/debate` | AI 토론 모드 |
| `/swarm` | 멀티 에이전트 스웜 |

## 주요 컴포넌트

- DesktopSidebar -- 접이식 네비게이션
- DesktopChatBubble -- 사용자/어시스턴트 메시지 (토큰 카운트)
- AgentCard -- 에이전트 상태 및 제어
- ToolGrid -- 도구 그리드

디자인 토큰은 `--dt-*` 접두사를 사용한다.

## 의존 패키지

- `@hchat/tokens` -- 디자인 토큰 (CSS 변수)
- `@hchat/ui` -- 공유 UI 컴포넌트 (desktop)

## 배포

Vercel -- https://hchat-desktop.vercel.app
