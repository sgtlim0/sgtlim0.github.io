"""Research router with search-crawl-summarize pipeline."""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.crawler import fetch_page_text
from services.searcher import search_web
from services.summarizer import summarize_sources

logger = logging.getLogger(__name__)

router = APIRouter()


class ResearchRequest(BaseModel):
    """Request body for the research endpoint."""

    query: str = Field(..., min_length=1, max_length=1000)
    num_sources: int = Field(default=3, ge=1, le=10)


class SourceItem(BaseModel):
    """A single source used in the research response."""

    title: str
    url: str
    snippet: str


class ResearchResponse(BaseModel):
    """Response body for the research endpoint."""

    query: str
    summary: str
    sources: list[SourceItem]
    num_sources_used: int


@router.post("", response_model=ResearchResponse)
async def research(request: ResearchRequest):
    """Execute a research pipeline: search, crawl, and summarize."""
    try:
        search_results = await search_web(request.query, request.num_sources)

        enriched = await _crawl_sources(search_results)

        summary = await summarize_sources(request.query, enriched)

        sources = [
            SourceItem(
                title=s.get("title", ""),
                url=s.get("url", ""),
                snippet=s.get("snippet", ""),
            )
            for s in search_results
        ]

        return ResearchResponse(
            query=request.query,
            summary=summary,
            sources=sources,
            num_sources_used=len(enriched),
        )
    except Exception as e:
        logger.error("Research endpoint failed: %s", e)
        raise HTTPException(
            status_code=500, detail="Research request failed"
        ) from e


async def _crawl_sources(search_results: list[dict]) -> list[dict]:
    """Crawl each search result and attach page content."""
    enriched = []
    for result in search_results:
        url = result.get("url", "")
        content = await fetch_page_text(url) if url else ""
        enriched.append({
            "title": result.get("title", ""),
            "url": url,
            "snippet": result.get("snippet", ""),
            "content": content if content else result.get("snippet", ""),
        })
    return enriched
