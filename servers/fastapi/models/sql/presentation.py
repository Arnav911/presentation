from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import JSON, Column, DateTime, String
from sqlmodel import Boolean, Field, SQLModel

from models.presentation_layout import PresentationLayoutModel
from models.presentation_outline_model import PresentationOutlineModel
from models.presentation_structure_model import PresentationStructureModel
from utils.datetime_utils import get_current_utc_datetime


class PresentationModel(SQLModel, table=True):
    __tablename__ = "presentations"

    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    content: str
    n_slides: int
    language: str
    title: Optional[str] = None
    file_paths: Optional[List[str]] = Field(sa_column=Column(JSON), default=None)
    outlines: Optional[dict] = Field(sa_column=Column(JSON), default=None)
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), nullable=False, default=get_current_utc_datetime
        ),
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            default=get_current_utc_datetime,
            onupdate=get_current_utc_datetime,
        ),
    )
    layout: Optional[dict] = Field(sa_column=Column(JSON), default=None)
    structure: Optional[dict] = Field(sa_column=Column(JSON), default=None)
    instructions: Optional[str] = Field(sa_column=Column(String), default=None)
    tone: Optional[str] = Field(sa_column=Column(String), default=None)
    verbosity: Optional[str] = Field(sa_column=Column(String), default=None)
    include_table_of_contents: bool = Field(sa_column=Column(Boolean), default=False)
    include_title_slide: bool = Field(sa_column=Column(Boolean), default=True)
    web_search: bool = Field(sa_column=Column(Boolean), default=False)
    theme: Optional[dict] = Field(sa_column=Column(JSON), default=None)

    def get_new_presentation(self):
        return PresentationModel(
            id=uuid.uuid4(),
            content=self.content,
            n_slides=self.n_slides,
            language=self.language,
            title=self.title,
            file_paths=self.file_paths,
            outlines=self.outlines,
            layout=self.layout,
            structure=self.structure,
            instructions=self.instructions,
            tone=self.tone,
            verbosity=self.verbosity,
            include_table_of_contents=self.include_table_of_contents,
            include_title_slide=self.include_title_slide,
        )

    def get_presentation_outline(self):
        if not self.outlines:
            return None
        return PresentationOutlineModel(**self.outlines)

    def get_layout(self):
        if not self.layout:
            return None

        def heal_zod_schema(obj):
            if not isinstance(obj, dict):
                if isinstance(obj, list):
                    return [heal_zod_schema(i) for i in obj]
                return obj
            
            # Handle Zod 4 leaked internal structure (e.g. {"~standard": ..., "def": ...})
            if "~standard" in obj and "def" in obj:
                return heal_zod_schema(obj["def"])
            
            if "type" in obj:
                t = obj["type"]
                if t == "default" and "innerType" in obj:
                    return heal_zod_schema(obj["innerType"])
                if t == "optional" and "innerType" in obj:
                    # Return the inner type, but the parent should handle the "required" list
                    return heal_zod_schema(obj["innerType"])
                if t == "array" and "element" in obj:
                    return {
                        "type": "array",
                        "items": heal_zod_schema(obj["element"])
                    }
                if t == "object" and "shape" in obj:
                    properties = {}
                    required = []
                    for k, v in obj["shape"].items():
                        properties[k] = heal_zod_schema(v)
                        
                        # Determine if this key is required
                        # It's required if it's NOT an optional type
                        v_inner = v.get("def", v) if "~standard" in v else v
                        if v_inner.get("type") != "optional":
                            required.append(k)
                    
                    res = {
                        "type": "object",
                        "properties": properties
                    }
                    if required:
                        res["required"] = required
                    return res
                if t == "literal" and "values" in obj:
                    # JSON Schema uses 'const' for single values or 'enum' for multiple
                    val = obj["values"][0] if obj["values"] else None
                    return {"const": val}
                
                if t == "union" and "options" in obj:
                    return {
                        "anyOf": [heal_zod_schema(opt) for opt in obj["options"]]
                    }
                # Handle base types
                if t in ["string", "number", "boolean", "integer"]:
                    res = {"type": t}
                    # Preserve some useful constraints if available
                    for k in ["enum", "minimum", "maximum"]:
                        if k in obj:
                            res[k] = obj[k]
                    return res

            # Generic cleanup: remote Zod-specific keys and preserve the rest
            new_obj = {}
            for k, v in obj.items():
                if k in ["~standard", "_def", "vendor", "version", "checks", "defaultValue", "format", "innerType", "options", "element", "shape", "check", "abort", "values"]:
                    continue
                new_obj[k] = heal_zod_schema(v)
            return new_obj

        # The layout is a dict with 'slides' list
        cleaned_layout = {
            "name": self.layout.get("name"),
            "ordered": self.layout.get("ordered", False),
            "slides": []
        }
        
        for slide in self.layout.get("slides", []):
            cleaned_slide = {
                "id": slide.get("id"),
                "name": slide.get("name"),
                "description": slide.get("description"),
                "json_schema": heal_zod_schema(slide.get("json_schema", {}))
            }
            cleaned_layout["slides"].append(cleaned_slide)

        return PresentationLayoutModel(**cleaned_layout)

    def set_layout(self, layout: PresentationLayoutModel):
        self.layout = layout.model_dump()

    def get_structure(self):
        if not self.structure:
            return None
        return PresentationStructureModel(**self.structure)

    def set_structure(self, structure: PresentationStructureModel):
        self.structure = structure.model_dump()
