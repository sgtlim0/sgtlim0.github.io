# H Chat AI Core

FastAPI backend service for the H Chat platform. Provides chat, text analysis, and web research capabilities with multi-provider LLM support.

## Tech Stack

- **Python 3.12+**, FastAPI, Pydantic v2
- **LLM Providers**: OpenAI, Anthropic (Claude), Google (Gemini) — with mock fallback
- **HTTP Client**: httpx (async)
- **Prompt Optimization**: entropy-based compression (`optimizer/`)

## Project Structure

```
apps/ai-core/
├── main.py                   # FastAPI app entry point (CORS, lifespan, router mount)
├── routers/
│   ├── chat.py               # POST /chat, POST /chat/stream (SSE)
│   ├── analyze.py            # POST /analyze (summarize, explain, research, translate)
│   └── research.py           # POST /research (search-crawl-summarize pipeline)
├── services/
│   ├── llm_client.py         # Multi-provider LLM client (OpenAI, Anthropic, Google, mock)
│   ├── searcher.py           # Web search integration
│   ├── crawler.py            # Page content extraction
│   └── summarizer.py         # Source summarization
└── optimizer/
    ├── entropy_encoder.py    # Token compression via entropy encoding
    └── prompt_builder.py     # Prompt construction with optional compression
```

## Quick Start

```bash
cd apps/ai-core

# Install dependencies
pip install -r requirements.txt   # or: pip install fastapi uvicorn httpx python-dotenv pydantic

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run server
uvicorn main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | No | `mock` | LLM provider: `openai`, `anthropic`, `google`, `mock` |
| `LLM_MODEL` | No | `gpt-4o-mini` | Default model ID |
| `OPENAI_API_KEY` | If using OpenAI | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | If using Anthropic | — | Anthropic API key |
| `GOOGLE_API_KEY` | If using Google | — | Google Generative AI API key |
| `EXTENSION_ORIGIN` | No | — | Chrome Extension origin for CORS |

When no API key is configured for the selected provider, the service falls back to mock responses automatically.

## API Endpoints

| Method | Path | Description | Rate Limit (via proxy) |
|--------|------|-------------|------------------------|
| `GET` | `/health` | Health check | — |
| `POST` | `/chat` | Send chat message | 30/min |
| `POST` | `/chat/stream` | SSE streaming chat | 20/min |
| `POST` | `/analyze` | Text analysis (4 modes) | 20/min |
| `POST` | `/research` | Web research pipeline | 10/min |

Full OpenAPI spec: [`docs/openapi.yaml`](../../docs/openapi.yaml)

FastAPI also auto-generates interactive docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Architecture

```
Client (Browser/Extension)
   │
   ▼
User API (Next.js, port 3003)     ← Zod validation, CSRF, rate limiting
   │
   ▼
AI Core (FastAPI, port 8000)      ← This service
   │
   ├── Prompt Builder (optional compression)
   │
   ▼
LLM Provider (OpenAI / Anthropic / Google / Mock)
```

Clients never call AI Core directly. The User API proxy handles:
- Request validation (Zod schemas)
- CSRF token verification (Double Submit Cookie + HMAC)
- IP-based rate limiting (sliding window)
- Error normalization

## SSE Streaming

The `/chat/stream` endpoint returns `text/event-stream` with:

```
data: Hello
data:  world
data: !
data: [DONE]
```

On error: `data: [ERROR] <message>`

Headers: `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`

## CORS

Allowed origins (configured in `main.py`):
- `localhost:3000` through `localhost:3006` (all dev apps)
- `localhost:5173` (Desktop app)
- Custom extension origin via `EXTENSION_ORIGIN` env var
