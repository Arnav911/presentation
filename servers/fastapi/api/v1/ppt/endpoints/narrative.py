from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from utils.llm_calls.generate_narrative_approaches import generate_narrative_approaches
from services.documents_loader import DocumentsLoader

NARRATIVE_ROUTER = APIRouter(prefix="/narrative", tags=["Narrative"])


class NarrativeRequest(BaseModel):
    prompt: str
    file_paths: Optional[List[str]] = None


class NarrativeApproach(BaseModel):
    title: str
    description: str


class NarrativeResponse(BaseModel):
    approaches: list[NarrativeApproach]


@NARRATIVE_ROUTER.post("/approaches", response_model=NarrativeResponse)
async def get_narrative_approaches(body: NarrativeRequest):
    additional_context = ""
    if body.file_paths:
        try:
            documents_loader = DocumentsLoader(file_paths=body.file_paths)
            await documents_loader.load_documents()
            documents = documents_loader.documents
            if documents:
                additional_context = "\n\n".join(documents)
        except Exception as e:
            print(f"DEBUG_NARRATIVE: Error loading documents: {e}")

    approaches = await generate_narrative_approaches(body.prompt, additional_context)
    return NarrativeResponse(approaches=[NarrativeApproach(**a) for a in approaches])
