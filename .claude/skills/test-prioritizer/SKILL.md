---
name: test-prioritizer
description: 테스트 커버리지 보고서를 분석하여 P0~P3 우선순위별 테스트 대상을 식별하고 우선순위 높은 테스트를 자동 생성합니다.
---

# Test Prioritizer

커버리지 갭에서 최대 효과의 테스트를 우선 식별하고 생성합니다.

## 활성화 시점

- `npm run test:coverage` 실행 후 갭 발견
- Phase 전환 전 커버리지 검증
- 새 파일 추가 후 테스트 누락 확인

## 4단계 우선순위

| 우선순위 | 대상 | 전략 | 예시 |
|---------|------|------|------|
| **P0 Critical** | 보안 코드 | 즉시 TDD | sanitize.ts, auth, PII 관련 |
| **P1 High** | 서비스 훅 | 에러 시나리오 중심 | useChat, useAuth, useQuery |
| **P2 Medium** | UI 컴포넌트 (로직) | 로직 추출 → 순수 함수 | DataTable 필터링, 정렬 |
| **P3 Low** | 브라우저 API 의존 | JSDOM mock + 최소 | DraggableList, SearchOverlay |

## 워크플로우

### 1단계: 커버리지 분석

```bash
npm run test:coverage
# 출력: istanbul JSON → coverage/coverage-summary.json
```

### 2단계: 갭 식별

80% 미만 파일을 우선순위 분류:
- 보안 관련 파일 → P0
- 서비스/훅 파일 → P1
- UI 컴포넌트 (로직 포함) → P2
- 브라우저 API 의존 → P3

### 3단계: 테스트 생성

**P0 보안 테스트 패턴:**
```typescript
describe('sanitizePII', () => {
  it('주민등록번호를 마스킹한다', () => {
    expect(sanitizePII('번호: 900101-1234567')).toBe('번호: ******-*******')
  })
  it('여러 PII 패턴을 동시 처리한다', () => { /* ... */ })
  it('정상 텍스트를 변경하지 않는다', () => { /* ... */ })
})
```

**P1 서비스 훅 테스트 패턴:**
```typescript
describe('useChat', () => {
  it('메시지를 전송한다', async () => { /* ... */ })
  it('네트워크 에러를 처리한다', async () => {
    server.use(http.post('/api/chat', () => HttpResponse.error()))
    // 에러 상태 검증
  })
  it('SSE 스트리밍을 처리한다', async () => { /* ... */ })
})
```

**P2 로직 추출 패턴:**
```typescript
// 컴포넌트에서 로직 추출
export function filterItems(items: Item[], query: string): Item[] {
  return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
}

// 순수 함수 테스트
describe('filterItems', () => {
  it('쿼리로 필터링한다', () => { /* ... */ })
  it('빈 쿼리에 전체를 반환한다', () => { /* ... */ })
  it('대소문자를 무시한다', () => { /* ... */ })
})
```

## 현재 프로젝트 메트릭

- **전체**: 89.24% stmts, 81.2% branches
- **임계값**: stmts 40%, branches 25%
- **테스트 파일**: 235개, 5,821 테스트
- **테스트 위치**: `packages/ui/__tests__/`

## 참조 문서

- `docs/COVERAGE_REPORT.md`
- `docs/DEV_PLAN_04_TEST_CICD_TEAM.md`
