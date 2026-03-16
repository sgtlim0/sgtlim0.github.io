# H Chat 코드베이스 감사 보고서

> **감사일**: 2026-03-16
> **감사 방법**: `codebase-audit` 스킬 — PM + 5 Worker Agent 병렬 실행
> **대상**: hchat-wiki 모노레포 (10 apps, 2 packages)

---

## Executive Summary

| 영역 | 등급 | 가중치 | CRITICAL | HIGH | MEDIUM | LOW |
|------|------|--------|----------|------|--------|-----|
| 아키텍처 | **A-** | 25% | 0 | 0 | 3 | 2 |
| 코드 품질 | **A-** | 20% | 0 | 1 | 2 | 0 |
| 보안 | **B+** | 25% | 0 | 1 | 3 | 2 |
| 테스트 | **A-** | 20% | 0 | 3 | 3 | 0 |
| 빌드/인프라 | **B+** | 10% | 1 | 2 | 3 | 2 |
| **종합** | **A-** | 100% | **1** | **7** | **14** | **6** |

### 종합 점수: **85/100 (A-)**

```
아키텍처   ████████████████████████░░░░░░ 88  A-
코드 품질  ████████████████████████░░░░░░ 88  A-
보안       ██████████████████████░░░░░░░░ 83  B+
테스트     ████████████████████████░░░░░░ 88  A-
빌드/인프라 ████████████████████░░░░░░░░░░ 80  B+
───────────────────────────────────────
종합       ████████████████████████░░░░░░ 85  A-
```

---

## 1. 아키텍처 (A-)

### 핵심 수치

| 항목 | 수치 | 판정 |
|------|------|------|
| packages/ui 총 파일 | 509 (문서 490 → 실측 509) | 주의 |
| 800줄 초과 파일 | **0개** | 우수 |
| 최대 파일 크기 | 714줄 (workflowService.ts) | 양호 |
| 순환 의존성 | **0건** | 우수 |
| 앱 간 직접 import | **0건** | 우수 |
| 크로스 도메인 import | 2건 | 경미 |

### 이슈

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| A1 | MEDIUM | admin/ 135파일(27%) 집중 — 패키지 내 모놀리스 위험 | `packages/ui/src/admin/` |
| A2 | MEDIUM | workflowService.ts 714줄 — 800줄 임계 접근 | `admin/services/workflowService.ts` |
| A3 | MEDIUM | HealthDashboard가 ROI 차트 직접 import | `admin/HealthDashboard.tsx` |
| A4 | LOW | serviceFactory가 admin+user 도메인 직접 참조 | `client/serviceFactory.ts` |
| A5 | LOW | CLAUDE.md 파일 수 490 → 실측 509 불일치 | `CLAUDE.md` |

---

## 2. 코드 품질 (A-)

### 핵심 수치

| 항목 | 수치 | 판정 |
|------|------|------|
| `any` 타입 사용 | **1건** (501파일 중) | 우수 |
| `@ts-ignore` | **0건** | 우수 |
| `TODO/FIXME/HACK` | **0건** | 우수 |
| console.log (런타임) | 2건 | 양호 |
| console.log (Storybook) | 41건 | 개선필요 |
| 평균 파일 크기 | 137.7줄 | 우수 |
| 400줄 초과 파일 | 5개 (2.1%) | 양호 |
| Loading/Error 중복 패턴 | 12개 admin 컴포넌트 | 개선필요 |

### 이슈

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| Q1 | HIGH | admin 12개 컴포넌트에서 동일 loading/error 보일러플레이트 반복 (useAsyncData 미활용) | `admin/*.tsx` 12개 |
| Q2 | MEDIUM | Storybook 41건 console.log → action() 교체 권장 | `apps/storybook/stories/` |
| Q3 | MEDIUM | ROIDataUpload.tsx 490줄 — 유틸리티 추출 검토 | `roi/ROIDataUpload.tsx` |

---

## 3. 보안 (B+)

### 핵심 수치

| 항목 | 수치 | 판정 |
|------|------|------|
| 실제 시크릿 노출 | **0건** | 우수 |
| Mock 시크릿 하드코딩 | 2건 | 주의 |
| Zod 스키마 파일 | 9개 (697줄) | 양호 |
| 앱 레벨 Zod 직접 사용 | 2/10개 앱 | 미흡 |
| PII 살균 구현 | 2개 독립 구현 + 테스트 | 양호 |
| 보안 헤더 적용 | **7/7 앱** (7개 헤더) | 우수 |
| CSP nonce (SSR) | 4/7 앱 | 양호 |
| eval/Function 사용 | **0건** | 우수 |
| dangerouslySetInnerHTML | 2건 (안전한 사용) | 양호 |

### 이슈

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| S1 | HIGH | 앱 레벨 Zod 검증 부족 — 10개 중 2개만 직접 import | `apps/` 전체 |
| S2 | MEDIUM | Mock secret 하드코딩 — 프로덕션 번들 포함 여부 확인 | `admin/auth/token.ts` |
| S3 | MEDIUM | Mock password 하드코딩 (Admin123!) | `admin/auth/mockAuthService.ts` |
| S4 | MEDIUM | Static Export 3개 앱 CSP unsafe-inline | `wiki, desktop, mobile` |
| S5 | LOW | style-src unsafe-inline (Tailwind 기술 제약) | 전체 앱 |
| S6 | LOW | Storybook 보안 헤더 없음 | `apps/storybook/` |

---

## 4. 테스트 (A-)

### 핵심 수치

| 항목 | 수치 | 판정 |
|------|------|------|
| 단위 테스트 파일 | 240개 | 우수 |
| 총 테스트 케이스 | **6,004개** | 우수 |
| 통과율 | **99.63%** (22건 실패) | 우수 |
| 커버리지 (stmts) | ~89% | 우수 |
| 커버리지 (branches) | ~81% | 양호 |
| E2E 파일 | 21개 (6개 앱 + cross-cutting) | 양호 |
| Storybook 스토리 | 209개 (93개 play function) | 양호 |
| 테스트:소스 비율 | 0.48 (240/501) | 양호 |

### 이슈

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| T1 | HIGH | Skeleton 스냅샷 불일치 12건 — 컴포넌트 변경 후 미갱신 | `SkeletonImage.test.tsx` |
| T2 | HIGH | CSRF 테스트 환경 2건 — crypto.getRandomValues polyfill 누락 | `csrf.test.ts` |
| T3 | HIGH | SkeletonPulse 테스트 8건 실패 — DOM 구조 불일치 | `Skeleton*.test.tsx` |
| T4 | MEDIUM | Desktop/Mobile E2E 테스트 없음 | `tests/e2e/` |
| T5 | MEDIUM | Storybook 인터랙션 테스트 44.5% (93/209) | `stories/` |
| T6 | MEDIUM | 테스트 22건 실패 중 — 모두 스냅샷/환경 이슈, 로직 버그 아님 | 다수 |

---

## 5. 빌드/인프라 (B+)

### 핵심 수치

| 항목 | 수치 | 판정 |
|------|------|------|
| 타입 에러 (루트 tsc) | 376개 | 미흡 |
| 타입 에러 (핵심 앱) | 0개 (hmg,llm-router,desktop,mobile) | 양호 |
| CI 워크플로우 | 5개 | 우수 |
| Docker 서비스 | 3개 (ai-core, postgres, redis) | 양호 |
| 빌드 성공률 | 9/9 앱 | 우수 |
| 보안 헤더 | 7/7 앱 `poweredByHeader: false` | 우수 |

### 이슈

| # | 심각도 | 이슈 | 위치 |
|---|--------|------|------|
| B1 | **CRITICAL** | Docker DB_PASSWORD/JWT_SECRET 빈 값 기동 가능 | `docker-compose.prod.yml` |
| B2 | HIGH | 루트 tsc 376개 에러 — tsconfig 루트/앱 불일치 | `tsconfig.json` |
| B3 | HIGH | packages/ 231개 타입 에러 — props/mock 타입 불일치 | `packages/ui/` |
| B4 | MEDIUM | wiki transpilePackages 누락 | `apps/wiki/next.config.ts` |
| B5 | MEDIUM | vitest.setup.ts에 vitest/globals 타입 미설정 | `vitest.setup.ts` |
| B6 | MEDIUM | packages/ 분리 불완전 (ui-admin 등 5개 추가 패키지 미사용) | `packages/` |
| B7 | LOW | Docker Compose version: '3.8' deprecated | `docker-compose.prod.yml` |
| B8 | LOW | lighthouse.yml에 npm 캐시 미설정 | `.github/workflows/` |

---

## 종합 권장사항 (우선순위순)

### 즉시 수정 (CRITICAL — 1건)

1. **B1**: `docker/docker-compose.prod.yml`에서 `DB_PASSWORD`와 `JWT_SECRET`에 필수 검증 추가 또는 `.env.docker.example` 제공

### 이번 스프린트 (HIGH — 7건)

2. **B2+B3**: 루트 `tsconfig.json`을 프로젝트 참조 방식으로 전환하여 376개 타입 에러 해소
3. **Q1**: admin 12개 컴포넌트의 loading/error 보일러플레이트를 `useAsyncData` 훅으로 통합
4. **S1**: `apps/admin`, `apps/llm-router` 등 API route에 Zod 검증 레이어 추가
5. **T1+T2+T3**: 22건 테스트 실패 해소 (스냅샷 갱신 + crypto polyfill)

### 다음 스프린트 (MEDIUM — 14건)

6. **Q2**: Storybook 41건 console.log → `action()` 교체
7. **S2+S3**: Mock 인증 코드가 프로덕션 번들에서 tree-shaking 되는지 검증
8. **T4+T5**: Desktop/Mobile E2E 추가, Storybook 인터랙션 테스트 60%+ 확대
9. **A1**: admin/ 135파일 — 서브 패키지 분리 또는 내부 경계 강화 검토
10. 기타 MEDIUM 이슈 8건 순차 해소

---

## 이전 감사 대비 변화

| 항목 | 2026-03-08 (Phase 100) | 2026-03-16 (현재) | 변화 |
|------|----------------------|------------------|------|
| 종합 등급 | B+ | **A-** | +1단계 |
| 테스트 수 | 5,821 | **6,004** | +183 |
| 커버리지 | 89.24% | ~89% | 유지 |
| any 사용 | 0 | 1 (UndoRedo 제네릭) | +1 |
| 보안 CRITICAL | 2건 (mock 인증) | **0건** | 해소 |
| 800줄+ 파일 | 0 | 0 | 유지 |

---

## 감사 메타데이터

| 항목 | 값 |
|------|-----|
| 스킬 | `codebase-audit` |
| Worker 수 | 5 (병렬 실행) |
| 총 tool 호출 | 270+ |
| 총 소요 시간 | ~3분 (병렬) |
| 분석 대상 파일 | 501 소스 + 240 테스트 + 209 스토리 |
