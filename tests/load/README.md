# k6 Load Tests

H Chat monorepo API and page load testing with [k6](https://k6.io/).

## Prerequisites

Install k6 (macOS):

```bash
brew install k6
```

## Quick Start

```bash
# Run with defaults (localhost)
npm run test:load

# Run against deployed environments
npm run test:load:staging
npm run test:load:prod
```

## Scenarios

| # | Name | Executor | VUs | Duration | Target |
|---|------|----------|-----|----------|--------|
| 1 | `smoke_health` | constant-vus | 1 | 10s | `/api/health` |
| 2 | `chat_load` | constant-vus | 10 | 30s | `/api/chat` |
| 3 | `stream_load` | constant-vus | 5 | 30s | `/api/chat/stream` (SSE) |
| 4 | `research_load` | constant-vus | 3 | 30s | `/api/analyze` |
| 5 | `pages_load` | constant-vus | 5 | 30s | Wiki, Admin, LLM Router pages |
| 6 | `spike` | ramping-vus | 0-100 | 40s | Mixed (health + chat + wiki) |

Timeline: scenarios 1 runs first (0-10s), scenarios 2-5 run in parallel (10-40s), spike starts at 50s.

## Thresholds

| Metric | Threshold |
|--------|-----------|
| `http_req_duration` | p(95) < 500ms, p(99) < 1000ms |
| `http_req_failed` | rate < 1% |
| `http_reqs` | rate > 100 req/s |
| `chat_duration` | p(95) < 800ms |
| `stream_duration` | p(95) < 2000ms |
| `research_duration` | p(95) < 3000ms |
| `health_errors` | rate < 0.1% |
| `chat_errors` | rate < 2% |
| `stream_errors` | rate < 5% |
| `page_errors` | rate < 1% |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3003` | User app API base |
| `WIKI_URL` | `http://localhost:3000` | Wiki app |
| `ADMIN_URL` | `http://localhost:3002` | Admin app |
| `LLM_ROUTER_URL` | `http://localhost:3004` | LLM Router app |

Example:

```bash
k6 run -e BASE_URL=https://hchat-user.vercel.app \
       -e WIKI_URL=https://sgtlim0.github.io \
       -e ADMIN_URL=https://hchat-admin.vercel.app \
       -e LLM_ROUTER_URL=https://hchat-llm-router.vercel.app \
       tests/load/k6-config.js
```

## Run a Single Scenario

```bash
k6 run --scenario smoke_health tests/load/k6-config.js
k6 run --scenario chat_load tests/load/k6-config.js
k6 run --scenario spike tests/load/k6-config.js
```

## SSE Streaming Note

k6 does not have native EventSource/SSE support. The `stream_load` scenario sends a standard HTTP POST with `Accept: text/event-stream` and reads the full response once the connection closes. This validates endpoint availability and latency but does not measure individual SSE event timing.

## Production Warning

When running against production URLs, all test scenarios use **read-only** GET and POST requests with mock payloads. However, exercise caution:

- Keep VU counts low for production (reduce via `--vus` or environment overrides)
- Monitor server metrics during test runs
- Avoid running spike tests against production without coordination
