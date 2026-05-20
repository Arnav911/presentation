import asyncio
from datetime import datetime
import json
import math
import os
import random
import traceback
import uuid
from typing import Annotated, List, Literal, Optional, Tuple, Dict, Any
import dirtyjson
from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Path, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

VISUAL_TYPE_TO_FLEX_LAYOUT = {
    # --- Title / Cover ---
    "cover": "title-slide",
    "title": "title-slide",
    "opener": "title-slide",
    "intro": "title-slide",
    "introduction": "title-slide",
    # --- Timeline ---
    "timeline": "timeline",
    "history": "timeline",
    "evolution": "timeline",
    "roadmap": "timeline",
    "chronological": "timeline",
    "trajectory": "timeline",
    "milestones": "timeline",
    "expansion": "timeline",
    # --- KPI Grid ---
    "metrics": "kpi-grid",
    "kpi": "kpi-grid",
    "statistics": "kpi-grid",
    "scorecard": "kpi-grid",
    "revenue": "kpi-grid",
    "financial": "kpi-grid",
    "performance": "kpi-grid",
    "valuation": "kpi-grid",
    "billion": "kpi-grid",
    "million": "kpi-grid",
    "numbers": "kpi-grid",
    "digital transformation": "kpi-grid",
    # --- Two-col compare ---
    "comparison": "two-col-compare",
    "versus": "two-col-compare",
    "contrast": "two-col-compare",
    "side-by-side": "two-col-compare",
    "different from": "two-col-compare",
    "why ipl was different": "two-col-compare",
    # --- Flow Diagram ---
    "process": "flow-diagram",
    "flow": "flow-diagram",
    "strategy": "flow-diagram",
    "steps": "flow-diagram",
    "acquisition": "flow-diagram",
    "framework": "flow-diagram",
    "mechanism": "flow-diagram",
    "model": "flow-diagram",
    "phases": "flow-diagram",
    "ripple": "flow-diagram",
    "beyond": "flow-diagram",
    # --- Data Table ---
    "table": "data-table",
    "breakdown": "data-table",
    "schedule": "data-table",
    "data": "data-table",
    # --- Big Statement ---
    "quote": "big-statement",
    "insight": "big-statement",
    "core-message": "big-statement",
    "takeaway": "big-statement",
    "lesson": "big-statement",
    "principle": "big-statement",
    "statement": "big-statement",
    "why": "big-statement",
    "playbook": "big-statement",
    # --- Icon Bullets ---
    "list": "icon-bullets",
    "bullets": "icon-bullets",
    "lessons": "icon-bullets",
    "recommendations": "icon-bullets",
    "pillars": "icon-bullets",
    "principles": "icon-bullets",
}

def get_flex_layout_for_slide(slide_spec: dict) -> str:
    """Reads the slide spec from the outline and returns the appropriate flex layout.
    
    Priority order:
    1. Explicit visual_type field in the slide spec (most reliable)
    2. Direct flex layout name as visual_type value
    3. Keyword scan of the title field
    4. Keyword scan of the raw content text (Guide Mode outlines have no title)
    """
    all_flex_layouts = set(VISUAL_TYPE_TO_FLEX_LAYOUT.values())

    # 1. Honour explicit visual_type from the structured outline (most reliable)
    visual_type = str(slide_spec.get("visual_type") or "").lower().strip()
    if visual_type:
        if visual_type in VISUAL_TYPE_TO_FLEX_LAYOUT:
            return VISUAL_TYPE_TO_FLEX_LAYOUT[visual_type]
        # Direct flex layout name (e.g. visual_type = "kpi-grid")
        if visual_type in all_flex_layouts:
            return visual_type

    # 2. Keyword-scan the TITLE field
    title = str(slide_spec.get("title", "")).lower()
    for key, layout_val in VISUAL_TYPE_TO_FLEX_LAYOUT.items():
        if key in title:
            return layout_val

    # 3. Keyword-scan the raw CONTENT text (Guide Mode sends plain-text outlines)
    content = str(slide_spec.get("content", "")).lower()
    if content:
        # Extract the slide title from the first non-empty line (e.g. "**Slide 1: The Bold Experiment**")
        first_line = next((ln.strip() for ln in content.splitlines() if ln.strip()), "")
        # Strip markdown bold markers and slide prefix
        import re
        first_line = re.sub(r"^\*?\*?slide\s+\d+[\s:*]+", "", first_line, flags=re.IGNORECASE).strip("*").lower()
        for key, layout_val in VISUAL_TYPE_TO_FLEX_LAYOUT.items():
            if key in first_line:
                return layout_val
        # Broader scan of the full content if the first line didn't match
        for key, layout_val in VISUAL_TYPE_TO_FLEX_LAYOUT.items():
            if key in content:
                return layout_val

    return "icon-bullets"


from constants.presentation import DEFAULT_TEMPLATES
from enums.webhook_event import WebhookEvent
from models.api_error_model import APIErrorModel
from models.generate_presentation_request import GeneratePresentationRequest
from models.presentation_and_path import PresentationPathAndEditPath
from models.presentation_from_template import EditPresentationRequest
from models.presentation_outline_model import (
    PresentationOutlineModel,
    SlideOutlineModel,
)
from enums.tone import Tone
from enums.verbosity import Verbosity
from models.pptx_models import PptxPresentationModel
from models.presentation_layout import PresentationLayoutModel
from models.presentation_structure_model import PresentationStructureModel
from models.presentation_with_slides import (
    PresentationWithSlides,
)
from models.sql.template import TemplateModel

from services.documents_loader import DocumentsLoader
from services.webhook_service import WebhookService
from utils.get_layout_by_name import get_layout_by_name
from services.image_generation_service import ImageGenerationService
from utils.dict_utils import deep_update
from utils.export_utils import export_presentation
from utils.llm_calls.generate_presentation_outlines import generate_ppt_outline
from models.sql.slide import SlideModel
from models.sse_response import SSECompleteResponse, SSEErrorResponse, SSEResponse

from services.database import get_async_session
from services.temp_file_service import TEMP_FILE_SERVICE
from services.concurrent_service import CONCURRENT_SERVICE
from models.sql.presentation import PresentationModel
from services.pptx_presentation_creator import PptxPresentationCreator
from models.sql.async_presentation_generation_status import (
    AsyncPresentationGenerationTaskModel,
)
from utils.asset_directory_utils import get_exports_directory, get_images_directory
from utils.llm_calls.generate_presentation_structure import (
    generate_presentation_structure,
)
from utils.llm_calls.generate_slide_content import (
    get_slide_content_from_type_and_outline,
)
from utils.ppt_utils import (
    get_presentation_title_from_outlines,
    select_toc_or_list_slide_layout_index,
)
from utils.process_slides import (
    process_slide_add_placeholder_assets,
    process_slide_and_fetch_assets,
)
from utils.llm_calls.auto_select_template import auto_select_template
import uuid
from pydantic import BaseModel


PRESENTATION_ROUTER = APIRouter(prefix="/presentation", tags=["Presentation"])


@PRESENTATION_ROUTER.get("/all", response_model=List[PresentationWithSlides])
async def get_all_presentations(sql_session: AsyncSession = Depends(get_async_session)):
    presentations_with_slides = []

    query = (
        select(PresentationModel, SlideModel)
        .join(
            SlideModel,
            (SlideModel.presentation == PresentationModel.id) & (SlideModel.index == 0),
        )
        .order_by(PresentationModel.created_at.desc())
    )

    results = await sql_session.execute(query)
    rows = results.all()
    presentations_with_slides = [
        PresentationWithSlides(
            **presentation.model_dump(),
            slides=[first_slide],
        )
        for presentation, first_slide in rows
    ]
    return presentations_with_slides


@PRESENTATION_ROUTER.get("/{id}", response_model=PresentationWithSlides)
async def get_presentation(
    id: uuid.UUID, sql_session: AsyncSession = Depends(get_async_session)
):
    presentation = await sql_session.get(PresentationModel, id)
    if not presentation:
        raise HTTPException(404, "Presentation not found")
    slides = await sql_session.scalars(
        select(SlideModel)
        .where(SlideModel.presentation == id)
        .order_by(SlideModel.index)
    )
    return PresentationWithSlides(
        **presentation.model_dump(),
        slides=slides,
    )


@PRESENTATION_ROUTER.delete("/{id}", status_code=204)
async def delete_presentation(
    id: uuid.UUID, sql_session: AsyncSession = Depends(get_async_session)
):
    presentation = await sql_session.get(PresentationModel, id)
    if not presentation:
        raise HTTPException(404, "Presentation not found")

    await sql_session.delete(presentation)
    await sql_session.commit()


@PRESENTATION_ROUTER.post("/create", response_model=PresentationModel)
async def create_presentation(
    content: Annotated[str, Body()],
    n_slides: Annotated[int, Body()],
    language: Annotated[str, Body()],
    file_paths: Annotated[Optional[List[str]], Body()] = None,
    tone: Annotated[Tone, Body()] = Tone.DEFAULT,
    verbosity: Annotated[Verbosity, Body()] = Verbosity.STANDARD,
    instructions: Annotated[Optional[str], Body()] = None,
    include_table_of_contents: Annotated[bool, Body()] = False,
    include_title_slide: Annotated[bool, Body()] = True,
    web_search: Annotated[bool, Body()] = False,
    sql_session: AsyncSession = Depends(get_async_session),
):

    if include_table_of_contents and n_slides < 3:
        raise HTTPException(
            status_code=400,
            detail="Number of slides cannot be less than 3 if table of contents is included",
        )

    presentation_id = uuid.uuid4()

    presentation = PresentationModel(
        id=presentation_id,
        content=content,
        n_slides=n_slides,
        language=language,
        file_paths=file_paths,
        tone=tone.value,
        verbosity=verbosity.value,
        instructions=instructions,
        include_table_of_contents=include_table_of_contents,
        include_title_slide=include_title_slide,
        web_search=web_search,
    )

    sql_session.add(presentation)
    await sql_session.commit()

    return presentation


class AutoSelectTemplateRequest(BaseModel):
    presentation_id: uuid.UUID


class AutoSelectTemplateResponse(BaseModel):
    template_id: str


@PRESENTATION_ROUTER.post("/auto-select", response_model=AutoSelectTemplateResponse)
async def auto_select_presentation_template(
    body: AutoSelectTemplateRequest,
    sql_session: AsyncSession = Depends(get_async_session),
):
    presentation = await sql_session.get(PresentationModel, body.presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    template_id = await auto_select_template(presentation.content)
    return AutoSelectTemplateResponse(template_id=template_id)


@PRESENTATION_ROUTER.post("/prepare", response_model=PresentationModel)
async def prepare_presentation(
    presentation_id: Annotated[uuid.UUID, Body()],
    outlines: Annotated[List[SlideOutlineModel], Body()],
    layout: Annotated[PresentationLayoutModel, Body()],
    title: Annotated[Optional[str], Body()] = None,
    sql_session: AsyncSession = Depends(get_async_session),
):
    if not outlines:
        raise HTTPException(status_code=400, detail="Outlines are required")

    presentation = await sql_session.get(PresentationModel, presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    presentation_outline_model = PresentationOutlineModel(slides=outlines)

    total_slide_layouts = len(layout.slides)
    total_outlines = len(outlines)

    if layout.ordered:
        presentation_structure = layout.to_presentation_structure()
    else:
        presentation_structure: PresentationStructureModel = (
            await generate_presentation_structure(
                presentation_outline=presentation_outline_model,
                presentation_layout=layout,
                instructions=presentation.instructions,
            )
        )

    presentation_structure.slides = presentation_structure.slides[: len(outlines)]
    for index in range(total_outlines):
        random_slide_index = random.randint(0, total_slide_layouts - 1)
        if index >= total_outlines:
            presentation_structure.slides.append(random_slide_index)
            continue
        if presentation_structure.slides[index] >= total_slide_layouts:
            presentation_structure.slides[index] = random_slide_index

    if presentation.include_table_of_contents:
        n_toc_slides = presentation.n_slides - total_outlines
        toc_slide_layout_index = select_toc_or_list_slide_layout_index(layout)
        if toc_slide_layout_index != -1:
            outline_index = 1 if presentation.include_title_slide else 0
            for i in range(n_toc_slides):
                outlines_to = outline_index + 10
                if total_outlines == outlines_to:
                    outlines_to -= 1

                presentation_structure.slides.insert(
                    i + 1 if presentation.include_title_slide else i,
                    toc_slide_layout_index,
                )
                toc_outline = "Table of Contents\n\n"

                for outline in presentation_outline_model.slides[
                    outline_index:outlines_to
                ]:
                    page_number = (
                        outline_index - i + n_toc_slides + 1
                        if presentation.include_title_slide
                        else outline_index - i + n_toc_slides
                    )
                    toc_outline += f"Slide page number: {page_number}\n Slide Content: {outline.content[:100]}\n\n"
                    outline_index += 1

                outline_index += 1

                presentation_outline_model.slides.insert(
                    i + 1 if presentation.include_title_slide else i,
                    SlideOutlineModel(
                        content=toc_outline,
                    ),
                )

    sql_session.add(presentation)
    presentation.outlines = presentation_outline_model.model_dump(mode="json")
    presentation.title = title or presentation.title
    presentation.set_layout(layout)
    presentation.set_structure(presentation_structure)
    await sql_session.commit()

    return presentation


@PRESENTATION_ROUTER.get("/stream/{id}")
async def stream_presentation(
    id: uuid.UUID, sql_session: AsyncSession = Depends(get_async_session)
):
    try:
        presentation = await sql_session.get(PresentationModel, id)
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        if not presentation.structure:
            raise HTTPException(
                status_code=400,
                detail="Presentation not prepared for stream",
            )
        if not presentation.outlines:
            raise HTTPException(
                status_code=400,
                detail="Outlines can not be empty",
            )

        image_generation_service = ImageGenerationService(get_images_directory())

        async def inner():
            try:
                structure = presentation.get_structure()
                layout = presentation.get_layout()
                outline = presentation.get_presentation_outline()

                # These tasks will be gathered and awaited after all slides are generated
                async_assets_generation_tasks = []

                slides: List[SlideModel] = []
                yield SSEResponse(
                    event="response",
                    data=json.dumps({"type": "chunk", "chunk": '{ "slides": [ '}),
                ).to_string()
                for i, slide_layout_index in enumerate(structure.slides):
                    slide_layout = layout.slides[slide_layout_index]

                    custom_instructions = presentation.instructions
                    if layout.name in ["flex", "Flexible Smart Layout"]:
                        outline_dict = outline.slides[i].model_dump()
                        flex_layout = get_flex_layout_for_slide(outline_dict)

                        # Per-layout field guide so the LLM fills the right data structure
                        LAYOUT_FIELD_GUIDE = {
                            "title-slide": "Set heading (presentation title), subheading (tagline). Optionally add items[] as key theme pills. Pick a vivid accentColor.",
                            "timeline": "Set heading + subheading. Fill steps[] with 3-6 items: year, label, description, color.",
                            "kpi-grid": "Set heading + subheading. Fill items[] with exactly 4 metric cards: label (metric name), value (big stat), subtitle (explanation), color.",
                            "two-col-compare": "Set heading + subheading. Fill leftColumn {heading, color, items[]} and rightColumn {heading, color, items[]} with 3-4 items each.",
                            "flow-diagram": "Set heading + subheading. Fill items[] with 3-5 process steps: label (step name), subtitle (one-line detail), icon (emoji), color.",
                            "icon-bullets": "Set heading + subheading. Fill items[] with 3-6 bullets: label (key point), subtitle (explanation), icon (emoji), color.",
                            "data-table": "Set heading + subheading. Fill headers[] with column names and rows[][] with 2-6 data rows.",
                            "big-statement": "Set heading (bold assertion max 12 words). Set subheading (context). Optionally add 1-3 items[] with value + label as supporting stats.",
                            "duotone-split": "For comparison: leftLabel + leftColor + rightLabel + rightColor. For cover: heading + subtitle + accentColor.",
                            "quote-hero": "Set heading. Set quote (full quotable statement). Set attribution (source/author). Set subheading for context.",
                        }
                        field_guide = LAYOUT_FIELD_GUIDE.get(flex_layout, "Fill all relevant fields.")
                        custom_instructions = (
                            f"{presentation.instructions or ''}"
                            f"\n\nIMPORTANT: You MUST set the JSON field 'layout' to '{flex_layout}'."
                            f"\nFIELD GUIDE for '{flex_layout}': {field_guide}"
                            f"\nDo NOT leave required arrays empty. Do not use fields from other layouts."
                        )

                        # Override to the unified flex schema
                        matching_layout = next((l for l in layout.slides if l.id == flex_layout), None)
                        if matching_layout:
                            slide_layout = matching_layout

                    try:
                        slide_content = await get_slide_content_from_type_and_outline(
                            slide_layout,
                            outline.slides[i],
                            presentation.language,
                            presentation.tone,
                            presentation.verbosity,
                            custom_instructions,
                        )
                    except HTTPException as e:
                        yield SSEErrorResponse(detail=e.detail).to_string()
                        return

                    slide = SlideModel(
                        presentation=id,
                        layout_group=layout.name,
                        layout=slide_layout.id,
                        index=i,
                        speaker_note=slide_content.get("__speaker_note__", ""),
                        content=slide_content,
                    )
                    slides.append(slide)

                    # This will mutate slide and add placeholder assets
                    process_slide_add_placeholder_assets(slide)

                    # This will mutate slide
                    async_assets_generation_tasks.append(
                        asyncio.ensure_future(
                            process_slide_and_fetch_assets(image_generation_service, slide)
                        )
                    )

                    yield SSEResponse(
                        event="response",
                        data=json.dumps({"type": "chunk", "chunk": slide.model_dump_json()}),
                    ).to_string()

                    if i < len(structure.slides) - 1:
                        yield SSEResponse(
                            event="response",
                            data=json.dumps({"type": "chunk", "chunk": ", "}),
                        ).to_string()

                yield SSEResponse(
                    event="response",
                    data=json.dumps({"type": "chunk", "chunk": " ] }"}),
                ).to_string()

                generated_assets_lists = await asyncio.gather(*async_assets_generation_tasks)
                generated_assets = []
                for assets_list in generated_assets_lists:
                    generated_assets.extend(assets_list)

                # Moved this here to make sure new slides are generated before deleting the old ones
                await sql_session.execute(
                    delete(SlideModel).where(SlideModel.presentation == id)
                )
                await sql_session.commit()

                sql_session.add(presentation)
                sql_session.add_all(slides)
                sql_session.add_all(generated_assets)
                await sql_session.commit()

                response = PresentationWithSlides(
                    **presentation.model_dump(),
                    slides=slides,
                )

                yield SSECompleteResponse(
                    key="presentation",
                    value=response.model_dump(mode="json"),
                ).to_string()
            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Error in stream_inner: {error_trace}")
                yield SSEErrorResponse(detail=f"Inner Stream Error: {str(e)}\n{error_trace}").to_string()

        return StreamingResponse(
            inner(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error in stream_presentation outer: {error_trace}")
        return Response(content=f"Outer Error: {str(e)}\n{error_trace}", status_code=500)


@PRESENTATION_ROUTER.patch("/update", response_model=PresentationWithSlides)
async def update_presentation(
    id: Annotated[uuid.UUID, Body()],
    n_slides: Annotated[Optional[int], Body()] = None,
    title: Annotated[Optional[str], Body()] = None,
    instructions: Annotated[Optional[str], Body()] = None,
    theme: Annotated[Optional[dict], Body()] = None,
    slides: Annotated[Optional[List[SlideModel]], Body()] = None,
    sql_session: AsyncSession = Depends(get_async_session),
):
    presentation = await sql_session.get(PresentationModel, id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    presentation_update_dict: Dict[str, Any] = {}
    if n_slides:
        presentation_update_dict["n_slides"] = n_slides
    if title:
        presentation_update_dict["title"] = title
    if instructions:
        presentation_update_dict["instructions"] = instructions
    if theme:
        presentation_update_dict["theme"] = theme

    if n_slides or title or instructions or theme:
        presentation.sqlmodel_update(presentation_update_dict)

    if slides:
        # Just to make sure id is UUID
        for slide in slides:
            slide.presentation = uuid.UUID(slide.presentation)
            slide.id = uuid.UUID(slide.id)

        await sql_session.execute(
            delete(SlideModel).where(SlideModel.presentation == presentation.id)
        )
        sql_session.add_all(slides)

    await sql_session.commit()

    return PresentationWithSlides(
        **presentation.model_dump(),
        slides=slides or [],
    )


@PRESENTATION_ROUTER.post("/export/pptx", response_model=str)
async def export_presentation_as_pptx(
    pptx_model: Annotated[PptxPresentationModel, Body()],
):
    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()

    pptx_creator = PptxPresentationCreator(pptx_model, temp_dir)
    await pptx_creator.create_ppt()

    export_directory = get_exports_directory()
    pptx_path = os.path.join(
        export_directory, f"{pptx_model.name or uuid.uuid4()}.pptx"
    )
    pptx_creator.save(pptx_path)

    return pptx_path


@PRESENTATION_ROUTER.post("/export", response_model=PresentationPathAndEditPath)
async def export_presentation_as_pptx_or_pdf(
    id: Annotated[uuid.UUID, Body(description="Presentation ID to export")],
    export_as: Annotated[
        Literal["pptx", "pdf"], Body(description="Format to export the presentation as")
    ] = "pptx",
    sql_session: AsyncSession = Depends(get_async_session),
):
    presentation = await sql_session.get(PresentationModel, id)

    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    presentation_and_path = await export_presentation(
        id,
        presentation.title or str(uuid.uuid4()),
        export_as,
    )

    return PresentationPathAndEditPath(
        **presentation_and_path.model_dump(),
        edit_path=f"/presentation?id={id}",
    )


async def check_if_api_request_is_valid(
    request: GeneratePresentationRequest,
    sql_session: AsyncSession = Depends(get_async_session),
) -> Tuple[uuid.UUID,]:
    presentation_id = uuid.uuid4()
    print(f"Presentation ID: {presentation_id}")

    # Making sure either content, slides markdown or files is provided
    if not (request.content or request.slides_markdown or request.files):
        raise HTTPException(
            status_code=400,
            detail="Either content or slides markdown or files is required to generate presentation",
        )

    # Making sure number of slides is greater than 0
    if request.n_slides <= 0:
        raise HTTPException(
            status_code=400,
            detail="Number of slides must be greater than 0",
        )

    # Checking if template is valid
    if request.template not in DEFAULT_TEMPLATES:
        request.template = request.template.lower()
        if not request.template.startswith("custom-"):
            raise HTTPException(
                status_code=400,
                detail="Template not found. Please use a valid template.",
            )
        template_id = request.template.replace("custom-", "")
        try:
            template = await sql_session.get(TemplateModel, uuid.UUID(template_id))
            if not template:
                raise Exception()
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Template not found. Please use a valid template.",
            )

    return (presentation_id,)


async def generate_presentation_handler(
    request: GeneratePresentationRequest,
    presentation_id: uuid.UUID,
    async_status: Optional[AsyncPresentationGenerationTaskModel],
    sql_session: AsyncSession = Depends(get_async_session),
):
    try:
        using_slides_markdown = False

        if request.slides_markdown:
            using_slides_markdown = True
            request.n_slides = len(request.slides_markdown)

        if not using_slides_markdown:
            additional_context = ""

            # Updating async status
            if async_status:
                async_status.message = "Generating presentation outlines"
                async_status.updated_at = datetime.now()
                sql_session.add(async_status)
                await sql_session.commit()

            if request.files:
                documents_loader = DocumentsLoader(file_paths=request.files)
                await documents_loader.load_documents()
                documents = documents_loader.documents
                if documents:
                    additional_context = "\n\n".join(documents)

            # Finding number of slides to generate by considering table of contents
            n_slides_to_generate = request.n_slides
            if request.include_table_of_contents:
                needed_toc_count = math.ceil(
                    (
                        (request.n_slides - 1)
                        if request.include_title_slide
                        else request.n_slides
                    )
                    / 10
                )
                n_slides_to_generate -= math.ceil(
                    (request.n_slides - needed_toc_count) / 10
                )

            presentation_outlines_text = ""
            async for chunk in generate_ppt_outline(
                request.content,
                n_slides_to_generate,
                request.language,
                additional_context,
                request.tone.value,
                request.verbosity.value,
                request.instructions,
                request.include_title_slide,
                request.web_search,
            ):

                if isinstance(chunk, HTTPException):
                    raise chunk

                presentation_outlines_text += chunk

            try:
                presentation_outlines_json = dict(
                    dirtyjson.loads(presentation_outlines_text)
                )
            except Exception:
                traceback.print_exc()
                raise HTTPException(
                    status_code=400,
                    detail="Failed to generate presentation outlines. Please try again.",
                )
            presentation_outlines = PresentationOutlineModel(
                **presentation_outlines_json
            )
            total_outlines = n_slides_to_generate

        else:
            # Setting outlines to slides markdown
            presentation_outlines = PresentationOutlineModel(
                slides=[
                    SlideOutlineModel(content=slide)
                    for slide in request.slides_markdown
                ]
            )
            total_outlines = len(request.slides_markdown)

        # Updating async status
        if async_status:
            async_status.message = "Selecting layout for each slide"
            async_status.updated_at = datetime.now()
            sql_session.add(async_status)
            await sql_session.commit()

        print("-" * 40)
        print(f"Generated {total_outlines} outlines for the presentation")

        # Parse Layouts
        layout_model = await get_layout_by_name(request.template)
        total_slide_layouts = len(layout_model.slides)

        # Generate Structure
        if layout_model.ordered:
            presentation_structure = layout_model.to_presentation_structure()
        else:
            presentation_structure: PresentationStructureModel = (
                await generate_presentation_structure(
                    presentation_outlines,
                    layout_model,
                    request.instructions,
                    using_slides_markdown,
                )
            )

        presentation_structure.slides = presentation_structure.slides[:total_outlines]
        for index in range(total_outlines):
            random_slide_index = random.randint(0, total_slide_layouts - 1)
            if index >= total_outlines:
                presentation_structure.slides.append(random_slide_index)
                continue
            if presentation_structure.slides[index] >= total_slide_layouts:
                presentation_structure.slides[index] = random_slide_index

        # Injecting table of contents to the presentation structure and outlines
        if request.include_table_of_contents and not using_slides_markdown:
            n_toc_slides = request.n_slides - total_outlines
            toc_slide_layout_index = select_toc_or_list_slide_layout_index(layout_model)
            if toc_slide_layout_index != -1:
                outline_index = 1 if request.include_title_slide else 0
                for i in range(n_toc_slides):
                    outlines_to = outline_index + 10
                    if total_outlines == outlines_to:
                        outlines_to -= 1

                    presentation_structure.slides.insert(
                        i + 1 if request.include_title_slide else i,
                        toc_slide_layout_index,
                    )
                    toc_outline = "Table of Contents\n\n"

                    for outline in presentation_outlines.slides[
                        outline_index:outlines_to
                    ]:
                        page_number = (
                            outline_index - i + n_toc_slides + 1
                            if request.include_title_slide
                            else outline_index - i + n_toc_slides
                        )
                        toc_outline += f"Slide page number: {page_number}\n Slide Content: {outline.content[:100]}\n\n"
                        outline_index += 1

                    outline_index += 1

                    presentation_outlines.slides.insert(
                        i + 1 if request.include_title_slide else i,
                        SlideOutlineModel(
                            content=toc_outline,
                        ),
                    )

        # Create PresentationModel
        presentation = PresentationModel(
            id=presentation_id,
            content=request.content,
            n_slides=request.n_slides,
            language=request.language,
            title=get_presentation_title_from_outlines(presentation_outlines),
            outlines=presentation_outlines.model_dump(),
            layout=layout_model.model_dump(),
            structure=presentation_structure.model_dump(),
            tone=request.tone.value,
            verbosity=request.verbosity.value,
            instructions=request.instructions,
        )

        # Updating async status
        if async_status:
            async_status.message = "Generating slides"
            async_status.updated_at = datetime.now()
            sql_session.add(async_status)
            await sql_session.commit()

        image_generation_service = ImageGenerationService(get_images_directory())
        async_assets_generation_tasks = []

        # 7. Generate slide content concurrently (batched), then build slides and fetch assets
        slides: List[SlideModel] = []

        slide_layout_indices = presentation_structure.slides
        slide_layouts = [layout_model.slides[idx] for idx in slide_layout_indices]

        # Schedule slide content generation and asset fetching in batches of 10
        batch_size = 10
        for start in range(0, len(slide_layouts), batch_size):
            end = min(start + batch_size, len(slide_layouts))

            print(f"Generating slides from {start} to {end}")

            # Generate contents for this batch concurrently
            content_tasks = [
                get_slide_content_from_type_and_outline(
                    slide_layouts[i],
                    presentation_outlines.slides[i],
                    request.language,
                    request.tone.value,
                    request.verbosity.value,
                    request.instructions,
                )
                for i in range(start, end)
            ]
            batch_contents: List[dict] = await asyncio.gather(*content_tasks)

            # Build slides for this batch
            batch_slides: List[SlideModel] = []
            for offset, slide_content in enumerate(batch_contents):
                i = start + offset
                slide_layout = slide_layouts[i]
                slide = SlideModel(
                    presentation=presentation_id,
                    layout_group=layout_model.name,
                    layout=slide_layout.id,
                    index=i,
                    speaker_note=slide_content.get("__speaker_note__"),
                    content=slide_content,
                )
                slides.append(slide)
                batch_slides.append(slide)

            # Start asset fetch tasks for just-generated slides so they run while next batch is processed
            asset_tasks = [
                asyncio.ensure_future(
                    process_slide_and_fetch_assets(image_generation_service, slide)
                )
                for slide in batch_slides
            ]
            async_assets_generation_tasks.extend(asset_tasks)

        if async_status:
            async_status.message = "Fetching assets for slides"
            async_status.updated_at = datetime.now()
            sql_session.add(async_status)
            await sql_session.commit()

        # Run all asset tasks concurrently while batches may still be generating content
        generated_assets_list = await asyncio.gather(*async_assets_generation_tasks)
        generated_assets = []
        for assets_list in generated_assets_list:
            generated_assets.extend(assets_list)

        # 8. Save PresentationModel and Slides
        sql_session.add(presentation)
        sql_session.add_all(slides)
        sql_session.add_all(generated_assets)
        await sql_session.commit()

        if async_status:
            async_status.message = "Exporting presentation"
            async_status.updated_at = datetime.now()
            sql_session.add(async_status)

        # 9. Export
        presentation_and_path = await export_presentation(
            presentation_id, presentation.title or str(uuid.uuid4()), request.export_as
        )

        response = PresentationPathAndEditPath(
            **presentation_and_path.model_dump(),
            edit_path=f"/presentation?id={presentation_id}",
        )

        if async_status:
            async_status.message = "Presentation generation completed"
            async_status.status = "completed"
            async_status.data = response.model_dump(mode="json")
            async_status.updated_at = datetime.now()
            sql_session.add(async_status)
            await sql_session.commit()

        # Triggering webhook on success
        CONCURRENT_SERVICE.run_task(
            None,
            WebhookService.send_webhook,
            WebhookEvent.PRESENTATION_GENERATION_COMPLETED,
            response.model_dump(mode="json"),
        )

        return response

    except Exception as e:
        if not isinstance(e, HTTPException):
            traceback.print_exc()
            e = HTTPException(status_code=500, detail="Presentation generation failed")

        api_error_model = APIErrorModel.from_exception(e)

        # Triggering webhook on failure
        CONCURRENT_SERVICE.run_task(
            None,
            WebhookService.send_webhook,
            WebhookEvent.PRESENTATION_GENERATION_FAILED,
            api_error_model.model_dump(mode="json"),
        )

        if async_status:
            async_status.status = "error"
            async_status.message = "Presentation generation failed"
            async_status.updated_at = datetime.now()
            async_status.error = api_error_model.model_dump(mode="json")
            sql_session.add(async_status)
            await sql_session.commit()

        else:
            raise e


@PRESENTATION_ROUTER.post("/generate", response_model=PresentationPathAndEditPath)
async def generate_presentation_sync(
    request: GeneratePresentationRequest,
    sql_session: AsyncSession = Depends(get_async_session),
):
    try:
        (presentation_id,) = await check_if_api_request_is_valid(request, sql_session)
        return await generate_presentation_handler(
            request, presentation_id, None, sql_session
        )
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Presentation generation failed")


@PRESENTATION_ROUTER.post(
    "/generate/async", response_model=AsyncPresentationGenerationTaskModel
)
async def generate_presentation_async(
    request: GeneratePresentationRequest,
    background_tasks: BackgroundTasks,
    sql_session: AsyncSession = Depends(get_async_session),
):
    try:
        (presentation_id,) = await check_if_api_request_is_valid(request, sql_session)

        async_status = AsyncPresentationGenerationTaskModel(
            status="pending",
            message="Queued for generation",
            data=None,
        )
        sql_session.add(async_status)
        await sql_session.commit()

        background_tasks.add_task(
            generate_presentation_handler,
            request,
            presentation_id,
            async_status=async_status,
            sql_session=sql_session,
        )
        return async_status

    except Exception as e:
        if not isinstance(e, HTTPException):
            print(e)
            e = HTTPException(status_code=500, detail="Presentation generation failed")

        raise e


@PRESENTATION_ROUTER.get(
    "/status/{id}", response_model=AsyncPresentationGenerationTaskModel
)
async def check_async_presentation_generation_status(
    id: str = Path(description="ID of the presentation generation task"),
    sql_session: AsyncSession = Depends(get_async_session),
):
    status = await sql_session.get(AsyncPresentationGenerationTaskModel, id)
    if not status:
        raise HTTPException(
            status_code=404, detail="No presentation generation task found"
        )
    return status


@PRESENTATION_ROUTER.post("/edit", response_model=PresentationPathAndEditPath)
async def edit_presentation_with_new_content(
    data: Annotated[EditPresentationRequest, Body()],
    sql_session: AsyncSession = Depends(get_async_session),
):
    presentation = await sql_session.get(PresentationModel, data.presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    slides = await sql_session.scalars(
        select(SlideModel).where(SlideModel.presentation == data.presentation_id)
    )

    new_slides = []
    slides_to_delete = []
    for each_slide in slides:
        updated_content = None
        new_slide_data = list(
            filter(lambda x: x.index == each_slide.index, data.slides)
        )
        if new_slide_data:
            updated_content = deep_update(each_slide.content, new_slide_data[0].content)
            new_slides.append(
                each_slide.get_new_slide(presentation.id, updated_content)
            )
            slides_to_delete.append(each_slide.id)

    await sql_session.execute(
        delete(SlideModel).where(SlideModel.id.in_(slides_to_delete))
    )

    sql_session.add_all(new_slides)
    await sql_session.commit()

    presentation_and_path = await export_presentation(
        presentation.id, presentation.title or str(uuid.uuid4()), data.export_as
    )

    return PresentationPathAndEditPath(
        **presentation_and_path.model_dump(),
        edit_path=f"/presentation?id={presentation.id}",
    )


@PRESENTATION_ROUTER.post("/derive", response_model=PresentationPathAndEditPath)
async def derive_presentation_from_existing_one(
    data: Annotated[EditPresentationRequest, Body()],
    sql_session: AsyncSession = Depends(get_async_session),
):
    presentation = await sql_session.get(PresentationModel, data.presentation_id)
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    slides = await sql_session.scalars(
        select(SlideModel).where(SlideModel.presentation == data.presentation_id)
    )

    new_presentation = presentation.get_new_presentation()
    new_slides = []
    for each_slide in slides:
        updated_content = None
        new_slide_data = list(
            filter(lambda x: x.index == each_slide.index, data.slides)
        )
        if new_slide_data:
            updated_content = deep_update(each_slide.content, new_slide_data[0].content)
        new_slides.append(
            each_slide.get_new_slide(new_presentation.id, updated_content)
        )

    sql_session.add(new_presentation)
    sql_session.add_all(new_slides)
    await sql_session.commit()

    presentation_and_path = await export_presentation(
        new_presentation.id, new_presentation.title or str(uuid.uuid4()), data.export_as
    )

    return PresentationPathAndEditPath(
        **presentation_and_path.model_dump(),
        edit_path=f"/presentation?id={new_presentation.id}",
    )
