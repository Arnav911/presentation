import xml.etree.ElementTree as ET
import json
import re
from typing import Optional


def parse_oxml_to_structured_json(xml_content: str) -> str:
    """
    Parses OXML string, extracts shapes, text, and coordinates,
    and computes geometric containment to output a pre-grouped JSON.

    Fixes applied:
    1. Strict containment tolerance instead of pure area comparison for parent selection.
    2. Smallest qualifying container is chosen as parent (min area), not last in sorted list.
    3. clean_node is now fully recursive — preserves grandchildren and deeper nesting.
    4. Scale is clamped to prevent runaway values on malformed EMU data.
    5. Rich text extraction: preserves per-run font size, bold, color, and alignment.
    6. Fill color is extracted from solidFill so the LLM can reproduce card backgrounds exactly.
    7. Border-radius hint is extracted from prstGeom so rounded cards are flagged.
    8. Elements that are children are excluded from the top-level list correctly
       (previous code appended them to top_level when parent_found was set True but the
       guard `if not parent_found` was still evaluated on a stale flag in some edge cases).
    """
    try:
        # ── 1. Slide-size scaling ────────────────────────────────────────────────
        scale_x = 1.0
        scale_y = 1.0

        size_match = re.search(
            r'<!--\s*SLIDESIZE:\s*cx="(\d+)"\s*cy="(\d+)"\s*-->', xml_content
        )
        if size_match:
            cx_emu = int(size_match.group(1))
            cy_emu = int(size_match.group(2))

            base_w_px = cx_emu / 9525.0
            base_h_px = cy_emu / 9525.0

            # Clamp scale to a sensible range to guard against corrupt EMU values
            scale_x = max(0.1, min(10.0, 1280.0 / base_w_px)) if base_w_px > 0 else 1.0
            scale_y = max(0.1, min(10.0, 720.0  / base_h_px)) if base_h_px > 0 else 1.0

        # ── 2. XML parse ─────────────────────────────────────────────────────────
        root = ET.fromstring(xml_content)
        NS = {
            "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
            "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
            "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        }

        sp_tree = root.find(".//p:spTree", NS)
        if sp_tree is None:
            return json.dumps([])

        # ── 3. Element extraction ────────────────────────────────────────────────
        elements = []
        z_index = 0

        for child in sp_tree:
            tag = child.tag.split("}")[-1]
            if tag not in ("sp", "pic", "graphicFrame", "grpSp"):
                continue

            z_index += 1

            xfrm = child.find(".//a:xfrm", NS)
            if xfrm is None:
                continue

            off = xfrm.find("a:off", NS)
            ext = xfrm.find("a:ext", NS)
            if off is None or ext is None:
                continue

            try:
                x = round(int(off.get("x", 0)) / 9525.0 * scale_x, 2)
                y = round(int(off.get("y", 0)) / 9525.0 * scale_y, 2)
                w = round(int(ext.get("cx", 0)) / 9525.0 * scale_x, 2)
                h = round(int(ext.get("cy", 0)) / 9525.0 * scale_y, 2)
            except (ValueError, TypeError):
                continue

            # Skip zero-size elements — they are invisible and add noise
            if w <= 0 or h <= 0:
                continue

            # ── Rich text extraction ─────────────────────────────────────────
            text_content, text_styles = _extract_rich_text(child, NS)

            # ── Fill color ───────────────────────────────────────────────────
            fill_color = _extract_fill_color(child, NS)
            is_filled = fill_color is not None

            # ── Geometry / border-radius hint ────────────────────────────────
            prst_geom = child.find(".//a:prstGeom", NS)
            geom = prst_geom.get("prst") if prst_geom is not None else "rect"
            is_rounded = geom in (
                "roundRect", "round1Rect", "round2DiagRect",
                "round2SameRect", "snipRoundRect",
            )

            # ── Image relationship ────────────────────────────────────────────
            image_rId = None
            blip = child.find(".//a:blip", NS)
            if blip is not None:
                image_rId = blip.get(
                    "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
                )

            elem = {
                "id": f"elem_{z_index}",
                "z_index": z_index,
                "type": tag,
                "geom": geom,
                "is_rounded": is_rounded,
                "is_filled": is_filled,
                "fill_color": fill_color,
                "x": x,
                "y": y,
                "w": w,
                "h": h,
                "text": text_content if text_content else None,
                "text_styles": text_styles if text_styles else None,
                "image_rId": image_rId,
                "children": [],
            }
            elements.append(elem)

        # ── 4. Geometric containment grouping ────────────────────────────────────
        #
        # Strategy:
        #   • Only filled/background shapes can be parents (text boxes floating
        #     in the open are never containers for other text boxes).
        #   • Use a small pixel tolerance to handle off-by-one EMU rounding.
        #   • Among all qualifying parents, choose the SMALLEST (tightest) one.
        #   • An element that becomes a child is tracked in `child_ids` so it is
        #     excluded from the top-level list.

        TOLERANCE = 6  # px — accounts for EMU rounding across scale factors

        # Pre-build a lookup so we can mutate the original element objects
        elem_by_id = {e["id"]: e for e in elements}
        child_ids: set = set()

        for elem in elements:
            # Elements that are purely text boxes without fills should not be
            # parents themselves, but they CAN be children of filled shapes.
            potential_parents = [
                p for p in elements
                if p["id"] != elem["id"]
                and p["is_filled"]                              # only filled shapes are containers
                and (p["w"] * p["h"]) > (elem["w"] * elem["h"])  # parent must be larger
                and (p["x"] - TOLERANCE) <= elem["x"]
                and (p["y"] - TOLERANCE) <= elem["y"]
                and (p["x"] + p["w"] + TOLERANCE) >= (elem["x"] + elem["w"])
                and (p["y"] + p["h"] + TOLERANCE) >= (elem["y"] + elem["h"])
            ]

            if potential_parents:
                # Tightest (smallest area) qualifying container
                parent = min(potential_parents, key=lambda p: p["w"] * p["h"])

                elem_copy = {k: v for k, v in elem.items()}
                elem_copy["relative_x"] = round(elem["x"] - parent["x"], 2)
                elem_copy["relative_y"] = round(elem["y"] - parent["y"], 2)

                elem_by_id[parent["id"]]["children"].append(elem_copy)
                child_ids.add(elem["id"])

        # Top-level = elements that were not absorbed as children
        top_level = [e for e in elements if e["id"] not in child_ids]

        # ── 5. Recursive clean ────────────────────────────────────────────────────
        cleaned = [_clean_node(n) for n in top_level]

        return json.dumps(cleaned, indent=2)

    except Exception as e:
        print(f"Error parsing OXML: {e}")
        return json.dumps({"error": str(e), "raw_xml_length": len(xml_content)})


# ── Helpers ───────────────────────────────────────────────────────────────────

def _clean_node(node: dict) -> dict:
    """
    Recursively clean a node tree.
    Removes the 'children' key when the list is empty,
    and recurses into children so no level of nesting is lost.
    """
    if not node.get("children"):
        node.pop("children", None)
    else:
        node["children"] = [_clean_node(c) for c in node["children"]]
    return node


def _extract_rich_text(shape_elem: ET.Element, NS: dict) -> tuple:
    """
    Walk all paragraph/run elements and extract:
      - plain concatenated text string
      - list of style dicts (font size, bold, color, alignment) per paragraph

    Returns (text_str, styles_list).
    """
    paragraphs_text = []
    styles = []

    for para in shape_elem.findall(".//a:p", NS):
        # Paragraph-level alignment
        pPr = para.find("a:pPr", NS)
        align = pPr.get("algn", "l") if pPr is not None else "l"

        runs_text = []
        para_style = {"align": align, "runs": []}

        for run in para.findall("a:r", NS):
            t_elem = run.find("a:t", NS)
            if t_elem is None or not t_elem.text:
                continue

            run_text = t_elem.text
            runs_text.append(run_text)

            rPr = run.find("a:rPr", NS)
            run_style: dict = {}

            if rPr is not None:
                # Font size (in hundredths of a point → pt)
                sz = rPr.get("sz")
                if sz:
                    run_style["font_size_pt"] = int(sz) / 100

                run_style["bold"]   = rPr.get("b") in ("1", "true")
                run_style["italic"] = rPr.get("i") in ("1", "true")

                # Solid color on the run
                solid = rPr.find(".//a:solidFill/a:srgbClr", NS)
                if solid is not None:
                    run_style["color"] = "#" + solid.get("val", "000000")

                # Font family
                latin = rPr.find("a:latin", NS)
                if latin is not None:
                    run_style["font_family"] = latin.get("typeface", "")

            if run_style:
                run_style["text"] = run_text
                para_style["runs"].append(run_style)

        para_text = "".join(runs_text)
        if para_text:
            paragraphs_text.append(para_text)
            if para_style["runs"]:
                styles.append(para_style)

    return "\n".join(paragraphs_text), styles if styles else None


def _extract_fill_color(shape_elem: ET.Element, NS: dict) -> Optional[str]:
    """
    Extract a hex fill color string from a shape element.
    Returns None when the shape has no explicit solid fill.
    Handles solidFill, theme references are left as None (LLM will infer from image).
    """
    # Direct solid fill on spPr
    solid = shape_elem.find(".//a:spPr/a:solidFill/a:srgbClr", NS)
    if solid is not None:
        return "#" + solid.get("val", "ffffff")

    # Solid fill anywhere inside the shape (e.g. inside style)
    solid_any = shape_elem.find(".//a:solidFill/a:srgbClr", NS)
    if solid_any is not None:
        return "#" + solid_any.get("val", "ffffff")

    # Gradient fill — return first stop color as a hint
    grad_stop = shape_elem.find(".//a:gradFill//a:srgbClr", NS)
    if grad_stop is not None:
        return "#" + grad_stop.get("val", "ffffff")

    # Shape has a fill reference in style (theme color) — signal presence without value
    fill_ref = shape_elem.find(".//p:style/a:fillRef", NS)
    if fill_ref is not None:
        inner = fill_ref.find(".//a:srgbClr", NS)
        if inner is not None:
            return "#" + inner.get("val", "ffffff")
        # Theme color — we can't resolve without the theme XML, signal as "theme"
        scheme = fill_ref.find(".//a:schemeClr", NS)
        if scheme is not None:
            return f"theme:{scheme.get('val', 'unknown')}"

    return None