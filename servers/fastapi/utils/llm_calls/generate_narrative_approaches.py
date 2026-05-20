from models.llm_message import LLMSystemMessage, LLMUserMessage
from services.llm_client import LLMClient
from utils.llm_provider import get_model


SYSTEM_PROMPT = """
You are a strategic presentation consultant. Given a user's presentation topic, and potentially some supporting document context, generate 4 distinct narrative approaches.
Each approach should be:
- A compelling framing for the topic
- Different enough from the others to offer real choice
- Actionable as a slide deck angle

Return a JSON object with this exact schema:
{
  "approaches": [
    { "title": "short punchy title", "description": "one-sentence explanation of the angle" },
    ...
  ]
}
Only return valid JSON with exactly 4 approaches. No extra text outside the JSON.
""".strip()


async def generate_narrative_approaches(prompt: str, additional_context: str = "") -> list[dict]:
    client = LLMClient()
    model = get_model()

    user_content = f'Presentation topic: "{prompt}"'
    if additional_context:
        user_content += f'\n\nSupporting Context from User Documents:\n{additional_context[:15000]}' # Limit context size to avoid context window issues

    messages = [
        LLMSystemMessage(role="system", content=SYSTEM_PROMPT),
        LLMUserMessage(role="user", content=user_content),
    ]

    response_format = {
        "type": "object",
        "properties": {
            "approaches": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                    },
                    "required": ["title", "description"],
                },
                "minItems": 4,
                "maxItems": 4,
            }
        },
        "required": ["approaches"],
    }

    result = await client.generate_structured(
        model=model,
        messages=messages,
        response_format=response_format,
        max_tokens=1000,
        # Force Anthropic to always use the ResponseSchema tool
        tool_choice={"type": "tool", "name": "ResponseSchema"},
    )

    if not result:
        print(f"DEBUG_NARRATIVE: LLM result is empty for prompt '{prompt}'")
        return []

    print(f"DEBUG_NARRATIVE: Raw LLM result for '{prompt}': {result}")
    import json
    try:
        print(f"DEBUG_NARRATIVE: JSON representation: {json.dumps(result, indent=2)}")
    except Exception as e:
        print(f"DEBUG_NARRATIVE: Could not JSON serialize result: {e}")

    
    approaches = []
    
    if isinstance(result, dict):
        if "approaches" in result and isinstance(result["approaches"], list):
            approaches = result["approaches"]
        elif "array_of_strings" in result and isinstance(result["array_of_strings"], list):
            # Fallback for when LLM simplifies the output
            approaches = [
                {"title": str(s), "description": f"Exploring the theme of {s}."}
                for s in result["array_of_strings"]
            ]
        elif len(result) == 1 and isinstance(next(iter(result.values())), list):
            # Fallback for any other single-key list
            list_data = next(iter(result.values()))
            approaches = [
                {"title": str(s), "description": "A tailored perspective for your topic."}
                if isinstance(s, str) else s
                for s in list_data
            ]
    elif isinstance(result, list):
        # Fallback for when LLM returns list directly
        approaches = [
            {"title": str(item), "description": "AI-generated strategic framing."}
            if isinstance(item, (str, int)) else item
            for item in result
        ]

    # Ensure we have exactly 4 (pad if necessary)
    if approaches:
        while len(approaches) < 4:
            approaches.append({
                "title": f"Alternative Approach {len(approaches) + 1}",
                "description": "Another strategic angle for your presentation."
            })
        return approaches[:4]

    return []
