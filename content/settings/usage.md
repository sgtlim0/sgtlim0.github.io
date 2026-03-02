---
title: 사용량 추적
description: H Chat v3의 프로바이더별 토큰 사용량 추적, 비용 추정, 일별 차트, 예산 알림 및 90일 보존 정책 안내
badges: [v3]
---

# 사용량 추적

H Chat v3에서 대폭 강화된 사용량 추적 시스템은 AWS Bedrock, OpenAI, Google Gemini 각 프로바이더별로 토큰 사용량과 비용을 정밀하게 추적합니다.

## 사용량 추적 개요

모든 AI 요청에 대한 토큰 사용량과 예상 비용을 실시간으로 기록하고 시각화합니다.

### 주요 기능

- **프로바이더별 추적**: AWS, OpenAI, Google 개별 비용 산정
- **기능별 분류**: 채팅/그룹/도구/에이전트/토론/리포트별 사용량
- **일별 비용 차트**: 시각적 사용량 추이 분석
- **예산 알림**: 설정한 예산 초과 시 알림 (예정)
- **90일 보존**: 최근 90일간 데이터 자동 관리

## 토큰 추정 방식

각 프로바이더마다 다른 토큰 계산 방식을 사용합니다.

### 토큰 추정 알고리즘

| 언어/타입 | 추정 방식 | 비율 |
|----------|----------|------|
| **한국어** | 문자 수 기반 | 2자 = 1토큰 |
| **영어** | 단어 수 기반 | 1단어 ≈ 1.3토큰 |
| **코드** | 문자 수 기반 | 4자 = 1토큰 |
| **혼합** | 가중 평균 | 언어 비율 자동 감지 |

### 추정 정확도

```typescript
// lib/usage.ts에서 토큰 추정 로직
function estimateTokens(text: string): number {
  const korean = (text.match(/[가-힣]/g) || []).length
  const english = (text.match(/[a-zA-Z]+/g) || []).length
  const code = (text.match(/[{}();[\]]/g) || []).length

  return Math.ceil(
    korean / 2 +      // 한국어: 2자/토큰
    english * 1.3 +   // 영어: 1.3토큰/단어
    code / 4          // 코드: 4자/토큰
  )
}
```

**실제 토큰 수와 차이가 있을 수 있습니다**. 정확한 토큰 수는 각 프로바이더의 공식 토크나이저를 사용해야 합니다.

## 프로바이더별 비용 산정

각 프로바이더는 독립적인 가격 정책을 가지고 있습니다.

### AWS Bedrock 가격 (2026년 3월 기준)

| 모델 | Input ($/1M tokens) | Output ($/1M tokens) |
|------|---------------------|----------------------|
| **Claude Sonnet 4.6** | $3.00 | $15.00 |
| **Claude Opus 4.6** | $15.00 | $75.00 |
| **Claude Haiku 4.5** | $1.00 | $5.00 |

### OpenAI 가격 (2026년 3월 기준)

| 모델 | Input ($/1M tokens) | Output ($/1M tokens) |
|------|---------------------|----------------------|
| **GPT-4o** | $2.50 | $10.00 |
| **GPT-4o mini** | $0.15 | $0.60 |

### Google Gemini 가격 (2026년 3월 기준)

| 모델 | Input ($/1M tokens) | Output ($/1M tokens) |
|------|---------------------|----------------------|
| **Flash 2.0** | $0.075 | $0.30 |
| **Pro 1.5** (128K 이하) | $1.25 | $5.00 |
| **Pro 1.5** (128K 초과) | $2.50 | $10.00 |

### 비용 계산 예시

**예시**: Claude Sonnet 4.6으로 500토큰 입력, 2000토큰 출력

```
Input 비용: 500 / 1,000,000 × $3.00 = $0.0015
Output 비용: 2000 / 1,000,000 × $15.00 = $0.03
총 비용: $0.0015 + $0.03 = $0.0315 (약 ₩42)
```

## 사용량 데이터 구조

모든 사용량 기록은 구조화된 형태로 저장됩니다.

### UsageRecord 스키마

```typescript
interface UsageRecord {
  id: string                    // 고유 UUID
  timestamp: number             // 타임스탬프
  provider: string              // 'bedrock' | 'openai' | 'gemini'
  model: string                 // 사용된 모델 ID
  feature: FeatureType          // 기능 타입
  inputTokens: number           // 입력 토큰 수
  outputTokens: number          // 출력 토큰 수
  estimatedCost: number         // 예상 비용 (USD)
  conversationId?: string       // 대화 ID (선택)
}

type FeatureType =
  | 'chat'          // 일반 채팅
  | 'group'         // 그룹 채팅
  | 'tools'         // 도구 사용
  | 'agent'         // 에이전트 모드
  | 'debate'        // 크로스 모델 토론
  | 'report'        // YouTube 통합 리포트
```

### 스토리지 키

```
hchat:usage    # UsageRecord[] 배열 (최근 90일)
```

## 사용량 대시보드 (UsageView)

사이드패널의 "사용량" 탭에서 모든 사용량 통계를 확인할 수 있습니다.

### 대시보드 구성

1. **요약 카드**
   - 총 사용 비용 (USD, KRW)
   - 총 토큰 수 (Input + Output)
   - 총 요청 수
   - 평균 요청당 비용

2. **프로바이더별 통계**
   - 각 프로바이더 사용 비율 (파이 차트)
   - 프로바이더별 비용 (막대 차트)
   - 프로바이더별 토큰 수

3. **기능별 통계**
   - 기능별 사용 비율
   - 기능별 평균 비용
   - 가장 많이 사용된 기능

4. **일별 차트**
   - 최근 30일 사용량 추이
   - 일별 비용 변화
   - 일별 토큰 사용량

5. **모델별 통계**
   - 각 모델 사용 빈도
   - 모델별 평균 비용
   - 최다 사용 모델

### 필터 옵션

| 필터 | 옵션 | 설명 |
|-----|------|------|
| **기간** | 7일/30일/90일/전체 | 조회 기간 선택 |
| **프로바이더** | AWS/OpenAI/Google/전체 | 특정 프로바이더만 표시 |
| **기능** | Chat/Group/Tools/전체 | 특정 기능만 표시 |
| **모델** | 모델 목록 | 특정 모델만 표시 |

## 일별 비용 차트

시각적으로 사용량 추이를 분석할 수 있는 차트를 제공합니다.

### 차트 타입

#### 1. 라인 차트 (기본)

```
비용 ($)
  │
  │       ╱╲
  │      ╱  ╲      ╱╲
  │     ╱    ╲    ╱  ╲
  │    ╱      ╲  ╱    ╲
  │   ╱        ╲╱      ╲
  └─────────────────────────→ 날짜
    1일  7일  14일  21일  30일
```

- X축: 날짜
- Y축: 일별 총 비용 (USD)
- 색상: 프로바이더별 구분

#### 2. 스택 바 차트

```
비용 ($)
  │
  │ ┌───┐     ┌───┐
  │ │ G │     │ G │  ← Google Gemini
  │ │───│ ┌───│───│
  │ │ O │ │ O │ O │  ← OpenAI
  │ │───│ │───│───│
  │ │ B │ │ B │ B │  ← AWS Bedrock
  └─┴───┴─┴───┴───┴──→ 날짜
```

- 프로바이더별 비용 적층 표시
- 전체 비용 한눈에 파악

#### 3. 토큰 사용량 차트

```
토큰 (천)
  │
  │ ████████        ← Output
  │ ░░░░░░░░        ← Input
  │ ████████
  │ ░░░░░░░░
  └────────────────→ 날짜
```

- Input/Output 토큰 구분
- 토큰 효율성 분석

### 차트 인터랙션

- **호버**: 특정 날짜 상세 정보 표시
- **클릭**: 해당 날짜의 상세 기록으로 이동
- **확대/축소**: 기간 범위 조정
- **다운로드**: PNG/SVG 이미지로 내보내기

## 예산 알림 (v3.1 예정)

설정한 예산을 초과하면 자동으로 알림을 받을 수 있습니다.

### 예산 설정

```markdown
1. 사용량 탭에서 "예산 설정" 클릭
2. 일별/월별 예산 입력 (USD)
3. 알림 임계값 설정 (예: 80%, 100%)
4. 알림 방식 선택 (브라우저 알림/이메일)
```

### 예산 초과 시 동작

| 임계값 | 동작 | 설명 |
|-------|------|------|
| **80%** | 경고 알림 | 노란색 배지, 브라우저 알림 |
| **100%** | 차단 옵션 | 빨간색 배지, 추가 사용 차단 가능 |
| **120%** | 강제 차단 | 설정 시 자동으로 AI 요청 차단 |

### 예산 초기화

- 일별 예산: 매일 자정 (00:00) 초기화
- 월별 예산: 매월 1일 초기화
- 수동 초기화: "예산 재설정" 버튼

## 90일 보존 정책

사용량 데이터는 자동으로 관리되어 스토리지 한계를 초과하지 않습니다.

### 자동 정리 규칙

```typescript
// 90일 이상 된 기록 자동 삭제
async function cleanOldRecords() {
  const records = await Storage.get<UsageRecord[]>('hchat:usage') || []
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000  // 90일

  const filtered = records.filter(r => r.timestamp > cutoff)
  await Storage.set('hchat:usage', filtered)
}
```

### 보존 정책

| 기간 | 상태 | 접근 |
|-----|------|------|
| **0-30일** | 활성 | 실시간 조회 가능 |
| **30-90일** | 보관 | 조회 가능, 차트 포함 안 됨 |
| **90일+** | 삭제 | 자동 삭제 (복구 불가) |

### 장기 보관 방법

90일 이상 데이터를 보관하려면 내보내기를 사용하세요.

```markdown
1. 사용량 탭에서 "내보내기" 클릭
2. 형식 선택 (CSV/JSON/Excel)
3. 기간 선택 (전체/최근 90일)
4. 파일 다운로드
```

## 내보내기 형식

### CSV 형식

```csv
날짜,프로바이더,모델,기능,입력토큰,출력토큰,비용(USD)
2026-03-01,bedrock,claude-sonnet-4-6,chat,500,2000,0.0315
2026-03-01,openai,gpt-4o,tools,300,1200,0.0128
2026-03-02,gemini,flash-2.0,agent,1000,3000,0.0098
```

### JSON 형식

```json
[
  {
    "id": "usage-uuid-1",
    "timestamp": 1709251200000,
    "provider": "bedrock",
    "model": "claude-sonnet-4-6",
    "feature": "chat",
    "inputTokens": 500,
    "outputTokens": 2000,
    "estimatedCost": 0.0315,
    "conversationId": "conv-uuid-1"
  },
  {
    "id": "usage-uuid-2",
    "timestamp": 1709251300000,
    "provider": "openai",
    "model": "gpt-4o",
    "feature": "tools",
    "inputTokens": 300,
    "outputTokens": 1200,
    "estimatedCost": 0.0128
  }
]
```

### Excel 형식 (.xlsx)

- 여러 시트로 구성:
  - **요약**: 전체 통계
  - **프로바이더별**: 각 프로바이더 상세
  - **기능별**: 기능별 분석
  - **일별**: 일별 추이
  - **원본**: 전체 기록

## 비용 최적화 팁

### 팁 1: 적절한 모델 선택

| 작업 유형 | 권장 모델 | 비용 대비 성능 |
|---------|-----------|--------------|
| 간단한 질문 | Haiku 4.5, GPT-4o mini, Flash 2.0 | ⭐⭐⭐⭐⭐ |
| 일반 대화 | Sonnet 4.6, GPT-4o | ⭐⭐⭐⭐ |
| 복잡한 추론 | Opus 4.6 | ⭐⭐⭐ |

### 팁 2: 컨텍스트 관리

```markdown
- 불필요한 페이지 컨텍스트 비활성화
- 이미지 업로드는 필요할 때만
- 대화 히스토리 정기 정리
```

### 팁 3: 에이전트 스텝 제한

```markdown
- 에이전트 최대 스텝 수 조정 (설정 → 10→5)
- 웹 검색은 꼭 필요할 때만
- 캐시 활용 (중복 검색 방지)
```

### 팁 4: 프로바이더 비교

```markdown
같은 작업을 다른 프로바이더로 실행:
- Gemini Flash 2.0: 가장 저렴 ($0.075/$0.30)
- Claude Haiku 4.5: 빠르고 경제적 ($1.00/$5.00)
- GPT-4o mini: 중간 가격대 ($0.15/$0.60)
```

## 분석 리포트 자동 생성 (v3.1 예정)

주간/월간 사용량 리포트를 자동으로 생성하고 이메일로 발송합니다.

### 리포트 내용

- **요약**: 총 비용, 토큰, 요청 수
- **프로바이더별 비용**: 파이 차트
- **일별 추이**: 라인 차트
- **가장 많이 사용된 모델**: 순위
- **비용 최적화 제안**: AI 분석 기반

### 리포트 형식

- PDF (이메일 첨부)
- HTML (웹 뷰어)
- JSON (API 연동)

## 관련 파일

```
src/lib/usage.ts                # 사용량 추적 로직
src/components/UsageView.tsx    # 대시보드 UI
```

## API 예시

### 사용량 기록 추가

```typescript
import { Usage } from '../lib/usage'

await Usage.track({
  provider: 'bedrock',
  model: 'claude-sonnet-4-6',
  feature: 'chat',
  inputTokens: 500,
  outputTokens: 2000,
  conversationId: 'conv-uuid'
})
```

### 통계 조회

```typescript
// 최근 30일 통계
const stats = await Usage.getStats(30)

console.log(stats)
// {
//   totalCost: 12.34,
//   totalTokens: 250000,
//   totalRequests: 150,
//   byProvider: { bedrock: 8.50, openai: 2.84, gemini: 1.00 },
//   byFeature: { chat: 9.00, tools: 2.00, agent: 1.34 }
// }
```

### 일별 차트 데이터

```typescript
const chartData = await Usage.getDailyChart(30)

console.log(chartData)
// [
//   { date: '2026-03-01', bedrock: 0.50, openai: 0.20, gemini: 0.10 },
//   { date: '2026-03-02', bedrock: 0.60, openai: 0.15, gemini: 0.08 },
//   ...
// ]
```

## 참고

- 비용은 예상 금액이며 실제 청구와 다를 수 있습니다.
- 각 프로바이더의 공식 청구 페이지에서 정확한 비용을 확인하세요.
- 토큰 추정은 근사치이며, 실제 토큰 수는 프로바이더에 따라 다를 수 있습니다.
- 사용량 데이터는 로컬에 저장되며 외부로 전송되지 않습니다.
