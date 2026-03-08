"""Prompt builder with optional entropy-based compression."""

import logging

from optimizer.entropy_encoder import TokenEntropyEncoder

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are H Chat, an AI assistant for Hyundai Motor Group. "
    "Be helpful, accurate, and concise. Respond in the same "
    "language as the user's message."
)


def build_chat_prompt(
    user_message: str,
    history: list[dict] | None = None,
    use_compression: bool = False,
) -> tuple[list[dict], dict]:
    """Build a chat prompt with optional entropy compression.

    Returns a tuple of (messages, stats) where messages is the
    formatted message list and stats contains compression info.
    """
    stats = {
        "compressed": False,
        "original_tokens": 0,
        "compressed_tokens": 0,
        "compression_ratio": 0.0,
    }

    processed_message = user_message
    if use_compression:
        processed_message, stats = _compress_message(user_message)

    messages = _build_messages(processed_message, history)
    return messages, stats


def _compress_message(user_message: str) -> tuple[str, dict]:
    """Apply entropy encoding to compress the user message."""
    encoder = TokenEntropyEncoder()
    compressed = encoder.encode(user_message)
    stats = encoder.compression_stats(user_message, compressed)
    stats["compressed"] = True

    logger.info(
        "Prompt compressed: %d -> %d tokens (%.1f%% saved)",
        stats["original_tokens"],
        stats["compressed_tokens"],
        stats["compression_ratio"] * 100,
    )

    return compressed, stats


def _build_messages(
    user_message: str, history: list[dict] | None
) -> list[dict]:
    """Assemble the message list from history and current message."""
    messages = []

    if history:
        for entry in history:
            role = entry.get("role", "user")
            content = entry.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})
    return messages
