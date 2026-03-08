"""Anthropic Claude API client with graceful mock fallback."""

import logging
import os
from collections.abc import AsyncGenerator

logger = logging.getLogger(__name__)

_client = None
_MOCK_MODE = False


def _get_client():
    """Lazily initialize the Anthropic client."""
    global _client, _MOCK_MODE

    if _client is not None:
        return _client

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set — using mock responses")
        _MOCK_MODE = True
        return None

    try:
        import anthropic

        _client = anthropic.Anthropic(api_key=api_key)
        logger.info("Anthropic client initialized")
        return _client
    except Exception as e:
        logger.error("Failed to initialize Anthropic client: %s", e)
        _MOCK_MODE = True
        return None


async def chat(messages: list[dict], model: str = "claude-sonnet-4-20250514") -> str:
    """Send a chat request and return the full response text.

    Falls back to mock response when API key is unavailable.
    """
    client = _get_client()

    if _MOCK_MODE or client is None:
        return _mock_response(messages)

    try:
        response = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=messages,
        )
        return response.content[0].text
    except Exception as e:
        logger.error("Chat API call failed: %s", e)
        return _mock_response(messages)


async def chat_stream(
    messages: list[dict], model: str = "claude-sonnet-4-20250514"
) -> AsyncGenerator[str, None]:
    """Stream chat response tokens as an async generator.

    Falls back to mock streaming when API key is unavailable.
    """
    client = _get_client()

    if _MOCK_MODE or client is None:
        async for token in _mock_stream(messages):
            yield token
        return

    try:
        with client.messages.stream(
            model=model,
            max_tokens=4096,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:
        logger.error("Stream API call failed: %s", e)
        async for token in _mock_stream(messages):
            yield token


def _mock_response(messages: list[dict]) -> str:
    """Generate a mock response for development without API key."""
    last_msg = messages[-1]["content"] if messages else "empty"
    return (
        f"[Mock Response] Received your message: '{last_msg[:80]}'. "
        "This is a mock response because ANTHROPIC_API_KEY is not configured. "
        "Set the environment variable to enable real AI responses."
    )


async def _mock_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Generate mock streaming tokens for development."""
    import asyncio

    response = _mock_response(messages)
    words = response.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.05)
