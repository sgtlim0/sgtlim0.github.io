---
title: Desktop 앱 개요
description: H Chat Desktop - PWA 기반 AI 챗 애플리케이션
---

# H Chat Desktop

H Chat Desktop은 현대차그룹 생성형 AI 서비스의 **Progressive Web App (PWA)** 버전입니다.

## 배포 URL

- **프론트엔드**: https://hchat-desktop.vercel.app
- **백엔드 API**: Modal Serverless (FastAPI)
- **GitHub**: https://github.com/sgtlim0/hchat-desktop

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 프레임워크 |
| TypeScript | 5.9 | 타입 안전성 |
| Vite | 7 | 빌드 도구 |
| Tailwind CSS | 3 | 스타일링 |
| Zustand | 5 | 상태 관리 |
| Dexie | 4.3 | IndexedDB 래퍼 |
| FastAPI | - | 백엔드 API |
| Modal | - | Serverless 배포 |

## 프로젝트 규모

| 항목 | 수치 |
|------|------|
| 페이지 | 15개 |
| Zustand 스토어 | 16개 |
| 테스트 | 667개 |
| 커버리지 | 83% |
| 완료율 | 100% (70/70 TODO) |

## 아키텍처

Feature-Sliced Design 패턴을 사용합니다:

```
src/
├── pages/          # 15개 뷰 컴포넌트
├── widgets/        # 복합 UI 위젯
├── entities/       # 16개 Zustand 스토어
├── shared/         # 공통 유틸리티, 훅, i18n, 타입
├── server/         # Vite 미들웨어 (Bedrock 프록시)
└── styles/         # 글로벌 CSS
```

## 지원 AI 모델

- **AWS Bedrock**: Claude Opus 4.6, Sonnet 4.6, Haiku 4.5
- **OpenAI**: GPT-4o, GPT-4 Turbo
- **Google**: Gemini Pro
