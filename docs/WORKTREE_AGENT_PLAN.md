# Worktree Auto-Generation & Agent Assignment Plan

> Date: 2026-03-08
> Purpose: Phase 62-70 병렬 구현을 위한 워크트리 + 에이전트 자동화 설계

---

## 1. 개념

각 Phase를 독립 git worktree에서 실행하고, 전문 에이전트를 배정하여 병렬 작업 후 main에 순차 머지.

```
main (Phase 61)
  |
  ├── worktree/phase-62-zod    → [tdd-guide] + [security-reviewer]
  ├── worktree/phase-63-tests  → [tdd-guide] + [e2e-runner]
  |   (62, 63 병렬)
  |
  ├── worktree/phase-64-server → [refactor-cleaner] + [architect]
  ├── worktree/phase-65-api-v1 → [planner] + [tdd-guide] + [security-reviewer]
  |
  ├── worktree/phase-66-ai     → [planner] + [tdd-guide]
  ├── worktree/phase-67-perf   → [refactor-cleaner] + [build-error-resolver]
  |   (66, 67 병렬)
  |
  ├── worktree/phase-68-i18n   → [doc-updater] + [tdd-guide]
  ├── worktree/phase-69-monitor → [architect] + [security-reviewer]
  |   (68, 69 병렬)
  |
  └── worktree/phase-70-launch → [planner] + [security-reviewer] + [e2e-runner]
```

---

## 2. 워크트리 자동생성 스크립트

### `scripts/create-worktrees.sh`

```bash
#!/bin/bash
set -euo pipefail

BASE_DIR="/Users/yhlim/workspace/hchat-wiki"
WORKTREE_DIR="$BASE_DIR/.worktrees"

# Phase definitions: branch_name
PHASES=(
  "phase-62-zod-validation"
  "phase-63-test-coverage-80"
  "phase-64-server-components"
  "phase-65-real-api-v1"
  "phase-66-real-api-v2-ai"
  "phase-67-bundle-performance"
  "phase-68-i18n-full"
  "phase-69-monitoring"
  "phase-70-production-launch"
)

mkdir -p "$WORKTREE_DIR"

for phase in "${PHASES[@]}"; do
  WORKTREE_PATH="$WORKTREE_DIR/$phase"

  if [ -d "$WORKTREE_PATH" ]; then
    echo "Skip: $phase (already exists)"
    continue
  fi

  echo "Creating worktree: $phase"
  git worktree add -b "$phase" "$WORKTREE_PATH" main

  # Install dependencies
  (cd "$WORKTREE_PATH" && npm install --silent)

  echo "Ready: $WORKTREE_PATH"
done

echo ""
echo "All worktrees created. List:"
git worktree list
```

### `scripts/cleanup-worktrees.sh`

```bash
#!/bin/bash
set -euo pipefail

BASE_DIR="/Users/yhlim/workspace/hchat-wiki"
WORKTREE_DIR="$BASE_DIR/.worktrees"

echo "Cleaning up worktrees..."

for dir in "$WORKTREE_DIR"/phase-*; do
  if [ -d "$dir" ]; then
    branch=$(basename "$dir")
    echo "Removing: $branch"
    git worktree remove "$dir" --force 2>/dev/null || true
  fi
done

git worktree prune
echo "Done. Remaining:"
git worktree list
```

### `scripts/merge-phase.sh`

```bash
#!/bin/bash
set -euo pipefail

PHASE="$1"

if [ -z "$PHASE" ]; then
  echo "Usage: ./scripts/merge-phase.sh phase-62-zod-validation"
  exit 1
fi

echo "Merging $PHASE into main..."

git checkout main
git merge "$PHASE" --no-ff -m "feat: Merge $PHASE into main"

echo "Merged. Cleaning up worktree..."
WORKTREE_DIR="/Users/yhlim/workspace/hchat-wiki/.worktrees/$PHASE"
if [ -d "$WORKTREE_DIR" ]; then
  git worktree remove "$WORKTREE_DIR"
fi

git branch -d "$PHASE" 2>/dev/null || true
echo "Done: $PHASE merged and cleaned"
```

---

## 3. 에이전트 배정 매트릭스

### Phase별 에이전트 역할

| Phase | Primary Agent | Secondary Agent | Reviewer | 예상 Task 수 |
|-------|--------------|-----------------|----------|-------------|
| 62 Zod | tdd-guide | security-reviewer | code-reviewer | 8 |
| 63 Tests | tdd-guide | e2e-runner | code-reviewer | 12 |
| 64 Server | refactor-cleaner | architect | build-error-resolver | 6 |
| 65 API v1 | planner → tdd-guide | security-reviewer | code-reviewer | 10 |
| 66 AI | planner → tdd-guide | - | security-reviewer | 8 |
| 67 Perf | refactor-cleaner | build-error-resolver | code-reviewer | 6 |
| 68 i18n | doc-updater | tdd-guide | code-reviewer | 8 |
| 69 Monitor | architect | security-reviewer | code-reviewer | 6 |
| 70 Launch | planner | security-reviewer + e2e-runner | all | 12 |

### 에이전트별 워크로드

| Agent | Phases | Total Tasks |
|-------|--------|-------------|
| tdd-guide | 62, 63, 65, 66, 68 | ~40 |
| security-reviewer | 62, 65, 66, 69, 70 | ~20 |
| code-reviewer | 62-68 | ~50 (every PR) |
| planner | 65, 66, 70 | ~10 |
| refactor-cleaner | 64, 67 | ~12 |
| architect | 64, 69 | ~8 |
| e2e-runner | 63, 70 | ~10 |
| build-error-resolver | 64, 67 | ~8 |
| doc-updater | 68 | ~8 |

---

## 4. Claude Code 실행 템플릿

### Phase 62 (Zod Validation) — 워크트리 에이전트 실행

```
Agent(
  subagent_type="tdd-guide",
  isolation="worktree",
  prompt="""
  Phase 62: Zod Validation Layer

  Working directory: packages/ui/src/schemas/
  Branch: phase-62-zod-validation

  Tasks:
  1. Install zod in @hchat/ui-core package.json
  2. Create schema files:
     - auth.schema.ts (LoginInput, RegisterInput, TokenPayload)
     - chat.schema.ts (MessageInput, ConversationCreate)
     - admin.schema.ts (UserCreate, SettingsUpdate, DashboardFilter)
     - roi.schema.ts (UploadConfig, KPIFilter, DateRange)
     - llm-router.schema.ts (ModelFilter, ProviderRequest)
  3. Add .parse() to service methods in packages/ui/src/admin/services/
  4. Create useValidatedForm hook in packages/ui/src/hooks/
  5. Write tests for all schemas (edge cases, error messages)
  6. Run: npx vitest run --coverage

  TDD workflow: Write schema test FIRST, then implement schema.
  Target: 100% schema test coverage.
  """
)
```

### Phase 63 (Test Coverage) — 병렬 서브태스크

```
# Sub-task 1: MSW Integration Tests
Agent(
  subagent_type="tdd-guide",
  isolation="worktree",
  prompt="Phase 63-A: MSW integration tests for 8 domains..."
)

# Sub-task 2: Component Tests
Agent(
  subagent_type="tdd-guide",
  isolation="worktree",
  prompt="Phase 63-B: Admin component tests (32 untested)..."
)

# Sub-task 3: E2E Tests
Agent(
  subagent_type="e2e-runner",
  isolation="worktree",
  prompt="Phase 63-C: Playwright E2E for critical user flows..."
)
```

### Phase 65 (Real API v1) — 순차 파이프라인

```
# Step 1: Planning
Agent(subagent_type="planner", prompt="Phase 65: Plan Real API v1...")

# Step 2: Implementation (after plan approval)
Agent(
  subagent_type="tdd-guide",
  isolation="worktree",
  prompt="Phase 65: Implement Prisma + Real Auth/Chat/Admin services..."
)

# Step 3: Security Review
Agent(subagent_type="security-reviewer", prompt="Review Phase 65 API...")
```

---

## 5. 병렬 실행 그룹

### Group A (Week 1-2): Phase 62 + 63

```python
# 동시 실행 가능 — 독립적인 코드 영역
Group_A = [
  Task("phase-62", agents=["tdd-guide", "security-reviewer"]),
  Task("phase-63", agents=["tdd-guide", "e2e-runner"]),
]
# 62: packages/ui/src/schemas/ (신규)
# 63: packages/ui/__tests__/ + tests/e2e/ (기존 확장)
# 충돌 없음
```

### Group B (Week 3-5): Phase 64 -> 65

```python
# 순차 실행 — 64가 import 구조 변경 후 65 진행
Group_B = [
  Task("phase-64", agents=["refactor-cleaner", "architect"]),
  Task("phase-65", agents=["planner", "tdd-guide"], depends_on=["phase-64"]),
]
```

### Group C (Week 6-7): Phase 66 + 67

```python
# 동시 실행 가능
Group_C = [
  Task("phase-66", agents=["planner", "tdd-guide"]),   # API routes
  Task("phase-67", agents=["refactor-cleaner"]),         # Bundle config
]
# 66: packages/ui/src/admin/services/ (real implementations)
# 67: next.config.ts + imports (bundle optimization)
# 최소 충돌
```

### Group D (Week 8-9): Phase 68 + 69

```python
# 동시 실행 가능 — 완전 독립
Group_D = [
  Task("phase-68", agents=["doc-updater", "tdd-guide"]),  # i18n
  Task("phase-69", agents=["architect", "security-reviewer"]),  # monitoring
]
```

### Group E (Week 10): Phase 70

```python
# 모든 Phase 완료 후 순차 실행
Group_E = [
  Task("phase-70", agents=["planner", "security-reviewer", "e2e-runner"],
       depends_on=["phase-62", ..., "phase-69"]),
]
```

---

## 6. 머지 전략

### 머지 순서 (충돌 최소화)

```
main ← phase-62 (zod: 신규 파일만, 충돌 0)
     ← phase-63 (tests: 테스트 파일만, 충돌 0)
     ← phase-64 (server components: 기존 파일 수정, 머지 주의)
     ← phase-65 (api v1: 신규 + 기존 수정)
     ← phase-66 (ai: 서비스 파일 수정)
     ← phase-67 (perf: config + import 수정)
     ← phase-68 (i18n: 신규 locale 파일)
     ← phase-69 (monitoring: 유틸 + 설정)
     ← phase-70 (launch: 문서 + 설정)
```

### 충돌 위험 매트릭스

| Phase Pair | Conflict Risk | Shared Files |
|------------|--------------|-------------|
| 62 + 63 | None | 0 |
| 64 + 65 | Medium | service imports |
| 66 + 67 | Low | next.config.ts |
| 68 + 69 | None | 0 |
| 64 + any | High | 209 'use client' files |

### 충돌 해결 프로토콜

1. 머지 전 `git diff main...branch -- <shared-files>` 확인
2. 충돌 시 `build-error-resolver` 에이전트 투입
3. 머지 후 반드시 `npx turbo build && npx vitest run` 검증
4. 실패 시 롤백: `git revert -m 1 HEAD`

---

## 7. .gitignore 추가

```
# Worktrees
.worktrees/
```

---

## 8. 실행 명령 요약

```bash
# 1. 워크트리 생성
./scripts/create-worktrees.sh

# 2. Phase 작업 (워크트리에서)
cd .worktrees/phase-62-zod-validation
# ... 에이전트 작업 ...

# 3. 머지
./scripts/merge-phase.sh phase-62-zod-validation

# 4. 전체 정리
./scripts/cleanup-worktrees.sh
```

---

## 9. Claude Code 실행 예시 (전체 파이프라인)

```
# 사용자 프롬프트:
"Phase 62 실행해줘"

# Claude Code 자동 실행:
1. TaskCreate: Phase 62 서브태스크 8개 생성
2. Agent(planner): 구현 계획 확인
3. Agent(tdd-guide, isolation="worktree"):
   - branch: phase-62-zod-validation
   - TDD: 테스트 먼저 → 스키마 구현
4. Agent(security-reviewer): Zod 스키마 보안 검토
5. Agent(code-reviewer): 코드 리뷰
6. Bash: npx turbo build && npx vitest run
7. TaskUpdate: 모든 태스크 completed
8. Git: commit + merge-ready 상태 알림
```
