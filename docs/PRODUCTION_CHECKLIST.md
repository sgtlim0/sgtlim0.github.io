# H Chat Production Checklist

> Phase 60 | Last Updated: 2026-03-07

## Infrastructure
- [ ] PostgreSQL 16 production server
- [ ] Redis 7 production server
- [ ] SSL/TLS certificates
- [ ] Domain DNS configuration
- [ ] CDN (Vercel Edge Network)

## Environment Variables
- [ ] DATABASE_URL (production DB)
- [ ] REDIS_URL (production Redis)
- [ ] JWT_SECRET (256-bit random)
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] GOOGLE_AI_API_KEY
- [ ] SENTRY_DSN
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_API_MODE=real

## Security
- [ ] API keys in vault (not env files)
- [ ] CORS configuration
- [ ] Rate limiting (per-user, per-endpoint)
- [ ] CSP headers
- [ ] HSTS enabled
- [ ] Input validation (zod schemas)
- [ ] XSS prevention (no dangerouslySetInnerHTML)

## Monitoring
- [ ] Sentry project created
- [ ] Lighthouse CI thresholds verified
- [ ] Log collection (Datadog/CloudWatch)
- [ ] Alert channels (PagerDuty/Slack)
- [ ] Web Vitals reporting enabled

## Testing
- [ ] 860+ unit tests passing
- [ ] 18 E2E tests passing
- [ ] MSW handlers covering 39 endpoints
- [ ] Load testing (k6)
- [ ] Security scan (OWASP ZAP)

## Deployment
- [ ] Vercel production env vars set
- [ ] Docker Compose production run
- [ ] DB migration executed
- [ ] Rollback plan documented
- [ ] DNS cutover plan
- [ ] Monitoring dashboards ready

## Post-Launch
- [ ] Smoke test all 8 apps
- [ ] Performance baseline recorded
- [ ] Error rate monitoring active
- [ ] User feedback channel open
