from typing import Any, Callable, Coroutine, Optional
from pydantic import BaseModel, Field


class LLMTool(BaseModel):
    pass


class LLMDynamicTool(LLMTool):
    name: str
    description: str
    parameters: dict = {}
    handler: Callable[..., Coroutine[Any, Any, str]]


class SearchWebTool(LLMTool):
    """
    Search the web for latest, factual information, news, comparisons, and market data. 
    Use descriptive, multi-word queries for best results. Avoid searching for single words or brand names alone.
    """

    query: str = Field(description="Descriptive search query (e.g. 'Apple vs Samsung market share 2024')")


class GetCurrentDatetimeTool(LLMTool):
    """
    Get the current datetime.
    """

    pass
