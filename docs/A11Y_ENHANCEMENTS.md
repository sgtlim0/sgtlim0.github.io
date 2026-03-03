# Accessibility (A11Y) Enhancements

## Overview

WCAG 2.1 AA compliance improvements have been added across all apps in the hchat-wiki monorepo.

## Changes Summary

### 1. E2E Accessibility Tests (`tests/e2e/a11y.spec.ts`)

Created comprehensive Playwright accessibility tests that verify:

- **Heading Hierarchy**: All pages have at least one h1 element
- **Language Attribute**: HTML elements have proper lang attribute (ko)
- **Image Alt Text**: All images have alt text
- **Keyboard Accessibility**: Interactive elements (buttons, links, inputs) are focusable
- **Empty Elements**: Checks for buttons/links without text or aria-labels

Tests run against 5 deployed apps:
- Admin Dashboard (`https://hchat-admin.vercel.app/`)
- Admin ROI (`https://hchat-admin.vercel.app/roi/overview`)
- HMG Home (`https://hchat-hmg.vercel.app/`)
- User Home (`https://hchat-user.vercel.app/`)
- Wiki Home (`https://sgtlim0.github.io/`)

### 2. ARIA Labels Added

#### User Components (`packages/ui/src/user/`)

**ChatSearchBar.tsx**
- Added `aria-label="검색 입력"` to textarea

**ChatSidebar.tsx**
- Added `role="navigation"` and `aria-label="대화 목록 네비게이션"` to nav container
- Added `aria-label="대화 선택: {title}"` to conversation buttons
- Added `role="complementary"` and `aria-label="사이드바"` to aside elements

**AssistantGrid.tsx**
- Added `role="tablist"` and `aria-label="비서 유형 선택"` to tabs container
- Added `role="tab"` and `aria-selected` to TabButton components

**FileUploadZone.tsx**
- Added `role="button"` and `aria-label="파일 업로드 영역"` to drop zone

**UserGNB.tsx**
- Added `role="navigation"` and `aria-label="메인 네비게이션"` to nav element

#### LLM Router Components (`packages/ui/src/llm-router/`)

**LRNavbar.tsx**
- Added `role="navigation"` and `aria-label="메인 네비게이션"` to nav element
- Added `aria-label` to all navigation links (모델, 문서, Playground, 가격)

**ModelTable.tsx**
- Added `aria-label="모델 검색"` to search input
- Added `aria-sort` attributes to all sortable table headers (name, provider, inputPrice, outputPrice, contextWindow, latency)

**CodeBlock.tsx**
- Added `role="tablist"` and `aria-label="코드 언어 선택"` to tabs container
- Added `role="tab"` and `aria-selected` to language tab buttons

#### Wiki Components (`apps/wiki/components/`)

**HomePage.tsx**
- Added `aria-label="{title} 프로젝트로 이동"` to project card links

**Sidebar.tsx**
- Added `role="navigation"` and `aria-label="메인 네비게이션"` to aside element

### 3. Skip Navigation Links

Added "본문 바로가기" (Skip to Main Content) links to all app layouts:

**apps/wiki/app/layout.tsx**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded">본문 바로가기</a>
<main id="main-content">...</main>
```

**apps/llm-router/app/layout.tsx**
- Added skip link with `bg-lr-primary`
- Added `id="main-content"` to main wrapper in `app/page.tsx`

**apps/admin/app/layout.tsx**
- Added skip link with `bg-admin-primary`
- Main element already has proper structure

**apps/user/app/layout.tsx**
- Added skip link with `bg-user-primary`
- Main element already has proper structure

### 4. Screen Reader CSS Utilities

Added `.sr-only` and `.focus:not-sr-only` utility classes to all globals.css files:

- `apps/wiki/app/globals.css`
- `apps/llm-router/app/globals.css`
- `apps/admin/app/globals.css`
- `apps/user/app/globals.css`

```css
/* Accessibility - Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Testing

### Run Accessibility Tests

```bash
# Run all accessibility tests
npx playwright test tests/e2e/a11y.spec.ts

# Run with UI mode
npx playwright test tests/e2e/a11y.spec.ts --ui

# Run specific test
npx playwright test tests/e2e/a11y.spec.ts -g "should have proper heading hierarchy"
```

### Verify Skip Links

1. Tab through the page (press Tab key)
2. The "본문 바로가기" link should appear when focused
3. Pressing Enter should jump to main content

### Test with Screen Readers

- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA or JAWS
- Chrome: ChromeVox extension

## WCAG 2.1 AA Compliance Checklist

✅ **1.3.1 Info and Relationships** - Semantic HTML with proper ARIA roles
✅ **2.1.1 Keyboard** - All interactive elements are keyboard accessible
✅ **2.4.1 Bypass Blocks** - Skip navigation links implemented
✅ **2.4.4 Link Purpose** - Descriptive aria-labels on links
✅ **3.1.1 Language of Page** - lang="ko" on all HTML elements
✅ **4.1.2 Name, Role, Value** - ARIA labels and roles on all interactive elements

## Files Modified

### Tests
- `tests/e2e/a11y.spec.ts` (NEW)

### UI Components
- `packages/ui/src/user/components/ChatSearchBar.tsx`
- `packages/ui/src/user/components/ChatSidebar.tsx`
- `packages/ui/src/user/components/AssistantGrid.tsx`
- `packages/ui/src/user/components/FileUploadZone.tsx`
- `packages/ui/src/user/components/UserGNB.tsx`
- `packages/ui/src/llm-router/LRNavbar.tsx`
- `packages/ui/src/llm-router/ModelTable.tsx`
- `packages/ui/src/llm-router/CodeBlock.tsx`

### Wiki Components
- `apps/wiki/components/HomePage.tsx`
- `apps/wiki/components/Sidebar.tsx`

### Layouts
- `apps/wiki/app/layout.tsx`
- `apps/llm-router/app/layout.tsx`
- `apps/llm-router/app/page.tsx`
- `apps/admin/app/layout.tsx`
- `apps/user/app/layout.tsx`

### Styles
- `apps/wiki/app/globals.css`
- `apps/llm-router/app/globals.css`
- `apps/admin/app/globals.css`
- `apps/user/app/globals.css`

## Next Steps

Consider adding:
1. **Focus indicators** - Enhanced visual focus states beyond default browser styles
2. **Color contrast** - Verify all text meets WCAG AA contrast ratios (4.5:1 for normal text)
3. **Form validation** - Add aria-invalid and aria-describedby for form errors
4. **Live regions** - Add aria-live for dynamic content updates (chat streaming, notifications)
5. **Landmark regions** - Add more semantic HTML5 landmarks (header, footer, aside, article)
6. **axe-core integration** - Add automated accessibility testing with @axe-core/playwright

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
