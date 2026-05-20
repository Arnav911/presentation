from datetime import datetime
import json
from typing import Optional

from models.llm_message import LLMSystemMessage, LLMUserMessage
from models.llm_tools import SearchWebTool
from services.llm_client import LLMClient
from utils.get_dynamic_models import get_presentation_outline_model_with_n_slides
from utils.llm_client_error_handler import handle_llm_client_exceptions
from utils.llm_provider import get_model


def get_system_prompt(
    n_slides: int,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
):
    return f"""
        You are an expert presentation consultant and researcher. Your goal is to create high-impact, professional presentations that are data-driven, insightful, and logically structured.

        ### CORE GUIDELINES:
        - **Data Over Generalizations**: Prioritize specific numbers, percentages, dates, and factual entities. Avoid generic "placeholder" content.
        - **Deep Research & Synthesis**: If search results are provided, do not just summarize them. Synthesize the findings to create a cohesive narrative that answers 'Why' and 'How', not just 'What'.
        - **Logical Flow**: Ensure a strong narrative arc. Each slide should build on the previous one.
        - **Content Density**: Provide enough detail to be informative but keep it concise for a slide format. Use Markdown (bolding, lists) to make key points pop.
        - **Numerical Emphasis**: Place greater emphasis on numerical data, market trends, and competitive comparisons.
        - **Thinking Process**: Always provide a brief step-by-step reasoning of your research strategy and how you will structure the presentation BEFORE executing any tools or providing the final response.

        ### SEARCH USAGE (if tools used):
        - Extract specific data points (numbers, dates, names, rankings) from search results.
        - If conflicting data exists, prioritize the most recent or reputable source.
        - Use search results to enrich the content with real-world examples and current market data.

        ### VISUAL LAYOUT ASSIGNMENT:
        For each slide, you MUST set a `visual_type` field choosing the single best option from:
        - `timeline`       → chronological / historical sequence
        - `comparison`     → two items compared side-by-side (A vs B)
        - `metrics`        → numbers, KPIs, statistics, market data
        - `process`        → sequential steps, workflow, strategy phases
        - `quote`          → a single powerful insight or key takeaway
        - `list`           → bullet points, recommendations, lessons learned
        - `table`          → structured data rows (revenue, schedules)
        - `cover`          → title / opener slide

        Only use `timeline` if the slide is SPECIFICALLY about a historical sequence.
        Vary layouts across slides — do NOT use the same layout for every slide.

        ### FORMATTING:
        - Provide content for each slide in markdown format.
        - Make sure no images are provided in the content.
        - Do not generate a table of contents slide.
        {f"- Always make the first slide a title slide." if include_title_slide else "- Do not include a title slide."}

        # User Instruction:
        {instructions or "Follow standard professional presentation best practices."}
        
        {"# Tone: " + tone if tone else ""}
        {"# Verbosity: " + verbosity if verbosity else ""}

        **CRITICAL**: User instruction always supercedes any other instruction, except for slide numbers. **Stick to the requested number of slides ({n_slides}) regardless of user input.**
    """


def get_user_prompt(
    content: str,
    n_slides: int,
    language: str,
    additional_context: Optional[str] = None,
    web_search: bool = False,
):
    research_reminder = (
        "\n- Use the provided search results to ground the presentation in current data, market stats, and expert insights."
        if (web_search and n_slides > 3)
        else ""
    )
    return f"""
        **Input:**
        - User Topic: {content or "Create presentation"}
        - Output Language: {language}
        - Target Slide Count: {n_slides}
        - Current Date and Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - Additional Context: {additional_context or "None provided"}{research_reminder}
    """


def get_messages(
    content: str,
    n_slides: int,
    language: str,
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    web_search: bool = False,
):
    return [
        LLMSystemMessage(
            content=get_system_prompt(
                n_slides,
                tone, verbosity, instructions, include_title_slide
            ),
        ),
        LLMUserMessage(
            content=get_user_prompt(
                content, n_slides, language, additional_context, web_search
            ),
        ),
    ]


async def generate_ppt_outline(
    content: str,
    n_slides: int,
    language: Optional[str] = None,
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    web_search: bool = False,
):
    model = get_model()
    response_model = get_presentation_outline_model_with_n_slides(n_slides)

    client = LLMClient()
    messages = get_messages(
        content,
        n_slides,
        language,
        additional_context,
        tone,
        verbosity,
        instructions,
        include_title_slide,
        web_search,
    )
    
    # Enable tools if web_search is requested
    tools = None
    if web_search:
        from models.llm_tools import SearchWebTool, GetCurrentDatetimeTool
        tools = [SearchWebTool, GetCurrentDatetimeTool]

    try:
        tool_choice = None
        if client.llm_provider.value == "anthropic":
            tool_choice = {"type": "auto"} if tools else {"type": "tool", "name": "ResponseSchema"}
            
        async for chunk in client.stream_structured(
            model,
            messages,
            response_model.model_json_schema(),
            strict=True,
            tools=tools,
            tool_choice=tool_choice,
        ):
            yield chunk
    except Exception as e:
        yield handle_llm_client_exceptions(e)
