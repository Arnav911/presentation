import asyncio
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Body
from fastapi.responses import StreamingResponse

from models.llm_message import LLMUserMessage, OpenAIAssistantMessage, LLMSystemMessage
from models.llm_tools import SearchWebTool, GetCurrentDatetimeTool
from models.sse_response import SSEResponse, SSEErrorResponse
from services.llm_client import LLMClient
from utils.llm_provider import get_model

AGENT_CHAT_ROUTER = APIRouter(prefix="/agent-chat", tags=["Agent Chat"])

SYSTEM_PROMPT = """
You are a Senior Presentation Consultant helping a user create an excellent presentation.
You exist in a chat interface where the user can brainstorm ideas, ask for revisions, or discuss story angles.
Always be helpful, strategic, and concise. 
If the user asks you to modify a slide, confirm you understand and offer suggestions.
"""

@AGENT_CHAT_ROUTER.post("/stream")
async def stream_agent_chat(
    messages: List[Dict[str, Any]] = Body(...),
):
    async def inner():
        try:
            llm_messages = [LLMSystemMessage(content=SYSTEM_PROMPT.strip())]
            
            for msg in messages:
                if msg.get("role") == "user":
                    llm_messages.append(LLMUserMessage(content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    llm_messages.append(OpenAIAssistantMessage(content=msg.get("content", "")))
            
            client = LLMClient()
            model = get_model()

            async for chunk in client.stream(
                model=model,
                messages=llm_messages,
                tools=[SearchWebTool, GetCurrentDatetimeTool]
            ):
                await asyncio.sleep(0)
                if isinstance(chunk, str):
                    yield SSEResponse(
                        event="response",
                        data=json.dumps({"type": "chunk", "chunk": chunk}),
                    ).to_string()
                elif isinstance(chunk, dict) and chunk.get("type") == "citations":
                     yield SSEResponse(
                        event="response",
                        data=json.dumps({"type": "citations", "citations": chunk["citations"]}),
                    ).to_string()
                    
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield SSEErrorResponse(detail=str(e)).to_string()

    return StreamingResponse(
        inner(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
