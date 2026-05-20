import asyncio
import base64
import hashlib
import hmac
import json
import os
import time
import aiohttp
from fastapi import HTTPException
from google import genai
from openai import NOT_GIVEN, AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.get_env import (
    get_dall_e_3_quality_env,
    get_gpt_image_1_5_quality_env,
    get_pexels_api_key_env,
    get_kling_api_key_env,
    get_kling_secret_key_env,
)
from utils.get_env import get_pixabay_api_key_env, get_openai_api_key_env
from utils.get_env import get_comfyui_url_env
from utils.get_env import get_comfyui_workflow_env
from utils.image_provider import (
    is_gpt_image_1_5_selected,
    is_image_generation_disabled,
    is_pixels_selected,
    is_pixabay_selected,
    is_gemini_flash_selected,
    is_nanobanana_pro_selected,
    is_dalle3_selected,
    is_comfyui_selected,
    is_kling_selected,
)
import uuid


class ImageGenerationService:
    def __init__(self, output_directory: str):
        self.output_directory = output_directory
        self.is_image_generation_disabled = is_image_generation_disabled()
        self.image_gen_func = self.get_image_gen_func()

    def get_image_gen_func(self):
        if self.is_image_generation_disabled:
            return None

        if is_pixabay_selected():
            return self.get_image_from_pixabay
        elif is_pixels_selected():
            return self.get_image_from_pexels
        elif is_gemini_flash_selected():
            return self.generate_image_gemini_flash
        elif is_nanobanana_pro_selected():
            return self.generate_image_nanobanana_pro
        elif is_dalle3_selected():
            return self.generate_image_openai_dalle3
        elif is_gpt_image_1_5_selected():
            return self.generate_image_openai_gpt_image_1_5
        elif is_comfyui_selected():
            return self.generate_image_comfyui
        elif is_kling_selected():
            return self.generate_image_kling
        return None

    def is_stock_provider_selected(self):
        return is_pixels_selected() or is_pixabay_selected()

    async def generate_image(self, prompt: ImagePrompt) -> str | ImageAsset:
        """
        Generates an image based on the provided prompt.
        - If no image generation function is available, returns a placeholder image.
        - If the stock provider is selected, it uses the prompt directly,
        otherwise it uses the full image prompt with theme.
        - Output Directory is used for saving the generated image not the stock provider.
        """
        if self.is_image_generation_disabled:
            print("Image generation is disabled. Using placeholder image.")
            return "/static/images/placeholder.jpg"

        if not self.image_gen_func:
            print("No image generation function found. Using placeholder image.")
            return "/static/images/placeholder.jpg"

        image_prompt = prompt.get_image_prompt(
            with_theme=not self.is_stock_provider_selected()
        )
        print(f"Request - Generating Image for {image_prompt}")

        try:
            if self.is_stock_provider_selected():
                image_path = await self.image_gen_func(image_prompt)
            else:
                image_path = await self.image_gen_func(
                    image_prompt, self.output_directory
                )
            if image_path:
                if image_path.startswith("http"):
                    return image_path
                elif os.path.exists(image_path):
                    return ImageAsset(
                        path=image_path,
                        is_uploaded=False,
                        extras={
                            "prompt": prompt.prompt,
                            "theme_prompt": prompt.theme_prompt,
                        },
                    )
            raise Exception(f"Image not found at {image_path}")

        except Exception as e:
            print(f"Error generating image: {e}")
            return "/static/images/placeholder.jpg"

    async def generate_image_openai(
        self, prompt: str, output_directory: str, model: str, quality: str
    ) -> str:
        client = AsyncOpenAI(api_key=get_openai_api_key_env())
        result = await client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            quality=quality,
            response_format="b64_json" if model == "dall-e-3" else NOT_GIVEN,
            size="1024x1024",
        )
        image_path = os.path.join(output_directory, f"{uuid.uuid4()}.png")
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(result.data[0].b64_json))
        return image_path

    async def generate_image_openai_dalle3(
        self, prompt: str, output_directory: str
    ) -> str:
        return await self.generate_image_openai(
            prompt,
            output_directory,
            "dall-e-3",
            get_dall_e_3_quality_env() or "standard",
        )

    async def generate_image_openai_gpt_image_1_5(
        self, prompt: str, output_directory: str
    ) -> str:
        return await self.generate_image_openai(
            prompt,
            output_directory,
            "gpt-image-1.5",
            get_gpt_image_1_5_quality_env() or "medium",
        )

    async def _generate_image_google(
        self, prompt: str, output_directory: str, model: str
    ) -> str:
        """Base method for Google image generation models."""
        client = genai.Client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=model,
            contents=[prompt],
        )

        image_path = None
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image = part.as_image()
                image_path = os.path.join(output_directory, f"{uuid.uuid4()}.jpg")
                image.save(image_path)

        if not image_path:
            raise HTTPException(
                status_code=500, detail=f"No image generated by google {model}"
            )

        return image_path

    async def generate_image_gemini_flash(
        self, prompt: str, output_directory: str
    ) -> str:
        """Generate image using Gemini Flash (gemini-2.5-flash-image-preview)."""
        return await self._generate_image_google(
            prompt, output_directory, "gemini-2.5-flash-image-preview"
        )

    async def generate_image_nanobanana_pro(
        self, prompt: str, output_directory: str
    ) -> str:
        """Generate image using NanoBanana Pro (gemini-3-pro-image-preview)."""
        return await self._generate_image_google(
            prompt, output_directory, "gemini-3-pro-image-preview"
        )

    async def get_image_from_pexels(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://api.pexels.com/v1/search?query={prompt}&per_page=1",
                headers={"Authorization": f"{get_pexels_api_key_env()}"},
            )
            data = await response.json()
            image_url = data["photos"][0]["src"]["large"]
            return image_url

    async def get_image_from_pixabay(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://pixabay.com/api/?key={get_pixabay_api_key_env()}&q={prompt}&image_type=photo&per_page=3"
            )
            data = await response.json()
            image_url = data["hits"][0]["largeImageURL"]
            return image_url

    async def generate_image_comfyui(self, prompt: str, output_directory: str) -> str:
        """
        Generate image using ComfyUI workflow API.

        User provides:
        - COMFYUI_URL: ComfyUI server URL (e.g., http://192.168.1.7:8188)
        - COMFYUI_WORKFLOW: Workflow JSON exported from ComfyUI

        The workflow should have a CLIPTextEncode node with "Positive" in the title
        where the prompt will be injected.

        Args:
            prompt: The text prompt for image generation
            output_directory: Directory to save the generated image

        Returns:
            Path to the generated image file
        """
        comfyui_url = get_comfyui_url_env()
        workflow_json = get_comfyui_workflow_env()

        if not comfyui_url:
            raise ValueError("COMFYUI_URL environment variable is not set")

        if not workflow_json:
            raise ValueError(
                "COMFYUI_WORKFLOW environment variable is not set. Please provide a ComfyUI workflow JSON."
            )

        # Ensure URL doesn't have trailing slash
        comfyui_url = comfyui_url.rstrip("/")

        # Parse the workflow JSON
        try:
            workflow = json.loads(workflow_json)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid workflow JSON: {str(e)}")

        # Find and update the positive prompt node
        workflow = self._inject_prompt_into_workflow(workflow, prompt)

        async with aiohttp.ClientSession(trust_env=True) as session:
            # Step 1: Submit workflow
            prompt_id = await self._submit_comfyui_workflow(
                session, comfyui_url, workflow
            )

            # Step 2: Wait for completion
            status_data = await self._wait_for_comfyui_completion(
                session, comfyui_url, prompt_id
            )

            # Step 3: Download the generated image
            image_path = await self._download_comfyui_image(
                session, comfyui_url, status_data, prompt_id, output_directory
            )

            return image_path

    def _inject_prompt_into_workflow(self, workflow: dict, prompt: str) -> dict:
        """
        Find the prompt node in the workflow and inject the prompt text.
        Looks for a node with title 'Input Prompt' (case-insensitive).

        User must rename their prompt node to 'Input Prompt' in ComfyUI.
        """
        for node_id, node_data in workflow.items():
            meta = node_data.get("_meta", {})
            title = meta.get("title", "").lower()

            if title == "input prompt":
                if "inputs" in node_data and "text" in node_data["inputs"]:
                    node_data["inputs"]["text"] = prompt
                    print(
                        f"Injected prompt into node {node_id}: {meta.get('title', '')}"
                    )
                    return workflow

        raise ValueError(
            "Could not find a node with title 'Input Prompt' in the workflow. Please rename your prompt node to 'Input Prompt' in ComfyUI."
        )

    async def _submit_comfyui_workflow(
        self, session: aiohttp.ClientSession, comfyui_url: str, workflow: dict
    ) -> str:
        """Submit workflow to ComfyUI and return the prompt_id."""
        client_id = str(uuid.uuid4())
        payload = {"prompt": workflow, "client_id": client_id}

        response = await session.post(
            f"{comfyui_url}/prompt",
            json=payload,
            timeout=aiohttp.ClientTimeout(total=30),
        )

        if response.status != 200:
            error_text = await response.text()
            raise Exception(f"Failed to submit workflow to ComfyUI: {error_text}")

        data = await response.json()
        prompt_id = data.get("prompt_id")

        if not prompt_id:
            raise Exception("No prompt_id returned from ComfyUI")

        print(f"ComfyUI workflow submitted. Prompt ID: {prompt_id}")
        return prompt_id

    async def _wait_for_comfyui_completion(
        self,
        session: aiohttp.ClientSession,
        comfyui_url: str,
        prompt_id: str,
        timeout: int = 300,
        poll_interval: int = 4,
    ) -> dict:
        """Poll ComfyUI history endpoint until workflow completes."""
        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                raise Exception(f"ComfyUI workflow timed out after {timeout} seconds")

            await asyncio.sleep(poll_interval)

            response = await session.get(
                f"{comfyui_url}/history/{prompt_id}",
                timeout=aiohttp.ClientTimeout(total=30),
            )

            if response.status != 200:
                continue

            try:
                status_data = await response.json()
            except Exception as _:
                continue

            if prompt_id in status_data:
                execution_data = status_data[prompt_id]

                # Check for completion
                if "status" in execution_data:
                    status = execution_data["status"]
                    if status.get("completed", False):
                        print("ComfyUI workflow completed successfully")
                        return status_data
                    if "error" in status:
                        raise Exception(f"ComfyUI workflow error: {status['error']}")

                # Also check if outputs exist (alternative completion check)
                if "outputs" in execution_data and execution_data["outputs"]:
                    print("ComfyUI workflow completed (outputs found)")
                    return status_data

            print(f"Waiting for ComfyUI workflow... ({int(elapsed)}s)")

    async def _download_comfyui_image(
        self,
        session: aiohttp.ClientSession,
        comfyui_url: str,
        status_data: dict,
        prompt_id: str,
        output_directory: str,
    ) -> str:
        """Download the generated image from ComfyUI."""
        if prompt_id not in status_data:
            raise Exception("Prompt ID not found in status data")

        outputs = status_data[prompt_id].get("outputs", {})

        if not outputs:
            raise Exception("No outputs found in ComfyUI response")

        # Find the first image in outputs
        for node_id, node_output in outputs.items():
            if "images" in node_output:
                for image_info in node_output["images"]:
                    filename = image_info["filename"]
                    subfolder = image_info.get("subfolder", "")

                    # Build view params
                    params = {"filename": filename, "type": "output"}
                    if subfolder:
                        params["subfolder"] = subfolder

                    # Download the image
                    response = await session.get(
                        f"{comfyui_url}/view",
                        params=params,
                        timeout=aiohttp.ClientTimeout(total=60),
                    )

                    if response.status == 200:
                        image_data = await response.read()

                        # Determine extension
                        ext = filename.split(".")[-1] if "." in filename else "png"
                        image_path = os.path.join(
                            output_directory, f"{uuid.uuid4()}.{ext}"
                        )

                        with open(image_path, "wb") as f:
                            f.write(image_data)

                        print(f"Downloaded image from ComfyUI: {image_path}")
                        return image_path
                    else:
                        raise Exception(f"Failed to download image: {response.status}")

        raise Exception("No images found in ComfyUI outputs")

    # ------------------------------------------------------------------ #
    #  Kling AI Image Generation                                           #
    # ------------------------------------------------------------------ #

    def _kling_build_jwt(self) -> str:
        """
        Build a JWT token for Kling API authentication.
        Header: {"alg": "HS256", "typ": "JWT"}
        Payload: {"iss": <api_key>, "exp": now+1800, "nbf": now-5}
        Signature: HMAC-SHA256 over base64url(header).base64url(payload)
        """
        api_key = get_kling_api_key_env()
        secret_key = get_kling_secret_key_env()

        if not api_key or not secret_key:
            raise ValueError(
                "KLING_API_KEY and KLING_SECRET_KEY must be set in environment variables"
            )

        def _b64url(data: dict) -> str:
            return (
                base64.urlsafe_b64encode(json.dumps(data, separators=(",", ":")).encode())
                .rstrip(b"=")
                .decode()
            )

        now = int(time.time())
        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"iss": api_key, "exp": now + 1800, "nbf": now - 5}

        header_b64 = _b64url(header)
        payload_b64 = _b64url(payload)
        signing_input = f"{header_b64}.{payload_b64}"

        signature = hmac.new(
            secret_key.encode(), signing_input.encode(), hashlib.sha256
        ).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

        return f"{header_b64}.{payload_b64}.{sig_b64}"

    async def generate_image_kling(
        self, prompt: str, output_directory: str, timeout: int = 300
    ) -> str:
        """
        Generate an image using the Kling AI image generation API.

        Steps:
          1. Submit a text-to-image task  (POST /v1/images/generations)
          2. Poll until the task status is 'succeed'
          3. Download the result image and save it locally

        Returns:
            Absolute path to the saved image file.
        """
        base_url = "https://api.klingai.com"
        token = self._kling_build_jwt()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        payload = {
            "model_name": "kling-v1",
            "prompt": prompt,
            "negative_prompt": "",
            "n": 1,
            "aspect_ratio": "16:9",
        }

        async with aiohttp.ClientSession(trust_env=True) as session:
            # Step 1: Submit task
            async with session.post(
                f"{base_url}/v1/images/generations",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60),
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(
                        f"Kling task submission failed ({resp.status}): {error_text}"
                    )
                submit_data = await resp.json()

            task_id = (
                submit_data.get("data", {}).get("task_id")
                or submit_data.get("task_id")
            )
            if not task_id:
                raise Exception(
                    f"Kling API did not return a task_id. Response: {submit_data}"
                )
            print(f"Kling task submitted. Task ID: {task_id}")

            # Step 2: Poll for completion
            poll_url = f"{base_url}/v1/images/generations/{task_id}"
            start = time.time()
            image_url = None

            while True:
                if time.time() - start > timeout:
                    raise Exception(
                        f"Kling image generation timed out after {timeout}s"
                    )

                await asyncio.sleep(5)

                # Refresh token for long polls
                headers["Authorization"] = f"Bearer {self._kling_build_jwt()}"

                async with session.get(
                    poll_url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as poll_resp:
                    if poll_resp.status != 200:
                        continue
                    poll_data = await poll_resp.json()

                task_data = poll_data.get("data", poll_data)
                status = task_data.get("task_status") or task_data.get("status")
                print(f"Kling task status: {status}")

                if status == "succeed":
                    works = task_data.get("task_result", {}).get("images", [])
                    if works:
                        image_url = works[0].get("url")
                    break
                elif status in ("failed", "error"):
                    raise Exception(
                        f"Kling task failed: {task_data.get('task_status_msg', 'Unknown error')}"
                    )

            if not image_url:
                raise Exception("Kling returned no image URL after task completion")

            # Step 3: Download and save the image
            async with session.get(
                image_url, timeout=aiohttp.ClientTimeout(total=120)
            ) as img_resp:
                if img_resp.status != 200:
                    raise Exception(
                        f"Failed to download Kling image ({img_resp.status})"
                    )
                image_data = await img_resp.read()

            image_path = os.path.join(output_directory, f"{uuid.uuid4()}.jpg")
            with open(image_path, "wb") as f:
                f.write(image_data)

            print(f"Kling image saved: {image_path}")
            return image_path
