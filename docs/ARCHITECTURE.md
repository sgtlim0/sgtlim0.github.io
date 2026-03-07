# H Chat 아키텍처

> 최종 업데이트: 2026-03-07 | Phase 35 완료 기준

## 시스템 개요

```mermaid
graph TB
    subgraph "모노레포 (hchat-wiki)"
        subgraph "Packages"
            TOKENS["@hchat/tokens<br/>CSS 디자인 토큰 (194개)"]
            UI["@hchat/ui<br/>공유 UI (23,385줄, 128 컴포넌트)"]
        end

        subgraph "Apps (8개)"
            WIKI["@hchat/wiki<br/>마크다운 위키"]
            HMG["@hchat/hmg<br/>HMG 공식사이트"]
            ADMIN["@hchat/admin<br/>관리자 패널"]
            USER["@hchat/user<br/>사용자 앱"]
            LLM["@hchat/llm-router<br/>LLM 라우터"]
            DESK["@hchat/desktop<br/>데스크톱 앱"]
            MOBI["@hchat/mobile<br/>모바일 앱 (PWA)"]
            SB["@hchat/storybook<br/>컴포넌트 문서"]
        end

        TOKENS --> UI
        UI --> WIKI
        UI --> HMG
        UI --> ADMIN
        UI --> USER
        UI --> LLM
        UI --> DESK
        UI --> MOBI
        UI --> SB
    end

    subgraph "별도 레포"
        EXT["hchat-v2-extension<br/>Chrome Extension"]
        DESKPWA["hchat-desktop<br/>PWA Desktop"]
    end

    subgraph "배포"
        GP["GitHub Pages"]
        V1["Vercel (7개)"]
    end

    WIKI --> GP
    HMG --> V1
    ADMIN --> V1
    USER --> V1
    LLM --> V1
    DESK --> V1
    MOBI --> V1
    SB --> V1
```

## 패키지 의존성

```mermaid
graph LR
    TOKENS["@hchat/tokens"] --> UI["@hchat/ui"]
    UI --> |"@hchat/ui"| SHARED["공유 컴포넌트"]
    UI --> |"@hchat/ui/admin"| ADMIN["Admin (46 exports)"]
    UI --> |"@hchat/ui/user"| USER["User (7 exports)"]
    UI --> |"@hchat/ui/llm-router"| LLM["LLM Router (19 exports)"]
    UI --> |"@hchat/ui/roi"| ROI["ROI (19 exports)"]
    UI --> |"@hchat/ui/desktop"| DESK["Desktop (13 exports)"]
    UI --> |"@hchat/ui/mobile"| MOBI["Mobile (15 exports)"]
    UI --> |"@hchat/ui/hmg"| HMG["HMG (8 exports)"]
    UI --> |"@hchat/ui/i18n"| I18N["i18n (4 exports)"]
```

## @hchat/ui 내부 구조 (195파일, 23,385줄)

```mermaid
graph TB
    subgraph "@hchat/ui"
        CORE["Core (10파일)<br/>Badge, ThemeProvider, Skeleton,<br/>Toast, ErrorBoundary, EmptyState,<br/>FeatureCard, LanguageToggle"]
        VAL["Validation<br/>validate(), useFormValidation()"]
        I18N["i18n (5파일)<br/>한영 다국어"]

        subgraph "도메인별 모듈"
            ADMIN_C["admin/ (68파일)<br/>Dashboard, DataTable, Auth<br/>+ services (workflow, widget,<br/>notification, mock API)"]
            USER_C["user/ (34파일)<br/>ChatPage, MessageBubble<br/>+ services (chat, mock)"]
            ROI_C["roi/ (27파일)<br/>5종 SVG 차트,<br/>9개 대시보드 페이지"]
            LLM_C["llm-router/ (22파일)<br/>ModelTable, Playground<br/>+ services (streaming, hooks)"]
            MOBI_C["mobile/ (12파일)<br/>MobileApp, SwipeableChat<br/>+ services (mobile, hooks)"]
            HMG_C["hmg/ (9파일)<br/>GNB, HeroBanner, Footer"]
            DESK_C["desktop/ (8파일)<br/>Sidebar, ChatBubble,<br/>AgentCard, ToolGrid"]
        end
    end
```

## 서비스 레이어 패턴

3개 앱(Admin, User, LLM Router) + Mobile에 동일한 Provider Pattern 적용:

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Custom Hook
    participant P as Context Provider
    participant S as Service Interface
    participant M as Mock Service

    C->>H: useProviders()
    H->>P: useContext()
    P->>S: service.getProviders()
    S->>M: mockService.getProviders()
    M-->>S: mock data (100-300ms delay)
    S-->>P: Provider[]
    P-->>H: { providers, loading }
    H-->>C: render data
```

실제 API 전환 시 Mock Service를 API Service로 교체 (Interface 불변).

## 실시간 데이터 흐름

```mermaid
graph LR
    subgraph "실시간 대시보드 (Phase 29)"
        RT["realtimeService<br/>setInterval 1-5s"]
        RT --> LMC["LiveMetricCard"]
        RT --> LLC["LiveLineChart"]
        RT --> LAF["LiveActivityFeed"]
        RT --> LMD["LiveModelDistribution"]
    end

    subgraph "SSE 스트리밍 (Phase 30)"
        SSE["streamingService<br/>Token-by-token 30-80ms"]
        SSE --> SP["StreamingPlayground"]
        SSE --> MC["ModelComparison"]
        SSE --> CP["ChatPage (User)"]
    end

    subgraph "알림 시스템 (Phase 32)"
        NS["notificationService<br/>Mock WebSocket"]
        NS --> NB["NotificationBell"]
        NS --> NP["NotificationPanel"]
    end
```

## 워크플로우 빌더 (Phase 34)

```mermaid
graph LR
    subgraph "노드 타입 (8종)"
        INPUT["Input"]
        LLM["LLM"]
        TRANSFORM["Transform"]
        CONDITION["Condition"]
        OUTPUT["Output"]
        API["API"]
        DB["Database"]
        CUSTOM["Custom"]
    end

    INPUT --> |"SVG 엣지"| LLM
    LLM --> TRANSFORM
    TRANSFORM --> CONDITION
    CONDITION --> |"true"| OUTPUT
    CONDITION --> |"false"| API
    API --> DB
    DB --> CUSTOM
```

## 위젯 시스템 (Phase 33)

```mermaid
graph TB
    subgraph "위젯 타입 (10종)"
        W1["MetricCard"]
        W2["LineChart"]
        W3["BarChart"]
        W4["DonutChart"]
        W5["ActivityFeed"]
        W6["ModelDistribution"]
        W7["UsageTable"]
        W8["StatusGrid"]
        W9["AlertList"]
        W10["CustomHTML"]
    end

    subgraph "레이아웃"
        GRID["CSS Grid<br/>(span 설정)"]
        LS["localStorage<br/>(레이아웃 영속)"]
    end

    W1 --> GRID
    W2 --> GRID
    GRID --> LS
```

## 성능 최적화

```mermaid
graph LR
    subgraph "코드 스플리팅"
        DI["Dynamic Import<br/>11개 페이지 (ssr: false)"]
        SK["Skeleton Fallback<br/>Chart/Card/Table"]
    end

    subgraph "빌드 최적화"
        BA["Bundle Analyzer<br/>@next/bundle-analyzer"]
        TC["Turbo Cache<br/>inputs 필드로 선별 리빌드"]
    end

    subgraph "품질 측정"
        LH["Lighthouse CI<br/>perf>=80, a11y>=85"]
        E2E["Playwright E2E<br/>18개 테스트"]
        UT["Vitest 단위 테스트<br/>20파일, ~284 테스트"]
    end
```

## 디자인 토큰 흐름

```mermaid
graph LR
    T["tokens.css<br/>194 CSS 변수"] --> G["globals.css<br/>@import + @theme inline"]
    G --> TW["Tailwind CSS 4<br/>유틸리티 클래스"]
    TW --> C["컴포넌트<br/>bg-primary, text-text-primary"]

    T --> |".dark 클래스"| DM["다크 모드<br/>자동 전환"]
```

**토큰 접두사**: Wiki (`--wiki-*`), HMG (`--hmg-*`), Admin (`--admin-*`), ROI (`--roi-*`), User (`--user-*`), LLM Router (`--lr-*`), Desktop (`--dt-*`)

## 앱별 라우트 구조

### Admin (24 routes)
```
/ (Dashboard)
/usage, /statistics, /users, /settings
/providers, /models, /features, /prompts, /agents
/departments, /audit-logs, /sso
/login
/realtime (실시간 대시보드)
/notifications (알림 센터)
/workflows (워크플로우 빌더)
/custom-dashboard (커스텀 대시보드)
/roi/overview, /roi/adoption, /roi/productivity
/roi/analysis, /roi/organization, /roi/sentiment
/roi/reports, /roi/upload, /roi/settings
```

### User (5 routes)
```
/ (Chat), /docs, /ocr, /translation, /my
```

### LLM Router (10+ routes)
```
/ (Landing), /models, /docs, /playground, /compare
/dashboard, /api-keys, /usage, /settings, /login, /signup
```

### Desktop (5 routes)
```
/ (Chat), /agents, /swarm, /debate, /tools
```

### Mobile (4 tabs)
```
Chat, Assistants, History, Settings
```

### HMG (4 routes)
```
/ (Home), /publications, /guide, /dashboard
```

### Wiki (catch-all)
```
/ (home.md), /[...slug] (28 마크다운 페이지)
```

## CI/CD 파이프라인

```mermaid
graph LR
    subgraph "GitHub Actions"
        CI["CI<br/>type-check → lint → test → build"]
        LH["Lighthouse CI<br/>perf>=80, a11y>=85"]
        E2E["E2E Tests<br/>Playwright 18파일"]
        DEPLOY["Deploy<br/>Wiki → GitHub Pages"]
    end

    subgraph "자동 배포"
        GA["GitHub Pages<br/>(Wiki)"]
        VC["Vercel<br/>(7개 앱 + Storybook)"]
    end

    CI --> LH
    CI --> DEPLOY
    DEPLOY --> GA
    CI --> VC
    E2E --> |"배포 URL 테스트"| VC
```

## 보안 아키텍처

```mermaid
graph TB
    subgraph "인증/인가"
        LP["LoginPage"]
        AP["AuthProvider"]
        PR["ProtectedRoute"]

        LP --> |"admin@hchat.ai"| AP
        AP --> |"token"| PR
        PR --> |"role check"| PAGES["Admin 페이지"]
    end

    subgraph "저장소"
        LS["localStorage<br/>(기억하기)"]
        SS["sessionStorage<br/>(세션)"]
    end

    AP --> LS
    AP --> SS

    subgraph "API 보안"
        PROXY["프록시 패턴<br/>(API 키 서버사이드)"]
        MASK["maskAPIKey()<br/>(클라이언트 표시)"]
        VALIDATE["validateAPIKey()<br/>(형식 검증)"]
    end
```
