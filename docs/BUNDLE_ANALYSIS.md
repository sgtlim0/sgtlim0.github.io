# Bundle Analysis Report

**Date**: 2026-03-08
**Build tool**: Next.js 16.1.6 + Turbopack
**Build result**: 9/9 apps pass, 3064/3064 tests pass

---

## 1. Dependency Impact Summary

| Dependency | Used by | Bundle Impact | Status |
|------------|---------|---------------|--------|
| `highlight.js` (via `rehype-highlight`) | wiki | ~40 common languages (~300KB uncompressed) -> 9 languages (~50KB) | **Optimized** |
| `xlsx` (SheetJS) | ui (ROI) | ~400KB uncompressed | Already optimized (Web Worker + dynamic import) |
| `zod` | ui (schemas), user | ~60KB uncompressed | Acceptable (used in 9 schema files) |
| `lucide-react` | admin, user, hmg, llm-router | Tree-shakeable (per-icon imports) | OK |
| `react-markdown` + `remark-gfm` | wiki | ~80KB combined | Acceptable (core feature) |
| `idb` | ui (IndexedDB) | ~5KB | Minimal |

## 2. Optimizations Applied

### 2.1 Admin Barrel Import Elimination (HIGH IMPACT)

**Problem**: All 24+ admin pages imported `ProtectedRoute` from `@hchat/ui/admin`, a `'use client'` barrel file that re-exports ~70 components. This forced the bundler to include the entire admin component tree in every page's initial chunk, defeating code-splitting.

**Fix**: Changed all imports to use `@hchat/ui/admin/auth` (a small sub-barrel with only auth-related exports).

**Files changed**: 25 files in `apps/admin/app/`

**Estimated impact**: ~200-400KB reduction in shared chunk size for the admin app.

### 2.2 Admin Dynamic Imports (HIGH IMPACT)

**Problem**: 6 admin pages (dashboard, usage, statistics, users, settings, login) used static imports for their main component, loading the full component code in the initial page bundle.

**Fix**: Converted all 6 pages to use `next/dynamic` with direct file imports (`@hchat/ui/admin/AdminDashboard` instead of barrel re-export).

**Files changed**:
- `apps/admin/app/page.tsx`
- `apps/admin/app/usage/page.tsx`
- `apps/admin/app/statistics/page.tsx`
- `apps/admin/app/users/page.tsx`
- `apps/admin/app/settings/page.tsx`
- `apps/admin/app/login/page.tsx`

**Estimated impact**: Each page now loads only its specific component on demand, reducing initial JS by ~30-80KB per page.

### 2.3 Admin Direct File Imports (MEDIUM IMPACT)

**Problem**: 12 admin pages that already used `dynamic()` imported via barrel: `import('@hchat/ui/admin').then(m => m.ComponentName)`. This pattern still resolves the entire barrel before extracting the named export.

**Fix**: Changed to direct file imports: `import('@hchat/ui/admin/ComponentName')`.

**Files changed**: 12 files (providers, models, features, prompts, agents, departments, audit-logs, sso, notifications, realtime, workflows, customize)

**Estimated impact**: ~50-150KB reduction per lazy chunk (avoids pulling entire barrel into each chunk).

### 2.4 Wiki highlight.js Language Subset (MEDIUM IMPACT)

**Problem**: `rehype-highlight` defaults to registering the `common` language set (~40 languages), bundling significant highlight.js grammar code that is never used.

**Fix**: Passed explicit `languages` option with only the 9 languages actually used in wiki content: `typescript`, `javascript`, `bash`, `css`, `json`, `xml`, `markdown`, `yaml`, `python`.

**File changed**: `apps/wiki/components/MarkdownRenderer.tsx`

**Estimated impact**: ~100-200KB reduction in wiki JS bundle (40 languages -> 9 languages).

## 3. Already Well-Optimized

| Pattern | Where | Notes |
|---------|-------|-------|
| xlsx in Web Worker | `packages/ui/src/roi/xlsxWorker.ts` | Dynamic `import('xlsx')` inside worker -- zero main thread impact |
| User app dynamic imports | `apps/user/app/*/page.tsx` | All 5 pages use `next/dynamic` |
| LLM Router dynamic imports | `apps/llm-router/app/*/page.tsx` | CodeBlock, ModelTable, ModelComparison are lazy |
| Desktop dynamic imports | `apps/desktop/app/page.tsx` | Main page uses `next/dynamic` |
| Mobile dynamic imports | `apps/mobile/app/page.tsx` | MobileApp is lazy-loaded |
| ROI pages | `apps/admin/app/roi/*/page.tsx` | All 9 ROI pages use `next/dynamic` with `ssr: false` |
| Root UI barrel | `packages/ui/src/index.ts` | Small barrel (~10 exports), ROI/LLM/mobile excluded |

## 4. Future Optimization Opportunities

### 4.1 lucide-react icon tree-shaking audit
Some files import from `lucide-react` directly. While lucide-react supports tree-shaking, verifying that only used icons ship would require bundle analysis HTML inspection.

### 4.2 Admin services barrel split
`@hchat/ui/admin/services` re-exports many service hooks. Pages that only need one hook could import from specific files.

### 4.3 i18n bundle
`@hchat/ui` root barrel re-exports `* from './i18n'` which may include all locale data. Consider lazy-loading non-default locales.

### 4.4 Font subsetting
All apps load Inter font via `next/font/google`. The full character set includes Latin Extended. For Korean-only content, subsetting could reduce font size.

## 5. Measurement Commands

Run these to get exact sizes after optimization:

```bash
# Per-app build output size
for app in wiki hmg admin user llm-router desktop mobile; do
  du -sh apps/$app/out/ 2>/dev/null
done

# Admin bundle analysis (opens HTML report)
ANALYZE=true npm run build:admin

# User bundle analysis
ANALYZE=true npm run build:user

# JS-only sizes per app
for app in wiki hmg admin user llm-router desktop mobile; do
  find apps/$app/out -name '*.js' -exec cat {} + 2>/dev/null | wc -c
done
```

## 6. Build Verification

```
Tasks:    9 successful, 9 total
Cached:    0 cached, 9 total
Time:     16.82s

Tests:    145 files, 3064 passed
```
