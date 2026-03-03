# H Chat 다음 단계 계획 (Phase 21~25)

> 작성일: 2026-03-04
> 현재 상태: Phase 23 완료, 모노레포 7개 앱 + 별도 레포 2개
> 완료 현황: 7개 앱 배포, 100+ 컴포넌트, 60+ 페이지, 73+ 스토리, 12 E2E 테스트

---

## Phase 21: Storybook 완성 + 디자인 시스템 정리 ✅

**목표**: 전체 컴포넌트 카탈로그 완성 및 디자인 시스템 문서화

### 21-1. 누락된 Storybook 스토리 추가
- [x] LLM Router 컴포넌트 스토리 6개
- [x] ROI 차트 컴포넌트 스토리 보강
- [x] Enterprise 컴포넌트 스토리 3개
- [x] 달성: 73개+ 스토리

### 21-2. 디자인 토큰 문서화
- [x] `packages/tokens/` 토큰 README
- [x] 토큰 미리보기 Storybook 페이지
- [x] 앱별 커스텀 토큰 정리

### 21-3. Storybook 배포 검증
- [x] Vercel 배포 확인
- [x] 모든 스토리 렌더링 정상 확인

**산출물**: 73개+ 스토리, 디자인 토큰 문서, Storybook 배포 검증

---

## Phase 22: API 서비스 레이어 + UX 폴리싱 ✅

**목표**: Mock 데이터를 API 서비스 레이어로 추상화, 로딩/에러 상태 UI 완성

### 22-1. API 서비스 레이어 통합
- [x] Admin: Enterprise API Provider Pattern 서비스 레이어
- [x] User: API-ready 서비스 인터페이스 (7 hooks)
- [x] LLM Router: Provider Pattern 서비스 레이어 (7 hooks)

### 22-2. 로딩/에러 상태 UI
- [x] 스켈레톤 로더 5종 (Pulse, Text, Card, Table, Chart)
- [x] ErrorBoundary + ErrorFallback
- [x] EmptyState 컴포넌트
- [x] Toast Provider + useToast

### 22-3. 폼 유효성 검증
- [x] validate() + useFormValidation() + patterns

**산출물**: 3개 앱 서비스 레이어, Skeleton/Toast/ErrorBoundary/EmptyState, 폼 검증

---

## Phase 23: 성능 최적화 + 번들 분석 ✅

**목표**: Core Web Vitals 개선 및 빌드 크기 최적화

### 23-1. 번들 분석
- [x] 4개 앱 `@next/bundle-analyzer` 설정 (admin, hmg, user, llm-router)
- [x] analyze 스크립트 추가 (`ANALYZE=true npm run build:admin`)

### 23-2. 코드 스플리팅
- [x] Dynamic import 23개 페이지 (Admin 16, User 5, LLM Router 1 + playground 제외)
- [x] Skeleton 로딩 fallback (SkeletonChart, SkeletonCard, SkeletonTable)

### 23-3. OG 메타데이터 + SEO
- [x] LLM Router OpenGraph URL 추가
- [x] 전 앱 OG 메타데이터 확인 (기존 Phase에서 이미 구현됨)

### 23-4. Lighthouse CI 보강
- [x] llm-router URL 추가
- [x] desktop URL 추가

### 23-5. Turbo 빌드 캐시 최적화
- [x] inputs 필드 추가 (관련 없는 파일 변경 시 리빌드 방지)
- [x] ANALYZE env 변수 등록

**산출물**: 번들 분석 도구, 23개 dynamic import, Lighthouse CI 보강, Turbo 캐시 최적화

---

## Phase 24: CI/CD 파이프라인 강화

**목표**: 자동화된 품질 게이트 및 배포 파이프라인

### 24-1. GitHub Actions 워크플로우 확장
- [ ] PR 시 자동: lint + type-check + build (Turborepo)
- [ ] E2E 테스트 자동 실행 (배포 URL 대상)
- [ ] Lighthouse CI PR 코멘트 (점수 변화 표시)
- [ ] 번들 크기 비교 PR 코멘트

### 24-2. 배포 자동화
- [ ] Vercel Preview Deploy 설정 (PR별 미리보기)
- [ ] 환경별 변수 관리 (dev/staging/prod)
- [ ] 배포 후 헬스체크 자동 검증

### 24-3. 코드 품질
- [ ] ESLint 규칙 통일 (모든 앱 동일 설정)
- [ ] Prettier 자동 적용
- [ ] Husky pre-commit hook (lint-staged)

**산출물**: CI/CD 워크플로우, Preview Deploy, 코드 품질 자동화

---

## Phase 25: 통합 테스트 + 문서 최종화

**목표**: 전체 플랫폼 품질 검증 및 프로젝트 문서 마무리

### 25-1. E2E 테스트 확장
- [ ] 크로스 앱 네비게이션 테스트 (랜딩 → 각 앱)
- [ ] 다크모드 일관성 테스트 (모든 앱)
- [ ] 반응형 레이아웃 테스트 (모바일/태블릿/데스크톱)
- [ ] 접근성 자동 테스트 (axe-core 기반)

### 25-2. 단위 테스트 추가
- [ ] packages/ui 컴포넌트 단위 테스트 (Vitest + Testing Library)
- [ ] 목표: 80%+ 커버리지
- [ ] 유틸리티 함수 테스트 (aggregateData, mockData 등)

### 25-3. 프로젝트 문서 최종화
- [ ] 전체 아키텍처 다이어그램 (Mermaid)
- [ ] 기여 가이드 (CONTRIBUTING.md)
- [ ] 배포 가이드 (각 앱별 Vercel 설정)
- [ ] API 스펙 문서 (Enterprise API)

### 25-4. 데모 시나리오
- [ ] 포트폴리오 발표용 데모 스크립트 작성
- [ ] 각 앱별 주요 기능 시연 순서 정리
- [ ] 스크린샷/GIF 캡처

**산출물**: E2E/단위 테스트, 아키텍처 문서, 데모 시나리오

---

## 우선순위 및 의존성

```
Phase 21 (Storybook 완성)    ──┐
Phase 22 (API 추상화)         ──┼── 병렬 실행 가능
Phase 24 (CI/CD)              ──┘
                                ↓
Phase 23 (성능 최적화)         ── Phase 22 이후 권장
                                ↓
Phase 25 (통합 테스트 + 문서)  ── 최종 마무리
```

---

## 장기 로드맵 (Phase 26+)

| 작업 | 설명 |
|------|------|
| Desktop 모노레포 통합 | hchat-desktop을 모노레포로 이전 또는 서브모듈 연결 |
| Extension 연동 | hchat-v2-extension과 Admin 사용량 데이터 실시간 연동 |
| 실시간 대시보드 | WebSocket 기반 Admin 실시간 모니터링 |
| 다국어 확장 | 일본어, 중국어 추가 (현재 한/영) |
| AI 모델 실연동 | LLM Router에서 실제 AI 모델 API 호출 |
| 모바일 앱 | React Native 또는 PWA 기반 모바일 클라이언트 |

---

## 성공 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 앱 배포 | 7개 | 7개 ✅ |
| Storybook 스토리 | 73개+ | 80개+ |
| E2E 테스트 | 12개 | 25개+ |
| Lighthouse a11y | 미측정 | 90+ |
| 단위 테스트 커버리지 | 0% | 80%+ |
| 컴포넌트 | 100개+ | 120개+ |
| 페이지 | 60개+ | 65개+ |
