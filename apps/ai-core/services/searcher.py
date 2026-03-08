"""Web search service using Serper API with mock fallback."""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

SERPER_API_URL = "https://google.serper.dev/search"


async def search_web(query: str, num_results: int = 5) -> list[dict]:
    """Search the web for a query and return structured results.

    Returns mock results when SERPER_API_KEY is not configured.
    """
    api_key = os.getenv("SERPER_API_KEY")

    if not api_key:
        logger.warning("SERPER_API_KEY not set — returning mock results")
        return _mock_results(query, num_results)

    try:
        return await _fetch_serper(query, num_results, api_key)
    except Exception as e:
        logger.error("Serper API call failed: %s", e)
        return _mock_results(query, num_results)


async def _fetch_serper(
    query: str, num_results: int, api_key: str
) -> list[dict]:
    """Call the Serper API and parse organic results."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            SERPER_API_URL,
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query, "num": num_results},
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("organic", [])[:num_results]:
        results.append({
            "title": item.get("title", ""),
            "url": item.get("link", ""),
            "snippet": item.get("snippet", ""),
        })
    return results


def _mock_results(query: str, num_results: int) -> list[dict]:
    """Generate mock search results for development."""
    mock_data = [
        {
            "title": f"Understanding {query} - Overview",
            "url": f"https://example.com/{query.replace(' ', '-')}/overview",
            "snippet": f"A comprehensive overview of {query} covering key concepts and applications.",
        },
        {
            "title": f"{query} Best Practices Guide",
            "url": f"https://example.com/{query.replace(' ', '-')}/best-practices",
            "snippet": f"Learn the best practices for {query} with real-world examples.",
        },
        {
            "title": f"Recent Advances in {query}",
            "url": f"https://example.com/{query.replace(' ', '-')}/advances",
            "snippet": f"Discover the latest developments and research in {query}.",
        },
        {
            "title": f"{query} Tutorial for Beginners",
            "url": f"https://example.com/{query.replace(' ', '-')}/tutorial",
            "snippet": f"Step-by-step tutorial to get started with {query}.",
        },
        {
            "title": f"{query} Case Studies and Examples",
            "url": f"https://example.com/{query.replace(' ', '-')}/case-studies",
            "snippet": f"Real-world case studies demonstrating {query} in production.",
        },
    ]
    return mock_data[:num_results]
