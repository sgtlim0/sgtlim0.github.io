"""Chat router with standard and SSE streaming endpoints."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from optimizer.prompt_builder import build_chat_prompt
from services import llm_client

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatMessage(BaseModel):
    """A single chat message."""

    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=50000)


class ChatRequest(BaseModel):
    """Request body for chat endpoints."""

    message: str = Field(..., min_length=1, max_length=50000)
    history: list[ChatMessage] = Field(default_factory=list)
    use_compression: bool = False


class CompressionStats(BaseModel):
    """Compression statistics returned with chat responses."""

    compressed: bool = False
    original_tokens: int = 0
    compressed_tokens: int = 0
    compression_ratio: float = 0.0


class ChatResponse(BaseModel):
    """Response body for the chat endpoint."""

    response: str
    stats: CompressionStats


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and return the AI response."""
    try:
        messages, stats = build_chat_prompt(
            user_message=request.message,
            history=[m.model_dump() for m in request.history],
            use_compression=request.use_compression,
        )
        response_text = await llm_client.chat(messages)

        return ChatResponse(
            response=response_text,
            stats=CompressionStats(**stats),
        )
    except Exception as e:
        logger.error("Chat endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail="Chat request failed") from e


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat response tokens via Server-Sent Events."""
    try:
        messages, _ = build_chat_prompt(
            user_message=request.message,
            history=[m.model_dump() for m in request.history],
            use_compression=request.use_compression,
        )
        return StreamingResponse(
            _event_generator(messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        logger.error("Stream endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail="Stream request failed") from e


async def _event_generator(messages: list[dict]):
    """Yield SSE-formatted events from the LLM stream."""
    try:
        async for token in llm_client.chat_stream(messages):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        logger.error("SSE stream error: %s", e)
        yield f"data: [ERROR] {e}\n\n"
