from typing import List, Optional
from pydantic import BaseModel


class SlideOutlineModel(BaseModel):
    content: str
    visual_type: Optional[str] = None  # e.g. "timeline", "comparison", "kpi", "flow"


class PresentationOutlineModel(BaseModel):
    slides: List[SlideOutlineModel]

    def to_string(self):
        message = ""
        for i, slide in enumerate(self.slides):
            message += f"## Slide {i+1}:\n"
            message += f"  - Content: {slide.content} \n"
            if slide.visual_type:
                message += f"  - Visual Type: {slide.visual_type} \n"
        return message
