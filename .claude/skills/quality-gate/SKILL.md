---
name: quality-gate
description: PR, Phase 전환, 프로덕션 배포 전 3단계 품질 게이트를 검증합니다. 타입 체크, 테스트, 커버리지, 보안, Lighthouse 성능을 자동 확인하고 Go/No-Go를 판정합니다.
---

# Quality Gate

3단계(PR → Phase → Production) 품질 게이트로 배포 안전성을 보장합니다.

## 활성화 시점

- PR 머지 전 검증
- Phase 전환 시 품질 확인
- 프로덕션 배포 전 최종 검증

## 3단계 게이트

### Level 1: PR Gate

| 항목 | 임계값 | 명령어 |
|------|--------|--------|
| 타입 체크 | 에러 0 | `npx tsc --noEmit` |
| Lint | warning만 허용 | `npm run lint` |
| 관련 테스트 | 100% 통과 | `npx vitest run --changed` |
| 번들 크기 | +10% 이내 | `npm run build` |

### Level 2: Phase Gate

| 항목 | 임계값 | 명령어 |
|------|--------|--------|
| Statement 커버리지 | 40%+ | `npm run test:coverage` |
| Branch 커버리지 | 25%+ | `npm run test:coverage` |
| E2E 통과율 | 95%+ | `npm run test:e2e` |
| Flaky 테스트 | 5% 이하 | E2E 3회 반복 실행 |
| CRITICAL 보안 | 0건 | codebase-audit 스킬 |
| 빌드 전체 | 9/9 통과 | `npx turbo build` |

### Level 3: Production Gate

| 항목 | 임계값 | 명령어 |
|------|--------|--------|
| Lighthouse FCP | <3s | `npx lhci autorun` |
| Lighthouse LCP | <4s | `npx lhci autorun` |
| Lighthouse CLS | <0.1 | `npx lhci autorun` |
| Lighthouse TBT | <500ms | `npx lhci autorun` |
| 부하 P95 | <2s | k6 load test |
| Canary 에러율 | <0.1% | 모니터링 확인 |

## Go/No-Go 판정 로직

```
IF Level에 해당하는 모든 항목 통과:
  → GO (진행)
ELIF CRITICAL 이슈만 실패:
  → BLOCK (즉시 수정 후 재검증)
ELIF HIGH 이슈 실패:
  → CONDITIONAL GO (이번 스프린트 내 수정 조건부 승인)
ELSE:
  → NO-GO (재작업)
```

## 실패 시 대응

| 실패 항목 | 즉시 대응 | 근본 대응 |
|---------|---------|---------|
| 타입 에러 | `npx tsc` 에러 수정 | strict 모드 점진 적용 |
| 테스트 실패 | 실패 테스트 수정 | Flaky 테스트 격리 |
| 커버리지 미달 | test-prioritizer 스킬 실행 | TDD 워크플로우 강화 |
| 번들 초과 | dynamic import 적용 | barrel import 최적화 |
| Lighthouse | 이미지 최적화, 폰트 서브셋 | 성능 모니터링 자동화 |

## 참조 문서

- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/DEV_PLAN_04_TEST_CICD_TEAM.md`
- `.github/workflows/ci.yml` — CI 파이프라인
- `lighthouserc.json` — Lighthouse 설정
