# H Chat 아키텍처

## 시스템 개요

```mermaid
graph TB
    subgraph "모노레포 (hchat-wiki)"
        subgraph "Packages"
            TOKENS["@hchat/tokens<br/>CSS 디자인 토큰"]
            UI["@hchat/ui<br/>공유 UI 컴포넌트"]
        end

        subgraph "Apps"
            WIKI["@hchat/wiki<br/>마크다운 위키"]
            HMG["@hchat/hmg<br/>HMG 공식사이트"]
            ADMIN["@hchat/admin<br/>관리자 패널"]
            USER["@hchat/user<br/>사용자 앱"]
            LLM["@hchat/llm-router<br/>LLM 라우터"]
            SB["@hchat/storybook<br/>컴포넌트 문서"]
        end

        TOKENS --> UI
        UI --> WIKI
        UI --> HMG
        UI --> ADMIN
        UI --> USER
        UI --> LLM
        UI --> SB
    end

    subgraph "별도 레포"
        EXT["hchat-v2-extension<br/>Chrome Extension"]
        DESK["hchat-desktop<br/>PWA Desktop"]
    end

    subgraph "배포"
        GP["GitHub Pages"]
        V1["Vercel"]
    end

    WIKI --> GP
    HMG --> V1
    ADMIN --> V1
    USER --> V1
    LLM --> V1
    SB --> V1
    DESK --> V1
```

## 패키지 의존성

```mermaid
graph LR
    TOKENS["@hchat/tokens"] --> UI["@hchat/ui"]
    UI --> |"@hchat/ui"| APPS["모든 앱"]
    UI --> |"@hchat/ui/hmg"| HMG["HMG"]
    UI --> |"@hchat/ui/admin"| ADMIN["Admin"]
    UI --> |"@hchat/ui/user"| USER["User"]
    UI --> |"@hchat/ui/llm-router"| LLM["LLM Router"]
    UI --> |"@hchat/ui/roi"| ROI["ROI Dashboard"]
```

## @hchat/ui 내부 구조

```mermaid
graph TB
    subgraph "@hchat/ui"
        CORE["Core<br/>Badge, ThemeProvider, Skeleton,<br/>Toast, ErrorBoundary, EmptyState"]
        VAL["Validation<br/>validate(), useFormValidation()"]
        I18N["i18n<br/>한영 다국어"]

        subgraph "도메인별 모듈"
            HMG_C["hmg/<br/>GNB, HeroBanner, Footer"]
            ADMIN_C["admin/<br/>Dashboard, DataTable, Nav<br/>+ services/ (Provider Pattern)"]
            USER_C["user/<br/>ChatPage, TranslationPage<br/>+ services/ (Provider Pattern)"]
            LLM_C["llm-router/<br/>ModelTable, Playground<br/>+ services/ (Provider Pattern)"]
            ROI_C["roi/<br/>5종 SVG 차트,<br/>9개 대시보드 페이지"]
        end
    end
```

## 서비스 레이어 패턴

3개 앱(Admin, User, LLM Router)에 동일한 Provider Pattern 적용:

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

실제 API 전환 시 Mock Service를 API Service로 교체.

## 성능 최적화

```mermaid
graph LR
    subgraph "코드 스플리팅"
        DI["Dynamic Import<br/>22개 페이지"]
        SK["Skeleton Fallback<br/>Chart/Card/Table"]
    end

    subgraph "빌드 최적화"
        BA["Bundle Analyzer<br/>@next/bundle-analyzer"]
        TC["Turbo Cache<br/>inputs 필드로 선별 리빌드"]
    end

    subgraph "품질 측정"
        LH["Lighthouse CI<br/>6개 URL"]
        E2E["Playwright E2E<br/>18개+ 테스트"]
    end
```

## 디자인 토큰 흐름

```mermaid
graph LR
    T["tokens.css<br/>80+ CSS 변수"] --> G["globals.css<br/>@import + @theme inline"]
    G --> TW["Tailwind CSS 4<br/>유틸리티 클래스"]
    TW --> C["컴포넌트<br/>bg-primary, text-text-primary"]

    T --> |".dark 클래스"| DM["다크 모드<br/>자동 전환"]
```

## 앱별 라우트 구조

### Admin (17 routes)
```
/ (Dashboard)
/usage, /statistics, /users, /settings
/providers, /models, /features, /prompts, /agents
/departments, /audit-logs, /sso
/login
/roi/overview, /roi/adoption, /roi/productivity
/roi/analysis, /roi/organization, /roi/sentiment
/roi/reports, /roi/upload, /roi/settings
```

### User (5 routes)
```
/ (Chat), /translate, /docs, /ocr, /my-page
```

### LLM Router (10 routes)
```
/ (Landing), /dashboard, /models, /playground
/api-keys, /usage, /docs, /settings, /login, /register
```

### HMG (4 routes)
```
/ (Home), /publications, /guide, /dashboard
```

## CI/CD 파이프라인

```mermaid
graph LR
    subgraph "GitHub Actions"
        CI["CI<br/>type-check → lint → build"]
        LH["Lighthouse CI"]
        E2E["E2E Tests<br/>Playwright"]
    end

    subgraph "배포"
        GA["GitHub Pages<br/>(Wiki)"]
        VC["Vercel<br/>(5개 앱 + Storybook)"]
    end

    CI --> LH
    CI --> GA
    CI --> VC
    E2E --> |"배포 URL 테스트"| VC
```
