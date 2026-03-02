# H Chat Wiki 프로젝트 Phase 17-22 실행 계획

> 작성일: 2026-03-03
> 완료된 Phase: 1-16 (Wiki, HMG, Admin, ROI, Enterprise API, User 앱 기본)
> 목표: User 앱 완성 및 LLM-Router 구현

---

## Phase 17: User 앱 완성도 강화

### 주요 작업

1. **User Storybook 스토리 12개 추가**
   - ChatSidebar, AssistantCard, AssistantGrid
   - CategoryFilter, ChatSearchBar, FileUploadZone
   - EngineSelector, StepProgress, ProjectTable
   - SubscriptionCard, UsageTable, UserGNB

2. **다크모드 지원**
   - User 앱용 CSS 토큰 추가 (`packages/tokens/styles/tokens.css`)
   - ThemeToggle 컴포넌트 적용
   - 다크모드 색상 변수 정의

3. **반응형 레이아웃**
   - 모바일: 햄버거 메뉴, 사이드바 오버레이
   - 태블릿: 2컬럼 레이아웃
   - 브레이크포인트: 640px, 768px, 1024px

4. **Vercel Git 연동 자동 배포 설정**

### 수정/생성 파일

```
apps/storybook/stories/user/         # 신규: 12개 스토리
packages/tokens/styles/tokens.css    # User 다크모드 변수 추가
packages/ui/src/user/components/*.tsx # 반응형 클래스 추가
```

### 의존성
- Phase 16 완료 (User 앱 기본 구현)

### 예상 결과물
- Storybook 12개 User 컴포넌트 스토리
- 다크/라이트 모드 전환 가능
- 모바일/태블릿/데스크톱 반응형

---

## Phase 18: 채팅 인터랙션 고도화

### 주요 작업

1. **실시간 AI 응답 스트리밍 UI**
   - SSE Mock 서버 구현 (`packages/ui/src/user/services/sseService.ts`)
   - 타이핑 애니메이션 효과
   - 스트리밍 중 인디케이터
   - 중단 버튼 (Stop generating)

2. **비서 커스텀 생성/편집 폼**
   - 커스텀 비서 생성 모달
   - 필드: 이름, 아이콘, 모델 선택, 프롬프트, 카테고리
   - 비서 편집/삭제 기능
   - LocalStorage 저장

3. **대화 히스토리 검색**
   - 대화 내용 전문 검색
   - 날짜/비서별 필터
   - 검색 결과 하이라이트

4. **마크다운 렌더링 강화**
   - 코드 블록 syntax highlighting
   - 테이블 렌더링
   - 이미지 인라인 표시

### 수정/생성 파일

```
packages/ui/src/user/components/
├── ChatInterface.tsx                 # 신규: 채팅 UI
├── MessageBubble.tsx                 # 신규: 메시지 버블
├── StreamingIndicator.tsx            # 신규: 스트리밍 표시
├── CustomAssistantModal.tsx          # 신규: 비서 생성 모달
├── ChatSearchPanel.tsx               # 신규: 검색 패널
└── MarkdownRenderer.tsx              # 신규: 마크다운 렌더러

packages/ui/src/user/services/
├── sseService.ts                     # 신규: SSE Mock
├── chatService.ts                    # 신규: 채팅 서비스
└── assistantService.ts               # 신규: 비서 관리
```

### 의존성
- Phase 17 완료 (User 앱 인프라)
- react-markdown, remark-gfm, rehype-highlight

### 예상 결과물
- 실시간 스트리밍 채팅 데모
- 커스텀 비서 생성 가능
- 대화 검색 기능
- 풍부한 마크다운 렌더링

---

## Phase 19: LLM-Router 코드 구현

### 주요 작업

1. **LLM-Router 앱 생성**
   - `apps/llm-router` Next.js 앱 생성
   - 포트 3004 설정
   - 기본 레이아웃 및 라우팅

2. **wiki.pen 10개 화면 구현**
   - Landing Page (`/`) — 히어로, 기능 카드
   - Models Page (`/models`) — 86개 모델 테이블
   - Docs (`/docs/*`) — MDX 문서 시스템
   - Playground (`/playground`) — 모델 테스트
   - Usage Stats (`/dashboard/usage`) — 사용량 차트
   - API Keys (`/dashboard/keys`) — 키 관리
   - Org Settings (`/dashboard/settings`) — 조직 설정
   - Billing (`/dashboard/billing`) — 결제 관리
   - Login (`/login`) — 로그인 폼
   - Signup (`/signup`) — 회원가입 폼

3. **컴포넌트 라이브러리**
   - ModelTable (정렬/필터/검색)
   - ProviderBadge (제공자 아이콘)
   - PriceCell (할인가 표시)
   - CodeBlock (언어별 탭)
   - DocsSidebar (문서 네비게이션)

4. **Mock 데이터**
   - 86개 모델 정보
   - 가격 데이터 (KRW 환산)
   - 사용량 통계, API 키 목록

### 수정/생성 파일

```
apps/llm-router/                      # 신규 앱
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing
│   ├── models/page.tsx               # 모델 가격표
│   ├── docs/[...slug]/page.tsx       # MDX 문서
│   ├── playground/page.tsx           # 테스트
│   ├── dashboard/
│   │   ├── usage/page.tsx
│   │   ├── keys/page.tsx
│   │   ├── settings/page.tsx
│   │   └── billing/page.tsx
│   ├── login/page.tsx
│   └── signup/page.tsx
├── package.json
└── vercel.json

packages/ui/src/llm-router/           # 신규: 공용 컴포넌트
└── index.ts
```

### 의존성
- Phase 17 완료 (모노레포 인프라)
- @next/mdx, gray-matter, rehype-highlight

### 예상 결과물
- LLM-Router 앱 10개 페이지
- 86개 모델 가격표 (필터/정렬)
- MDX 문서 시스템
- 모델 테스트 Playground
- 대시보드 4개 페이지

---

## Phase 20: 통합 테스트 + 품질

### 주요 작업

1. **E2E 테스트 확장**
   - User 앱 테스트 시나리오 5개
   - LLM-Router 테스트 시나리오 3개
   - 크로스 앱 네비게이션 테스트

2. **Lighthouse 성능 검증**
   - 전체 앱 성능 측정
   - Core Web Vitals 최적화
   - 번들 사이즈 분석

3. **접근성(a11y) 강화**
   - WCAG 2.1 AA 준수
   - 키보드 네비게이션
   - 스크린 리더 테스트
   - 색상 대비 검증

### 수정/생성 파일

```
tests/e2e/
├── user/
│   ├── chat.spec.ts
│   ├── translation.spec.ts
│   ├── docs.spec.ts
│   ├── ocr.spec.ts
│   └── mypage.spec.ts
├── llm-router/
│   ├── models.spec.ts
│   ├── playground.spec.ts
│   └── dashboard.spec.ts
└── integration/
    └── cross-app.spec.ts
```

### 의존성
- Phase 18, 19 완료
- Playwright, Lighthouse CI

### 예상 결과물
- E2E 테스트 커버리지 80%+
- Lighthouse 점수 90+ (모든 앱)
- a11y 이슈 0개

---

## Phase 21: 데이터 연동 레이어

### 주요 작업

1. **User 앱 API 서비스 레이어**
   - API 클라이언트 (`userApiService.ts`)
   - 타입 정의 강화
   - 에러 핸들링 통합
   - 재시도 로직

2. **WebSocket/SSE 통신 모듈**
   - WebSocket 연결 관리
   - 자동 재연결, 하트비트 체크
   - 이벤트 핸들러 추상화

3. **상태 관리 고도화**
   - React Query 도입
   - 캐싱 전략, Optimistic Updates
   - 백그라운드 동기화

4. **에러 핸들링 + 로딩 상태**
   - 글로벌 에러 바운더리
   - 토스트 알림 시스템
   - 스켈레톤 로더, 진행률 표시

### 수정/생성 파일

```
packages/ui/src/user/services/
├── api/
│   ├── client.ts
│   ├── chatApi.ts
│   ├── translationApi.ts
│   ├── docsApi.ts
│   └── ocrApi.ts
├── websocket/
│   ├── WebSocketManager.ts
│   ├── SSEClient.ts
│   └── ReconnectStrategy.ts
└── hooks/
    ├── useChat.ts
    ├── useTranslation.ts
    └── useWebSocket.ts

packages/ui/src/user/components/
├── ErrorBoundary.tsx
├── Toast.tsx
├── Skeleton.tsx
└── ProgressBar.tsx
```

### 의존성
- Phase 19 완료
- @tanstack/react-query

### 예상 결과물
- 완전한 API 서비스 레이어
- 실시간 통신 인프라
- 강력한 에러 처리

---

## Phase 22: 문서화 + 최종 정리

### 주요 작업

1. **전체 Storybook 통합**
   - User 스토리 12개 완성
   - LLM-Router 스토리 8개 추가
   - Storybook Docs 페이지

2. **API 문서 자동 생성**
   - TypeDoc 설정
   - API 레퍼런스 생성
   - 서비스 레이어 문서화

3. **프로젝트 발표 자료**
   - 아키텍처 다이어그램
   - 기술 스택 설명
   - 데모 시나리오
   - 성과 지표 정리

### 수정/생성 파일

```
apps/storybook/stories/
├── user/                            # 12개 완성
└── llm-router/                      # 신규: 8개

docs/
├── API_REFERENCE.md
├── ARCHITECTURE.md
├── DEMO_SCENARIOS.md
└── PRESENTATION.md
```

### 의존성
- Phase 17-21 완료

### 예상 결과물
- 완전한 컴포넌트 문서화
- API 레퍼런스 사이트
- 프로젝트 발표 자료

---

## 위험 요소 및 대응 방안

| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| SSE/WebSocket 구현 복잡도 | 높음 | Mock 서버로 시작, 단계적 구현 |
| LLM-Router 86개 모델 데이터 관리 | 중간 | JSON 파일 관리, 타입 자동 생성 |
| 번들 사이즈 증가 | 중간 | 코드 스플리팅, 동적 임포트 |
| E2E 테스트 실행 시간 | 낮음 | 병렬 실행, 중요 시나리오 우선 |

---

## 성공 지표

- 6개 앱 모두 Vercel 배포 완료
- Storybook 스토리 70개+
- E2E 테스트 커버리지 80%+
- Lighthouse 점수 90+
- 전체 페이지 50개+
- 컴포넌트 100개+
- 다크모드 100% 지원
- 모바일 반응형 100%
