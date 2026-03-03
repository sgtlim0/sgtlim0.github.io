# Accessibility Testing Guide

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all accessibility tests
npx playwright test tests/e2e/a11y.spec.ts

# Run with UI mode (recommended for debugging)
npx playwright test tests/e2e/a11y.spec.ts --ui

# Run specific test by page name
npx playwright test tests/e2e/a11y.spec.ts -g "Admin Dashboard"
npx playwright test tests/e2e/a11y.spec.ts -g "Wiki Home"
```

## Test Coverage

The accessibility test suite (`tests/e2e/a11y.spec.ts`) verifies 5 checks across 5 deployed apps:

### Apps Tested
1. **Admin Dashboard** - `https://hchat-admin.vercel.app/`
2. **Admin ROI** - `https://hchat-admin.vercel.app/roi/overview`
3. **HMG Home** - `https://hchat-hmg.vercel.app/`
4. **User Home** - `https://hchat-user.vercel.app/`
5. **Wiki Home** - `https://sgtlim0.github.io/`

### Tests per Page (5 checks × 5 pages = 25 tests total)

#### 1. Proper Heading Hierarchy
Verifies each page has at least one `<h1>` element for main heading.

**Why it matters**: Screen readers use heading hierarchy to navigate page structure.

#### 2. Language Attribute
Verifies `<html>` element has `lang` attribute set (should be "ko" for Korean).

**Why it matters**: Screen readers use language to select correct pronunciation.

#### 3. Image Alt Text
Verifies all `<img>` elements have `alt` attributes.

**Why it matters**: Alt text provides description for screen reader users and when images fail to load.

#### 4. Keyboard Accessibility
Counts focusable interactive elements (buttons, links, inputs, selects, textareas).

**Why it matters**: All functionality must be accessible via keyboard for users who can't use a mouse.

#### 5. Empty Links/Buttons
Warns about buttons without text or aria-labels (allows some for icon buttons with nested SVG).

**Why it matters**: Interactive elements need accessible names for screen readers.

## Manual Testing Checklist

### Skip Navigation Link
1. Navigate to any page
2. Press `Tab` key
3. First focused element should be "본문 바로가기" (Skip to Main Content)
4. Press `Enter` to jump to main content
5. Next `Tab` should focus first interactive element in main content

### Keyboard Navigation
Test on each app:
```
Tab          → Move forward through interactive elements
Shift+Tab    → Move backward
Enter/Space  → Activate buttons/links
Arrow keys   → Navigate within components (dropdowns, tabs)
Escape       → Close modals/dropdowns
```

### Screen Reader Testing

#### macOS VoiceOver
```bash
# Enable VoiceOver
Cmd + F5

# Basic commands
Ctrl + Option + →    → Move to next element
Ctrl + Option + ←    → Move to previous element
Ctrl + Option + U    → Open rotor (navigation menu)
Ctrl + Option + H    → Jump to next heading
Ctrl + Option + L    → Jump to next link
```

#### NVDA (Windows)
```
# Basic commands
Insert + Down        → Read next line
Insert + Up          → Read previous line
H                    → Jump to next heading
K                    → Jump to next link
B                    → Jump to next button
```

### Focus Visibility
1. Tab through all pages
2. Verify visible focus indicator on:
   - Links
   - Buttons
   - Form inputs
   - Tabs
   - Interactive cards

### Color Contrast
Use browser DevTools or extensions:
- Chrome: Lighthouse (Ctrl+Shift+I → Lighthouse tab)
- Firefox: Accessibility Inspector
- Edge: DevTools Accessibility pane

Target ratios (WCAG AA):
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

## Automated Testing Tools

### 1. Playwright (Current Implementation)
```bash
npx playwright test tests/e2e/a11y.spec.ts --reporter=html
```

### 2. axe-core (Recommended Addition)
```bash
npm install -D @axe-core/playwright

# Add to test file:
import { injectAxe, checkA11y } from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('https://hchat-user.vercel.app/')
  await injectAxe(page)
  await checkA11y(page)
})
```

### 3. Lighthouse CI
```bash
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=https://hchat-admin.vercel.app/
```

## Common Issues & Fixes

### Missing ARIA Labels
**Problem**: Button with only icon, no text
```tsx
// ❌ Bad
<button onClick={handleClick}>
  <SearchIcon />
</button>

// ✅ Good
<button onClick={handleClick} aria-label="검색">
  <SearchIcon />
</button>
```

### Missing Form Labels
**Problem**: Input without associated label
```tsx
// ❌ Bad
<input type="text" placeholder="이름" />

// ✅ Good - Method 1: Label wrapper
<label>
  이름
  <input type="text" />
</label>

// ✅ Good - Method 2: For attribute
<label htmlFor="name">이름</label>
<input type="text" id="name" />

// ✅ Good - Method 3: ARIA label
<input type="text" aria-label="이름" placeholder="이름" />
```

### Incorrect Heading Order
**Problem**: Skipping heading levels
```tsx
// ❌ Bad
<h1>Page Title</h1>
<h3>Section</h3>  {/* Skipped h2 */}

// ✅ Good
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Missing Alt Text
**Problem**: Decorative images with no alt attribute
```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good - Informative image
<img src="logo.png" alt="H Chat 로고" />

// ✅ Good - Decorative image
<img src="bg-pattern.png" alt="" />
```

## CI/CD Integration

Add to GitHub Actions workflow:
```yaml
- name: Run Accessibility Tests
  run: npx playwright test tests/e2e/a11y.spec.ts

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Lighthouse Accessibility Audits](https://web.dev/lighthouse-accessibility/)

## Getting Help

For accessibility questions:
1. Check [ARIA specification](https://www.w3.org/TR/wai-aria-1.2/)
2. Search [WebAIM mailing list](https://webaim.org/discussion/)
3. Test with actual screen reader users when possible
