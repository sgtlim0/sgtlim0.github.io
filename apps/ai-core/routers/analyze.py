"""Analyze router with 4-mode text analysis: summarize, explain, research, translate."""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services import llm_client

logger = logging.getLogger(__name__)

router = APIRouter()

MODE_PROMPTS = {
    "summarize": "다음 텍스트를 핵심 내용 위주로 간결하게 요약해주세요:\n\n{text}",
    "explain": "다음 텍스트를 쉽게 이해할 수 있도록 설명해주세요:\n\n{text}",
    "research": "다음 텍스트와 관련된 추가 정보와 맥락을 조사하여 알려주세요:\n\n{text}",
    "translate": "다음 텍스트를 영어로 번역해주세요. 원문이 영어인 경우 한국어로 번역해주세요:\n\n{text}",
}


class AnalyzeRequest(BaseModel):
    """Request body for the analyze endpoint."""

    text: str = Field(..., min_length=1, max_length=50000)
    mode: str = Field(..., pattern="^(summarize|explain|research|translate)$")
    url: str | None = None
    title: str | None = None


class AnalyzeResponse(BaseModel):
    """Response body for the analyze endpoint."""

    result: str
    mode: str


@router.post("", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze text using the specified mode."""
    try:
        prompt_template = MODE_PROMPTS.get(request.mode)
        if not prompt_template:
            raise HTTPException(status_code=400, detail=f"Unknown mode: {request.mode}")

        context = ""
        if request.title:
            context += f"출처: {request.title}\n"
        if request.url:
            context += f"URL: {request.url}\n"
        if context:
            context += "\n"

        prompt = context + prompt_template.format(text=request.text)
        messages = [{"role": "user", "content": prompt}]

        response_text = await llm_client.chat(messages)

        return AnalyzeResponse(result=response_text, mode=request.mode)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Analyze endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail="Analysis request failed") from e
