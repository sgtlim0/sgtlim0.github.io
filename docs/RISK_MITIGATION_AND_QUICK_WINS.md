# Risk Mitigation & Quick Wins

> Worker B 산출물 | 2026-03-14 | H Chat Browser OS + hchat-pwa 통합 로드맵 리스크 대응

---

## 1. Risk Register

| # | Risk | Impact | Probability | Grade | Mitigation | Owner | Monitoring |
|---|------|--------|-------------|-------|------------|-------|------------|
| R1 | **Scope Creep** — Phase 24 "AI Simulation Lab", "Smart Contract Automation" 등이 Browser OS 30주 로드맵과 충돌, 팀 집중력 분산 | High | High | **Critical** | Phase Gate 도입: 각 Phase 종료 시 Go/No-Go 결정. Browser OS 외 신규 피처는 "Parking Lot" 백로그로 격리. 분기별 스코프 리뷰 의무화 | PM Lead | 주간 스프린트 리뷰에서 스코프 변경 건수 추적. 3건/주 초과 시 경보 |
| R2 | **Test Target Unrealism** — 14,500+ 테스트를 30주 = 주당 483개. 기존 대비 9.8배 속도 요구 | High | Very High | **Critical** | 단계별 목표 재설정 (섹션 5 참조). TDD 강제 범위를 Core Path로 한정, 나머지는 후행 테스트 허용 | QA Lead | 주간 테스트 증가율 대시보드. 목표 대비 70% 미만 2주 연속 시 스코프 축소 트리거 |
| R3 | **L4 MARS LLM Cost Overrun** — $36K 예산, 주당 $1,200. 개발/테스트 단계 과다 호출 위험 | Medium | High | **High** | Mock LLM + Rate Limit + 비용 캡 (섹션 4 참조) | Infra Lead | 일일 비용 대시보드. 주간 $1,000 도달 시 자동 throttle |
| R4 | **Extension Dev Pitfalls** — PRISM 코드 리뷰에서 CRIT 2건 + HIGH 4건 발견. Race condition, 무한 루프, 메모리 누수 | Very High | Medium | **Critical** | PRISM 체크리스트 의무 적용 (섹션 2 참조). PR merge 전 체크리스트 100% 통과 필수 | Extension Lead | PR 리뷰 체크리스트 통과율. 미통과 PR merge 차단 (CI gate) |
| R5 | **RQFP Weight Hardcoding** — 0.4:0.4:0.2 고정값이 도메인별 최적과 괴리 | Medium | Medium | **Medium** | AutoResearch 루프 기반 적응형 가중치 (섹션 7 참조) | AI Lead | A/B 테스트 결과 주간 리포트. MRR(Mean Reciprocal Rank) 모니터링 |
| R6 | **Self-Healing Circular Failure** — Healing Agent 잘못된 패치가 새 장애를 트리거하는 무한 루프 | Very High | Medium | **Critical** | 순환 방지 설계 (섹션 3 참조). 횟수 제한 + 쿨다운 + 에스컬레이션 | Platform Lead | Healing 이벤트 로그. 동일 컴포넌트 3회/시간 초과 시 자동 중단 + PagerDuty |

### Risk Heat Map

```
Probability
Very High |      [R2]
     High | [R3]       [R1]
   Medium |      [R5]  [R4][R6]
      Low |
          +--Low--Med--High--VHigh--> Impact
```

---

## 2. PRISM Lessons -> H Chat Extension Review Checklist

PRISM 코드 리뷰에서 발견된 6건의 Critical/High 버그를 Extension PR 머지 게이트 체크리스트로 변환한다.

### Critical Items (PR Merge Blocker)

| ID | PRISM Bug | Checklist Item | 검증 방법 |
|----|-----------|----------------|-----------|
| CK-01 | CRIT-01: `waitForDOMStable()` 다중 resolve race condition | **Promise는 반드시 단일 resolve 보장.** `once` 플래그 또는 `AbortController` 패턴 사용. MutationObserver 콜백 내 early return 확인 | Unit test: concurrent trigger 10회 시 resolve 1회만 발생하는지 검증 |
| CK-02 | CRIT-02: `unwrapNode()` 무한 루프 | **재귀/while 루프에 depth limit 필수.** `MAX_DEPTH = 100` 상수 정의, 초과 시 `throw` + 로그 | Unit test: circular reference 입력 시 100회 이내 종료 확인 |
| CK-03 | CRIT-05: API 키 삭제 전 검증 부재 | **파괴적 작업(DELETE)은 사전 검증 필수.** 키 존재 확인 + 사용 중 여부 체크 + confirm dialog | Integration test: 존재하지 않는 키 삭제 시 graceful error 반환 |

### High Items (PR Review Required)

| ID | PRISM Bug | Checklist Item | 검증 방법 |
|----|-----------|----------------|-----------|
| CK-04 | HIGH-03: `getBoundingClientRect()` 반복 호출 강제 reflow | **Layout thrashing 금지.** DOM 읽기는 배치로 모아서 1회, 쓰기는 `requestAnimationFrame` 내에서 실행 | Performance test: 100 요소 대상 reflow 횟수 측정 (Chrome DevTools Protocol) |
| CK-05 | HIGH-08: in-flight SSE 스트림 미취소 메모리 누수 | **SSE/WebSocket은 컴포넌트 언마운트 시 반드시 `close()`.** `AbortController.signal` 을 `EventSource` 또는 fetch에 연결 | Unit test: 마운트 → 스트림 시작 → 언마운트 → `controller.abort()` 호출 확인 |
| CK-06 | (종합) 비동기 정리 누락 | **`useEffect` cleanup 함수에서 모든 비동기 구독 해제.** timer, observer, listener, stream 포함 | Lint rule: `eslint-plugin-react-hooks` exhaustive-deps + custom rule for cleanup |

### CI Integration

```yaml
# .github/workflows/extension-pr-gate.yml (개념)
extension-checklist:
  runs-on: ubuntu-latest
  steps:
    - name: CRIT check — single resolve
      run: grep -rn "resolve(" apps/extension/src/ | check-single-resolve
    - name: CRIT check — loop depth
      run: grep -rn "while\|recursion" apps/extension/src/ | check-max-depth
    - name: HIGH check — layout thrashing
      run: npx eslint apps/extension/src/ --rule 'no-layout-thrashing: error'
    - name: HIGH check — SSE cleanup
      run: npx vitest run --filter='**/extension/**sse**'
```

---

## 3. Self-Healing Circular Failure Prevention

### 3.1 Core Policy: 3-Strike Circuit Breaker

```
Component X 장애 발생
  -> Healing Agent 패치 시도 #1
    -> 성공? -> 정상 복귀, 카운터 리셋
    -> 실패? -> 카운터 +1, 쿨다운 5분

Component X 장애 재발생 (카운터=1)
  -> Healing Agent 패치 시도 #2 (다른 전략)
    -> 실패? -> 카운터 +1, 쿨다운 15분

Component X 장애 재발생 (카운터=2)
  -> Healing Agent 패치 시도 #3 (최소 개입: fallback UI 전환)
    -> 실패? -> CIRCUIT OPEN -> 수동 에스컬레이션
```

### 3.2 Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `MAX_HEAL_ATTEMPTS` | 3 | 3회 초과 시 자동 패치가 상황 악화 가능성 높음 |
| `COOLDOWN_BASE_SEC` | 300 (5min) | 연쇄 패치 방지. 지수 백오프: 5min, 15min, 45min |
| `CIRCUIT_OPEN_DURATION_SEC` | 3600 (1hr) | 수동 개입 여유 시간 |
| `HEAL_SCOPE` | component-level | 파일 단위가 아닌 컴포넌트 단위로 격리 |
| `ESCALATION_CHANNEL` | PagerDuty + Slack #incidents | Circuit Open 시 즉시 알림 |

### 3.3 Escalation Matrix

| 단계 | 조건 | 행동 |
|------|------|------|
| L1 Auto-Heal | 첫 번째 장애 | Healing Agent 자동 패치, Slack 알림(info) |
| L2 Retry | 2회째 장애 (5분 쿨다운 후) | 대안 전략 패치, Slack 알림(warning) |
| L3 Fallback | 3회째 장애 (15분 쿨다운 후) | Fallback UI 전환, 기능 degradation 허용 |
| L4 Circuit Open | 3회 모두 실패 | 자동 패치 중단, PagerDuty 호출, 수동 대응 전환 |
| L5 Post-Mortem | 수동 해결 후 | RCA 문서 작성, Healing 전략 DB 업데이트 |

### 3.4 Anti-Pattern Guard

- **Same-patch detection**: 이전 패치와 동일한 diff를 생성하면 즉시 스킵 (무한 동일 패치 방지)
- **Blast radius limit**: Healing Agent가 수정 가능한 파일 수 상한 = 3개/시도
- **Rollback-first**: 패치 적용 전 자동 스냅샷, 실패 시 즉시 rollback

---

## 4. LLM Cost Control Strategy

### 4.1 Environment-Based Tiering

| Environment | LLM Backend | Rate Limit | Monthly Cap |
|-------------|-------------|------------|-------------|
| `local` / `test` | **Mock LLM** (deterministic responses) | Unlimited | $0 |
| `dev` | Haiku 4.5 (저비용) | 50 req/hr/dev | $500/mo |
| `staging` | Sonnet 4.5 (운영 동일) | 200 req/hr | $2,000/mo |
| `production` | MARS Pipeline (Sonnet 4.5 primary) | 1,000 req/hr | $3,000/mo |

### 4.2 Mock LLM Design

```typescript
// packages/ui/src/mocks/mockLlm.ts
interface MockLlmConfig {
  latencyMs: number        // 시뮬레이션 지연 (200~500ms)
  tokenBudget: number      // 응답 토큰 수 제한
  deterministicSeed: string // 동일 입력 -> 동일 출력 보장
}

// 테스트: 실제 LLM 호출 0건, CI 비용 $0
// 개발: 90% mock, 10% 실제 (수동 토글)
```

### 4.3 MARS Pipeline Cost Optimization

| 단계 | 기존 비용 | 최적화 | 절감 |
|------|----------|--------|------|
| Query Analysis | $0.02 | 캐시: 동일 쿼리 24시간 캐시 | -60% |
| Web Search | $0.03 | 결과 캐시: URL 기반 7일 캐시 | -40% |
| Content Extract | $0.02 | 변경 없음 | - |
| RQFP Scoring | $0.02 | 로컬 임베딩 모델 전환 | -80% |
| Synthesis | $0.03 | Streaming + early stop | -20% |
| Citation | $0.01 | 변경 없음 | - |
| Verification | $0.01 | 샘플링 (30%만 검증) | -70% |
| **Total/req** | **$0.14** | | **~$0.08** |

### 4.4 Monitoring Dashboard

- **실시간 지표**: 일/주/월 API 호출 수, 토큰 소비량, 비용
- **예산 소진율**: 번다운 차트 (30주 기준)
- **Alert Threshold**: 주간 $1,000 도달 시 Slack 경보, $1,100 시 자동 throttle (rate limit 50% 감소)
- **Cost Attribution**: 기능별 태깅 (MARS, Chat, Research, Extension) → 비용 귀속 추적

---

## 5. Test Target Recalibration

### 5.1 Problem Statement

현재 목표 14,500 테스트 / 30주 = **주당 483개** 신규 테스트는 비현실적이다. hchat-pwa가 30주에 1,479개를 쌓은 실적 대비 **9.8배** 속도를 요구한다.

### 5.2 Phased Target (현실적 재설정)

| Phase | 기간 | 누적 테스트 | 주당 증가 | 전략 |
|-------|------|------------|----------|------|
| Foundation (W1-W8) | 8주 | 7,500 | ~190 | 기존 5,997 + Core Path TDD (신규 ~1,500) |
| Growth (W9-W18) | 10주 | 10,500 | ~300 | Browser OS 핵심 모듈 TDD + 통합 테스트 |
| Hardening (W19-W26) | 8주 | 12,500 | ~250 | E2E 확대 + 부채 해소 + 회귀 테스트 |
| Polish (W27-W30) | 4주 | 13,500 | ~250 | 안정화 + 성능 테스트 + 엣지 케이스 |

**최종 목표: 14,500 -> 13,500** (7% 축소, 커버리지 품질 유지)

### 5.3 TDD vs Post-hoc Strategy

| 영역 | 전략 | 근거 |
|------|------|------|
| MARS Pipeline (AI Core) | **TDD 강제** | 비결정적 출력 → 테스트 없이 회귀 감지 불가 |
| Self-Healing Engine | **TDD 강제** | 순환 장애 방지를 테스트로 보장 |
| Extension (Content Script) | **TDD 강제** | PRISM 교훈: race condition은 사후 발견 비용 10배 |
| UI Components | **후행 테스트 허용** | Storybook interaction test로 보완 가능 |
| ROI Dashboard | **후행 테스트 허용** | 데이터 시각화는 시각적 검증이 더 효과적 |
| Documentation Pages | **최소 테스트** | 정적 콘텐츠, 빌드 성공이 곧 검증 |

### 5.4 Quality Gate (테스트 타협 방지)

- PR merge 조건: 변경 파일의 커버리지 >= 80% (신규 파일은 90%)
- 주간 리포트: 테스트 증가율 vs 코드 증가율 비율. 비율 < 0.5 시 Tech Debt Sprint 발동
- 분기별: 전체 커버리지 85% 미만 시 신규 피처 동결, 테스트 보강 스프린트

---

## 6. Quick Wins: Immediate Execution Plan

### 6.1 Citation System (T1-T4) — 3 Working Days

Browser OS 로드맵과 **완전 독립**, 병렬 실행 가능. AI 응답 신뢰도를 즉시 향상시키는 고가치 항목.

| Task | Day | Description | Deliverable |
|------|-----|-------------|-------------|
| T1 | D1 AM | Citation 데이터 모델 설계 | `CitationSource` 타입 (url, title, snippet, relevance score, accessedAt) |
| T2 | D1 PM | Citation 추출 로직 | MARS Synthesis 단계 출력에서 `[n]` 참조 파싱 + 소스 매핑 |
| T3 | D2 | CitationCard + CitationList 컴포넌트 | 인라인 참조 번호 hover -> 소스 미리보기. 하단 참고문헌 목록 |
| T4 | D3 | 통합 테스트 + Storybook | Unit 20개 + Integration 5개 + Story 3개. 커버리지 90%+ |

**Dependencies**: None (MARS 응답 포맷에 citation 필드 추가만 필요)
**Risk**: Low (UI 컴포넌트 + 파싱 로직, 기존 패턴 재사용)

### 6.2 Atlassian Integration (T5-T9) — 4 Working Days

엔터프라이즈 고객의 **가장 빈번한 요청**. Jira + Confluence 연동으로 엔터프라이즈 가치 즉시 시연 가능.

| Task | Day | Description | Deliverable |
|------|-----|-------------|-------------|
| T5 | D1 | Atlassian OAuth 2.0 (3LO) 연동 | `AtlassianAuthService` — token 발급/갱신/revoke |
| T6 | D2 AM | Jira Issue Fetcher | `JiraService.searchIssues()`, `getIssue()`, `getComments()` |
| T7 | D2 PM | Confluence Page Fetcher | `ConfluenceService.searchPages()`, `getPageContent()` |
| T8 | D3 | AI Context Injection | Jira/Confluence 데이터를 MARS 컨텍스트로 주입. 프롬프트 템플릿 설계 |
| T9 | D4 | 통합 테스트 + Mock 서비스 | MSW handler 추가 (Jira 5 endpoints, Confluence 3 endpoints). Unit 25개 |

**Dependencies**: Atlassian Developer 계정 (무료, 즉시 생성 가능)
**Risk**: Medium (OAuth flow는 redirect URI 설정 필요, 로컬 개발 시 ngrok 활용)

### 6.3 Parallel Execution Confirmation

```
Week N Timeline:
                Browser OS
Day  Mon  Tue  Wed  Thu  Fri
  1  [--Citation T1--][T2-]
  2  [---Citation T3---][T4]    <- Browser OS W1 진행 중
  3  [Atlassian T5][---T6/T7---]
  4  [--Atlassian T8--][--T9--]

Conflict: None
- Citation: packages/ui/src/user/ 영역 (신규 파일)
- Atlassian: packages/ui/src/admin/services/ 영역 (신규 파일)
- Browser OS: apps/ 레벨 신규 구조
-> 파일 충돌 없음, 리뷰어 분리 가능
```

---

## 7. RQFP Adaptive Weighting

### 7.1 Problem

현재 RQFP(Relevance-Quality-Freshness-Provenance) 가중치가 `0.4:0.4:0.2:0.0` 으로 하드코딩되어 있다. 그러나 도메인별 최적값은 상이하다.

| Domain | Optimal R:Q:F | Rationale |
|--------|--------------|-----------|
| 뉴스/시사 | 0.2:0.2:0.6 | Freshness가 가장 중요 |
| 기술 문서 | 0.5:0.4:0.1 | 정확한 매칭(Relevance)이 핵심 |
| ERP/사내 데이터 | 0.3:0.5:0.2 | Quality(정확성)가 최우선 |
| 학술 논문 | 0.4:0.3:0.1 + Provenance 0.2 | 출처 신뢰도 중요 |

### 7.2 AutoResearch Loop-Based Auto-Tuning

```
[User Query]
    |
    v
[Domain Classifier] -- 쿼리를 5개 도메인 중 하나로 분류
    |                   (news, tech-doc, enterprise, academic, general)
    v
[Weight Preset Lookup] -- 도메인별 초기 가중치 로드
    |
    v
[MARS Pipeline with Weighted RQFP]
    |
    v
[User Feedback Signal] -- 클릭, 인용 사용, 재질문 여부
    |
    v
[Weight Adjuster] -- 피드백 기반 가중치 미세 조정
    |                  EMA(Exponential Moving Average), learning rate=0.05
    v
[Updated Weight Store] -- 도메인 x 사용자 그룹별 가중치 저장
```

### 7.3 Implementation Phases

| Phase | 내용 | 기간 |
|-------|------|------|
| P1: Preset | 5개 도메인별 수동 튜닝 프리셋 | 1주 |
| P2: Classifier | 쿼리 도메인 자동 분류 (임베딩 기반 kNN) | 2주 |
| P3: Feedback Loop | 사용자 행동 신호 수집 + EMA 조정 | 3주 |
| P4: A/B Test | 고정 가중치 vs 적응형 가중치 비교 | 2주 (지속) |

### 7.4 Guardrails

- **가중치 범위 제한**: 각 차원 최소 0.05, 최대 0.7 (극단값 방지)
- **변경 속도 제한**: 1회 조정 시 최대 +/-0.05 (급격한 변동 방지)
- **Fallback**: Classifier 신뢰도 < 0.6이면 general 프리셋 사용
- **모니터링**: 주간 MRR(Mean Reciprocal Rank) 리포트, 10% 이상 하락 시 이전 가중치로 자동 롤백

---

## Summary: Priority Matrix

| Item | Effort | Impact | Priority | Start |
|------|--------|--------|----------|-------|
| Citation System | 3d | High (AI 신뢰도) | **P0** | Week 1 |
| Atlassian Integration | 4d | High (엔터프라이즈) | **P0** | Week 1 |
| PRISM Checklist CI Gate | 1d | Critical (버그 방지) | **P0** | Week 1 |
| Self-Healing Circuit Breaker | 2d | Critical (안정성) | **P1** | Week 2 |
| LLM Mock + Cost Dashboard | 3d | High (비용 통제) | **P1** | Week 2 |
| Test Target Recalibration | 0.5d (계획) | High (현실성) | **P1** | Week 1 |
| RQFP Adaptive (P1: Preset) | 1w | Medium (검색 품질) | **P2** | Week 4 |
