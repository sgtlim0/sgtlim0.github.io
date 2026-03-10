# Coverage Report (2026-03-10)

## Summary

| Metric | Value | Raw |
|--------|-------|-----|
| Statements | **88.75%** | 11,096/12,502 |
| Branches | **80.21%** | 5,360/6,682 |
| Functions | **89.34%** | 3,361/3,762 |
| Lines | **89.72%** | 10,128/11,288 |

**Tests**: 226 files, 5,417 tests (all passing)

## Coverage by Area

### 95-100%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| hmg | 100% | 100% | 100% | 100% |
| mocks | 100% | 100% | 100% | 100% |
| schemas | 100% | 100% | 100% | 100% |
| user/hooks | 99.47% | 88.23% | 98.46% | 100% |
| admin/auth | 97.26% | 91.93% | 97.50% | 97.15% |
| user/pages | 96.58% | 95.65% | 92.68% | 98.09% |
| utils | 96.05% | 88.74% | 98.78% | 96.98% |
| user/components | 95.43% | 91.36% | 91.26% | 96.39% |
| client | 95.03% | 86.74% | 97.18% | 96.68% |

### 90-94%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| i18n | 91.11% | 80.00% | 81.25% | 95.23% |
| llm-router | 90.86% | 83.15% | 83.01% | 90.82% |
| roi | 90.65% | 81.76% | 95.97% | 91.12% |
| desktop | 90.27% | 86.66% | 100% | 93.44% |
| mobile | 90.00% | 78.49% | 83.78% | 91.66% |

### 85-89%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| admin/services | 88.90% | 73.57% | 93.38% | 89.18% |
| user/services | 88.80% | 71.71% | 92.59% | 90.00% |
| hooks | 88.75% | 83.44% | 90.95% | 90.05% |
| admin (overall) | 88.17% | 82.82% | 84.35% | 89.12% |

### Below 80% (root-level shared components)

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| (root) src/ | 72.78% | 68.51% | 69.88% | 74.58% |

Root-level shared components (AnimatedList, DraggableList, DiffViewer, SearchOverlay, etc.) have lower coverage due to complex DOM interactions and browser API dependencies.

## Files Under 80% Statements (root-level)

| File | Stmts | Notes |
|------|-------|-------|
| AnimatedList.tsx | 0% | requestAnimationFrame-heavy component |
| BaseLayout.tsx | 0% | Layout wrapper, no testable logic |
| BatchActionBar.tsx | 0% | Selection state UI |
| DragHandle.tsx | 0% | Drag event handlers |
| DraggableList.tsx | 0% | Drag-and-drop DOM interactions |
| SelectableList.tsx | 0% | Selection state UI |
| withProfiler.tsx | 0% | React Profiler HOC |
| ProfilerOverlay.tsx | 2.85% | Browser performance API |
| SearchOverlay.tsx | 1.04% | Complex search with keyboard nav |
| ThemeCustomizer.tsx | 8.33% | Color picker + preview |
| DiffViewer.tsx | 14.63% | Text diff algorithm |
| InfiniteList.tsx | 20% | IntersectionObserver |
| VersionHistory.tsx | 18.18% | Version diff UI |
| ExportButton.tsx | 43.33% | Blob/download API |
| AppNotificationCenter.tsx | 46.93% | Notification permission API |
| Transition.tsx | 46.15% | CSS transition timing |

## Gap Analysis

### Root-level Shared Components (72.78%)
The largest coverage gap is in root-level shared components. Many of these are complex UI primitives that depend heavily on browser APIs (IntersectionObserver, requestAnimationFrame, drag events, CSS transitions) which are difficult to mock in jsdom.

### Branch Coverage Gaps
- admin/services (73.57%): Many admin service hooks have untested error/edge branches
- user/services (71.71%): SSE streaming and complex async error paths
- mobile (78.49%): Touch event and gesture branches

### Type-Only Files (0%)
Files containing only TypeScript types/interfaces have 0% coverage. These are expected and could be excluded from coverage thresholds.

## Recommendations

1. **Root-level components**: Extract testable logic from UI-heavy components into pure functions. Test the logic separately.
2. **admin/services branch coverage**: Add error-scenario tests for service hooks.
3. **user/services branch coverage**: Add SSE error/reconnect scenario tests.
4. **Exclude type-only files** from coverage by adding to `vitest.config.ts` `coverage.exclude`.
