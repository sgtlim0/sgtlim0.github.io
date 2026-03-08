# H Chat Production Deployment Checklist

## Pre-requisites

- [ ] Environment variables configured (.env.production)
- [ ] API keys verified (OpenAI / Anthropic / Google)
- [ ] Database migration executed (`docker/init.sql`)
- [ ] SSL certificates provisioned
- [ ] DNS records configured for all subdomains
- [ ] Docker images built and tested locally

## Build & Deploy

- [ ] `npm run build` succeeds for all apps
- [ ] `npx vitest run` — all tests pass
- [ ] `npm run test:e2e` — Playwright E2E tests pass
- [ ] Lighthouse score check (Performance > 90)
- [ ] Bundle size within budget (check with `npm run analyze:*`)
- [ ] Static exports generated (`apps/*/out/`)
- [ ] Docker production stack starts: `npm run docker:prod`

## Security

- [ ] No hardcoded secrets (grep for API keys, passwords, tokens)
- [ ] CORS configuration verified for all origins
- [ ] CSP headers enabled in all Next.js apps (`next.config.ts`)
- [ ] Rate limiting active on API Gateway endpoints
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] JWT_SECRET is a strong random value (>= 32 chars)
- [ ] DB_PASSWORD is a strong random value (>= 24 chars)
- [ ] No `dangerouslyAllowSVG` or `unoptimized` in production
- [ ] Authentication flow tested (login, logout, token refresh)

## Database

- [ ] PostgreSQL 16 running with persistent volume
- [ ] `init.sql` schema applied (users, conversations, messages, api_keys, audit_logs)
- [ ] Indexes verified (`idx_conversations_user`, `idx_messages_conversation`, `idx_audit_logs_*`)
- [ ] Connection pooling configured
- [ ] Backup strategy in place (pg_dump schedule)

## Monitoring

- [ ] Sentry DSN configured (`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`)
- [ ] Web Vitals reporter enabled (`webVitals.ts`)
- [ ] Health check endpoints responding (`/health`, `/api/health`)
- [ ] Alert channels configured (Slack / Email)
- [ ] Log aggregation set up
- [ ] Resource usage dashboards (CPU, memory, disk)

## Load Testing

- [ ] k6 load test executed (`npm run test:load`)
- [ ] p95 latency < 500ms under 50 concurrent users
- [ ] Error rate < 1% under peak load (100 users)
- [ ] No memory leaks during sustained load

## Vercel Deployments

- [ ] Wiki: GitHub Pages deploy verified (https://sgtlim0.github.io)
- [ ] HMG: Vercel deploy verified (https://hchat-hmg.vercel.app)
- [ ] Admin: Vercel deploy verified (https://hchat-admin.vercel.app)
- [ ] User: Vercel deploy verified (https://hchat-user.vercel.app)
- [ ] LLM Router: Vercel deploy verified (https://hchat-llm-router.vercel.app)
- [ ] Desktop: Vercel deploy verified (https://hchat-desktop.vercel.app)
- [ ] Storybook: Vercel deploy verified (https://hchat-storybook.vercel.app)
- [ ] Environment variables set in Vercel dashboard for each project

## Rollback Plan

- [ ] Previous version tag identified (`git tag` list)
- [ ] Rollback procedure documented and tested
- [ ] DB rollback script prepared (if schema changed)
- [ ] Vercel instant rollback tested (Deployments > Promote)
- [ ] Docker image rollback tested (`docker compose down && docker compose up -d`)

## Post-Deploy Verification

- [ ] Smoke test all app URLs
- [ ] Chat flow end-to-end (send message, receive SSE response)
- [ ] Admin login with demo credentials
- [ ] ROI dashboard data upload works
- [ ] LLM Router model list loads correctly
- [ ] Dark mode toggle works across all apps
- [ ] Mobile responsive layout verified
