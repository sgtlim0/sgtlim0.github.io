# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

npm workspaces monorepo for H Chat — Wiki, HMG site, Admin panel, and shared Storybook.

## Monorepo Structure

```
hchat-wiki/
├── packages/
│   ├── tokens/          # @hchat/tokens — Design token CSS variables (light/dark)
│   └── ui/              # @hchat/ui — Shared UI components
│       └── src/
│           ├── hmg/     # HMG components (GNB, HeroBanner, Footer, etc.)
│           └── admin/   # Admin components (StatCard, DataTable, etc.)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 16 markdown wiki (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js 16 HMG site (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 16 admin panel (Vercel)
│   └── storybook/       # @hchat/storybook — Storybook 9 (Vercel)
├── design/              # wiki.pen, design1.pen
└── docs/
```

## Commands

```bash
npm install              # Install all workspace dependencies
npm run build            # Turbo: build all apps
npm run build:wiki       # Wiki only → apps/wiki/out/
npm run build:hmg        # HMG only → apps/hmg/out/
npm run build:admin      # Admin only → apps/admin/out/
npm run build:storybook  # Storybook only → apps/storybook/storybook-static/
npm run dev:wiki         # Wiki dev at localhost:3000
npm run dev:hmg          # HMG dev at localhost:3001
npm run dev:admin        # Admin dev at localhost:3002
npm run dev:storybook    # Storybook dev at localhost:6006
```

## Package Dependency Graph

```
@hchat/tokens  ←  @hchat/ui  ←  @hchat/wiki
                       ↑        ←  @hchat/hmg
                       ↑        ←  @hchat/admin
               @hchat/storybook
```

## Tech Stack

- Next.js 16.1.1 (App Router, Static Export), TypeScript 5, Tailwind CSS 4
- Turborepo for build orchestration
- Storybook 9 with nextjs-vite framework
- Design tokens: CSS variables in `packages/tokens/styles/tokens.css`

## Architecture

### Design Tokens (`packages/tokens/`)
CSS variables for Wiki, HMG, and Admin themes (light + dark). Each app imports via `@import "../../../packages/tokens/styles/tokens.css"` in its globals.css and maps to Tailwind via `@theme inline`.

### Shared UI (`packages/ui/`)
- `@hchat/ui` — Badge, ThemeProvider, ThemeToggle, FeatureCard
- `@hchat/ui/hmg` — GNB, HeroBanner, TabFilter, Footer, HmgStatCard, StepItem, DownloadItem, PillButton
- `@hchat/ui/admin` — StatusBadge, MonthPicker, StatCard, DataTable, BarChartRow, UserCard, SettingsRow, AdminDashboard, AdminUsageHistory, AdminStatistics, AdminUserManagement, AdminSettings

### Wiki App (`apps/wiki/`)
Markdown wiki with Sidebar + catch-all route. Content in `apps/wiki/content/`.

### HMG App (`apps/hmg/`)
4 pages: Home (`/`), Publications (`/publications`), StepGuide (`/guide`), Dashboard (`/dashboard`).

### Admin App (`apps/admin/`)
5 pages: Dashboard (`/`), Usage (`/usage`), Statistics (`/statistics`), Users (`/users`), Settings (`/settings`).

### Storybook (`apps/storybook/`)
Stories for Wiki (13), Admin (12), and HMG (8) components. Uses vite aliases in `.storybook/main.ts` for monorepo resolution.

### Dark Mode
All apps use ThemeProvider from `@hchat/ui` with `.dark` class toggle on `<html>`.

### Deployment
- Wiki: GitHub Actions → GitHub Pages
- HMG/Admin/Storybook: Vercel (separate projects)
