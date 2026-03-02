---
title: 멀티턴 에이전트
description: XML 기반 도구 호출로 최대 10스텝 자율 작업을 수행하는 AI 에이전트
badges: [v2]
---

# 멀티턴 에이전트

멀티턴 에이전트는 H Chat v2에서 도입된 기능으로, AI가 여러 단계에 걸쳐 자율적으로 도구를 사용하며 복잡한 작업을 수행할 수 있습니다.

## 개요

에이전트 모드는 AI가 단순히 답변을 생성하는 것을 넘어서, 웹 검색, 페이지 읽기, 코드 실행 등의 도구를 스스로 선택하고 사용하여 문제를 해결하는 방식입니다.

### XML 기반 도구 호출

에이전트는 XML 태그를 사용하여 도구를 호출합니다:

```xml
<tool_call>
  <name>web_search</name>
  <params>{"query": "Next.js 15 새로운 기능"}</params>
</tool_call>
```

AI가 응답에 `<tool_call>` 태그를 포함하면, H Chat이 이를 감지하여 해당 도구를 실행하고 결과를 AI에게 다시 전달합니다.

## 내장 도구

H Chat은 5가지 내장 도구를 제공합니다:

| 도구 | 설명 | 파라미터 | 사용 예시 |
|------|------|----------|-----------|
| **web_search** | 웹 검색 수행 | `query` (검색어) | 최신 정보 조회, 팩트 체크 (DuckDuckGo/Google) |
| **read_page** | 현재 페이지 컨텍스트 읽기 | (없음) | chrome.storage에서 페이지 정보 조회 |
| **fetch_url** | URL 콘텐츠 가져오기 | `url` (데이터 URL) | 최대 6,000자, script/style 태그 제거 |
| **calculate** | JavaScript 수식 평가 | `expression` (수식) | 정규식 화이트리스트로 안전 검증 |
| **get_datetime** | 현재 날짜/시간 반환 | (없음) | 한국어 형식으로 현재 시간 정보 제공 |

### 도구별 상세 설명

#### 1. web_search

웹 검색 엔진(DuckDuckGo/Google)을 통해 정보를 검색합니다.

```xml
<tool_call>
  <name>web_search</name>
  <params>{"query": "TypeScript 5.3 릴리스 노트"}</params>
</tool_call>
```

**반환**: 검색 결과 목록 (제목, URL, 스니펫)

#### 2. read_page

현재 페이지의 컨텍스트를 chrome.storage에서 읽어옵니다.

```xml
<tool_call>
  <name>read_page</name>
  <params>{}</params>
</tool_call>
```

**반환**: 페이지의 텍스트 콘텐츠 (HTML 태그 제거됨)

#### 3. fetch_url

URL에서 콘텐츠를 가져옵니다. 최대 6,000자로 제한되며 script/style 태그가 제거됩니다.

```xml
<tool_call>
  <name>fetch_url</name>
  <params>{"url": "https://example.com/article"}</params>
</tool_call>
```

**반환**: 원시 응답 데이터 (JSON, XML, 텍스트 등)

#### 4. calculate

JavaScript 수식을 안전하게 평가합니다. 정규식 화이트리스트로 안전 검증을 수행합니다.

```xml
<tool_call>
  <name>calculate</name>
  <params>{"expression": "2 + 2 * 3"}</params>
</tool_call>
```

**반환**: 수식 계산 결과

#### 5. get_datetime

현재 날짜와 시간을 한국어 형식으로 반환합니다.

```xml
<tool_call>
  <name>get_datetime</name>
  <params>{}</params>
</tool_call>
```

**반환**: 현재 날짜 및 시간 정보 (예: "2026년 3월 2일 오후 2시 30분")

## 최대 10 스텝 자동 실행

에이전트는 최대 10단계까지 자율적으로 작업을 진행할 수 있습니다. 각 스텝은 다음과 같이 구성됩니다:

1. **Thinking**: AI가 현재 상황을 분석하고 다음 행동을 계획
2. **Tool Call**: 필요한 도구를 선택하고 호출
3. **Tool Result**: 도구 실행 결과를 받음
4. **Response**: 결과를 바탕으로 답변 생성 또는 다음 스텝 계획

### 스텝 예시

```
사용자: "Next.js 15의 새로운 기능을 조사하고 요약해주세요"

Step 1:
  Thinking: "Next.js 15에 대한 최신 정보를 검색해야겠다"
  Tool Call: web_search("Next.js 15 새로운 기능")
  Tool Result: [검색 결과 3개]

Step 2:
  Thinking: "공식 블로그 포스트를 읽어서 상세 정보를 얻어야겠다"
  Tool Call: read_page("https://nextjs.org/blog/next-15")
  Tool Result: [블로그 내용]

Step 3:
  Thinking: "충분한 정보를 수집했으니 요약을 작성하자"
  Response: "Next.js 15의 주요 새로운 기능은 다음과 같습니다..."
```

## 스텝별 시각화

에이전트 모드가 활성화되면 각 스텝의 진행 상황을 시각적으로 확인할 수 있습니다:

- **Thinking 단계**: 💭 사고 과정 표시
- **Tool Call 단계**: 🔧 사용 중인 도구와 파라미터 표시
- **Tool Result 단계**: 📊 도구 실행 결과 표시
- **Response 단계**: 💬 AI의 현재 답변 표시

### 진행 상황 인디케이터

```
[Step 1/10] 🔍 Searching...
[Step 2/10] 📖 Reading page...
[Step 3/10] ✍️ Generating response...
```

## 에이전트 모드 토글

ChatView에서 에이전트 모드를 켜고 끌 수 있습니다:

- **ON**: AI가 도구를 자동으로 사용하여 복잡한 작업 수행
- **OFF**: 일반 채팅 모드 (도구 호출 없음)

에이전트 모드가 꺼져 있어도 AI는 `<tool_call>` 태그를 생성할 수 있지만, 실제로 실행되지는 않습니다.

## 사용 사례

### 1. 리서치 및 정보 수집

```
사용자: "2024년 AI 트렌드를 조사하고 주요 발전 사항을 정리해주세요"

→ Step 1: web_search("2024 AI trends")
→ Step 2: read_page(관련 기사 1)
→ Step 3: read_page(관련 기사 2)
→ Step 4: 종합 정리 및 요약
```

### 2. 기술 문서 분석

```
사용자: "React 19의 새로운 훅들을 설명해주세요"

→ Step 1: web_search("React 19 new hooks")
→ Step 2: read_page(공식 문서)
→ Step 3: 각 훅의 사용 예제와 설명 생성
```

### 3. 데이터 조회 및 계산

```
사용자: "이 API에서 사용자 목록을 가져와서 평균 나이를 계산해주세요"

→ Step 1: fetch_url("https://api.example.com/users")
→ Step 2: javascript_eval(평균 계산 코드)
→ Step 3: 결과 설명
```

### 4. 비교 분석

```
사용자: "Vue 3와 Svelte 5의 성능을 비교해주세요"

→ Step 1: web_search("Vue 3 performance benchmarks")
→ Step 2: web_search("Svelte 5 performance benchmarks")
→ Step 3: read_page(벤치마크 결과 페이지)
→ Step 4: 비교 분석 정리
```

## 사용 방법

1. ChatView에서 에이전트 모드를 활성화합니다
2. 복잡한 작업이나 리서치가 필요한 질문을 입력합니다
3. AI가 자동으로 필요한 도구를 선택하고 사용합니다
4. 각 스텝의 진행 상황을 실시간으로 확인합니다
5. 최대 10스텝 내에서 최종 답변이 생성됩니다

## 제한사항

- **최대 스텝 수**: 10스텝 (무한 루프 방지)
- **도구 제한**: 5가지 내장 도구만 사용 가능
- **도구 결과 제한**: 각 도구 실행 결과는 최대 4,000자로 제한됨
- **실행 시간**: 복잡한 작업은 일반 채팅보다 오래 걸릴 수 있음
- **오류 처리**: 도구 실행 실패 시 AI가 대체 방법을 시도하거나 사용자에게 알림

## 팁

- **명확한 목표**: 구체적이고 명확한 작업 요청이 더 나은 결과를 제공합니다
- **단계 확인**: 각 스텝을 확인하여 AI가 올바른 방향으로 진행하는지 모니터링하세요
- **중단 가능**: 진행 중인 에이전트 작업은 언제든 중단할 수 있습니다
- **결과 활용**: 최종 답변뿐만 아니라 중간 단계의 검색 결과나 데이터도 유용합니다
