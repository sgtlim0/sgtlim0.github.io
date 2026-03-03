---
title: 자주 묻는 질문 (FAQ)
description: H Chat v4에 대한 일반적인 질문과 답변
---

# 자주 묻는 질문 (FAQ)

## 일반

### H Chat v4란 무엇인가요?

H Chat v4는 Chrome Extension Manifest V3 기반의 올인원 AI 어시스턴트입니다. 3가지 주요 AI 프로바이더(AWS Bedrock, OpenAI, Google Gemini)를 통해 총 9개의 AI 모델을 지원하며, 21가지 기능을 제공합니다.

### 어떤 AI 모델을 지원하나요?

총 7개의 모델을 지원합니다:

**AWS Bedrock (Claude)**
- Claude Sonnet 4.6 (모델 ID: `us.anthropic.claude-sonnet-4-6`)
- Claude Opus 4.6 (모델 ID: `us.anthropic.claude-opus-4-6-v1`)
- Claude Haiku 4.5 (모델 ID: `us.anthropic.claude-haiku-4-5-20251001-v1:0`)

**OpenAI (GPT)**
- GPT-4o
- GPT-4o mini

**Google Gemini**
- Gemini Flash 2.0 (실험 버전)
- Gemini Pro 1.5

### v4의 주요 특징은 무엇인가요?

- **멀티 AI 프로바이더**: 3개 프로바이더, 9개 모델 지원
- **크로스 모델 비교**: 서로 다른 AI 모델 간 동시 대화 및 토론
- **자동 모델 라우팅**: 작업 유형에 따라 최적의 모델 자동 선택
- **완전한 로컬 저장**: 모든 데이터가 chrome.storage.local에 저장
- **프라이버시 우선**: 텔레메트리 및 분석 기능 없음
- **21가지 기능**: AI 채팅, 웹 검색, PDF 분석, YouTube 분석, 글쓰기 어시스턴트 등

## 설치 및 설정

### H Chat v4를 설치하려면 무엇이 필요한가요?

- Chrome 브라우저 (최신 버전 권장)
- Node.js (빌드를 위해)
- AWS 계정 (Bedrock 액세스용, 필수)
- OpenAI API Key (선택)
- Google Gemini API Key (선택)

### AWS Bedrock은 어떻게 사용하나요?

H Chat v4는 AWS SDK를 사용하지 않고 SigV4 서명을 직접 구현하여 AWS Bedrock API와 통신합니다. 이를 통해:

1. 번들 크기 최소화
2. 의존성 감소
3. 더 빠른 로딩 시간
4. Chrome Extension 환경에 최적화

### API 키는 어디에 저장되나요?

모든 API 키와 자격증명은 `chrome.storage.local`에 암호화되어 저장됩니다. 외부 서버로 전송되지 않으며, 브라우저를 벗어나지 않습니다.

## 기능

### 크로스 모델 토론이란 무엇인가요?

서로 다른 AI 프로바이더의 모델들이 동일한 주제에 대해 대화하고 토론할 수 있는 기능입니다. 예를 들어:

- Claude Sonnet 4.6 vs GPT-4o 토론
- Gemini Pro 1.5 + Claude Opus 4.6 협업
- 3개 모델 동시 비교 분석

이를 통해 다양한 관점과 더 균형잡힌 답변을 얻을 수 있습니다.

### 자동 모델 라우팅은 어떻게 작동하나요?

작업 유형을 자동으로 감지하여 최적의 모델을 선택합니다:

- **코드 분석**: Claude Sonnet 4.6 (높은 정확도)
- **빠른 요약**: Claude Haiku 4.5 또는 GPT-4o mini (빠른 응답)
- **창의적 글쓰기**: GPT-4o 또는 Gemini Pro 1.5 (창의성)
- **복잡한 추론**: Claude Opus 4.6 또는 GPT-4o (깊은 사고)

### 웹 검색 기능은 어떻게 작동하나요?

H Chat v4는 실시간 웹 검색 결과를 AI 응답에 통합합니다:

1. 검색 엔진에서 결과 크롤링
2. RAG (Retrieval-Augmented Generation) 적용
3. 최신 정보를 포함한 AI 응답 생성
4. 출처 링크 제공

### YouTube 댓글 분석이란?

YouTube 동영상의 댓글을 AI로 분석하여:

- 주요 의견 요약
- 감정 분석 (긍정/부정/중립)
- 주제별 분류
- 핵심 피드백 추출

### PDF 채팅 기능은 무엇인가요?

PDF 문서를 업로드하고 내용에 대해 AI와 대화할 수 있습니다:

- PDF 텍스트 추출 및 인덱싱
- 문서 내용 기반 질의응답
- 특정 섹션 참조
- 다국어 PDF 지원

## 데이터 및 프라이버시

### 내 데이터는 안전한가요?

네, 완전히 안전합니다:

- 모든 데이터는 **chrome.storage.local**에 로컬 저장
- 외부 서버로 전송되지 않음
- 텔레메트리 및 분석 기능 없음
- API 호출은 각 프로바이더에 직접 전송 (중간 서버 없음)

### 대화 기록은 얼마나 저장되나요?

제한 없이 모든 대화 기록이 로컬에 저장됩니다. 사용자가 직접 삭제하기 전까지 유지됩니다.

### 대화 기록을 내보낼 수 있나요?

네, 설정 탭에서 대화 기록을 JSON 형식으로 내보낼 수 있습니다.

## 사용량 및 비용

### 프로바이더별 사용량을 추적할 수 있나요?

네, H Chat v4는 프로바이더별 사용량을 자동으로 추적합니다:

- 토큰 사용량 (입력/출력)
- API 호출 횟수
- 예상 비용 (프로바이더별 요금 기준)
- 모델별 통계

설정 탭의 **사용량** 섹션에서 확인할 수 있습니다.

### 비용은 얼마나 드나요?

H Chat v4 자체는 무료 오픈소스입니다. 비용은 사용한 AI 프로바이더의 API 요금에 따라 발생합니다:

- **AWS Bedrock**: 입력/출력 토큰당 요금
- **OpenAI**: 모델별 토큰당 요금
- **Google Gemini**: 요청당 또는 토큰당 요금

각 프로바이더의 요금제는 공식 웹사이트를 참조하세요.

## 기술

### Provider Factory 패턴이란?

H Chat v4는 Provider Factory 패턴을 사용하여 여러 AI 프로바이더를 통합 관리합니다:

```typescript
// 예시 구조
interface AIProvider {
  chat(messages: Message[]): Promise<Response>
  streamChat(messages: Message[]): AsyncGenerator<Chunk>
  models: Model[]
}

class ProviderFactory {
  static create(type: 'bedrock' | 'openai' | 'gemini'): AIProvider
}
```

이를 통해 새로운 프로바이더를 쉽게 추가할 수 있습니다.

### useProvider 훅은 무엇인가요?

React 커스텀 훅으로, 컴포넌트에서 AI 프로바이더를 쉽게 사용할 수 있게 합니다:

```typescript
const { provider, model, changeProvider, sendMessage } = useProvider()
```

프로바이더 전환, 모델 선택, 메시지 전송 등을 간단하게 처리합니다.

### 프로젝트 규모는 어느 정도인가요?

H Chat v4 통계:

- **소스 파일**: 50개+
- **코드 라인**: 10,000+
- **탭 (기능)**: 8개
- **라이브러리**: 30개
- **AI 프로바이더**: 3개
- **지원 모델**: 9개
- **기능**: 21개

## 문제 해결

### 연결 테스트가 실패합니다

1. API 키와 자격증명이 올바른지 확인
2. AWS Region이 Bedrock을 지원하는지 확인 (us-east-1, us-west-2 권장)
3. 네트워크 연결 확인
4. 프로바이더의 API 상태 페이지 확인

### 일부 기능이 작동하지 않습니다

1. Chrome 브라우저를 최신 버전으로 업데이트
2. 확장 프로그램을 다시 빌드하고 로드
3. Chrome의 개발자 도구(F12)에서 콘솔 오류 확인
4. 필요시 `chrome://extensions`에서 확장 프로그램 재시작

### 성능이 느립니다

1. 사용하지 않는 탭 닫기
2. 대화 기록이 너무 많으면 일부 삭제
3. 더 빠른 모델 선택 (Claude Haiku 4.5, GPT-4o mini, Gemini Flash 2.0)
4. 자동 모델 라우팅 활성화

### v1에 있던 대화 메모리, 작업 스케줄러, 에이전트 스웜 기능은 어디 갔나요?

v2에서 이러한 기능들은 웹 검색 + RAG, 멀티턴 에이전트, 스마트 북마크 등 새로운 기능으로 대체되었습니다. 에이전트 스웜의 병렬 처리 개념은 크로스 모델 그룹 채팅과 토론 기능으로 발전했습니다.

## 기여

### 버그를 발견했습니다. 어떻게 보고하나요?

GitHub 저장소의 Issues 섹션에서 새 이슈를 생성해주세요:
https://github.com/sgtlim0/hchat-v2-extension/issues

### 기여하고 싶습니다. 어떻게 시작하나요?

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 추가 질문

더 궁금한 점이 있으면 GitHub Issues에 질문을 남겨주세요.
