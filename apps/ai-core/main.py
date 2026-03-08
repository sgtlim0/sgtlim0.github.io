"""FastAPI application entry point for H Chat AI Core."""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze, chat, research

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

EXTENSION_ORIGIN = os.environ.get("EXTENSION_ORIGIN", "")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:5173",
]

if EXTENSION_ORIGIN:
    ALLOWED_ORIGINS.append(EXTENSION_ORIGIN)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle."""
    logger.info("AI Core starting up")
    yield
    logger.info("AI Core shutting down")


app = FastAPI(
    title="H Chat AI Core",
    description="Backend AI service for H Chat platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(research.router, prefix="/research", tags=["research"])


@app.get("/health")
async def health_check():
    """Return service health status."""
    return {"status": "ok", "service": "ai-core", "version": "0.1.0"}
