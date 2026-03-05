# H Chat LLM Router UI 컴포넌트

86개 이상의 AI 모델을 통합 관리하고 라우팅하는 LLM Router 서비스의 UI 컴포넌트 패키지입니다. 모델 비교, 가격 조회, API 관리 등 LLM Router 플랫폼의 핵심 인터페이스를 제공합니다.

## 사용 앱

- H Chat LLM Router - LLM 통합 API 플랫폼

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { LRNavbar, ModelTable, mockModels } from '@hchat/ui/llm-router';

export default function App() {
  return (
    <>
      <LRNavbar isAuthenticated={true} />
      <div className="max-w-7xl mx-auto p-6">
        <ModelTable models={mockModels} />
      </div>
    </>
  );
}
```

## 컴포넌트 분류

### 네비게이션 컴포넌트 (1개)

| 컴포넌트 | 설명 | 주요 Props |
|---------|------|-----------|
| **LRNavbar** | LLM Router 메인 네비게이션 바 | `isAuthenticated` (boolean) |

### 모델 정보 컴포넌트 (4개)

| 컴포넌트 | 설명 | 주요 Props |
|---------|------|-----------|
| **ModelTable** | 모델 비교 테이블, 검색/필터링/정렬 기능 | `models` (LLMModel[]), `initialProvider`, `initialCategory` |
| **ProviderBadge** | AI 제공사 배지 (OpenAI, Anthropic 등) | `provider` (string), `size` ('sm' \| 'md') |
| **PriceCell** | 가격 표시 셀, 저가 모델 하이라이트 | `price` (number), `unit` (string) |
| **CodeBlock** | 다중 언어 코드 블록, 복사 기능 | `examples` ({ language, code }[]) |

### 문서 네비게이션 컴포넌트 (1개)

| 컴포넌트 | 설명 | 주요 Props |
|---------|------|-----------|
| **DocsSidebar** | 계층형 문서 네비게이션 사이드바 | `items` (DocsSidebarItem[]) |

## 타입 정의

### LLMModel

```typescript
interface LLMModel {
  id: string;              // 고유 모델 ID (예: 'gpt-4o')
  name: string;            // 모델명 (예: 'GPT-4o')
  provider: string;        // 제공사 (예: 'OpenAI')
  providerIcon: string;    // 제공사 아이콘 이모지
  category: 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'code';
  inputPrice: number;      // 입력 가격 (1M 토큰당 KRW)
  outputPrice: number;     // 출력 가격 (1M 토큰당 KRW)
  contextWindow: number;   // 컨텍스트 윈도우 크기 (토큰)
  maxOutput: number;       // 최대 출력 토큰
  latency: string;         // 응답 시간 (예: '0.8초')
  isPopular?: boolean;     // 인기 모델 마크
}
```

### APIKey

```typescript
interface APIKey {
  id: string;              // 키 ID
  name: string;            // 키 이름
  key: string;             // API 키 값
  created: string;         // 생성 날짜
  lastUsed: string;        // 마지막 사용 날짜
  status: 'active' | 'revoked';
}
```

### UsageStat

```typescript
interface UsageStat {
  date: string;            // 날짜
  requests: number;        // 요청 수
  tokens: number;          // 사용 토큰 수
  cost: number;            // 비용 (KRW)
}
```

### ModelUsage

```typescript
interface ModelUsage {
  model: string;           // 모델명
  requests: number;        // 요청 수
  tokens: number;          // 사용 토큰 수
  cost: number;            // 비용 (KRW)
}
```

### DocsSidebarItem

```typescript
interface DocsSidebarItem {
  title: string;           // 항목 제목
  href: string;            // 링크 경로
  children?: DocsSidebarItem[];  // 자식 항목
}
```

## Mock 데이터

### mockData.ts

실제 프로덕션 API 구축 전 개발/테스트용 샘플 데이터를 제공합니다.

**포함 내용:**
- `models` - 다양한 카테고리의 LLM 모델 배열
- API 키, 사용량 통계, 모델별 사용 현황 예제 데이터

### mockModels.ts

Anthropic Bedrock 등 AWS 통합 모델의 특화된 Mock 데이터를 제공합니다.

**포함 내용:**
- Bedrock Claude 모델들 (Opus 4.6, Sonnet 4.6, Haiku 4.5)
- AWS 제공자별 가격 정보

### 사용 예시

```tsx
import { mockModels, models } from '@hchat/ui/llm-router';

// Mock 데이터로 테이블 렌더링
<ModelTable models={mockModels} />

// 또는 프로덕션 데이터
<ModelTable models={fetchedModels || models} />
```

## LLM Router 앱 페이지 구조

LLM Router 서비스는 다음 10개 페이지로 구성됩니다:

### 공개 페이지

| 페이지 | 경로 | 설명 |
|-------|------|------|
| **Landing** | `/` | 서비스 소개 및 진입점 |
| **Models** | `/models` | 86개 모델 비교 테이블 |
| **Playground** | `/playground` | 모델 테스트 인터페이스 |
| **Docs** | `/docs` | API 문서 및 가이드 |

### 인증 페이지

| 페이지 | 경로 | 설명 |
|-------|------|------|
| **Login** | `/login` | 로그인 화면 |
| **Signup** | `/signup` | 회원가입 화면 |

### 대시보드 페이지 (인증 필요)

| 페이지 | 경로 | 설명 |
|-------|------|------|
| **Usage** | `/dashboard/usage` | API 호출량 통계 |
| **Keys** | `/dashboard/keys` | API 키 관리 |
| **Settings** | `/dashboard/settings` | 계정 설정 |
| **Billing** | `/dashboard/billing` | 결제 및 청구 정보 |

## 컴포넌트별 세부 기능

### LRNavbar

메인 네비게이션 바로 로그인 상태에 따라 다른 UI를 제공합니다.

**기능:**
- 반응형 네비게이션 (데스크톱/모바일 메뉴)
- 다크모드 토글
- 인증 상태에 따른 동적 링크 변경
- 접근성 지원 (aria-label, role)

**사용 예시:**
```tsx
<LRNavbar isAuthenticated={isLoggedIn} />
```

### ModelTable

86개 모델을 통합 관리하는 강력한 테이블 컴포넌트입니다.

**기능:**
- 검색 (모델명, 제공사)
- 필터링 (제공사, 카테고리)
- 다중 컬럼 정렬 (이름, 가격, 컨텍스트, 레이턴시)
- 페이지네이션 (20개 모델/페이지)
- 인기 모델 스타 표시
- 저가 모델 강조 표시

**사용 예시:**
```tsx
<ModelTable
  models={models}
  initialProvider="OpenAI"
  initialCategory="chat"
/>
```

### ProviderBadge

AI 제공사를 시각적으로 표현하는 배지입니다.

**지원 제공사:**
- OpenAI (녹색)
- Anthropic (주황색)
- Google (파랑색)
- Meta (파랑색)
- Mistral (주황색)
- Cohere (갈색)
- DeepSeek (파랑색)

**사용 예시:**
```tsx
<ProviderBadge provider="OpenAI" size="md" />
```

### PriceCell

모델 가격을 포맷팅하여 표시합니다. 저가 모델(500원 미만)은 자동으로 하이라이트됩니다.

**사용 예시:**
```tsx
<PriceCell price={3300} unit="/ 1M 토큰" />
```

### CodeBlock

다중 언어 코드 샘플을 탭 방식으로 표시하고 복사 기능을 제공합니다.

**지원 기능:**
- 언어별 탭 전환 (Python, JavaScript, cURL 등)
- 클립보드 복사 버튼
- 복사 완료 피드백

**사용 예시:**
```tsx
<CodeBlock
  examples={[
    { language: 'Python', code: 'import requests...' },
    { language: 'JavaScript', code: 'const response = await fetch...' },
    { language: 'cURL', code: 'curl -X POST...' }
  ]}
/>
```

### DocsSidebar

문서 네비게이션을 위한 계층형 사이드바입니다.

**기능:**
- 중첩 메뉴 확장/축소
- 링크 네비게이션
- 호버 상태 피드백
- 반응형 레이아웃

**사용 예시:**
```tsx
<DocsSidebar
  items={[
    {
      title: 'Getting Started',
      href: '/docs/getting-started',
      children: [
        { title: 'Installation', href: '/docs/getting-started/install' },
        { title: 'Quick Start', href: '/docs/getting-started/quick-start' }
      ]
    },
    { title: 'API Reference', href: '/docs/api' }
  ]}
/>
```

## 서비스 레이어

API 데이터 페칭 및 상태 관리는 `@hchat/ui/llm-router/services`에서 제공됩니다.

### 아키텍처

```
services/
├── types.ts                       # 서비스 전용 타입 정의
├── llmRouterService.ts            # LlmRouterService 인터페이스
├── mockLlmRouterService.ts        # Mock 구현 (기본값)
├── LlmRouterServiceProvider.tsx   # React Context 프로바이더
├── hooks.ts                       # 커스텀 React 훅
└── index.ts                       # Barrel exports
```

### 사용법

```tsx
import { LlmRouterServiceProvider } from '@hchat/ui/llm-router/services';

export default function RootLayout({ children }) {
  return (
    <LlmRouterServiceProvider>
      {children}
    </LlmRouterServiceProvider>
  );
}
```

### 사용 가능한 훅

| 훅 | 설명 |
|----|------|
| `useModels(filters?)` | 모델 목록 (필터링/페이지네이션) |
| `useModelById(id)` | 단일 모델 조회 |
| `useDashboardStats()` | 대시보드 통계 |
| `useUsageStats()` | 일별 사용량 통계 |
| `useMonthlyUsage()` | 월별 집계 데이터 |
| `useModelUsageBreakdown()` | 모델별 사용량 |
| `useAPIKeys()` | API 키 관리 (생성/폐기) |

### 실제 API 전환

```tsx
import { LlmRouterServiceProvider } from '@hchat/ui/llm-router/services';
import { realLlmRouterService } from './services/realLlmRouterService';

<LlmRouterServiceProvider service={realLlmRouterService}>
  {children}
</LlmRouterServiceProvider>
```

## 특징

- **확장성**: 86개 모델 관리 가능한 효율적인 테이블 구조
- **사용자 중심**: 검색, 필터링, 정렬로 원하는 모델 쉽게 찾기
- **모바일 친화**: 모든 컴포넌트 반응형 설계
- **다크모드 지원**: 다크모드/라이트모드 자동 전환
- **접근성**: WCAG 2.1 표준 준수 (ARIA 속성, 키보드 네비게이션)
- **TypeScript**: 완전한 타입 안정성
- **Mock 데이터**: 개발/테스트 시간 단축

## 최근 업데이트

### Phase 22: API 서비스 레이어
- **Provider Pattern**: LlmRouterServiceProvider + 7개 커스텀 훅으로 API 추상화
- **공통 UX**: Skeleton, Toast, ErrorBoundary, EmptyState 통합
- **Form Validation**: validate(), useFormValidation() 추가

### Phase 23: 성능 최적화
- **Dynamic Import**: 2개 페이지 코드 스플리팅 (Skeleton fallback)
- **Bundle Analyzer**: `npm run analyze:llm-router`으로 번들 크기 분석
- **Turbo Cache**: 불필요한 리빌드 방지

### Phase 24: CI/CD 파이프라인
- **Lighthouse CI**: 성능(≥80), 접근성(≥85) 자동 검증
- **E2E 확장**: 반응형, 다크모드, 접근성(axe-core) 테스트
- **코드 품질**: Prettier + Husky + lint-staged

### Phase 25: 통합 테스트 + 문서
- **18개 E2E 테스트**: responsive, dark-mode-all, a11y-all (WCAG 2.1 AA)
- **프로젝트 문서**: CONTRIBUTING.md, ARCHITECTURE.md, API_SPEC.md 등

### Phase 26: Storybook 완성
- **103개 스토리**: 전체 UI 컴포넌트 97% 커버리지
- **LLM Router 카테고리**: 6개 스토리 (컴포넌트 6개)
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app

## 테마 CSS 변수

LLM Router는 다음 CSS 변수를 사용합니다:

```css
/* 배경색 */
--lr-bg                    /* 기본 배경 */
--lr-bg-section            /* 섹션 배경 */
--lr-bg-table              /* 테이블 배경 */
--lr-bg-code               /* 코드 블록 배경 */
--lr-bg-hover              /* 호버 상태 배경 */

/* 텍스트색 */
--lr-text-primary          /* 주 텍스트 */
--lr-text-secondary        /* 보조 텍스트 */
--lr-text-muted            /* 흐린 텍스트 */

/* 테두리 */
--lr-border                /* 테두리색 */

/* 네비게이션 */
--lr-nav-bg                /* 네비게이션 배경 */
--lr-nav-text              /* 네비게이션 텍스트 */

/* 액션 */
--lr-primary               /* 주 컬러 */
--lr-primary-hover         /* 주 컬러 호버 */
```

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰 (테마 CSS 변수)
- **@hchat/ui** — 기본 공통 컴포넌트

## 개발 가이드

### 새 모델 추가

mockModels.ts 또는 mockData.ts에 LLMModel 객체를 추가하세요:

```typescript
{
  id: 'custom-model-id',
  name: 'Custom Model Name',
  provider: 'Provider Name',
  providerIcon: '🔧',
  category: 'chat',
  inputPrice: 1000,
  outputPrice: 5000,
  contextWindow: 100000,
  maxOutput: 8192,
  latency: '1.0초',
  isPopular: false
}
```

### 새 제공사 추가

ProviderBadge.tsx의 `providerColorMap`에 색상을 추가하세요:

```typescript
const providerColorMap: Record<string, string> = {
  'NewProvider': '#XXXXXX',
  // ...
}
```

### 커스텀 스타일링

Tailwind CSS 클래스 대신 CSS 변수를 사용하여 통일된 테마를 유지하세요:

```tsx
className="bg-lr-bg text-lr-text-primary border border-lr-border"
```

## 라이센스

MIT
