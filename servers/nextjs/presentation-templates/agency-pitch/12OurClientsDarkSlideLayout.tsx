import React from "react";
import * as z from "zod";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";

export const layoutId = "pitch-our-clients-dark";
export const layoutName = "Pitch Our Clients (Dark)";
export const layoutDescription =
  "Dark slide with an orange heading and a mosaic grid of client logo placeholders.";

const LogoSchema = z.object({
  image: ImageSchema.default({
    __image_prompt__: "Company logo on transparent background, clean and professional",
  }).meta({ description: "Client logo image" }),
  altText: z.string().default("Client Logo").meta({ description: "Accessible alt text for the logo" }),
});

const schema = z.object({
  agencyLabel: z
    .string()
    .default("Agency Name × Partner Name")
    .meta({ description: "Header label" }),
  phase: z
    .string()
    .default("Phase X")
    .meta({ description: "Phase label" }),
  logos: z
    .array(LogoSchema)
    .default(
      Array.from({ length: 7 }, (_, i) => ({
        image: { __image_prompt__: `Client logo ${i + 1}` },
        altText: `Client ${i + 1}`,
      }))
    )
    .meta({ description: "Up to 7 client logos for the mosaic grid" }),
});

export const Schema = schema;
export type PitchOurClientsDarkData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurClientsDarkData>;
}

/**
 * Grid layout mirrors the Figma design:
 *   Col 1: rows 1–2 (tall)   Col 2: row 1, Col 3: row 1
 *   Col 1: (cont.)           Col 2: row 2, Col 3: row 2
 *   Col 1: row 3             Col 2: (cont. tall), Col 3: row 3
 *   Col 1: row 3 (cont.)     ...
 *
 * Simplified to CSS grid with named template areas.
 */
const PitchOurClientsDarkSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, logos } = data;

  const list = logos ?? Array.from({ length: 7 }, (_, i) => ({
    altText: `Client ${i + 1}`,
  }));

  // Assign grid area names matching the mosaic
  const areas = ["a", "b", "c", "d", "e", "f", "g"];
  const gridTemplate = `
    "a b c"
    "a d c"
    "a e f"
    "g e h"
  `;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col"
        style={{ backgroundColor: "#111111" }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 48px 0",
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 60px)",
              textTransform: "uppercase",
              color: "#FF4A1C",
              margin: 0,
            }}
          >
            Our Clients
          </h2>
          <div
            style={{
              display: "flex",
              gap: 60,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            <span>{agencyLabel ?? "Agency Name × Partner Name"}</span>
            <span>{phase ?? "Phase X"}</span>
          </div>
        </div>

        {/* ── Logo grid ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: 14,
            padding: "20px 48px 32px",
          }}
        >
          {/* Slot 0: spans 2 rows */}
          <LogoCell imgUrl={getImgUrl(list[0])} alt={list[0]?.altText} style={{ gridRow: "span 2" }} />
          <LogoCell imgUrl={getImgUrl(list[1])} alt={list[1]?.altText} />
          <LogoCell imgUrl={getImgUrl(list[2])} alt={list[2]?.altText} />
          {/* Row 2 fills naturally */}
          <LogoCell imgUrl={getImgUrl(list[3])} alt={list[3]?.altText} />
          <LogoCell imgUrl={getImgUrl(list[4])} alt={list[4]?.altText} />
        </div>
      </div>
    </>
  );
};

function getImgUrl(logo: any): string | null {
  if (!logo) return null;
  if (logo.image && (logo.image as any).__image_url__) return (logo.image as any).__image_url__;
  return null;
}

function LogoCell({
  imgUrl,
  alt,
  style: extraStyle,
}: {
  imgUrl: string | null;
  alt?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...extraStyle,
      }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={alt ?? "Client logo"}
          style={{ maxWidth: "60%", maxHeight: "60%", objectFit: "contain" }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 6,
          }}
        />
      )}
    </div>
  );
}

export default PitchOurClientsDarkSlide;
