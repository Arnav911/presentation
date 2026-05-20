from models.llm_message import LLMSystemMessage, LLMUserMessage
from services.llm_client import LLMClient
from utils.llm_provider import get_model

TEMPLATES = [
    {
        "id": "general",
        "description": "General purpose layouts for common presentation elements. Best for educational, informative, or balanced presentations."
    },
    {
        "id": "modern",
        "description": "Modern white and blue business pitch deck layouts with clean, professional design. Best for corporate pitches, business proposals, or tech-focused decks."
    },
    {
        "id": "standard",
        "description": "Standard layouts for presentations. Best for formal, traditional, or academic presentations."
    },
    {
        "id": "swift",
        "description": "Swift layouts for presentations. Best for quick updates, minimal designs, or rapid information sharing."
    }
]

SYSTEM_PROMPT = f"""
You are a presentation design architect. Your task is to analyze a user's presentation prompt and select the most appropriate visual template from the available options.

AVAILABLE TEMPLATES:
{chr(10).join([f"- {t['id']}: {t['description']}" for t in TEMPLATES])}

Analyze the user's intent, audience, and industry to pick the best match. 

Return a JSON object with this exact schema:
{{
  "selected_template": "template_id"
}}
Only return valid JSON. No extra text.
""".strip()

async def auto_select_template(prompt: str) -> str:
    client = LLMClient()
    model = get_model()

    messages = [
        LLMSystemMessage(role="system", content=SYSTEM_PROMPT),
        LLMUserMessage(role="user", content=f'Presentation prompt: "{prompt}"'),
    ]

    response_format = {
        "type": "object",
        "properties": {
            "selected_template": {
                "type": "string",
                "enum": [t["id"] for t in TEMPLATES]
            }
        },
        "required": ["selected_template"],
    }

    result = await client.generate_structured(
        model=model,
        messages=messages,
        response_format=response_format,
        max_tokens=100,
    )

    if result and isinstance(result, dict) and "selected_template" in result:
        return result["selected_template"]
    
    return "general" # Default fallback
