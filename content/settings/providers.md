---
title: AI 프로바이더
description: AWS Bedrock, OpenAI, Google Gemini 멀티 프로바이더 설정 가이드
badges: ["v3"]
---

# AI 프로바이더

H Chat v3는 3가지 주요 AI 프로바이더를 지원하며, 각 프로바이더의 강점을 활용하여 최적의 AI 경험을 제공합니다.

## 지원 프로바이더

### AWS Bedrock (Claude)
Anthropic의 Claude 모델을 AWS Bedrock을 통해 사용합니다.

**설정 항목**:
- Access Key ID
- Secret Access Key
- AWS Region (예: us-east-1)

**특징**:
- SigV4 서명을 사용하여 AWS Bedrock API와 직접 통신
- 외부 SDK 없이 fetch()와 AsyncGenerator로 직접 스트리밍 구현
- 기업용 보안 및 컴플라이언스 요구사항 충족

### OpenAI (GPT)
OpenAI의 GPT 모델 시리즈를 사용합니다.

**설정 항목**:
- API Key

**특징**:
- 간단한 API Key 기반 인증
- 코드 생성 및 기술 작업에 최적화
- 안정적인 성능과 빠른 응답 속도

### Google Gemini
Google의 Gemini 모델 시리즈를 사용합니다.

**설정 항목**:
- API Key

**특징**:
- API Key 기반 인증
- 긴 컨텍스트 처리 능력
- 초고속 응답 (Flash 모델)

## 프로바이더 설정 방법

### AWS Bedrock 설정

1. H Chat 설정 페이지를 엽니다
2. "AI 프로바이더" 섹션으로 이동합니다
3. AWS Bedrock 카드를 선택합니다
4. 다음 정보를 입력합니다:
   - **Access Key ID**: AWS IAM 사용자의 액세스 키
   - **Secret Access Key**: AWS IAM 사용자의 시크릿 키
   - **Region**: Bedrock을 사용할 AWS 리전 (예: us-east-1)
5. "연결 테스트" 버튼을 클릭하여 설정을 확인합니다

**AWS IAM 권한 요구사항**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
```

### OpenAI 설정

1. H Chat 설정 페이지를 엽니다
2. "AI 프로바이더" 섹션으로 이동합니다
3. OpenAI 카드를 선택합니다
4. OpenAI API Key를 입력합니다
5. "연결 테스트" 버튼을 클릭하여 설정을 확인합니다

**API Key 발급**:
- [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키를 생성할 수 있습니다

### Google Gemini 설정

1. H Chat 설정 페이지를 엽니다
2. "AI 프로바이더" 섹션으로 이동합니다
3. Google Gemini 카드를 선택합니다
4. Gemini API Key를 입력합니다
5. "연결 테스트" 버튼을 클릭하여 설정을 확인합니다

**API Key 발급**:
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키를 생성할 수 있습니다

## 자동 모델 라우팅

H Chat v3는 프롬프트 패턴을 분석하여 최적의 모델을 자동으로 선택합니다.

### 라우팅 규칙

- **코드 생성 및 기술 작업** → OpenAI GPT-4o
  - 프롬프트에 코드 블록, 함수명, 프로그래밍 언어 키워드 포함 시

- **깊은 추론 및 복잡한 분석** → Claude Opus 4.6
  - 긴 문서 분석, 복잡한 논리 추론, 다단계 문제 해결

- **빠른 응답이 필요한 간단한 질문** → Claude Haiku 4.5 / Gemini Flash 2.0
  - 짧은 질문, 간단한 정보 조회, 빠른 번역

### 수동 모델 선택

자동 라우팅을 원하지 않는 경우, 채팅 인터페이스에서 직접 모델을 선택할 수 있습니다.

## Provider Factory 패턴

H Chat v3의 프로바이더 시스템은 Provider Factory 패턴을 사용하여 구현되었습니다.

### 주요 메서드

- `createAllProviders()`: 설정된 모든 프로바이더 인스턴스를 생성합니다
- `getProviderForModel(modelId)`: 특정 모델 ID에 해당하는 프로바이더를 반환합니다
- `getAllModels()`: 모든 프로바이더에서 사용 가능한 모델 목록을 반환합니다

### 직접 스트리밍

모든 프로바이더는 외부 SDK를 사용하지 않고 직접 스트리밍을 구현합니다:
- `fetch()` API를 사용한 HTTP 요청
- `AsyncGenerator`를 통한 스트리밍 응답 처리
- 각 프로바이더의 API 스펙에 맞는 커스텀 구현

## 연결 테스트

각 프로바이더 설정 후 "연결 테스트" 버튼을 클릭하면:
1. 간단한 테스트 프롬프트가 전송됩니다
2. 프로바이더가 응답하면 연결 성공 메시지가 표시됩니다
3. 오류가 발생하면 상세한 오류 메시지가 표시됩니다

## 문제 해결

### AWS Bedrock 연결 실패
- Access Key와 Secret Key가 정확한지 확인합니다
- IAM 사용자에게 Bedrock 사용 권한이 있는지 확인합니다
- 선택한 리전에서 Bedrock 서비스가 활성화되어 있는지 확인합니다

### OpenAI 연결 실패
- API Key가 유효한지 확인합니다
- OpenAI 계정에 충분한 크레딧이 있는지 확인합니다
- API 사용량 제한을 초과하지 않았는지 확인합니다

### Google Gemini 연결 실패
- API Key가 유효한지 확인합니다
- Gemini API가 활성화되어 있는지 확인합니다
- 일일 요청 한도를 초과하지 않았는지 확인합니다
