# hchat-wiki 모노레포 심층분석 종합 리포트

> 분석일: 2026-03-08 | 6개 병렬 에이전트 분석 결과 종합

---

## Executive Summary

| 항목 | 수치 |
|------|------|
| 앱 | 11개 (wiki, hmg, admin, user, llm-router, desktop, mobile, extension, ai-core, storybook) |
| 패키지 | 7개 (tokens, ui, ui-admin, ui-core, ui-llm-router, ui-roi, ui-user) |
| TS/TSX 파일 | 568개 (ui 308 + apps 260) |
| 추정 LOC | ~45,374줄 |
| 컴포넌트 | 137개 |
| 훅 | 69개 |
| 서비스 | 48개 |
| 단위 테스트 | 128 파일, 2,647 테스트 |
| 커버리지 | 83.1% stmts |
| E2E 테스트 | 18 파일 |
| Storybook | 135 스토리 |
| 빌드 | 9/9 pass |

### 종합 등급

| 영역 | 등급 | 핵심 이슈 |
|------|------|----------|
| 아키텍처 | **B+** | 명확한 계층 구조, 단 packages/ui 과대 (308파일) |
| 코드 품질 | **B** | 일관된 패턴, 중복 ~300줄, 대형 파일 1개 |
| 보안 | **C+** | 기본 보안 구현됨, CRITICAL 2건 (mock 인증) |
| 테스트 | **A-** | 83.1% 커버리지, 실시간 컴포넌트 갭 존재 |
| 빌드/인프라 | **B+** | Turbo 최적화됨, Admin 278MB 빌드 문제 |
| 문서화 | **B-** | 설계 문서 A, JSDoc 6-10%로 미흡 |

---

## 1. 아키텍처 & 의존성 (W1)

### 의존성 그래프

```
@hchat/tokens → @hchat/ui-core → @hchat/ui → 모든 앱
                                      |
                    ┌─────────────────┼─────────────────────┐
                    |        |        |        |             |
                  wiki    hmg     admin    user    llm-router ...
                                    |
                              ai-core (FastAPI)
```

- 순환 의존성: **없음**
- 단방향 계층: tokens → ui → apps

### 공유 코드 비율

| 영역 | 파일 수 | 비율 |
|------|---------|------|
| packages/ui (공유) | 308 | 72.5% |
| apps (독립) | 260 | 27.5% |

### packages/ui 내부 구조

| 디렉토리 | 파일 수 | 역할 |
|----------|---------|------|
| admin/ | 84 | Admin 컴포넌트/서비스 (최대) |
| user/ | 36 | User 컴포넌트/서비스 |
| roi/ | 24 | ROI 대시보드/차트 |
| llm-router/ | 21 | LLM Router 모델/서비스 |
| hmg/ | 12 | HMG 사이트 컴포넌트 |
| mobile/ | 10 | 모바일 PWA |
| desktop/ | 8 | 데스크톱 에이전트 UI |
| mocks/ | 8 | MSW 핸들러 |
| schemas/ | 9 | Zod 스키마 |
| utils/ | 15 | 유틸리티 |
| client/ | 4 | API 클라이언트 |
| i18n/ | 4 | 다국어 |

### 확장성 병목

1. **packages/ui 과대**: 308파일 단일 패키지 → 변경 시 모든 앱 재빌드
2. **번들 크기**: 각 앱이 불필요한 도메인 코드 포함
3. **레거시 패키지**: ui-admin, ui-core 등 6개가 stub만 존재 (실제 분리 안 됨)
4. **Mock 데이터 번들링**: 프로덕션에 1,000줄+ mock 데이터 포함 위험

---

## 2. 코드 품질 & 중복 (W2)

### 중복 코드 (HIGH)

| 패턴 | 반복 횟수 | 영향 파일 | 추정 중복 줄 |
|------|----------|----------|------------|
| Loading/Error 상태 관리 훅 | 25회 | user/admin/llm-router/mobile hooks | ~300줄 |
| Layout 컴포넌트 (Inter 폰트, ThemeProvider) | 7회 | 모든 앱 layout.tsx | ~200줄 |
| Dashboard 컴포넌트 구조 | 7회 | admin 대시보드 계열 | ~350줄 |

### 대형 파일

| 파일 | 줄 수 | 문제 |
|------|-------|------|
| llm-router/mockData.ts | 1,099 | 86개 모델 하드코딩 → JSON 분리 가능 |
| admin/workflowService.ts | 586 | 서비스 분할 필요 |
| admin/widgetService.ts | 342 | 서비스 분할 필요 |

### 미사용 코드

| 파일/함수 | 줄 수 | 상태 |
|----------|-------|------|
| utils/csrfExample.tsx | 111 | 예제 코드, 미사용 |
| utils/blocklist.ts - isBlockedSite() | ~30 | 미사용 export |
| utils/blocklist.ts - isSensitivePattern() | ~20 | 미사용 export |

### 리팩토링 기회 (우선순위)

1. **useAsyncData 공통 훅 추출** → 25개 파일 단순화, ~300줄 절감
2. **mockData.ts → models.json** → ~1,000줄 절감
3. **BaseLayout 공통 컴포넌트** → 7개 앱 단순화, ~200줄 절감
4. **미사용 코드 제거** → ~180줄 절감
5. **총 예상 절감: ~2,030줄 (1.7%)**

---

## 3. 보안 취약점 (W3)

### CRITICAL (2건)

| # | 취약점 | 위치 | 설명 |
|---|--------|------|------|
| 1 | 비밀번호 해싱 미구현 | mockAuthService.ts:35 | 평문 비교, bcrypt/argon2 미사용 |
| 2 | 약한 JWT 토큰 생성 | mockAuthService.ts:39 | btoa(JSON.stringify()) → 토큰 위조 가능 |

> 참고: mockAuthService는 개발용이나, 프로덕션 전환 시 반드시 교체 필요

### HIGH (3건)

| # | 취약점 | 위치 | 설명 |
|---|--------|------|------|
| 3 | CSP unsafe-inline/eval | 모든 next.config.ts | XSS 보호 효과 감소 |
| 4 | 토큰 XSS 노출 | tokenStorage.ts | sessionStorage → httpOnly 쿠키 필요 |
| 5 | Rate Limiting 미흡 | rateLimit.ts | 메모리 기반, 재시작 시 초기화 |

### MEDIUM (4건)

| # | 취약점 | 위치 | 설명 |
|---|--------|------|------|
| 6 | CSRF 토큰 검증 불완전 | apps/user/app/api/lib/csrf.ts | UUID 형식만 검사, 세션 매칭 없음 |
| 7 | API Key 해싱 미구현 | docker/init.sql:37 | key_hash 컬럼 있으나 로직 없음 |
| 8 | 환경 변수 검증 부재 | apps/user/app/api/lib/aiCore.ts:7 | SSRF 가능성 |
| 9 | Extension 과도한 권한 | manifest.json | `<all_urls>` 매칭 |

### LOW (2건)

| # | 취약점 | 위치 | 설명 |
|---|--------|------|------|
| 10 | 에러 메시지 정보 노출 | realAuthService.ts:36-38 | 원본 에러 노출 |
| 11 | 감사 로그 미구현 | docker/init.sql | 테이블만 존재, 로깅 코드 없음 |

### 보안 강점

- Zod 스키마 검증 (9파일, 40+ 타입)
- 보안 헤더 7/7 구현 (모든 앱)
- PII 마스킹 (sanitizePII)
- Extension blocklist 구현
- CSRF 기본 보호 + 타이밍 공격 방지

---

## 4. 테스트 커버리지 갭 (W4)

### 영역별 커버리지

| 영역 | 커버리지 | 평가 |
|------|---------|------|
| Admin Services | 95%+ | 매우 높음 |
| LLM Router Services | 95% | 매우 높음 |
| Schemas (Zod) | 95% | 매우 높음 |
| Security (CSRF, sanitize) | 90% | 높음 |
| Shared Hooks | 90% | 높음 |
| MSW/Mocks | 100% | 완벽 |
| Base Components | 100% | 완벽 |
| User Hooks | 100% | 완벽 |
| Admin Components | 90% | 높음 |
| HMG Components | 85% | 높음 |
| Desktop Components | 85% | 높음 |
| User Services | 85% | 높음 |
| Utilities | 85% | 높음 |
| I18n | 80% | 보통 |
| LLM Router Components | 80% | 보통 |
| Client Layer | 80% | 보통 |
| Mobile Components | 75% | 보통 |
| ROI Components | 70-80% | 보통 |
| User Pages | 60-70% | 낮음 |
| ROI DataContext | 50-60% | 낮음 |
| Admin 실시간 컴포넌트 | 55-65% | 낮음 |

### 커버리지 갭 Top 5

1. **ROIDataContext** (50-60%) — Context 상태 전환 시나리오 미흡
2. **Admin LiveMetricCard/LiveActivityFeed** (55-65%) — SSE 구독 테스트 부족
3. **User ChatPage/OCRPage** (60-70%) — UI 분기, 에러 경로 미흡
4. **Desktop SwarmPanel/DebateArena** (60-70%) — 멀티에이전트 상태 관리
5. **ROI 차트 상호작용** (65-70%) — 마우스 이벤트, 데이터 필터링

### E2E 테스트 현황

- 18개 파일, 6개 프로젝트 (admin, hmg, user, llm-router, wiki, dark-mode)
- 다크모드, 접근성, 반응형 테스트 포함
- 갭: 에러 경로, 복잡한 상태 전환, 성능 메트릭 검증 미흡

---

## 5. 빌드 & 인프라 (W5)

### 빌드 출력 크기

| 앱 | .next/ 크기 | 정적 out/ | 문제 |
|----|-----------|----------|------|
| admin | **278MB** | 1.3MB | ROI 차트 + Excel → 동적 로딩 필요 |
| llm-router | 35MB | - | 86개 모델 정적 데이터 |
| wiki | 13MB | 4.4MB | 정상 |
| user | 10MB | - | 정상 |
| desktop | 8.1MB | 2.2MB | 정상 |
| hmg | 7.9MB | 1.3MB | 정상 |
| mobile | 7.1MB | 2.0MB | 정상 |

### CI/CD 파이프라인

| 단계 | 예상 시간 | 병목 |
|------|----------|------|
| lint (Turbo) | 1-2분 | - |
| type-check (Turbo) | 2-3분 | - |
| @hchat/tokens + ui 빌드 | 40초 | - |
| 앱 빌드 (병렬) | 3-5분 | admin 최대 |
| Vitest (2,647 테스트) | 1-2분 | - |
| E2E (Playwright) | 5-10분 | 6개 프로젝트 |
| **전체 CI** | **15-25분** | admin + E2E |

### 배포 구조

| 앱 | 플랫폼 | 방식 |
|----|--------|------|
| wiki | GitHub Pages | GitHub Actions → 정적 |
| admin, user, hmg, llm-router, desktop, mobile, storybook | Vercel | Git push → auto-deploy |
| ai-core | Docker | docker-compose.prod.yml |

### 인프라 (Docker)

- **개발**: PostgreSQL 16 + Redis 7 + ai-core (FastAPI)
- **프로덕션**: 리소스 제한 (ai-core 2G/1CPU, postgres 1G, redis 512M)
- **DB 스키마**: 5 테이블 (users, conversations, messages, api_keys, audit_logs)

---

## 6. 문서화 (W6)

### CLAUDE.md 불일치 사항

| 항목 | CLAUDE.md | 실제 | 차이 |
|------|-----------|------|------|
| 앱 개수 | 7개 | 11개 | ai-core, extension, mobile 누락 |
| 스토리 수 | 103개 | 135개 | 32개 과소 기술 |
| 테스트 수 | 62파일/874 | 128파일/2,647 | 구식 데이터 |
| Next.js 버전 | 16.1.1 | 16.1.6 | 마이너 업데이트 |
| 패키지 구조 | 2개 | 7개 (6개 stub) | 레거시 미언급 |

### 문서 품질 등급

| 영역 | 등급 | 비고 |
|------|------|------|
| 설계/계획 문서 | A | 36개 문서, 16,676줄 |
| Storybook | A | 135개 스토리 |
| 루트 README | A | 100줄+, 매우 상세 |
| 패키지 README | B+ | tokens, ui 등 존재 |
| 위키 콘텐츠 | B+ | 23개 문서, 기능별 정리 |
| 앱 레벨 README | D | 대부분 없음 |
| JSDoc/TSDoc | D | 308파일 중 6-10%만 |
| API 문서 | C+ | API_SPEC.md 존재하나 불완전 |

---

## 종합 개선 로드맵

### Phase 1: 즉시 실행 (1주)

| 우선순위 | 작업 | 영역 | 영향 |
|---------|------|------|------|
| P0 | CLAUDE.md 최신화 (앱 3개 추가, 수치 업데이트) | 문서 | 개발자 경험 |
| P0 | useAsyncData 공통 훅 추출 | 코드품질 | 25파일 단순화 |
| P0 | mockData.ts → models.json 분리 | 코드품질 | 1,000줄 절감 |
| P1 | 미사용 코드 제거 (csrfExample, blocklist 함수) | 코드품질 | 180줄 절감 |
| P1 | console.log → logError 통일 | 코드품질 | 모니터링 개선 |

### Phase 2: 보안 강화 (2주)

| 우선순위 | 작업 | 심각도 | 영향 |
|---------|------|--------|------|
| P0 | bcrypt/argon2 비밀번호 해싱 구현 | CRITICAL | 인증 보안 |
| P0 | JWT 라이브러리 도입 (jose/jsonwebtoken) | CRITICAL | 토큰 위조 방지 |
| P1 | CSP nonce 기반 전환 (unsafe-inline 제거) | HIGH | XSS 방지 |
| P1 | httpOnly 쿠키 전환 | HIGH | 토큰 탈취 방지 |
| P1 | Redis 기반 Rate Limiting | HIGH | DDoS 방지 |
| P2 | CSRF 토큰 서버 세션 매칭 | MEDIUM | CSRF 강화 |

### Phase 3: 아키텍처 개선 (1개월)

| 우선순위 | 작업 | 영향 |
|---------|------|------|
| P1 | packages/ui 도메인별 실제 분리 | 빌드 시간 단축, 번들 최적화 |
| P1 | Admin ROI 차트 동적 import | 278MB → 목표 50MB 이하 |
| P2 | BaseLayout 공통 컴포넌트 추출 | 7개 앱 단순화 |
| P2 | MSW mock 프로덕션 빌드 제외 | 번들 크기 감소 |
| P2 | 환경별 .env 파일 분리 | 운영 안정성 |

### Phase 4: 테스트 & 문서 보강 (1개월)

| 우선순위 | 작업 | 목표 |
|---------|------|------|
| P1 | ROIDataContext 시나리오 테스트 | 50% → 80% |
| P1 | Admin 실시간 컴포넌트 SSE 모킹 | 55% → 80% |
| P1 | User 페이지 분기 커버리지 강화 | 60% → 80% |
| P2 | 앱 레벨 README 작성 (8개 앱) | 문서 완성도 |
| P2 | 주요 서비스/훅 JSDoc 추가 | 6% → 30% |
| P2 | E2E 에러 경로 시나리오 추가 | 복원력 검증 |

---

## 핵심 인사이트

### 강점
1. **명확한 계층 구조**: tokens → ui → apps 단방향 의존성, 순환 없음
2. **높은 테스트 커버리지**: 83.1% (서비스 계층 95%+, MSW 100%)
3. **일관된 아키텍처 패턴**: ServiceProvider, Mock/Real 전환, Zod 검증
4. **포괄적 CI/CD**: Turbo 병렬 빌드, E2E, Lighthouse, 자동 배포
5. **다크모드/i18n/접근성**: 전 앱 지원

### 리스크
1. **packages/ui 모놀리스**: 308파일 단일 패키지 → 빌드/번들 병목
2. **Mock 인증 보안**: 프로덕션 전환 시 CRITICAL 보안 이슈 2건
3. **Admin 빌드 278MB**: ROI 차트 로직의 과도한 번들
4. **CLAUDE.md 구식화**: 실제 코드와 문서 간 괴리
5. **JSDoc 부재**: 308파일 중 6-10%만 문서화 → 온보딩 어려움
