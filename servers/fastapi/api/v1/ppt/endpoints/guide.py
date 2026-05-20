import json
import asyncio
from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.llm_message import LLMSystemMessage, LLMUserMessage
from models.sse_response import SSEResponse, SSECompleteResponse, SSEErrorResponse
from services.llm_client import LLMClient
from utils.llm_provider import get_model
from utils.search_utils import execute_web_search_async

GUIDE_ROUTER = APIRouter(prefix="/guide", tags=["Guide"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sse_tool_log(tool: str, label: str, description: str) -> str:
    """Emit a tool-log SSE event so the frontend can render a ToolLogChip."""
    return SSEResponse(
        event="response",
        data=json.dumps({
            "type": "tool_log",
            "tool": tool,
            "label": label,
            "description": description,
        }),
    ).to_string()


def _sse_text(text: str) -> str:
    return SSEResponse(
        event="response",
        data=json.dumps({"type": "text", "text": text}),
    ).to_string()

def _sse_text_chunk(chunk: str) -> str:
    return SSEResponse(
        event="response",
        data=json.dumps({"type": "text_chunk", "chunk": chunk}),
    ).to_string()


def _sse_complete(key: str, value: object) -> str:
    return SSECompleteResponse(key=key, value=value).to_string()


def _format_search_results(results: list) -> str:
    if not results:
        return "No search results found."
    lines = []
    for i, r in enumerate(results[:8], 1):
        title = r.get("title", "")
        body = r.get("body", "")
        href = r.get("href", "")
        lines.append(f"{i}. {title}\n   URL: {href}\n   {body[:400]}")
    return "\n\n".join(lines)


# ---------------------------------------------------------------------------
# Slide count mapping from duration answer
# ---------------------------------------------------------------------------

DURATION_TO_SLIDES = {
    "short":  8,
    "medium": 12,
    "long":   16,
}

def _extract_slide_count(duration_answer: str) -> int:
    """Extract slide count from the duration Q&A answer."""
    lower = duration_answer.lower()
    if "short" in lower or "5-10" in lower or "8 slide" in lower:
        return DURATION_TO_SLIDES["short"]
    if "long" in lower or "30" in lower or "16 slide" in lower:
        return DURATION_TO_SLIDES["long"]
    return DURATION_TO_SLIDES["medium"]  # default


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class GuideTasksRequest(BaseModel):
    prompt: str

class GuideTasksResponse(BaseModel):
    tasks: List[str]

class GuideAnalysisRequest(BaseModel):
    prompt: str

class GuideAnalysisResponse(BaseModel):
    analysis: str

class GuideStrategyRequest(BaseModel):
    prompt: str
    answers: dict  # q1..q7

class GuideResearchRequest(BaseModel):
    prompt: str
    strategy: str  # strategy summary text

class GuideOutlineRequest(BaseModel):
    prompt: str
    strategy: str
    research_summary: str
    n_slides: int

class GuideDesignRequest(BaseModel):
    prompt: str
    strategy: str
    outline_summary: str  # first ~3 slide titles as context


# ---------------------------------------------------------------------------
# /tasks  — unchanged
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.post("/tasks", response_model=GuideTasksResponse)
async def guide_tasks(body: GuideTasksRequest):
    """Generate a dynamic task list for the guide mode based on the user's topic."""
    system_prompt = "You are a Senior Presentation Consultant. Return only valid JSON."
    user_prompt = f"""The user wants to create a presentation about: "{body.prompt}"

Generate a list of exactly 6 task names for the research and consultation process.
Task 1 should be a research task about the specific topic.
Tasks 2-6 should be consultation phases.

Return ONLY a JSON array of strings, no explanation. Example format:
["Research [topic] - market position, business models, competitive landscape", "Phase 1: Strategy Layer - Define audience, purpose, and context", "Phase 2: Substance Layer - Gather and filter materials", "Phase 3: Structure Layer - Design narrative framework and outline", "Phase 4: Surface Layer - Define visual style and design approach", "Phase 5: Execution & Reflection - Build slides and quality review"]

Make the first task specific to the topic: "{body.prompt}"
"""
    try:
        client = LLMClient()
        model = get_model()
        messages = [
            LLMSystemMessage(role="system", content=system_prompt),
            LLMUserMessage(role="user", content=user_prompt),
        ]
        completion = await client.generate(model=model, messages=messages, max_tokens=300)
        text = completion.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        tasks = json.loads(text.strip())
        if not isinstance(tasks, list):
            raise ValueError("Expected a list")
        return GuideTasksResponse(tasks=tasks)
    except Exception:
        import traceback
        traceback.print_exc()
        topic = body.prompt
        return GuideTasksResponse(tasks=[
            f"Research {topic} - market position, business models, competitive landscape",
            "Phase 1: Strategy Layer - Define audience, purpose, and context",
            "Phase 2: Substance Layer - Gather and filter materials",
            "Phase 3: Structure Layer - Design narrative framework and outline",
            "Phase 4: Surface Layer - Define visual style and design approach",
            "Phase 5: Execution & Reflection - Build slides and quality review",
        ])


# ---------------------------------------------------------------------------
# /analysis  — Phase 0 initial research (kept for backward compat)
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.post("/analysis", response_model=GuideAnalysisResponse)
async def guide_analysis(body: GuideAnalysisRequest):
    """Research the topic using web search and generate a rich analysis summary."""
    search_queries = [
        body.prompt,
        f"{body.prompt} market analysis statistics 2024 2025",
        f"{body.prompt} competitive landscape key insights",
    ]
    search_tasks = [execute_web_search_async(q, max_results=6) for q in search_queries]
    all_results = await asyncio.gather(*search_tasks, return_exceptions=True)

    combined_results = []
    seen_titles: set = set()
    for result_set in all_results:
        if isinstance(result_set, list):
            for r in result_set:
                title = r.get("title", "")
                if title not in seen_titles:
                    seen_titles.add(title)
                    combined_results.append(r)

    search_context = _format_search_results(combined_results)

    system_prompt = """You are a Senior Presentation Consultant who has just completed deep research on a topic.
You synthesize research into clear, authoritative, data-rich summaries for presentation strategy."""

    user_prompt = f"""The user wants to create a presentation about: "{body.prompt}"

I have gathered the following real web search results about this topic:

=== SEARCH RESULTS ===
{search_context}
=== END SEARCH RESULTS ===

Based on this research, generate a rich Phase 1 analysis summary. Follow this EXACT format:

**Phase 1: Strategy Layer – Understanding Your Needs**

Great! I've researched [topic]. Here's what I found:

**Key [Topic] Context**
• [Bullet point with specific data/stat from research]
• [Bullet point with specific data/stat from research]
• [Bullet point with specific data/stat from research]
• [Bullet point with specific data/stat from research]
• [Bullet point with specific data/stat from research]

[1-2 sentence synthesis paragraph summarizing the competitive/strategic landscape]

Now, before we proceed, I need to understand the strategic context for your presentation. Let me ask you some key questions to tailor this perfectly.

Rules:
- Use REAL data from the search results — specific numbers, percentages, dates, company names
- Keep bullet points concise and data-rich
- Do NOT make up statistics not supported by the search results
- End with exactly the sentence about "Let me ask you some key questions"
"""
    try:
        client = LLMClient()
        model = get_model()
        messages = [
            LLMSystemMessage(role="system", content=system_prompt),
            LLMUserMessage(role="user", content=user_prompt),
        ]
        completion = await client.generate(model=model, messages=messages, max_tokens=700)
        return GuideAnalysisResponse(analysis=completion)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# /phase1/strategy-summary  — generate strategy table after Q1-Q7
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.post("/phase1/strategy-summary")
async def guide_phase1_strategy_summary(body: GuideStrategyRequest):
    """Generate the Strategy Summary Table + Content Priorities after Q&A."""

    answers = body.answers
    n_slides = _extract_slide_count(answers.get("duration", "medium"))

    system_prompt = "You are a Senior Presentation Consultant. Generate structured strategy summaries in markdown."

    user_prompt = f"""A user wants to create a presentation about: "{body.prompt}"

They answered these strategic questions:
- Audience: {answers.get('audience', 'Not specified')}
- Core Purpose: {answers.get('purpose', 'Not specified')}
- Delivery Format: {answers.get('delivery', 'Not specified')}
- Material Strategy: {answers.get('material', 'AI-led research')}
- Presentation Duration: {answers.get('duration', 'Medium (15-20 minutes)')}
- Content Emphasis (may be multiple): {answers.get('emphasis', 'Not specified')}
- Tone: {answers.get('tone', 'Not specified')}

Generate a Strategy Summary for their approval. Use this EXACT markdown format:

**Strategy Summary for Your Approval**

Based on our discussion, here's the complete strategic blueprint for your presentation:

| Dimension | Decision | Rationale |
|---|---|---|
| Target Audience | [from answers] | [1 sentence why] |
| Core Purpose | [from answers] | [1 sentence why] |
| Delivery Format | [from answers] | [slide count + format note] |
| Tone & Style | [from answers] | [1 sentence why] |
| Material Strategy | [from answers] | [1 sentence why] |

**📌 Content Priorities (User-Selected Emphasis)**
1. [Primary emphasis topic] — [brief explanation]
2. [Secondary emphasis] — [brief explanation]
3. [Supporting emphasis] — [brief explanation]

**Key Design Implications**
• Narrative Arc: [1 sentence]
• Visual Priority: [1 sentence]  
• Strategic Depth: [1 sentence]
• Actionable Takeaways: [1 sentence]

✅ **Confirmation Required**
Does this strategy accurately capture your vision? Once you confirm, I'll move to Phase 2: Substance Layer — conducting deep, comprehensive research.

Rules:
- n_slides will be {n_slides} (derived from duration answer)
- Be specific, reference the user's actual answers
- Keep table cells concise (max 15 words per cell)
"""

    try:
        client = LLMClient()
        model = get_model()
        messages = [
            LLMSystemMessage(role="system", content=system_prompt),
            LLMUserMessage(role="user", content=user_prompt),
        ]
        completion = await client.generate(model=model, messages=messages, max_tokens=1000)
        return {"strategy_summary": completion, "n_slides": n_slides}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# /phase2/research  — SSE streaming deep research
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.get("/phase2/research")
async def guide_phase2_research_get():
    raise HTTPException(status_code=405, detail="Use POST")

@GUIDE_ROUTER.post("/phase2/research")
async def guide_phase2_research(body: GuideResearchRequest):
    """Deep research with live tool-log SSE events."""

    async def inner():
        await asyncio.sleep(0)

        # --- Phase 2 intro text ---
        yield _sse_text(
            "**Phase 2: Substance Layer – Deep Research Execution**\n\n"
            "Excellent! Strategy confirmed. Let me now conduct deep, comprehensive research "
            "to build the evidence base for your presentation."
        )
        await asyncio.sleep(0.1)

        # --- Parallel search tool log ---
        search_queries = [
            body.prompt,
            f"{body.prompt} history timeline key milestones",
            f"{body.prompt} market share financials revenue 2024 2025",
            f"{body.prompt} business model strategy competitive analysis",
            f"{body.prompt} latest news developments 2025",
        ]

        yield _sse_tool_log(
            tool="search",
            label="Parallel Search",
            description=f"{body.prompt[:50]}...",
        )
        await asyncio.sleep(0.2)

        # Run all searches in parallel
        search_tasks = [execute_web_search_async(q, max_results=5) for q in search_queries]
        all_results = await asyncio.gather(*search_tasks, return_exceptions=True)

        # Emit read tool logs for unique URLs found
        seen_urls: set = set()
        combined_results = []
        for result_set in all_results:
            if isinstance(result_set, list):
                for r in result_set:
                    href = r.get("href", "")
                    title = r.get("title", "")
                    if href and href not in seen_urls:
                        seen_urls.add(href)
                        combined_results.append(r)
                        # Emit a Read chip for each unique source
                        yield _sse_tool_log(
                            tool="read",
                            label="Read",
                            description=href[:70],
                        )
                        await asyncio.sleep(0.05)

        search_context = _format_search_results(combined_results[:12])

        # --- LLM synthesis ---
        system_prompt = """You are a Senior Presentation Consultant synthesizing research into a structured Phase 2 report.
Write in a clear, analytical style. Use specific facts and data from the research."""

        user_prompt = f"""Create a presentation about: "{body.prompt}"

Strategy context: {body.strategy[:400]}

SEARCH RESULTS:
{search_context}

Generate a structured Phase 2 Research Findings report with this EXACT format:

**Phase 2: Research Findings & Material Filtration**

**📋 Research Summary by Priority**

**Priority 1: [Most important emphasis from strategy]**
• [Specific fact/stat with source context]
• [Specific fact/stat]
• [Specific fact/stat]
• [Specific fact/stat]

**Priority 2: [Second emphasis]**
• [Specific fact/stat]
• [Specific fact/stat]
• [Specific fact/stat]

**Priority 3: [Third emphasis / supporting data]**
• [Specific fact/stat]
• [Specific fact/stat]
• [Specific fact/stat]

---

**🎯 Proposed Core Message (Elevator Pitch)**

> "[One powerful, memorable sentence that captures the essential insight or narrative of this presentation]"

**Why this message works:**
✅ [Reason 1 — relevance to audience]
✅ [Reason 2 — narrative power]
✅ [Reason 3 — strategic insight]
✅ [Reason 4 — actionability]

Rules:
- Use REAL data from search results. Quote specific numbers, percentages, dates
- Keep bullets concise and punchy
- The core message should be quotable — one bold, memorable sentence
- Do NOT invent statistics not supported by the research
"""

        try:
            client = LLMClient()
            model = get_model()
            messages = [
                LLMSystemMessage(role="system", content=system_prompt),
                LLMUserMessage(role="user", content=user_prompt),
            ]
            completion = await client.generate(model=model, messages=messages, max_tokens=1200)
            yield _sse_complete("research_summary", completion)
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


# ---------------------------------------------------------------------------
# /phase3/outline  — SSE streaming outline generation
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.post("/phase3/outline")
async def guide_phase3_outline(body: GuideOutlineRequest):
    """Generate full presentation outline with SSE tool-log events."""

    async def inner():
        await asyncio.sleep(0)

        yield _sse_text(
            "**Phase 3: Structure Layer – Designing the Narrative Framework**\n\n"
            "Excellent! The research is confirmed and the core message is approved. "
            "Now let's design the narrative architecture for your presentation."
        )
        await asyncio.sleep(0.1)

        yield _sse_tool_log(
            tool="think",
            label="Think",
            description=f"Selecting narrative framework for {body.prompt[:50]}...",
        )
        await asyncio.sleep(0.2)

        system_prompt = """You are a Senior Presentation Consultant designing a detailed slide-by-slide outline.
Think like a McKinsey consultant — every slide has a clear purpose, evidence, and strategic rationale."""

        user_prompt = f"""Create a detailed {body.n_slides}-slide presentation outline about: "{body.prompt}"

Strategy: {body.strategy[:500]}

Research findings summary:
{body.research_summary[:1500]}

Generate a complete slide-by-slide outline. Follow this EXACT format:

**Draft Presentation Outline — {body.n_slides} Slides**

**SECTION 1: OPENING & CONTEXT (2 slides)**

**Slide 1: [Title]**
• Purpose: [Why this slide exists]
• Key Content: [2-3 content points with specifics]
• Evidence: [Research reference or data point]
• Placement Rationale: [Why it's here in the narrative]

**Slide 2: [Title]**
[same structure]

**SECTION 2: [SECTION NAME] ([N] slides)**

[Continue for all {body.n_slides} slides organized into 4-5 logical sections]

---

**Page Count Allocation Summary**

| Section | Slides | Purpose |
|---|---|---|
| Opening & Context | 2 | [reason] |
| [Section 2] | [N] | [reason] |
| [Section 3] | [N] | [reason] |
| [Section 4] | [N] | [reason] |
| [Section 5] | [N] | [reason] |

---

**How This Outline Delivers on Strategy**
✅ Audience: [validation]
✅ Purpose: [validation]
✅ Tone: [validation]
✅ Duration: [slide count × avg time = total]
✅ Core Message: [how the arc builds to the core message]

Rules:
- Generate EXACTLY {body.n_slides} slides
- Be specific — use actual topic names, not placeholders
- Each slide should have a clear, distinct job in the narrative
- Group slides into 4-5 logical sections with headers
"""

        try:
            client = LLMClient()
            model = get_model()
            messages = [
                LLMSystemMessage(role="system", content=system_prompt),
                LLMUserMessage(role="user", content=user_prompt),
            ]
            completion_text = ""
            async for chunk in client.generate_stream(model=model, messages=messages, max_tokens=3000):
                if chunk:
                    completion_text += chunk
                    yield _sse_text_chunk(chunk)
            
            yield _sse_complete("outline", completion_text)
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


# ---------------------------------------------------------------------------
# /phase4/design  — design brief generation
# ---------------------------------------------------------------------------

@GUIDE_ROUTER.post("/phase4/design")
async def guide_phase4_design(body: GuideDesignRequest):
    """Generate the design brief and design summary table."""

    system_prompt = "You are a Senior Presentation Designer. Generate precise, opinionated design briefs."

    user_prompt = f"""A presentation about "{body.prompt}" needs a design direction.

Strategy context: {body.strategy[:400]}
Outline summary: {body.outline_summary[:300]}

Generate a Phase 4 Design Direction brief with this EXACT format:

**Phase 4: Surface Layer – Design Direction**

Excellent! The outline is approved. Now let's define the visual design direction.

**1. Information Density Recommendation**
[Visual-First vs Document-Style — explain the choice based on delivery format]

**2. Visual Style Recommendation**
[Modern Business / Academic / Creative — explain reasoning]

**3. Brand & Color Strategy**
[Specific color recommendations with hex codes if the topic has brand colors, or curated palette]

**4. Design Summary for Approval**

| Design Element | Decision | Rationale |
|---|---|---|
| Information Density | [choice] | [1-line reason] |
| Visual Style | [choice] | [1-line reason] |
| Color Palette | [specific colors with hex] | [1-line reason] |
| Typography | [font recommendation] | [1-line reason] |
| Key Visual Elements | [chart types, diagrams] | [1-line reason] |
| Brand Assets | [logos/colors approach] | [1-line reason] |

Rules:
- Be specific about colors — include hex codes where possible
- Recommend Google Fonts for typography (clean, web-safe)
- Match visual style to the audience and purpose from the strategy
- If topic is a brand (e.g. company name), use their actual brand colors
"""

    async def inner():
        try:
            client = LLMClient()
            model = get_model()
            messages = [
                LLMSystemMessage(role="system", content=system_prompt),
                LLMUserMessage(role="user", content=user_prompt),
            ]
            
            completion_text = ""
            async for chunk in client.generate_stream(model=model, messages=messages, max_tokens=3000):
                if chunk:
                    completion_text += chunk
                    yield _sse_text_chunk(chunk)
            
            yield _sse_complete("design_brief", completion_text)
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
