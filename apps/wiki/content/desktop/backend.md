---
title: Desktop 백엔드 API
description: Modal Serverless FastAPI 백엔드
---

# Backend API

H Chat Desktop의 백엔드는 Modal Serverless 플랫폼에서 실행되는 FastAPI 애플리케이션입니다.

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/health` | GET | 헬스 체크 |
| `/api/chat` | POST | SSE 스트리밍 채팅 |
| `/api/chat/test` | POST | AWS Bedrock 연결 테스트 |
| `/api/search` | POST | 웹 검색 (DuckDuckGo) |
| `/api/extract-memory` | POST | RAG 메모리 추출 |
| `/api/schedule/execute` | POST | 스케줄 작업 실행 |
| `/api/channels/slack` | POST | Slack 통합 |
| `/api/channels/telegram` | POST | Telegram 통합 |

## 스트리밍 프로토콜

```
data: {"type":"text","content":"안녕하세요"}\n\n
data: {"type":"text","content":" 무엇을"}\n\n
data: {"type":"done"}\n\n
```

## 보안 설계

- AWS 자격 증명은 브라우저 localStorage에만 저장
- 백엔드는 무상태 프록시 (자격 증명 미저장)
- 각 요청마다 새로운 Bedrock 클라이언트 생성
- CORS: 프로덕션은 *.vercel.app, *.github.io만 허용

## 로컬 개발

```bash
cd backend
pip install -r requirements.txt
modal serve app.py    # 로컬 서버 실행
```

## 배포 설정

- 타임아웃: 600초
- 동시 요청: 100개
- 플랫폼: Modal Serverless
