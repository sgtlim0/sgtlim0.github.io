"""Source summarization service using LLM."""

import logging

from services import llm_client

logger = logging.getLogger(__name__)

SUMMARIZE_SYSTEM_PROMPT = (
    "You are a research assistant. Summarize the provided sources "
    "to answer the user's query. Cite sources using [1], [2], etc. "
    "Be concise and factual. If sources conflict, note the discrepancy."
)


async def summarize_sources(query: str, sources: list[dict]) -> str:
    """Summarize multiple web sources into a coherent answer.

    Each source dict should have: title, url, content.
    Returns a summary with numbered source citations.
    """
    if not sources:
        return "No sources available to summarize."

    context = _build_context(sources)
    messages = [
        {"role": "user", "content": f"Query: {query}\n\n{context}"},
    ]

    try:
        return await llm_client.chat(messages)
    except Exception as e:
        logger.error("Summarization failed: %s", e)
        return _fallback_summary(query, sources)


def _build_context(sources: list[dict]) -> str:
    """Format sources into numbered context blocks."""
    parts = []
    for i, source in enumerate(sources, 1):
        title = source.get("title", "Untitled")
        url = source.get("url", "")
        content = source.get("content", "No content available")
        parts.append(f"[{i}] {title}\nURL: {url}\n{content}\n")
    return "\n".join(parts)


def _fallback_summary(query: str, sources: list[dict]) -> str:
    """Generate a basic summary without LLM when API is unavailable."""
    lines = [f"Research results for: {query}\n"]
    for i, source in enumerate(sources, 1):
        title = source.get("title", "Untitled")
        url = source.get("url", "")
        snippet = source.get("content", "")[:200]
        lines.append(f"[{i}] {title}\n    {url}\n    {snippet}\n")
    return "\n".join(lines)
