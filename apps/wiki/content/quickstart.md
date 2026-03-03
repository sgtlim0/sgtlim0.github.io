---
title: 빠른 시작 가이드
description: H Chat v4 설치 및 초기 설정
badges: ["초보자 가이드"]
---

# 빠른 시작 가이드

H Chat v4는 Chrome Extension (Manifest V3) 기반의 멀티 AI 프로바이더 어시스턴트입니다.

## 지원 AI 프로바이더

- **AWS Bedrock (Claude)** - Claude Sonnet 4.6, Claude Opus 4.6, Claude Haiku 4.5
- **OpenAI (GPT)** - GPT-4o, GPT-4o mini
- **Google Gemini** - Gemini Flash 2.0, Gemini Pro 1.5

## 설치 방법

### 1. 저장소 클론 및 빌드

```bash
git clone https://github.com/sgtlim0/hchat-v2-extension.git
cd hchat-v2-extension
npm install
npm run build
```

### 2. Chrome에 로드

1. Chrome 브라우저에서 `chrome://extensions` 접속
2. 우측 상단의 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. 빌드된 `dist/` 폴더 선택

## 초기 설정

### 1. 사이드패널 열기

- 단축키: `Ctrl+Shift+H` (Windows/Linux) 또는 `Cmd+Shift+H` (Mac)
- 또는 브라우저 우측 상단의 H Chat 아이콘 클릭

### 2. AWS Bedrock 설정 (필수)

1. 사이드패널에서 **설정** 탭 클릭
2. **AWS 자격증명** 섹션에서 다음 입력:
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Region (예: us-east-1)
3. **연결 테스트** 버튼으로 인증 확인

### 3. 추가 프로바이더 설정 (선택)

#### OpenAI 설정

1. 설정 탭의 **OpenAI** 섹션 이동
2. OpenAI API Key 입력
3. **연결 테스트** 버튼으로 인증 확인

#### Google Gemini 설정

1. 설정 탭의 **Google Gemini** 섹션 이동
2. Google Gemini API Key 입력
3. **연결 테스트** 버튼으로 인증 확인

## 주요 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Ctrl+Shift+H` | 사이드패널 열기/닫기 | H Chat 사이드패널 토글 |
| `Ctrl+Shift+S` | 빠른 페이지 요약 | 현재 페이지의 즉시 요약 생성 |
| `Ctrl+Shift+T` | 번역 모드 | 선택한 텍스트 빠른 번역 |
| `Ctrl+Shift+E` | 텍스트 설명 | 선택한 텍스트의 상세 설명 |
| `Ctrl+Shift+C` | 코드 분석 | 선택한 코드의 분석 및 설명 |
| `Ctrl+N` | 새 대화 | 새로운 대화 시작 |
| `/` | 입력창 포커스 | 채팅 입력창으로 이동 |
| `Escape` | 응답 중지 | 생성 중인 응답 중단 |
| `Ctrl+K` | 대화 검색 | 전체 대화 검색 모달 |
| `Ctrl+Shift+P` | 컨텍스트 토글 | 페이지 컨텍스트 켜기/끄기 |
| `Ctrl+]` / `Ctrl+[` | 탭 전환 | 다음/이전 탭 이동 |

**참고**: Mac에서는 `Ctrl` 대신 `Cmd` 키를 사용합니다.

## 첫 대화 시작하기

1. 사이드패널에서 **채팅** 탭 선택
2. 상단의 프로바이더 선택 드롭다운에서 원하는 AI 모델 선택
3. 메시지 입력창에 질문 입력
4. Enter 키 또는 전송 버튼 클릭

## 데이터 저장 방식

- 모든 대화 기록 및 설정은 **chrome.storage.local**에 로컬 저장됩니다
- 외부 서버로 데이터가 전송되지 않습니다
- 텔레메트리 및 분석 기능이 없어 완전히 프라이빗합니다

## Desktop 앱 시작하기

H Chat Desktop은 PWA 기반 데스크톱 AI 챗 애플리케이션입니다.

### 웹에서 바로 사용

https://hchat-desktop.vercel.app 접속

### 로컬 개발

```bash
git clone https://github.com/sgtlim0/hchat-desktop.git
cd hchat-desktop
npm install
npm run dev    # localhost:5173
```

### PWA 설치

1. https://hchat-desktop.vercel.app 접속
2. 브라우저 주소창의 설치 아이콘 클릭
3. "설치" 선택하면 데스크톱 앱으로 실행 가능

### 프로젝트 규모

- **테스트**: 667개 테스트, 83% 커버리지
- **기술 스택**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 3
- **상태 관리**: Zustand 5 (16개 스토어)
- **데이터베이스**: Dexie (IndexedDB)
- **백엔드**: Modal Serverless (FastAPI)
- **아키텍처**: Feature-Sliced Design (FSD)

## 다음 단계

- [AI 채팅](/chat/ai-chat) - AI 채팅 기능 상세 가이드
- [FAQ](/faq) - 자주 묻는 질문
- [변경 이력](/changelog) - 버전별 업데이트 내역
