from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from core.config import settings
from services.llm import get_llm_provider, GeminiProvider, MockLLMProvider

router = APIRouter(prefix="/llm", tags=["LLM Configuration & Status"])

class LLMStatusResponse(BaseModel):
    provider: str
    model: str
    configured: bool
    status: str
    mode: str  # "gemini_live" or "mock_mode"

class LLMTestResponse(BaseModel):
    success: bool
    provider: str
    model: str
    status: str
    message: str
    sample_output: Optional[str] = None

@router.get("/status", response_model=LLMStatusResponse)
def get_llm_status():
    """
    Get current AI Provider status and model name.
    Strictly guarantees that API keys and secrets are never returned.
    """
    has_key = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 0)
    provider_type = settings.LLM_PROVIDER.lower()
    
    if provider_type == "gemini" and has_key:
        status = "connected"
        mode = "gemini_live"
    elif provider_type == "gemini" and not has_key:
        status = "not_configured"
        mode = "mock_mode"
    else:
        status = "active"
        mode = "mock_mode"

    return LLMStatusResponse(
        provider="Google Gemini" if provider_type == "gemini" else "Mock Provider",
        model=settings.GEMINI_MODEL if provider_type == "gemini" else "mock-engine",
        configured=has_key,
        status=status,
        mode=mode
    )

@router.post("/test", response_model=LLMTestResponse)
async def test_llm_connection():
    """
    Safely trigger a connectivity and generation test against the active provider.
    Returns status and safe feedback message without exposing credentials.
    """
    provider = get_llm_provider()
    result = await provider.test_connection()
    
    return LLMTestResponse(
        success=result.get("success", False),
        provider=result.get("provider", "unknown"),
        model=result.get("model", settings.GEMINI_MODEL),
        status=result.get("status", "unknown"),
        message=result.get("message", ""),
        sample_output=result.get("sample_output")
    )
