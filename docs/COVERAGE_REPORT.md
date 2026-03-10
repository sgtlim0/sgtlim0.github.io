# Coverage Report (2026-03-10)

## Summary

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Statements | 88.13% (8,443/9,580) | **89.88%** (8,611/9,580) | +1.75% |
| Branches | 78.95% (3,920/4,965) | **80.56%** (4,000/4,965) | +1.61% |
| Functions | 88.16% (2,651/3,007) | **89.99%** (2,706/3,007) | +1.83% |
| Lines | 89.20% (7,700/8,632) | **90.95%** (7,851/8,632) | +1.75% |

**Tests**: 191 files, 4,277 tests (all passing)

## Coverage by Area

### 95-100%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| admin/auth | 97.26% | 91.93% | 97.50% | 97.15% |
| hmg | 100% | 100% | 100% | 100% |
| mocks | 100% | 100% | 100% | 100% |
| schemas | 100% | 100% | 100% | 100% |
| roi/charts | 100% | 94.11% | 100% | 100% |
| utils/text | 100% | 96.66% | 100% | 100% |
| utils | 96.01% | 89.13% | 98.85% | 97.19% |
| user/hooks | 99.47% | 88.23% | 98.46% | 100% |
| user/pages | 96.55% | 95.65% | 92.68% | 98.07% |
| llm-router/services | 95.91% | 83.33% | 98.71% | 95.53% |
| client | 95.03% | 86.74% | 97.18% | 96.68% |
| mobile/services | 100% | 100% | 100% | 100% |

### 90-94%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| hooks | 91.98% | 83.21% | 95.18% | 93.94% |
| i18n | 91.11% | 80.00% | 81.25% | 95.23% |
| llm-router | 90.47% | 83.33% | 82.24% | 90.38% |
| mobile | 90.00% | 78.49% | 83.78% | 91.66% |
| roi | 90.65% | 81.76% | 95.97% | 91.12% |
| desktop | 90.27% | 86.66% | 100% | 93.44% |

### 85-89%

| Area | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| admin | 86.22% | 80.97% | 81.94% | 87.29% |
| admin/services | 88.90% | 73.57% | 93.38% | 89.18% |
| user/services | 88.80% | 71.71% | 92.59% | 90.00% |

## Files Under 80% Statements

| File | Stmts | Branch | Funcs | Notes |
|------|-------|--------|-------|-------|
| user/services/types.ts | 0% | 0% | 0% | Type-only file (no runtime code) |
| user/services/userService.ts | 0% | 0% | 0% | Interface-only file |
| llm-router/types.ts | 0% | 0% | 0% | Type-only file |
| llm-router/services/types.ts | 0% | 0% | 0% | Type-only file |
| llm-router/services/streamingTypes.ts | 0% | 0% | 0% | Type-only file |
| llm-router/services/realRouterService.ts | 0% | 0% | 0% | Real API service (not mocked) |
| admin/services/types/ | 0% | 0% | 0% | Type-only directory |
| mobile/types.ts | 0% | 0% | 0% | Type-only file |
| user/services/mockUserService.ts | 52.94% | 0% | 63.63% | Complex SSE streaming mock |
| roi/xlsxWorker.ts | 47.61% | 47.61% | 50% | Web Worker (hard to test in jsdom) |
| utils/notification.ts | 76.66% | 65.38% | 100% | Browser Notification API |
| llm-router/LRNavbar.tsx | 45.45% | 81.81% | 33.33% | Mobile menu conditional rendering |

## Gap Analysis

### Type-Only Files (0%)
Files that only contain TypeScript types/interfaces have 0% coverage. These are expected and should be excluded from coverage thresholds. Consider adding them to `coverage.exclude` in `vitest.config.ts`.

### Real Service Files (0%)
`realRouterService.ts` and similar real API service files are not tested because they require actual API endpoints. These should be covered by integration/E2E tests.

### Web Worker (xlsxWorker.ts - 47.61%)
The Excel parsing worker uses `self.onmessage` and dynamic `import('xlsx')` which are difficult to mock in jsdom. The validation handler is fully tested; the parse handler requires xlsx library mocking.

### Browser APIs (notification.ts - 76.66%)
Requires `Notification` API which has limited support in jsdom.

## Improvements Made (This Session)

7 new test files added (85 tests total):

| Test File | Tests | Target File | Coverage Change |
|-----------|-------|-------------|-----------------|
| a11y.test.ts | 19 | utils/a11y.ts | 21.62% -> 100% |
| useSearch.test.ts | 13 | hooks/useSearch.ts | 0% -> 89.65% |
| LogProvider.test.tsx | 7 | utils/LogProvider.tsx | 0% -> 100% |
| AnalyticsProvider.test.tsx | 9 | utils/AnalyticsProvider.tsx | 6.66% -> 100% |
| FeatureFlagProvider.test.tsx | 12 | utils/FeatureFlagProvider.tsx | 0% -> 100% |
| mobileHooks-extended.test.tsx | 13 | mobile/services/mobileHooks.ts | 49.27% -> 100% |
| logger-extended.test.ts | 12 | utils/logger.ts | 73.68% -> 93.42% |

## Recommendations

1. **Exclude type-only files** from coverage by adding to `vitest.config.ts`:
   ```ts
   exclude: ['**/types.ts', '**/types/**']
   ```
   This would raise effective coverage by ~1-2%.

2. **LRNavbar mobile menu** (45.45%): The conditional mobile menu rendering (lines 123-162) needs additional tests that verify the authenticated mobile menu state and click-to-close behavior.

3. **xlsxWorker parse handler**: Consider extracting the parse logic into a testable pure function, or use a mock xlsx module.

4. **notification.ts**: Consider mocking the `Notification` constructor in tests.

5. **admin/services branch coverage** (73.57%): Many admin service hooks have untested error/edge branches. Adding error-scenario tests would improve this.
