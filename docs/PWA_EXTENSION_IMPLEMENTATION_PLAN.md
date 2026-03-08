# H Chat PWA + Chrome Extension 통합 구현방안

> 8개 병렬 에이전트 분석 결과 통합 (2026-03-08)
> Gap 분석, PWA, IndexedDB, 훅 리팩토링, 오프라인/배포, Extension 매핑, Extension 보안, Extension 로드맵

---

## 1. 분석 요약

두 개의 상세 문서 (PWA 구현본 + Chrome Extension 구현본)를 현재 hchat-wiki 모노레포에 매핑 분석했다.

| 분석 영역 | 핵심 결론 |
|-----------|----------|
| Gap 분석 | PWA/IndexedDB/오프라인 = 미구현(NEW), 훅 분리 = 부분 구현, SSE = 현행 유지 |
| PWA 적용 | next-pwa 권장, 테마 `#4f6ef7`, CSP `worker-src 'self'` 추가 필요 |
| IndexedDB | 난이도 MEDIUM, Option A(최소변경) 우선, idb 라이브러리, ~1.5일 |
| 훅 리팩토링 | ChatPage 599줄 -> ~200줄, 4훅 분리, SSE Subscribe 패턴 유지 |
| 오프라인/배포 | API Routes 유지(rewrites 불필요), Vercel + SW 호환 OK |
| Extension 매핑 | `apps/extension/`에 배치, React 19 + Tailwind 4 통일, Vite 전용 |
| Extension 보안 | CRITICAL 2건, HIGH 3건 — 권한 축소 + API Gateway 경유 필수 |
| Extension 로드맵 | 4주, ~3,000 LOC, ~30 파일, Extension 우선 -> PWA 강화 |

---

## 2. 기존 구현 상태 (Week 1-3 완료)

| 항목 | 상태 | 파일 |
|------|------|------|
| FastAPI AI Core | DONE | `apps/ai-core/` (Dockerfile, routers, services, optimizer) |
| Token Entropy Encoder (TS) | DONE | `packages/ui/src/utils/text/` |
| API Gateway | DONE | `apps/user/app/api/` (chat, research, health + Rate Limit + Zod) |
| Chat/Research 모드 전환 | DONE | `ChatPage.tsx` (Chat/Research 토글, ResearchPanel) |
| MessageBubble 확장 | DONE | CompressionBadge, SourceAttribution |
| SSE 스트리밍 (Mock/Real) | DONE | `sseService.ts` (subscribe 패턴) |
| 한국어 Token Encoder | DONE | tokenizeKorean(), 불용어 72개 |
| 테스트 | DONE | 1,214 테스트 통과 |

---

## 3. Gap 분석: 기존 구현 vs PWA/Extension 문서

| 항목 | 상태 | 설명 |
|------|------|------|
| PWA manifest.json | NEW | 완전 미구현 |
| Service Worker | NEW | 완전 미구현 |
| PWA Install Banner | NEW | 완전 미구현 |
| IndexedDB | NEW | 현재 localStorage만 사용 |
| 오프라인 감지 | NEW | navigator.onLine 미사용 |
| useChat/useResearch 훅 | PARTIAL | ChatPage에 인라인 구현 (599줄) |
| InputArea 자동 높이 | PARTIAL | ChatSearchBar에 고정 rows=1 |
| Chat/Research TabBar | DONE | ChatPage에 인라인 구현 |
| SSE AsyncGenerator | CONFLICT | 현행 Subscribe 패턴 유지 권장 |
| Next.js rewrites | CONFLICT | 현행 API Routes 유지 권장 |
| Chrome Extension | NEW | 완전 미구현 |
| /analyze 엔드포인트 | NEW | 완전 미구현 |
| Extension <-> PWA 통신 | NEW | 완전 미구현 |

### 유지 결정 (변경 불필요)

| 항목 | 이유 |
|------|------|
| SSE Subscribe 패턴 | AbortController 처리 깔끔, Mock/Real 전환 용이, 타입 안전 |
| API Routes 프록시 | Zod 검증 + Rate Limiting + 서버사이드 URL 보안 확보 |
| ServiceFactory mock/real | 기존 패턴으로 Extension 연동도 즉시 가능 |

---

## 4. 아키텍처 설계

### 4.1 통합 아키텍처

```
                Chrome Extension (MV3)
                ┌─────────────────────┐
                │ content.ts          │ 페이지 텍스트 추출
                │ background.ts       │ 컨텍스트 메뉴, 라우팅
                │ popup/Popup.tsx     │ 미니 분석 UI
                └────────┬────────────┘
                         │ chrome.storage / messaging
                         ▼
┌────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 Apps)                         │
│  ┌──────────┐                                       │
│  │ User App │  PWA (manifest + SW + IndexedDB)      │
│  │ :3003    │  useChat / useResearch / useExtension  │
│  └────┬─────┘                                       │
│       ▼                                             │
│  ┌──────────────────────────────────────────┐       │
│  │  API Gateway (Next.js API Routes)        │       │
│  │  /api/chat, /api/research, /api/analyze  │       │
│  │  Zod + Rate Limit + 서버사이드 URL       │       │
│  └────────────────┬─────────────────────────┘       │
└───────────────────┼─────────────────────────────────┘
                    │ HTTP/SSE
                    ▼
┌───────────────────────────────────────────────────┐
│  AI Core (Python FastAPI) :8000                    │
│  /chat/stream  /research  /analyze                 │
│  Token Entropy Encoder + LLM Client                │
└───────────────────────────────────────────────────┘
```

### 4.2 디렉토리 구조 (신규 파일)

```
hchat-wiki/
├── apps/
│   ├── extension/                    # 신규: Chrome Extension
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   └── icons/
│   │   ├── src/
│   │   │   ├── content.ts           # 페이지 텍스트 추출
│   │   │   ├── background.ts        # Service Worker (MV3)
│   │   │   ├── popup/
│   │   │   │   ├── Popup.tsx         # 미니 분석 UI
│   │   │   │   └── components/
│   │   │   ├── utils/
│   │   │   │   ├── storage.ts        # chrome.storage 래퍼
│   │   │   │   └── sanitize.ts       # 민감 데이터 마스킹
│   │   │   └── types.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ai-core/
│   │   └── routers/
│   │       └── analyze.py            # 신규: 페이지 분석 엔드포인트
│   └── user/
│       ├── public/
│       │   ├── manifest.json         # 신규: PWA 매니페스트
│       │   ├── sw.js                 # 신규: Service Worker
│       │   └── icons/                # 신규: PWA 아이콘
│       └── app/api/
│           └── analyze/
│               └── route.ts          # 신규: /api/analyze 프록시
├── packages/ui/src/
│   ├── user/
│   │   ├── hooks/                    # 신규 디렉토리
│   │   │   ├── useChat.ts            # ChatPage에서 추출
│   │   │   ├── useResearch.ts        # ChatPage에서 추출
│   │   │   ├── useConversations.ts   # ChatPage에서 추출
│   │   │   └── useExtensionContext.ts # Extension 데이터 수신
│   │   ├── components/
│   │   │   ├── PageContextBanner.tsx  # 신규: Extension 컨텍스트 배너
│   │   │   └── InstallBanner.tsx      # 신규: PWA 설치 배너
│   │   └── services/
│   │       ├── extensionTypes.ts      # 신규: Extension 공유 타입
│   │       └── indexedDbService.ts    # 신규: IndexedDB 서비스
│   └── hooks/
│       ├── useNetworkStatus.ts       # 신규: 오프라인 감지
│       └── usePWAInstall.ts          # 신규: PWA 설치 훅
```

---

## 5. PWA 구현 상세

### 5.1 manifest.json

```json
{
  "name": "H Chat",
  "short_name": "HChat",
  "description": "AI Chat + Research Assistant",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#4f6ef7",
  "background_color": "#f8fafc",
  "lang": "ko",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

테마 컬러 `#4f6ef7`은 현재 `--user-primary` 토큰과 일치.

### 5.2 Service Worker 전략

| 리소스 | 캐싱 전략 | 이유 |
|--------|----------|------|
| `_next/static/` (JS/CSS) | Cache First | 빌드 해시 포함, 변경 없음 |
| HTML 페이지 | Network First | 최신 우선, 오프라인 시 캐시 |
| 이미지/아이콘 | Cache First | 변경 드묾 |
| `/api/*` 응답 | Network Only | 실시간성 필수 |
| SSE 스트림 | Network Only | 캐싱 불가 |

### 5.3 next-pwa vs 수동 구현

| 기준 | next-pwa | 수동 구현 |
|------|---------|----------|
| 설정 난이도 | LOW | HIGH |
| 커스터마이징 | 제한적 | 완전 제어 |
| Next.js 호환 | 자동 | 수동 관리 |
| 번들 크기 | +50KB (Workbox) | 최소 |
| Vercel 배포 | 호환 | 호환 |

**결정**: 수동 구현 권장 (모노레포 복잡도 고려, 최소 의존성 원칙)

### 5.4 Layout 메타데이터 추가

```typescript
// apps/user/app/layout.tsx 수정
export const metadata: Metadata = {
  // 기존 메타데이터 유지
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'H Chat',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f6ef7',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}
```

### 5.5 CSP 헤더 수정

```typescript
// apps/user/next.config.ts 보안 헤더 추가
"worker-src 'self';"   // Service Worker 허용
"script-src 'self' blob:;"  // blob: 추가
```

---

## 6. IndexedDB 마이그레이션

### 6.1 현재 vs 목표

| 항목 | 현재 (localStorage) | 목표 (IndexedDB) |
|------|-------------------|-----------------|
| 용량 | 5-10MB 제한 | 수백MB+ |
| API | 동기식 (블로킹) | 비동기식 |
| 검색 | 전체 배열 순회 | 인덱스 기반 |
| 저장 구조 | JSON 문자열 | 구조화 객체 |

### 6.2 권장 스키마 (Option A: 최소 변경)

```typescript
// packages/ui/src/user/services/indexedDbService.ts
import { openDB } from 'idb'

const DB_NAME = 'hchat-user'
const DB_VERSION = 1

// 기존 인터페이스 유지, 구현만 변경
// conversations store: keyPath='id'
// assistants store: keyPath='id'
```

기존 `chatService.ts`의 인터페이스 (getConversations/saveConversations)를 유지하면서 내부 구현만 IndexedDB로 교체.

### 6.3 마이그레이션 전략

1. **Phase 1**: idb 설치 + IndexedDB 서비스 구현
2. **Phase 2**: 듀얼 모드 (읽기: IndexedDB 우선 + localStorage fallback)
3. **Phase 3**: localStorage -> IndexedDB 자동 이전 로직
4. **Phase 4**: localStorage 제거

### 6.4 난이도: MEDIUM (~1.5일)

- idb는 TypeScript 네이티브 지원
- 기존 서비스 레이어 분리가 잘 되어 있음
- 테스트: fake-indexeddb 라이브러리로 모킹

---

## 7. ChatPage 훅 리팩토링

### 7.1 현재 문제

- ChatPage.tsx: **599줄**, 상태 12개, useCallback 13개, useEffect 5개
- 단일 파일에 대화/메시지/스트리밍/리서치/어시스턴트/UI 모든 로직 집중

### 7.2 훅 분리 계획

| 훅 | 책임 | 추출 대상 |
|----|------|----------|
| `useConversations` | 대화 CRUD, localStorage 동기화 | conversations state, CRUD callbacks |
| `useChat` | SSE 스트리밍, 메시지 처리 | handleSendChatMessage, abort, isStreaming |
| `useResearch` | Research API 호출, 결과 처리 | handleSendResearchMessage, isResearching |
| `useAssistants` | 어시스턴트 관리 | allAssistants, custom CRUD, modal state |

### 7.3 예상 결과

- ChatPage.tsx: 599줄 -> ~200줄 (67% 감소)
- 각 훅 독립 테스트 가능
- user 도메인 커버리지 41.78% -> 60%+ 가능

### 7.4 리팩토링 순서 (안전한 순서)

1. useConversations 추출 (가장 안전, 독립적)
2. useAssistants 추출 (독립적)
3. useResearch 추출 (단순 async)
4. useChat 추출 (SSE abort 주의)
5. 통합 테스트 작성

### 7.5 SSE 패턴 결정

**현행 Subscribe 패턴 유지.** AsyncGenerator 전환 불필요.

| 기준 | Subscribe (현행) | AsyncGenerator (PWA 문서) |
|------|-----------------|-------------------------|
| AbortController | 깔끔 | 복잡 |
| 타입 안전성 | 좋음 | 보통 |
| Mock/Real 전환 | 용이 | 동일 |
| 코드 가독성 | 콜백 기반 | for-await 선언적 |

---

## 8. Chrome Extension 구현 상세

### 8.1 모노레포 배치

**`apps/extension/`** (옵션 A 선택)

| 기준 | apps/ | packages/ | 별도 레포 |
|------|-------|-----------|----------|
| 의미적 적합성 | 앱 O | 라이브러리 X | - |
| 타입 공유 | 모노레포 내 | 동일 | 어려움 |
| 빌드 통합 | Turbo 가능 | 동일 | 불가 |
| 배포 독립성 | 충분 | 동일 | 완전 |

### 8.2 의존성 호환성

| 의존성 | Extension 요구 | 현재 모노레포 | 해결 |
|--------|---------------|-------------|------|
| React | 18 (문서) | 19.2.3 | **19로 통일** |
| Tailwind CSS | 3 (문서) | 4 | **4로 통일** |
| Vite | 5 | 없음 | Extension 전용 |
| @types/chrome | 필수 | 없음 | Extension에 추가 |

### 8.3 핵심 기능

| 기능 | 설명 | 재사용 가능 코드 |
|------|------|----------------|
| content.ts | 페이지 텍스트/선택영역 추출 | - |
| background.ts | 컨텍스트 메뉴, storage sync | - |
| Popup.tsx | 4모드 분석 UI (요약/설명/리서치/번역) | MessageBubble 패턴 |
| /analyze | 페이지 분석 엔드포인트 | llm_client, summarizer |
| useExtensionContext | Extension 데이터 수신 훅 | - |
| PageContextBanner | Extension 컨텍스트 표시 | 디자인 토큰 공유 |

### 8.4 Extension <-> PWA 통신

**시나리오 A: 팝업 직접 분석**
```
사용자 팝업 클릭 -> content.ts 텍스트 추출 -> popup 표시
-> 분석 버튼 -> API Gateway /api/analyze -> AI Core /analyze
-> 팝업에 스트리밍 결과
```

**시나리오 B: PWA 연동**
```
우클릭 "H Chat으로 분석" -> background.ts 컨텍스트 수집
-> chrome.storage.local에 저장 -> PWA 탭 열기/포커스
-> useExtensionContext가 storage 읽기 -> PageContextBanner 표시
-> "분석 시작" 클릭 -> useChat.sendMessage -> 스트리밍 응답
```

---

## 9. 보안 분석

### 9.1 Extension 보안 위험

| 심각도 | 위험 | 완화 방안 |
|--------|------|----------|
| CRITICAL | `<all_urls>` host_permissions | `optional_host_permissions`로 변경, 사용자 허용 사이트만 |
| CRITICAL | 민감 페이지 텍스트 자동 추출 | 민감 사이트 차단 목록 + 사용자 동의 UI |
| HIGH | CORS `chrome-extension://*` | 특정 Extension ID만 허용 |
| HIGH | Popup -> FastAPI 직접 호출 | API Gateway 경유 강제 |
| HIGH | chrome.storage 평문 저장 | 데이터 만료 정책 (5분) |
| MEDIUM | MV3 CSP + React 충돌 | 빌드 시 인라인 스크립트 제거 |
| MEDIUM | web_accessible_resources fingerprinting | 특정 도메인으로 제한 |
| LOW | activeTab 권한 | 현재 수준 적절 |

### 9.2 권장 최소 권한 Manifest

```json
{
  "permissions": ["activeTab", "storage", "contextMenus"],
  "host_permissions": [],
  "optional_host_permissions": ["https://*/*"]
}
```

- `scripting` 제거 (activeTab으로 충분)
- `<all_urls>` 제거 -> optional로 전환
- 사용자 명시적 허용 필요

### 9.3 API 경유 강제

```
Extension -> Next.js /api/analyze -> AI Core /analyze
                ↓
           [Rate Limit: 10/min]
           [Zod 검증]
           [서버사이드 URL]
```

Extension이 AI Core (localhost:8000) 직접 호출 금지.

### 9.4 콘텐츠 살균 (Sanitization)

```typescript
// 민감 패턴 마스킹
text
  .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
  .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
  .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
```

---

## 10. 오프라인 지원

### 10.1 지원 범위

| 기능 | 오프라인 가능? | 방법 |
|------|--------------|------|
| 기존 대화 열람 | O | IndexedDB에서 읽기 |
| UI 셸 표시 | O | SW 캐싱 |
| 로컬 검색/필터 | O | IndexedDB 인덱스 |
| 새 AI 대화 | X | API 필수 |
| Research 검색 | X | API 필수 |
| Extension 분석 | X | API 필수 |

### 10.2 오프라인 UX

- 상단 배너: "오프라인 모드 - 캐시된 대화만 열람 가능"
- 입력 필드 비활성화 + 툴팁
- 새 대화 버튼 비활성화

### 10.3 네트워크 감지

```typescript
// useNetworkStatus 훅
// 1. navigator.onLine 기본 체크
// 2. /api/health fetch로 실제 검증 (1s timeout)
// 3. online/offline 이벤트 리스너
// 4. 30초 주기적 체크
```

---

## 11. 구현 로드맵

### Phase A: PWA 기반 + 훅 리팩토링 (Week 1)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| ChatPage 훅 분리 (useConversations, useChat, useResearch, useAssistants) | packages/ui/src/user/hooks/ | 중간 |
| PWA manifest.json + 아이콘 | apps/user/public/ | 낮음 |
| Service Worker (정적 자산 캐싱) | apps/user/public/sw.js | 중간 |
| layout.tsx PWA 메타데이터 | apps/user/app/layout.tsx | 낮음 |
| CSP 헤더 수정 (worker-src) | apps/user/next.config.ts | 낮음 |
| useNetworkStatus 훅 | packages/ui/src/hooks/ | 낮음 |
| usePWAInstall 훅 | packages/ui/src/hooks/ | 낮음 |
| InstallBanner 컴포넌트 | packages/ui/src/user/components/ | 낮음 |

**검증**: PWA Lighthouse 검사, 훅 단위 테스트, ChatPage 정상 동작

### Phase B: IndexedDB + 오프라인 (Week 2)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| idb 라이브러리 설치 | package.json | 낮음 |
| IndexedDB 서비스 구현 | packages/ui/src/user/services/indexedDbService.ts | 중간 |
| localStorage -> IndexedDB 마이그레이션 | chatService.ts, assistantService.ts | 중간 |
| 오프라인 UI (배너, 입력 비활성화) | ChatPage, UserGNB | 낮음 |
| 테스트 (fake-indexeddb) | __tests__/indexedDb.test.ts | 중간 |

**검증**: DevTools IndexedDB 확인, 오프라인 모드 동작, 마이그레이션 정상

### Phase C: Chrome Extension 기본 (Week 3)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| Extension 프로젝트 셋업 (Vite + React 19) | apps/extension/ | 중간 |
| manifest.json (최소 권한) | apps/extension/public/ | 낮음 |
| content.ts (텍스트 추출 + 살균) | apps/extension/src/ | 중간 |
| background.ts (컨텍스트 메뉴) | apps/extension/src/ | 낮음 |
| Popup.tsx (4모드 분석 UI) | apps/extension/src/popup/ | 중간 |
| FastAPI /analyze 엔드포인트 | apps/ai-core/routers/analyze.py | 낮음 |
| API Gateway /api/analyze | apps/user/app/api/analyze/ | 낮음 |

**검증**: Extension 로드, 팝업 동작, 분석 결과 표시

### Phase D: Extension <-> PWA 통합 + 보안 (Week 4)

| 작업 | 파일 | 난이도 |
|------|------|--------|
| useExtensionContext 훅 | packages/ui/src/user/hooks/ | 중간 |
| PageContextBanner 컴포넌트 | packages/ui/src/user/components/ | 낮음 |
| ChatPage Extension 통합 | ChatPage.tsx | 낮음 |
| 민감 사이트 차단 목록 | apps/extension/src/utils/ | 중간 |
| Extension CORS 설정 (특정 ID) | apps/ai-core/main.py | 낮음 |
| E2E 테스트 | tests/extension/ | 높음 |
| Chrome Web Store 준비 | apps/extension/store/ | 낮음 |

**검증**: 우클릭 -> PWA 연동, 보안 체크리스트, E2E 통과

---

## 12. 비용 예측 (추가분)

| 항목 | 예상 비용 | 비고 |
|------|----------|------|
| Chrome Web Store 개발자 등록 | $5 (1회) | 개발자 계정 |
| /analyze API 비용 | 기존 범위 내 | /chat과 동일 LLM 사용 |
| PWA 아이콘 디자인 | $0 | Figma/AI 생성 |
| 추가 서버 비용 | $0 | 기존 인프라 활용 |

---

## 13. 위험 요소 및 대응

| 위험 | 영향도 | 대응 |
|------|--------|------|
| Extension 권한 남용 | 높음 | optional_host_permissions + 민감 사이트 차단 |
| IndexedDB 마이그레이션 데이터 손실 | 중간 | 듀얼 모드 + localStorage 백업 유지 |
| ChatPage 훅 분리 시 회귀 | 중간 | 단계별 추출 + 각 단계 테스트 |
| Chrome Store 심사 거절 | 낮음 | 최소 권한 원칙 준수 |
| Vite + Turbo 빌드 충돌 | 낮음 | 별도 빌드 스크립트 분리 |
| MV3 SW 수명 이슈 | 낮음 | 짧은 작업 단위 설계 |
| iOS Safari PWA 제한 | 낮음 | 수동 설치 안내 표시 |

---

## 14. 성공 기준

### PWA
- [ ] Lighthouse PWA 점수 90+
- [ ] 오프라인에서 기존 대화 열람 가능
- [ ] PWA 설치 프롬프트 표시
- [ ] IndexedDB에 대화 정상 저장

### 훅 리팩토링
- [ ] ChatPage.tsx 200줄 이하
- [ ] 각 훅 독립 테스트 통과
- [ ] 기존 기능 회귀 없음

### Chrome Extension
- [ ] 모든 페이지에서 텍스트 추출 정상
- [ ] 4가지 분석 모드 동작
- [ ] Extension -> PWA 컨텍스트 전달 정상
- [ ] 민감 사이트 차단 동작
- [ ] Chrome Web Store 심사 통과

### 전체
- [ ] 전체 테스트 통과 (1,214 + 신규)
- [ ] 빌드 성공 (모든 앱 + Extension)
- [ ] 보안 체크리스트 완료

---

## 15. 다음 단계 (Phase D 이후)

프로토타입 안정화 후 검토:
1. YouTube 자막 추출 분석 (Extension 기능 확장)
2. PDF 드래그 앤 드롭 (Extension + PWA)
3. 세션 사이드바 UI
4. Extension Side Panel API 활용
5. 백그라운드 동기화 (오프라인 작성 -> 온라인 전송)
