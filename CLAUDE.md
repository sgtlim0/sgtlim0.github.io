# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Notion-style markdown wiki for H Chat documentation, built with Next.js 16 and statically exported to GitHub Pages.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Static export to ./out
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
```

No test framework is configured.

## Architecture

**Static-export Next.js 16 app** using App Router with a single catch-all route.

### Content Pipeline

1. Markdown files in `content/` with gray-matter frontmatter (minimum: `title`)
2. `lib/markdown.ts` reads content at build time — `getAllPages()` scans recursively, `getPageBySlug()` finds by slug, `getNavigation()` builds hierarchical nav tree
3. `app/[[...slug]]/page.tsx` — catch-all route; `content/home.md` maps to `/`, everything else maps by path (e.g., `content/h-chat/faq.md` → `/h-chat/faq`)
4. `generateStaticParams()` pre-renders all pages for static export

### Key Components

- `components/MarkdownRenderer.tsx` — Client component using react-markdown + remark-gfm + rehype-highlight with custom Tailwind-styled element mappings
- `components/Sidebar.tsx` — Client component with collapsible navigation, fixed 256px (`w-64`) left sidebar; main content offset with `ml-64`
- `app/layout.tsx` — Root layout calls `getNavigation()` at render time, uses Inter font

### Content Structure

```
content/
├── home.md                          # Root page (/)
├── getting-started.md               # /getting-started
├── guides/markdown-basics.md        # /guides/markdown-basics
└── h-chat/                          # H Chat documentation
    ├── faq.md
    └── guide/
        ├── get-started/overview.md
        ├── get-started/quickstart.md
        └── capabilities/models.md
```

Subdirectories without a matching `.md` file become auto-generated parent nav groups (title derived from folder name).

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) → `npm run build` → uploads `out/` → GitHub Pages. Triggers on push to `main`. Uses Node.js 20.

### Configuration

- `next.config.ts` — `output: 'export'` with `images.unoptimized: true`
- `basePath` is not set; uncomment and set if deploying to a subpath
- Tailwind CSS 4 via `@tailwindcss/postcss`; global styles in `app/globals.css`
- Path alias: `@/*` maps to project root
