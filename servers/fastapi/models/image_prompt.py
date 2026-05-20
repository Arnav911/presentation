from typing import Optional
from pydantic import BaseModel


class ImagePrompt(BaseModel):
    prompt: str
    theme_prompt: Optional[str] = None

    def get_image_prompt(self, with_theme: bool = False) -> str:
        style_modifiers = "high quality, highly detailed, professional, cinematic lighting, masterpiece, 8k resolution, award winning photography"
        final_prompt = self.prompt
        
        if with_theme and self.theme_prompt:
            final_prompt = f"{final_prompt}, {self.theme_prompt}"
            
        return f"{final_prompt}, {style_modifiers}"
