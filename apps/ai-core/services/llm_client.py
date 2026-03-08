"""Multi-provider LLM client supporting OpenAI, Anthropic, and Google.

Routes requests to the appropriate provider based on environment configuration.
Falls back to mock responses when API keys are not configured.
"""

import asyncio
import json
import logging
import os
from collections.abc import AsyncGenerator

import httpx

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")

DEFAULT_PROVIDER = os.environ.get("LLM_PROVIDER", "mock")
DEFAULT_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")

_HTTP_TIMEOUT = 60.0


def _resolve_provider(provider: str, model: str) -> tuple[str, str]:
    """Resolve provider and model, applying defaults."""
    p = provider or DEFAULT_PROVIDER
    m = model or DEFAULT_MODEL
    return p, m


# ---------------------------------------------------------------------------
# OpenAI
# ---------------------------------------------------------------------------


async def _openai_chat(messages: list[dict], model: str) -> str:
    """Send a non-streaming request to OpenAI Chat Completions API."""
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 4096,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def _openai_stream(
    messages: list[dict], model: str
) -> AsyncGenerator[str, None]:
    """Stream tokens from OpenAI Chat Completions API."""
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        async with client.stream(
            "POST",
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 4096,
                "stream": True,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:]
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        yield content
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


# ---------------------------------------------------------------------------
# Anthropic
# ---------------------------------------------------------------------------


async def _anthropic_chat(messages: list[dict], model: str) -> str:
    """Send a non-streaming request to Anthropic Messages API."""
    system_text, api_messages = _extract_system_message(messages)

    body: dict = {
        "model": model,
        "max_tokens": 4096,
        "messages": api_messages,
    }
    if system_text:
        body["system"] = system_text

    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json=body,
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


async def _anthropic_stream(
    messages: list[dict], model: str
) -> AsyncGenerator[str, None]:
    """Stream tokens from Anthropic Messages API."""
    system_text, api_messages = _extract_system_message(messages)

    body: dict = {
        "model": model,
        "max_tokens": 4096,
        "messages": api_messages,
        "stream": True,
    }
    if system_text:
        body["system"] = system_text

    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        async with client.stream(
            "POST",
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json=body,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                try:
                    event = json.loads(line[6:])
                    if event.get("type") == "content_block_delta":
                        text = event.get("delta", {}).get("text", "")
                        if text:
                            yield text
                except json.JSONDecodeError:
                    continue


def _extract_system_message(
    messages: list[dict],
) -> tuple[str, list[dict]]:
    """Extract system message from the list for Anthropic's API format.

    Anthropic requires system messages to be passed as a top-level parameter,
    not within the messages array.
    """
    system_text = ""
    api_messages: list[dict] = []

    for msg in messages:
        if msg.get("role") == "system":
            system_text = msg.get("content", "")
        else:
            api_messages.append({"role": msg["role"], "content": msg["content"]})

    return system_text, api_messages


# ---------------------------------------------------------------------------
# Google (Gemini)
# ---------------------------------------------------------------------------


async def _google_chat(messages: list[dict], model: str) -> str:
    """Send a non-streaming request to Google Generative Language API."""
    contents = _to_google_contents(messages)

    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            params={"key": GOOGLE_API_KEY},
            headers={"Content-Type": "application/json"},
            json={"contents": contents},
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def _google_stream(
    messages: list[dict], model: str
) -> AsyncGenerator[str, None]:
    """Stream tokens from Google Generative Language API."""
    contents = _to_google_contents(messages)

    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        async with client.stream(
            "POST",
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent",
            params={"key": GOOGLE_API_KEY, "alt": "sse"},
            headers={"Content-Type": "application/json"},
            json={"contents": contents},
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                try:
                    chunk = json.loads(line[6:])
                    parts = (
                        chunk.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [])
                    )
                    for part in parts:
                        text = part.get("text", "")
                        if text:
                            yield text
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


def _to_google_contents(messages: list[dict]) -> list[dict]:
    """Convert OpenAI-style messages to Google Generative Language format.

    Maps 'assistant' role to 'model' and 'system' messages to 'user' context.
    """
    contents: list[dict] = []
    for msg in messages:
        role = msg.get("role", "user")
        if role == "system":
            role = "user"
        elif role == "assistant":
            role = "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})
    return contents


# ---------------------------------------------------------------------------
# Mock (development fallback)
# ---------------------------------------------------------------------------


def _mock_response(messages: list[dict]) -> str:
    """Generate a mock response for development without API keys."""
    last_msg = messages[-1]["content"] if messages else "empty"
    return (
        f"[Mock Response] Received your message: '{last_msg[:80]}'. "
        "This is a mock response because no LLM provider is configured. "
        "Set LLM_PROVIDER and the corresponding API key to enable real AI responses."
    )


async def _mock_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Generate mock streaming tokens for development."""
    response = _mock_response(messages)
    words = response.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.05)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_PROVIDER_CHAT = {
    "openai": (lambda msgs, m: _openai_chat(msgs, m), OPENAI_API_KEY),
    "anthropic": (lambda msgs, m: _anthropic_chat(msgs, m), ANTHROPIC_API_KEY),
    "google": (lambda msgs, m: _google_chat(msgs, m), GOOGLE_API_KEY),
}

_PROVIDER_STREAM = {
    "openai": (lambda msgs, m: _openai_stream(msgs, m), OPENAI_API_KEY),
    "anthropic": (lambda msgs, m: _anthropic_stream(msgs, m), ANTHROPIC_API_KEY),
    "google": (lambda msgs, m: _google_stream(msgs, m), GOOGLE_API_KEY),
}


async def chat(messages: list[dict], provider: str = "", model: str = "") -> str:
    """Send messages to LLM and return complete response.

    Selects provider based on arguments or environment defaults.
    Falls back to mock response when no API key is available.
    """
    p, m = _resolve_provider(provider, model)

    entry = _PROVIDER_CHAT.get(p)
    if entry is not None:
        fn, api_key = entry
        if api_key:
            try:
                return await fn(messages, m)
            except httpx.HTTPStatusError as e:
                logger.error("LLM API error (%s %s): %s", p, m, e.response.text[:200])
                return _mock_response(messages)
            except Exception as e:
                logger.error("LLM call failed (%s %s): %s", p, m, e)
                return _mock_response(messages)
        else:
            logger.warning("API key not set for provider '%s' — using mock", p)

    return _mock_response(messages)


async def chat_stream(
    messages: list[dict], provider: str = "", model: str = ""
) -> AsyncGenerator[str, None]:
    """Stream tokens from LLM.

    Selects provider based on arguments or environment defaults.
    Falls back to mock streaming when no API key is available.
    """
    p, m = _resolve_provider(provider, model)

    entry = _PROVIDER_STREAM.get(p)
    if entry is not None:
        fn, api_key = entry
        if api_key:
            try:
                async for token in fn(messages, m):
                    yield token
                return
            except httpx.HTTPStatusError as e:
                logger.error(
                    "LLM stream error (%s %s): %s", p, m, e.response.text[:200]
                )
            except Exception as e:
                logger.error("LLM stream failed (%s %s): %s", p, m, e)
        else:
            logger.warning("API key not set for provider '%s' — using mock stream", p)

    async for token in _mock_stream(messages):
        yield token
