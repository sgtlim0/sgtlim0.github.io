# H Chat Storybook 설계 방안

## 1. 개요

H Chat v3 Chrome Extension의 12개 React 컴포넌트, 4개 커스텀 훅, 30개+ 라이브러리 모듈을 Storybook으로 문서화하고 시각적으로 테스트할 수 있는 환경을 구축하는 설계 방안입니다.

### 목표

- 모든 UI 컴포넌트를 격리된 환경에서 개발/테스트
- `.pen` 디자인 파일의 디자인 토큰을 Storybook에 반영
- Chrome Extension API 의존성을 모킹하여 독립 실행 가능
- 다크 모드 / 라이트 모드 전환 테스트
- 프로바이더별 상태 시각화 (Bedrock, OpenAI, Gemini)

---

## 2. .pen 디자인 파일 분석

### 2.1 파일 구조

레포지토리에 `v2.pen`과 `v3.pen` 두 파일이 존재하며, 내용은 동일합니다 (810KB).

### 2.2 화면 구성 (6개 화면)

| 화면 | ID | 테마 | 크기 |
|------|-----|------|------|
| WikiHome | `Oyw0e` | Light | 1440×900 |
| DocsPage - AI 채팅 | `Zzbmd` | Light | 1440×900 |
| QuickStartPage | `RfzE5` | Light | 1440×900 |
| WikiHome - Dark | `ZGhd9` | Dark | 1440×900 |
| DocsPage - AI 채팅 - Dark | `7symu` | Dark | 1440×900 |
| QuickStartPage - Dark | `DB4hd` | Dark | 1440×900 |

### 2.3 재사용 컴포넌트 (6개)

| 컴포넌트 | ID | 설명 |
|----------|-----|------|
| `Wiki/NavItem` | `pKthN` | 사이드바 네비게이션 아이템 (아이콘 + 라벨) |
| `Wiki/NavGroupHeader` | `2ITpx` | 사이드바 그룹 헤더 (화살표 + 섹션명) |
| `Wiki/FeatureCard` | `ZUwkZ` | 홈페이지 기능 카드 (아이콘, 제목, 설명) |
| `Wiki/Badge` | `iE8nD` | 버전 뱃지 (v2, v3 등) |
| `Wiki/Breadcrumb` | `b4345` | 경로 표시 (홈 / 상위 / 현재) |
| `Wiki/SearchBar` | `7d4mW` | 검색 입력바 (아이콘 + 플레이스홀더 + 단축키) |

### 2.4 디자인 토큰 (CSS 변수)

```css
/* 라이트 모드 */
--bg-page: #F8F9FA
--bg-sidebar: #FFFFFF
--bg-card: #FFFFFF
--text-primary: #1A1A2E
--text-secondary: #64748B
--text-tertiary: #94A3B8
--primary: #3478FE
--primary-light: #EEF4FF
--border: #E2E8F0

/* 다크 모드 */
--bg-page: #0F172A
--bg-sidebar: #1E293B
--bg-card: #1E293B
--text-primary: #F1F5F9
--text-secondary: #94A3B8
--text-tertiary: #64748B
--primary: #5B93FF
--primary-light: #1E3A5F
--border: #334155
```

### 2.5 타이포그래피

- **폰트**: Inter (sans-serif)
- **제목**: 13-16px, fontWeight 500-600
- **본문**: 14px, fontWeight normal
- **뱃지**: 12px, fontWeight 600
- **간격**: letterSpacing 0.3 (그룹 헤더)

---

## 3. H Chat 컴포넌트 인벤토리

### 3.1 페이지 뷰 컴포넌트 (8개)

| 컴포넌트 | 파일 | 줄 수 | 복잡도 | 의존성 |
|----------|------|-------|--------|--------|
| `ChatView` | ChatView.tsx | 700+ | 높음 | useChat, useProvider, 7개 서브컴포넌트 |
| `GroupChatView` | GroupChatView.tsx | 200+ | 중간 | useProvider, useConfig |
| `DebateView` | DebateView.tsx | 300+ | 높음 | debate.ts, useProvider |
| `ToolsView` | ToolsView.tsx | 400+ | 높음 | pageReader, pdfParser, commentAnalyzer |
| `HistoryView` | HistoryView.tsx | 204 | 낮음 | chatHistory, tags |
| `BookmarksView` | BookmarksView.tsx | 165 | 낮음 | bookmarks |
| `SettingsView` | SettingsView.tsx | 300+ | 중간 | useConfig, providers |
| `UsageView` | UsageView.tsx | 150+ | 중간 | usage |
| `PromptLibraryView` | PromptLibraryView.tsx | 139 | 낮음 | promptLibrary |

### 3.2 공용 컴포넌트 (4개)

| 컴포넌트 | 파일 | 줄 수 |
|----------|------|-------|
| `ModelSelector` | ModelSelector.tsx | 120+ |
| `PersonaSelector` | PersonaSelector.tsx | 128 |
| `MessageSearchModal` | MessageSearchModal.tsx | 111 |
| `App` (탭 라우터) | sidepanel/App.tsx | 150+ |

### 3.3 ChatView 서브 컴포넌트 (5개, 인라인)

| 서브컴포넌트 | 설명 |
|-------------|------|
| `CodeBlock` | 코드 블록 + 복사 (8개 언어) |
| `MD` | 마크다운 렌더링 (XSS 방지) |
| `SearchSources` | 웹 검색 출처 표시 |
| `AgentStepsView` | 에이전트 단계 시각화 |
| `MsgBubble` | 메시지 버블 (액션: 편집, 재생성, 복사, TTS, 핀, 포크) |

### 3.4 Content Script UI (3개)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| 텍스트 선택 툴바 | toolbar.ts | 7가지 AI 액션 플로팅 메뉴 |
| 검색엔진 AI 카드 | search-injector.ts | Google/Bing/Naver Shadow DOM 카드 |
| 글쓰기 어시스턴트 | writing-assistant.ts | textarea 플로팅 변환 툴바 |

---

## 4. Storybook 구조 설계

### 4.1 기술 스택

```json
{
  "devDependencies": {
    "@storybook/react-vite": "^8.5.0",
    "@storybook/addon-essentials": "^8.5.0",
    "@storybook/addon-themes": "^8.5.0",
    "@storybook/addon-a11y": "^8.5.0",
    "@storybook/addon-interactions": "^8.5.0",
    "@storybook/test": "^8.5.0",
    "storybook-addon-pseudo-states": "^4.0.0"
  }
}
```

### 4.2 디렉토리 구조

```
src/
├── .storybook/
│   ├── main.ts              # Storybook 설정
│   ├── preview.ts            # 글로벌 데코레이터 + 테마
│   ├── manager.ts            # Storybook UI 커스텀
│   └── mocks/
│       ├── chrome-storage.ts # chrome.storage.local 모킹
│       ├── chrome-runtime.ts # chrome.runtime 모킹
│       ├── providers.ts      # AI 프로바이더 모킹
│       └── fixtures.ts       # 테스트 데이터 (대화, 메시지, 북마크)
├── stories/
│   ├── atoms/                # 기본 요소
│   │   ├── Badge.stories.tsx
│   │   ├── CodeBlock.stories.tsx
│   │   └── SearchSources.stories.tsx
│   ├── molecules/            # 복합 요소
│   │   ├── ModelSelector.stories.tsx
│   │   ├── PersonaSelector.stories.tsx
│   │   ├── MessageSearchModal.stories.tsx
│   │   ├── MsgBubble.stories.tsx
│   │   └── AgentStepsView.stories.tsx
│   ├── organisms/            # 페이지 뷰
│   │   ├── ChatView.stories.tsx
│   │   ├── GroupChatView.stories.tsx
│   │   ├── DebateView.stories.tsx
│   │   ├── ToolsView.stories.tsx
│   │   ├── HistoryView.stories.tsx
│   │   ├── BookmarksView.stories.tsx
│   │   ├── SettingsView.stories.tsx
│   │   ├── UsageView.stories.tsx
│   │   └── PromptLibraryView.stories.tsx
│   ├── content-scripts/      # 컨텐트 스크립트 UI
│   │   ├── Toolbar.stories.tsx
│   │   ├── SearchCard.stories.tsx
│   │   └── WritingAssistant.stories.tsx
│   └── pages/                # 전체 앱
│       └── App.stories.tsx
```

### 4.3 Storybook 설정

#### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-addon-pseudo-states',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    // Chrome Extension API 모킹
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'chrome': './.storybook/mocks/chrome-storage.ts',
      },
    }
    return config
  },
}

export default config
```

#### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/styles/global.css'

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    // Chrome Extension 패널 크기 시뮬레이션
    (Story) => (
      <div style={{ width: '400px', height: '600px', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8F9FA' },
        { name: 'dark', value: '#0F172A' },
      ],
    },
    viewport: {
      viewports: {
        sidePanel: { name: 'Side Panel', styles: { width: '400px', height: '600px' } },
        sidePanelWide: { name: 'Side Panel Wide', styles: { width: '500px', height: '800px' } },
        popup: { name: 'Popup', styles: { width: '350px', height: '500px' } },
      },
    },
  },
}

export default preview
```

---

## 5. Chrome Extension API 모킹 전략

### 5.1 핵심 과제

H Chat은 Chrome Extension API에 강하게 의존합니다. Storybook에서 독립 실행하려면 다음 API를 모킹해야 합니다:

| API | 사용처 | 모킹 전략 |
|-----|--------|-----------|
| `chrome.storage.local` | 모든 컴포넌트 | 인메모리 Map 래퍼 |
| `chrome.runtime.connect()` | content script 스트리밍 | EventEmitter 시뮬레이션 |
| `chrome.runtime.sendMessage()` | 백그라운드 통신 | Promise.resolve 모킹 |
| `chrome.tabs.query()` | 현재 탭 정보 | 더미 탭 객체 |
| `chrome.scripting.executeScript()` | 페이지 콘텐츠 추출 | 더미 텍스트 반환 |

### 5.2 chrome.storage.local 모킹

```typescript
// .storybook/mocks/chrome-storage.ts
const store = new Map<string, unknown>()

// 초기 시드 데이터
const SEED_DATA: Record<string, unknown> = {
  'hchat:config': {
    aws: { accessKeyId: 'MOCK_KEY', secretAccessKey: 'MOCK_SECRET', region: 'us-east-1' },
    openai: { apiKey: 'sk-mock-key' },
    gemini: { apiKey: 'mock-gemini-key' },
    defaultModel: 'claude-sonnet-4-6',
    enableWebSearch: true,
    enableAgent: true,
  },
  'hchat:conversations': [
    { id: 'conv-1', title: '테스트 대화', model: 'claude-sonnet-4-6', updatedAt: Date.now() },
    { id: 'conv-2', title: 'React 질문', model: 'gpt-4o', updatedAt: Date.now() - 3600000 },
  ],
}

Object.entries(SEED_DATA).forEach(([k, v]) => store.set(k, v))

globalThis.chrome = {
  storage: {
    local: {
      get: (keys: string | string[]) => {
        const result: Record<string, unknown> = {}
        const keyList = Array.isArray(keys) ? keys : [keys]
        keyList.forEach((k) => { if (store.has(k)) result[k] = store.get(k) })
        return Promise.resolve(result)
      },
      set: (items: Record<string, unknown>) => {
        Object.entries(items).forEach(([k, v]) => store.set(k, v))
        return Promise.resolve()
      },
      remove: (keys: string | string[]) => {
        const keyList = Array.isArray(keys) ? keys : [keys]
        keyList.forEach((k) => store.delete(k))
        return Promise.resolve()
      },
    },
  },
  runtime: {
    sendMessage: () => Promise.resolve({}),
    connect: () => ({
      postMessage: () => {},
      onMessage: { addListener: () => {}, removeListener: () => {} },
      onDisconnect: { addListener: () => {} },
    }),
  },
  tabs: {
    query: () => Promise.resolve([{ id: 1, url: 'https://example.com', title: 'Example Page' }]),
  },
  scripting: {
    executeScript: () => Promise.resolve([{ result: '페이지 콘텐츠 예시 텍스트...' }]),
  },
} as unknown as typeof chrome
```

### 5.3 AI 프로바이더 모킹

```typescript
// .storybook/mocks/providers.ts
export function createMockStreamResponse(text: string, delayMs = 30) {
  return async function* () {
    const words = text.split(' ')
    let accumulated = ''
    for (const word of words) {
      await new Promise((r) => setTimeout(r, delayMs))
      accumulated += (accumulated ? ' ' : '') + word
      yield word + ' '
    }
    return accumulated
  }
}

export const MOCK_RESPONSES: Record<string, string> = {
  default: '안녕하세요! H Chat입니다. 무엇을 도와드릴까요?',
  code: '```typescript\nfunction hello(): string {\n  return "Hello, World!";\n}\n```',
  agent: '<tool_call>\n  <name>web_search</name>\n  <params>{"query": "Next.js 15"}</params>\n</tool_call>',
  search: '검색 결과에 따르면, Next.js 15는 2024년 10월에 출시되었습니다.',
}
```

---

## 6. 스토리 작성 가이드

### 6.1 Atoms — Badge

```typescript
// src/stories/atoms/Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'

const Badge = ({ label, variant = 'default' }: { label: string; variant?: 'default' | 'new' }) => (
  <span className={`badge badge-${variant}`}>{label}</span>
)

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['default', 'new'] },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const V2: Story = { args: { label: 'v2' } }
export const V3: Story = { args: { label: 'v3', variant: 'new' } }
export const CoreFeature: Story = { args: { label: '핵심 기능' } }
```

### 6.2 Molecules — ModelSelector

```typescript
// src/stories/molecules/ModelSelector.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ModelSelector } from '../../components/ModelSelector'

const meta: Meta<typeof ModelSelector> = {
  title: 'Molecules/ModelSelector',
  component: ModelSelector,
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ModelSelector>

export const Default: Story = {
  args: { currentModel: 'claude-sonnet-4-6', onSelect: () => {} },
}

export const GPTSelected: Story = {
  args: { currentModel: 'gpt-4o', onSelect: () => {} },
}

export const GeminiSelected: Story = {
  args: { currentModel: 'gemini-flash-2.0', onSelect: () => {} },
}
```

### 6.3 Organisms — ChatView

```typescript
// src/stories/organisms/ChatView.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ChatView } from '../../components/ChatView'
import '../mocks/chrome-storage'

const mockConfig = {
  aws: { accessKeyId: 'MOCK', secretAccessKey: 'MOCK', region: 'us-east-1' },
  openai: { apiKey: 'sk-mock' },
  gemini: { apiKey: 'mock' },
  defaultModel: 'claude-sonnet-4-6',
  enableWebSearch: true,
  enableAgent: false,
}

const meta: Meta<typeof ChatView> = {
  title: 'Organisms/ChatView',
  component: ChatView,
  parameters: {
    viewport: { defaultViewport: 'sidePanel' },
  },
}

export default meta
type Story = StoryObj<typeof ChatView>

export const Empty: Story = {
  args: { config: mockConfig },
}

export const WithMessages: Story = {
  args: { config: mockConfig, loadConvId: 'conv-1' },
}

export const AgentMode: Story = {
  args: { config: { ...mockConfig, enableAgent: true } },
}

export const WithPageContext: Story = {
  args: { config: mockConfig, contextEnabled: true },
}
```

---

## 7. 구현 단계

### Phase 1: 인프라 구축 (1일)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 1-1 | Storybook 8 + React-Vite 설치 | `.storybook/main.ts` |
| 1-2 | 글로벌 CSS + 테마 데코레이터 설정 | `.storybook/preview.ts` |
| 1-3 | Chrome API 전체 모킹 | `.storybook/mocks/*.ts` |
| 1-4 | AI 프로바이더 모킹 (스트리밍 시뮬레이션) | `.storybook/mocks/providers.ts` |
| 1-5 | 테스트 픽스처 데이터 생성 | `.storybook/mocks/fixtures.ts` |

### Phase 2: Atoms + Molecules (1일)

| 단계 | 스토리 | 변형 수 |
|------|--------|---------|
| 2-1 | Badge (v2, v3, 핵심 기능, 초보자) | 4 |
| 2-2 | CodeBlock (JS, Python, HTML, JSON, SQL) | 5 |
| 2-3 | SearchSources (1개 소스, 3개 소스, 0개) | 3 |
| 2-4 | MsgBubble (사용자, AI, 스트리밍, 에이전트) | 4 |
| 2-5 | AgentStepsView (1스텝, 3스텝, 10스텝) | 3 |
| 2-6 | ModelSelector (Bedrock, OpenAI, Gemini) | 3 |
| 2-7 | PersonaSelector (기본, 개발자, 커스텀) | 3 |
| 2-8 | MessageSearchModal (빈 상태, 결과 있음) | 2 |

### Phase 3: Organisms — 페이지 뷰 (2일)

| 단계 | 스토리 | 핵심 시나리오 |
|------|--------|-------------|
| 3-1 | ChatView | 빈 대화, 메시지 있음, 에이전트 모드, 스트리밍 중, 이미지 첨부 |
| 3-2 | GroupChatView | 2모델 비교, 4모델 비교, 스트리밍 중 |
| 3-3 | DebateView | 라운드 1, 라운드 2, 라운드 3 완료, 종합 결과 |
| 3-4 | ToolsView | 도구 목록, 페이지 요약 결과, YouTube 분석, PDF 채팅 |
| 3-5 | HistoryView | 빈 기록, 검색 결과, 태그 필터, 고정 대화 |
| 3-6 | BookmarksView | 빈 상태, 색상별 하이라이트, 메모 편집 |
| 3-7 | SettingsView | 초기 설정, 연결 성공, 연결 실패 |
| 3-8 | UsageView | 일일 차트, 프로바이더별 통계, 예산 알림 |
| 3-9 | PromptLibraryView | 기본 프롬프트, 커스텀 추가, 카테고리 필터 |

### Phase 4: Content Scripts + 통합 (1일)

| 단계 | 스토리 | 시나리오 |
|------|--------|---------|
| 4-1 | Toolbar | 텍스트 선택, 7가지 액션, 결과 패널 |
| 4-2 | SearchCard | Google, Bing, Naver 결과 페이지 |
| 4-3 | WritingAssistant | textarea 포커스, 7가지 변환, 결과 적용 |
| 4-4 | App (전체) | 탭 전환, 첫 실행, API 키 미설정 |

### Phase 5: 문서화 + CI (0.5일)

| 단계 | 작업 |
|------|------|
| 5-1 | 컴포넌트 JSDoc/TSDoc 주석 추가 |
| 5-2 | Storybook Autodocs 활성화 |
| 5-3 | Chromatic 또는 GitHub Pages 배포 설정 |
| 5-4 | CI 파이프라인에 Storybook 빌드 추가 |

---

## 8. ChatView 서브컴포넌트 추출 계획

현재 ChatView.tsx는 700+ 줄이며, 5개 서브컴포넌트가 인라인으로 정의되어 있습니다. Storybook에서 개별 테스트를 위해 분리가 필요합니다.

### 추출 대상

```
src/components/
├── ChatView.tsx              # 메인 (300줄로 축소)
├── chat/
│   ├── CodeBlock.tsx          # 코드 블록 + 복사
│   ├── MarkdownRenderer.tsx   # 마크다운 렌더링 (XSS 방지)
│   ├── SearchSources.tsx      # 웹 검색 출처 칩
│   ├── AgentStepsView.tsx     # 에이전트 단계 시각화
│   └── MsgBubble.tsx          # 메시지 버블 + 액션
```

### 추출 기준

| 기준 | 값 |
|------|-----|
| 파일당 최대 줄 수 | 200줄 |
| Props 인터페이스 | 모두 명시적으로 export |
| 상태 관리 | 부모에서 props로 전달 |
| 스타일 | CSS 클래스 기반 (인라인 스타일 제거) |

---

## 9. 테마 통합 전략

### 9.1 .pen 디자인 토큰 → CSS 변수 매핑

`.pen` 파일의 변수가 `src/styles/global.css`의 CSS 변수와 일치하도록 동기화합니다.

```css
/* global.css — .pen 디자인 토큰과 동기화 */
:root {
  --bg-page: #F8F9FA;
  --bg-sidebar: #FFFFFF;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A2E;
  --text-secondary: #64748B;
  --text-tertiary: #94A3B8;
  --primary: #3478FE;
  --primary-light: #EEF4FF;
  --border: #E2E8F0;
}

.dark {
  --bg-page: #0F172A;
  --bg-sidebar: #1E293B;
  --bg-card: #1E293B;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --primary: #5B93FF;
  --primary-light: #1E3A5F;
  --border: #334155;
}
```

### 9.2 Storybook 테마 전환

`@storybook/addon-themes`의 `withThemeByClassName`을 사용하여 `.dark` 클래스 토글로 라이트/다크 모드를 전환합니다. Storybook 툴바에서 원클릭 전환이 가능합니다.

### 9.3 프로바이더 브랜드 컬러

```css
.provider-bedrock { --provider-color: #FF9900; }
.provider-openai  { --provider-color: #10A37F; }
.provider-gemini  { --provider-color: #4285F4; }
```

---

## 10. npm 스크립트 추가

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build -o storybook-static",
    "test-storybook": "test-storybook"
  }
}
```

---

## 11. 예상 산출물 요약

| 항목 | 수량 |
|------|------|
| Storybook 스토리 파일 | 18개 |
| 스토리 변형 (variants) | 60개+ |
| Chrome API 모킹 모듈 | 4개 |
| 추출된 서브컴포넌트 | 5개 |
| 총 예상 소요 시간 | 5.5일 |

---

## 12. 참고 사항

- `.pen` 디자인 파일은 **위키 디자인**용이며, H Chat Extension 자체의 UI 디자인은 `src/styles/global.css`에 정의되어 있습니다
- Content Script UI (toolbar, search-injector, writing-assistant)는 Shadow DOM을 사용하므로, Storybook에서 Shadow DOM 래퍼가 필요합니다
- `pdfjs-dist` 라이브러리는 Storybook 환경에서 Worker 설정이 필요할 수 있습니다
- AI 스트리밍 모킹은 `AsyncGenerator`를 사용하여 실제와 유사한 딜레이를 시뮬레이션합니다
