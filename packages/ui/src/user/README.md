# H Chat 사용자 기능 컴포넌트

H Chat 사용자 인터페이스를 구성하는 컴포넌트, 페이지, 서비스 패키지입니다.

## 사용 앱

- **apps/user** — H Chat 사용자 앱
- https://hchat-user.vercel.app (포트 3003)

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

```tsx
import { ChatPage, ChatSidebar, StreamingIndicator } from '@hchat/ui/user';
import { getCustomAssistants, streamResponse } from '@hchat/ui/user';

export default function App() {
  return (
    <>
      <ChatSidebar />
      <ChatPage />
    </>
  );
}
```

## 컴포넌트 분류

### UI 컴포넌트 (13개)

| 컴포넌트 | 설명 |
|---------|------|
| **UserGNB** | 사용자 상단 네비게이션 바 |
| **ChatSidebar** | 채팅 목록 사이드바 |
| **ChatSearchBar** | 채팅/어시스턴트 검색 바 |
| **ChatSearchPanel** | 대화 검색 패널 |
| **AssistantCard** | 어시스턴트 정보 카드 |
| **AssistantGrid** | 어시스턴트 그리드 목록 |
| **CategoryFilter** | 카테고리 필터 |
| **FileUploadZone** | 파일 업로드 영역 |
| **StepProgress** | 단계 진행률 표시 |
| **StreamingIndicator** | 실시간 스트리밍 표시기 |
| **MessageBubble** | 채팅 메시지 버블 |
| **CustomAssistantModal** | 커스텀 어시스턴트 생성 모달 |
| **MarkdownRenderer** | Markdown 렌더링 컴포넌트 |

### 페이지 (5개)

| 페이지 | 설명 |
|-------|------|
| **ChatPage** | 업무 비서 채팅 (스트리밍, 커스텀 어시스턴트) |
| **TranslationPage** | 문서 번역 서비스 |
| **DocsPage** | 문서 작성 도구 |
| **OCRPage** | 이미지/PDF 텍스트 추출 |
| **MyPage** | 마이페이지 (설정, 구독, 사용량) |

### 기존 서비스 (localStorage 기반)

| 서비스 | 설명 |
|--------|------|
| **sseService** | SSE 스트리밍 응답 시뮬레이션 (`streamResponse`) |
| **chatService** | 채팅 대화 CRUD (localStorage 기반) |
| **assistantService** | 커스텀 어시스턴트 관리 |
| **types.ts** | TypeScript 타입 정의 (Assistant, Conversation, ChatMessage 등) |
| **mockData.ts** | Mock 데이터 샘플 (기본 어시스턴트, 대화 예제) |

### API-Ready 서비스 레이어

Provider Pattern 기반 서비스 추상화로, 실제 API 전환이 용이합니다.

```
services/
├── userService.ts              # UserService 인터페이스 (13개 메서드)
├── mockUserService.ts          # Mock 구현 (localStorage 래핑)
├── UserServiceProvider.tsx     # React Context 프로바이더
├── hooks.ts                    # 커스텀 React 훅 (7개)
└── index.ts                    # Barrel exports
```

**사용 가능한 훅:**

| 훅 | 설명 |
|----|------|
| `useConversations()` | 대화 목록 (생성/삭제 포함) |
| `useAssistants()` | 공식 + 커스텀 어시스턴트 |
| `useUsageStats()` | 사용량 통계 |
| `useSubscription()` | 구독 정보 |
| `useTranslationJobs()` | 번역 작업 목록 |
| `useDocProjects()` | 문서 프로젝트 |
| `useOCRJobs()` | OCR 작업 목록 |

**사용법:**

```tsx
import { UserServiceProvider } from '@hchat/ui/user/services';

export default function RootLayout({ children }) {
  return (
    <UserServiceProvider>
      {children}
    </UserServiceProvider>
  );
}
```

## 주요 기능

### ChatPage 기능

- **실시간 스트리밍 채팅** — SSE 기반 응답 스트리밍
- **커스텀 어시스턴트 생성** — 사용자 정의 어시스턴트 추가/저장
- **대화 저장 및 검색** — localStorage 기반 대화 이력 관리
- **다중 탭 지원** — 공식 어시스턴트/커스텀 어시스턴트 탭
- **카테고리 필터** — 어시스턴트별 카테고리 필터링

## 특징

- 완전한 채팅 시스템 (스트리밍 응답 포함)
- 2단계 서비스 레이어 (localStorage + API-Ready Provider Pattern)
- Mock 데이터 포함 (100-300ms 네트워크 시뮬레이션)
- 다크모드 지원
- TypeScript 완전 지원
- 반응형 레이아웃

## 최근 업데이트

### Phase 22: API 서비스 레이어 + 공통 UX 컴포넌트
- **Provider Pattern**: UserServiceProvider + 7개 커스텀 훅으로 API 추상화
- **공통 UX**: Skeleton, Toast, ErrorBoundary, EmptyState 통합
- **Form Validation**: validate(), useFormValidation() 추가

### Phase 23: 성능 최적화
- **Dynamic Import**: 5개 페이지 코드 스플리팅 (Skeleton fallback)
- **Bundle Analyzer**: `npm run analyze:user`으로 번들 크기 분석
- **Turbo Cache**: 불필요한 리빌드 방지

### Phase 24: CI/CD 파이프라인
- **Lighthouse CI**: 성능(≥80), 접근성(≥85) 자동 검증
- **E2E 확장**: 반응형, 다크모드, 접근성(axe-core) 테스트
- **코드 품질**: Prettier + Husky + lint-staged

### Phase 25: 통합 테스트 + 문서
- **18개 E2E 테스트**: responsive, dark-mode-all, a11y-all (WCAG 2.1 AA)
- **프로젝트 문서**: CONTRIBUTING.md, ARCHITECTURE.md, API_SPEC.md 등

### Phase 26: Storybook 완성
- **151개 스토리**: 전체 UI 컴포넌트 97% 커버리지
- **User 카테고리**: 9개 스토리 (페이지 5개 + 컴포넌트 4개)
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app

### Phase 28: 단위 테스트
- **Vitest 4**: 단위 테스트 기반 구축
- **User 서비스 테스트**: chatService, mockUserService 테스트 커버리지

## 관련 패키지

- **@hchat/tokens** — 디자인 토큰
- **@hchat/ui** — 기본 컴포넌트

## 프로젝트 분석

전체 프로젝트 심층 분석: [PROJECT_ANALYSIS.md](/docs/PROJECT_ANALYSIS.md)
