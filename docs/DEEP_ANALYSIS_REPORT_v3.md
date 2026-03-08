# hchat-wiki Deep Analysis Report v3

> 분석일: 2026-03-08 | 5개 병렬 에이전트 심층분석 결과

## Executive Summary

| 영역 | 점수 | 등급 | 핵심 이슈 |
|------|------|------|----------|
| Architecture | 8.1/10 | A- | 'use client' 남용, 서버상태 캐싱 부재 |
| Security | 4/10 | F | CSRF 없음, Zod 0건, CSP 없음 |
| Code Quality | 7.5/10 | B+ | any 0개(완벽), 데드코드 73파일 |
| Test Coverage | 5/10 | D | 51.81% (목표 80%), 인증 0% |
| Build & Perf | 7/10 | B | node_modules 792MB, lucide-react 45MB |
| **종합** | **6.3/10** | **C+** | **프로토타입→프로덕션 전환 필요** |

## Project Metrics

| 항목 | 값 |
|------|-----|
| TS/TSX 파일 | 584 (UI 265) |
| 총 LOC | 57,207 |
| 컴포넌트 | 160 exports |
| 커스텀 훅 | 61개 |
| 서비스 | 42 파일 (27 registry) |
| 페이지 | 56 (page.tsx) |
| 테스트 | 872 단위 + 18 E2E |
| node_modules | 792MB / 929 패키지 |
| 'use client' | 210 파일 |
| any 타입 | **0개** |

---

## 1. Architecture Analysis

### 1.1 Monorepo Structure
```
@hchat/tokens  -->  @hchat/ui-core  -->  @hchat/ui (re-export hub)
                                            ├── @hchat/ui-admin   (53.6% LOC)
                                            ├── @hchat/ui-user    (12.7%)
                                            ├── @hchat/ui-roi     (8.5%)
                                            └── @hchat/ui-llm-router (12.6%)
                                          All 7 apps depend on @hchat/ui
```

- Circular dependencies: **None** (clean)
- Package cohesion: **HIGH** (domain-based)
- Package coupling: **MEDIUM** (re-export pattern creates indirect coupling)

### 1.2 Layer Separation

| Layer | Implementation | Quality |
|-------|---------------|---------|
| Presentation | 210 'use client' components | MEDIUM - Server Component 미활용 |
| Business | 42 services, 8 Context Providers | HIGH - Provider 패턴 일관적 |
| Data | Mock/Real API abstraction | MEDIUM - 실제 API 구현 없음 |

### 1.3 State Management

| 상태 유형 | 구현 | 이슈 |
|----------|------|------|
| Global | 8 Context Providers | OK |
| Local | useState (useReducer 미사용) | OK |
| Server | 61 custom hooks, 캐싱 없음 | **HIGH** - React Query/SWR 필요 |
| Persistent | localStorage 40+ 위치 | **HIGH** - 보안 취약 |

### 1.4 Component Size Distribution

| 범위 | 개수 | 비고 |
|------|------|------|
| <100 LOC | 대부분 | Badge(11), ThemeToggle(22) |
| 100-200 | ~30개 | DesktopSidebar(119) |
| 200-400 | ~15개 | ModelTable(255) |
| >400 | 4개 | **ChatPage(429)** - 분할 필요 |

### 1.5 Architecture Issues

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| A1 | HIGH | 'use client' 210파일, Server Component 미활용 | packages/ui/src 전역 |
| A2 | HIGH | 서버 상태 캐싱 부재 (React Query/SWR 없음) | 61개 custom hooks |
| A3 | MEDIUM | ChatPage 429 LOC 초과 | packages/ui/src/user/pages/ChatPage.tsx |
| A4 | MEDIUM | ISR/SSG 미활용, 대부분 CSR | 모든 앱 |
| A5 | MEDIUM | 서브패키지 독립성 미완성 | packages/ui-* 상호참조 |
| A6 | LOW | 실제 API 구현 없음 (전체 Mock) | packages/ui/src/*/services |

---

## 2. Security Analysis (Score: 4/10)

### 2.1 Vulnerability Summary

| Severity | Count | Items |
|----------|-------|-------|
| CRITICAL | 3 | CSRF 없음, Zod 0건, xlsx CVE |
| HIGH | 5 | CSP 없음, token in sessionStorage, localStorage auth |
| MEDIUM | 4 | 테스트 자격증명 하드코딩, console.error 노출 |
| LOW | 2 | WebSocket 미사용(mock), Storybook 예제 키 |

### 2.2 Critical Vulnerabilities

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| S1 | **CSRF 보호 없음** | 프로젝트 전체 | Cross-Site Request Forgery 가능 |
| S2 | **Zod 검증 0건** | validation.ts (커스텀만) | 타입 안전 검증 부재, XSS/Injection 위험 |
| S3 | **xlsx 0.18.5 CVE** | packages/ui/package.json:36 | Prototype Pollution + ReDoS |

### 2.3 High Vulnerabilities

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| S4 | CSP 헤더 없음 | 모든 next.config.ts | XSS 추가 방어 없음 |
| S5 | Token in sessionStorage | admin/auth/mockAuthService.ts:41-42 | XSS시 토큰 탈취 |
| S6 | localStorage auth token | client/serviceFactory.ts:24 | 영구 탈취 가능 |
| S7 | 보안헤더 3/7앱만 적용 | wiki, desktop, mobile 미적용 | 부분적 보호 |
| S8 | 비밀번호 검증 미구현 | admin/auth/mockAuthService.ts:33-35 | 인증 우회 |

### 2.4 Resolved Items
- Next.js 16.1.6 업데이트 완료 (CVE 해결)
- xlsx Web Worker 격리 구현 완료
- 파일 업로드 크기 제한 50MB + 타임아웃 30초 구현

---

## 3. Code Quality Analysis

### 3.1 Strengths
- **any 타입: 0개** - 완벽한 타입 안전성
- **순환 의존성: 없음** - 클린 의존성 그래프
- **구조적 일관성** - 도메인별 폴더 명확

### 3.2 Issues Found

| ID | Severity | Issue | Detail |
|----|----------|-------|--------|
| Q1 | CRITICAL | 미사용 파일 73개 | apps/wiki/components/, stories/ 등 |
| Q2 | CRITICAL | Unlisted 의존성 126개 | postcss, @storybook/react 등 package.json 미등록 |
| Q3 | HIGH | 미사용 의존성 29개 | @hchat/tokens(앱에서), xlsx(ui-roi) 등 |
| Q4 | HIGH | StatCard 3중 중복 | admin/StatCard, roi/KPICard, hmg/HmgStatCard |
| Q5 | HIGH | 대형 파일 2개 | admin-pages.test.tsx(1,155줄), mockData.ts(1,099줄) |
| Q6 | MEDIUM | 미사용 exports 48개 | getNavigation(), getHeadings(), 43 types |
| Q7 | MEDIUM | console.log 19곳 | ErrorBoundary, chatService, 11 storybook |
| Q8 | MEDIUM | 매직 넘버 다수 | COST_PER_TOKEN=0.000015, HOURLY_LABOR_COST=45000 |

### 3.3 Estimated Cleanup Impact

| Action | Effect |
|--------|--------|
| 데드코드 제거 (73파일, 48 exports) | 번들 30-40% 감소 |
| 미사용 의존성 제거 (29패키지) | node_modules 200MB+ 감소 |
| StatCard 통합 (3->1) | 유지보수 비용 66% 감소 |
| 'use client' 최적화 (~50개 전환) | 초기 로드 2-3초 단축 |

---

## 4. Test Coverage Analysis

### 4.1 Coverage Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Statements | **51.81%** | 80% | -28.19% |
| Branches | **41.31%** | 80% | -38.69% |
| Functions | **51.56%** | 80% | -28.44% |
| Lines | **51.67%** | 80% | -28.33% |

### 4.2 Coverage by Domain

| Domain | Coverage | Status |
|--------|----------|--------|
| src (common) | 78.37% | OK |
| admin/services | 72.58% | OK |
| roi | 69.70% | MEDIUM |
| utils | 69.23% | MEDIUM |
| user | 41.78% | LOW |
| admin/auth | 43.28% | LOW |
| desktop | 38.88% | LOW |
| mobile | 30.00% | LOW |
| admin (pages) | 30.08% | LOW |
| **llm-router** | **10.38%** | **CRITICAL** |

### 4.3 Zero Coverage Critical Files

**Authentication (0%)**:
- `admin/auth/authService.ts`
- `admin/auth/AuthProvider.tsx`
- `admin/auth/ProtectedRoute.tsx`

**Core Services (0%)**:
- `admin/services/apiService.ts`
- `admin/services/enterpriseApi.ts`
- `client/serviceFactory.ts`

**ROI Core (0%)**:
- `roi/ROIDataUpload.tsx`
- `roi/xlsxWorker.ts`

**Hooks (0%)**:
- `admin/services/hooks.ts` (27 hooks)
- `user/services/hooks.ts`
- `mobile/services/mobileHooks.ts`

### 4.4 Test Anti-patterns
- React act() warnings: **71개**
- MSW handlers 39개 중 3개 파일에서만 사용
- 직접 모킹 과다, MSW 미활용
- 약한 assertion (`toBeDefined()` 등)

---

## 5. Build & Performance Analysis

### 5.1 Bundle Size: Heavy Dependencies

| Package | Size | Severity | Note |
|---------|------|----------|------|
| lucide-react | 45MB | CRITICAL | Tree-shaking 검증 필요 |
| highlight.js | 9.1MB | MEDIUM | wiki에서만 사용, 전체 언어팩 포함 |
| xlsx | 7.2MB | CRITICAL | CVE 존재 |
| codepage | 5.9MB | MEDIUM | xlsx 의존성 |
| zod | 6.0MB | MEDIUM | 설치만, 사용 0건 |

### 5.2 Build Configuration

| App | output | bundleAnalyzer | securityHeaders | Dynamic Imports |
|-----|--------|----------------|-----------------|-----------------|
| wiki | export | No | No | 0 |
| admin | (server) | Yes | 6 headers | 18 |
| hmg | (server) | Yes | 6 headers | 0 |
| user | (server) | Yes | 6 headers | 5 |
| llm-router | (server) | Yes | 6 headers | 2 |
| desktop | export | No | No | 5 |
| mobile | export | No | No | 1 |

### 5.3 Performance Positives
- Dynamic import + Skeleton: **31 pages** (code splitting)
- Turbo cache: 6/15 tasks HIT
- Tailwind CSS 4 @source: 6/7 apps configured

### 5.4 Build Issues

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| B1 | CRITICAL | lucide-react 45MB 번들 | 26개 컴포넌트 사용 |
| B2 | HIGH | eslint-config-next 16.1.1 vs next 16.1.6 | 7개 앱 package.json |
| B3 | HIGH | 서브패키지 5개 npm ls missing | package-lock.json 미반영 |
| B4 | HIGH | CI npm ci 중복 실행 (2-3분 낭비) | .github/workflows/ci.yml |
| B5 | HIGH | .env.example 부재 | 프로젝트 루트 |
| B6 | MEDIUM | Turbo Remote Cache 미활용 | turbo.json |
| B7 | MEDIUM | wiki @source 누락 | apps/wiki/app/globals.css |
| B8 | MEDIUM | highlight.js 전체 import | wiki/MarkdownRenderer.tsx |
| B9 | MEDIUM | Lighthouse numberOfRuns: 1 | lighthouserc.js |

---

## Consolidated Issue Tracker

### CRITICAL (즉시 조치 - 8건)

| # | Category | Issue | Action |
|---|----------|-------|--------|
| 1 | Security | CSRF 보호 없음 | CSRF 토큰 + SameSite 쿠키 구현 |
| 2 | Security | Zod 검증 0건 | 모든 API boundary에 Zod 스키마 적용 |
| 3 | Security | xlsx 0.18.5 CVE | ExcelJS 대체 또는 서버사이드 전환 |
| 4 | Quality | 미사용 파일 73개 | knip으로 식별 후 제거 |
| 5 | Quality | Unlisted 의존성 126개 | package.json 정리 |
| 6 | Build | lucide-react 45MB | 개별 아이콘 import 또는 tree-shaking 검증 |
| 7 | Test | llm-router 커버리지 10.38% | 핵심 컴포넌트 테스트 추가 |
| 8 | Test | 인증(auth) 커버리지 0% | authService, AuthProvider 테스트 필수 |

### HIGH (1-2주 내 - 15건)

| # | Category | Issue | Action |
|---|----------|-------|--------|
| 9 | Security | CSP 헤더 없음 | Content-Security-Policy 추가 |
| 10 | Security | Token in sessionStorage | httpOnly 쿠키 전환 |
| 11 | Security | localStorage auth | 보안 저장소 마이그레이션 |
| 12 | Security | 보안헤더 3/7앱 미적용 | wiki, desktop, mobile에 적용 |
| 13 | Arch | 'use client' 210파일 | 순수 표시 컴포넌트 50+개 서버 전환 |
| 14 | Arch | 서버 상태 캐싱 부재 | React Query 도입 |
| 15 | Quality | 미사용 의존성 29개 | 패키지 제거 |
| 16 | Quality | StatCard 3중 중복 | BaseStatCard로 통합 |
| 17 | Quality | 대형 파일 2개 (1000+줄) | 800줄 이하로 분할 |
| 18 | Build | eslint-config-next 버전 불일치 | 16.1.6으로 업그레이드 |
| 19 | Build | 서브패키지 npm ls missing | npm install 재실행 |
| 20 | Build | CI npm ci 중복 | artifact 캐시 공유 |
| 21 | Build | .env.example 부재 | 환경변수 템플릿 생성 |
| 22 | Build | Zod 6MB 설치, 사용 0건 | 실제 적용 또는 제거 |
| 23 | Test | 커버리지 51.81% -> 80% | Phase별 테스트 추가 계획 실행 |

### MEDIUM (1개월 내 - 18건)

| # | Category | Issue |
|---|----------|-------|
| 24 | Security | 테스트 자격증명 하드코딩 (admin@hchat.ai / Admin123!) |
| 25 | Security | console.error 프로덕션 노출 |
| 26 | Arch | ChatPage 429 LOC 분할 |
| 27 | Arch | ISR/SSG 미활용 |
| 28 | Arch | 서브패키지 상호참조 패턴 |
| 29 | Quality | 미사용 exports 48개 |
| 30 | Quality | console.log 19곳 |
| 31 | Quality | 매직 넘버 (COST_PER_TOKEN 등) |
| 32 | Build | Turbo Remote Cache 미활용 |
| 33 | Build | turbo.json env NEXT_PUBLIC_* 누락 |
| 34 | Build | wiki @source 누락 |
| 35 | Build | highlight.js 전체 import (9.1MB) |
| 36 | Build | Docker 기본 비밀번호 하드코딩 |
| 37 | Build | Lighthouse numberOfRuns: 1 |
| 38 | Build | xlsx 이중 선언 (ui + ui-roi) |
| 39 | Build | admin CSS @source 과도 |
| 40 | Test | React act() 경고 71개 |
| 41 | Test | MSW 핸들러 활용도 낮음 (39개 중 3파일) |

---

## Improvement Roadmap

### Phase A: Security Hardening (Week 1)
```
- CSRF 토큰 구현
- Zod 스키마 전면 도입 (API boundary)
- CSP + 보안 헤더 전 앱 적용
- Token 저장: sessionStorage -> httpOnly cookie
- xlsx -> ExcelJS 대체 검토
```

### Phase B: Code Cleanup (Week 2)
```
- knip으로 데드코드 73파일 제거
- 미사용 의존성 29개 제거
- StatCard 3중복 -> BaseStatCard 통합
- 대형 파일 분할 (ChatPage, mockData, test)
- console.log/매직넘버 정리
```

### Phase C: Test Coverage 80% (Week 3-4)
```
Week 3:
- 인증: authService, AuthProvider, ProtectedRoute (0% -> 80%)
- 핵심 API: apiService, enterpriseApi, serviceFactory (0% -> 80%)
- ROI: ROIDataUpload, xlsxWorker (0% -> 80%)

Week 4:
- llm-router 전체 (10% -> 60%)
- admin pages (30% -> 60%)
- user services (41% -> 80%)
- E2E: auth flow, ROI upload, chat conversation
```

### Phase D: Performance Optimization (Week 5-6)
```
- React Query 도입 (서버 상태 캐싱)
- 'use client' 50개 Server Component 전환
- lucide-react tree-shaking 또는 개별 import
- highlight.js 필요 언어만 import
- Turbo Remote Cache 활성화
- CI 파이프라인 최적화
```

### Phase E: Production API (Week 7-9)
```
- Backend API 스펙 정의 (OpenAPI)
- API Client 실제 구현
- Mock -> Real 점진적 전환
- ISR/SSG 적용
- 에러 처리 + 재시도 로직
```

---

## Score Targets

| Area | Current | After Phase A-B | After Phase C-D | Target |
|------|---------|-----------------|-----------------|--------|
| Architecture | 8.1 | 8.5 | 9.0 | 9.0+ |
| Security | 4.0 | 7.5 | 8.0 | 8.0+ |
| Code Quality | 7.5 | 9.0 | 9.0 | 9.0+ |
| Test Coverage | 5.0 | 5.0 | 8.0 | 8.0+ |
| Build & Perf | 7.0 | 7.5 | 8.5 | 8.5+ |
| **Overall** | **6.3** | **7.5** | **8.5** | **8.5+** |
