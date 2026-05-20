import os
import json

from models.user_config import UserConfig
from utils.get_env import (
    get_anthropic_api_key_env,
    get_anthropic_model_env,
    get_comfyui_url_env,
    get_comfyui_workflow_env,
    get_custom_llm_api_key_env,
    get_custom_llm_url_env,
    get_custom_model_env,
    get_dall_e_3_quality_env,
    get_disable_image_generation_env,
    get_disable_thinking_env,
    get_google_api_key_env,
    get_google_model_env,
    get_gpt_image_1_5_quality_env,
    get_llm_provider_env,
    get_ollama_model_env,
    get_ollama_url_env,
    get_openai_api_key_env,
    get_openai_model_env,
    get_pexels_api_key_env,
    get_tool_calls_env,
    get_user_config_path_env,
    get_image_provider_env,
    get_pixabay_api_key_env,
    get_extended_reasoning_env,
    get_web_grounding_env,
)
from utils.parsers import parse_bool_or_none
from utils.set_env import (
    set_anthropic_api_key_env,
    set_anthropic_model_env,
    set_comfyui_url_env,
    set_comfyui_workflow_env,
    set_custom_llm_api_key_env,
    set_custom_llm_url_env,
    set_custom_model_env,
    set_dall_e_3_quality_env,
    set_disable_image_generation_env,
    set_disable_thinking_env,
    set_extended_reasoning_env,
    set_google_api_key_env,
    set_google_model_env,
    set_gpt_image_1_5_quality_env,
    set_llm_provider_env,
    set_ollama_model_env,
    set_ollama_url_env,
    set_openai_api_key_env,
    set_openai_model_env,
    set_pexels_api_key_env,
    set_image_provider_env,
    set_pixabay_api_key_env,
    set_tool_calls_env,
    set_web_grounding_env,
)


def get_user_config():
    return UserConfig(
        LLM=get_llm_provider_env(),
        OPENAI_API_KEY=get_openai_api_key_env(),
        OPENAI_MODEL=get_openai_model_env(),
        GOOGLE_API_KEY=get_google_api_key_env(),
        GOOGLE_MODEL=get_google_model_env(),
        ANTHROPIC_API_KEY=get_anthropic_api_key_env(),
        ANTHROPIC_MODEL=get_anthropic_model_env(),
        OLLAMA_URL=get_ollama_url_env(),
        OLLAMA_MODEL=get_ollama_model_env(),
        CUSTOM_LLM_URL=get_custom_llm_url_env(),
        CUSTOM_LLM_API_KEY=get_custom_llm_api_key_env(),
        CUSTOM_MODEL=get_custom_model_env(),
        IMAGE_PROVIDER=get_image_provider_env(),
        DISABLE_IMAGE_GENERATION=parse_bool_or_none(get_disable_image_generation_env()) or False,
        PIXABAY_API_KEY=get_pixabay_api_key_env(),
        PEXELS_API_KEY=get_pexels_api_key_env(),
        COMFYUI_URL=get_comfyui_url_env(),
        COMFYUI_WORKFLOW=get_comfyui_workflow_env(),
        DALL_E_3_QUALITY=get_dall_e_3_quality_env(),
        GPT_IMAGE_1_5_QUALITY=get_gpt_image_1_5_quality_env(),
        TOOL_CALLS=parse_bool_or_none(get_tool_calls_env()) or False,
        DISABLE_THINKING=parse_bool_or_none(get_disable_thinking_env()) or False,
        EXTENDED_REASONING=parse_bool_or_none(get_extended_reasoning_env()) or False,
        WEB_GROUNDING=parse_bool_or_none(get_web_grounding_env()) or False,
    )


def update_env_with_user_config():
    # Deprecated: Config is inherently via .env so no need to flush JSON state to it
    pass
