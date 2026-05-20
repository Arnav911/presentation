import asyncio
import os
from typing import List, Dict, Any
from duckduckgo_search import DDGS

def perform_web_search(query: str, max_results: int = 10, region: str = "wt-wt") -> List[Dict[str, str]]:
    # Try Tavily first if API key is present
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    if tavily_api_key and tavily_api_key.strip():
        try:
            from tavily import TavilyClient
            tavily = TavilyClient(api_key=tavily_api_key)
            # Tavily's search returns results in a similar format
            search_result = tavily.search(query=query, search_depth="advanced", max_results=max_results)
            results = []
            for r in search_result.get("results", []):
                results.append({
                    "title": r.get("title", ""),
                    "href": r.get("url", ""),
                    "body": r.get("content", "")
                })
            if results:
                return results
        except Exception as e:
            print(f"Tavily search error: {e}. Falling back to DuckDuckGo.")

    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results, region=region):
                results.append({
                    "title": r.get("title", ""),
                    "href": r.get("href", ""),
                    "body": r.get("body", "")
                })
        return results
    except Exception as e:
        print(f"Web search error: {e}")
        return []

async def execute_web_search_async(query: str, max_results: int = 10, region: str = "wt-wt") -> List[Dict[str, str]]:
    return await asyncio.to_thread(perform_web_search, query, max_results, region)
