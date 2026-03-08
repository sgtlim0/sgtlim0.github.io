"""Web page crawler using httpx and BeautifulSoup."""

import logging

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (compatible; HChatBot/1.0; "
    "+https://github.com/sgtlim0/hchat-wiki)"
)

NOISE_TAGS = [
    "script",
    "style",
    "nav",
    "footer",
    "header",
    "aside",
    "noscript",
    "iframe",
    "form",
    "button",
    "svg",
]


async def fetch_page_text(url: str, max_chars: int = 3000) -> str:
    """Fetch a web page and extract clean text content.

    Removes noise elements (scripts, nav, footer, etc.) and
    returns plain text truncated to max_chars.
    """
    try:
        html = await _fetch_html(url)
        return _extract_text(html, max_chars)
    except httpx.TimeoutException:
        logger.warning("Timeout fetching %s", url)
        return ""
    except httpx.HTTPStatusError as e:
        logger.warning("HTTP %d for %s", e.response.status_code, url)
        return ""
    except Exception as e:
        logger.error("Failed to fetch %s: %s", url, e)
        return ""


async def _fetch_html(url: str) -> str:
    """Fetch raw HTML from a URL."""
    async with httpx.AsyncClient(
        timeout=10.0,
        follow_redirects=True,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text


def _extract_text(html: str, max_chars: int) -> str:
    """Parse HTML, remove noise elements, and extract text."""
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup.find_all(NOISE_TAGS):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    clean_text = "\n".join(lines)

    if len(clean_text) > max_chars:
        clean_text = clean_text[:max_chars] + "..."

    return clean_text
