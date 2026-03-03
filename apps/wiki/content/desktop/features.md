---
title: Desktop 주요 기능
description: 15개 페이지, 다중 AI 모델, 에이전트, 토론, 문서 처리
---

# Desktop 주요 기능

## 15개 페이지

| 페이지 | 설명 |
|--------|------|
| Home | 어시스턴트 마켓플레이스 (8개 공식 어시스턴트) |
| Chat | 표준 AI 대화 인터페이스 |
| Quick Chat | 빠른 메시징 |
| All Chats | 대화 히스토리 뷰어 |
| Group Chat | 다중 모델 병렬 응답 |
| Agent | 에이전트 모드 (XML 도구 호출) |
| Swarm | 멀티 에이전트 조율 |
| Debate | 3모델 토론 (3라운드 합의) |
| AI Tools | 작문 도구 허브 (11개 기능) |
| Image Gen | DALL-E 3 이미지 생성 |
| Prompt Library | 프롬프트 저장소 |
| Projects | 프로젝트 관리 |
| Memory | RAG 메모리 시스템 |
| Schedule | 반복 작업 스케줄러 |
| Settings | 설정 패널 |

## 핵심 기능

### AI 어시스턴트 마켓플레이스
- 8개 공식 어시스턴트 (신중한 분석가, 빠른 대화, 문서 검토, 번역, 보고서 생성, 코드 리뷰, 데이터 분석, 이메일 작성)
- 8개 카테고리 필터
- 원클릭 세션 시작, 시스템 프롬프트 자동 주입

### 실시간 SSE 스트리밍
- 토큰 단위 실시간 응답
- 자동 모델 라우팅 (프롬프트 복잡도 분석)
- 대화 포킹 및 자동 요약

### 그룹 채팅 및 토론
- 다중 모델 병렬 응답 비교
- 3개 모델 × 3라운드 토론 → 합의 요약
- 대화 폴더 및 태그 시스템

### 에이전트 및 Swarm
- XML 도구 호출 파싱
- 웹 검색 (DuckDuckGo 프록시)
- 코드 실행 시뮬레이션
- RAG (Retrieval-Augmented Generation)
- 멀티 에이전트 오케스트레이션

### AI 작문 도구 (11개)
요약, 톤 조정, 문법 검사, 문서 건강도 분석, 가독성 평가 등

### 문서 처리
- PDF 채팅 (pdfjs-dist)
- Excel/CSV 분석 (SheetJS)
- Tesseract.js OCR

### 데이터 안전
- 모든 데이터 로컬 저장 (IndexedDB, 13개 테이블)
- AI 가드레일: PII 탐지 (주민등록번호, 신용카드, 이메일)
- 백업/복원: JSON, Markdown, HTML, TXT, PDF 내보내기

### PWA
- 오프라인 지원 (Service Worker 캐싱)
- 설치 가능한 데스크톱 앱
- 키보드 단축키: Cmd/Ctrl+K (검색), Cmd/Ctrl+B (사이드바), Cmd/Ctrl+, (설정)
