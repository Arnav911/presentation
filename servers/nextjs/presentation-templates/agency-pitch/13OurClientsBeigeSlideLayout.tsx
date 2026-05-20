import React from "react";
import * as z from "zod";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";

export const layoutId = "pitch-our-clients-beige";
export const layoutName = "Pitch Our Clients (Beige)";
export const layoutDescription =
  "Beige slide with a 4×2 grid of client logo cells divided by thin hairlines.";

const LogoSchema = z.object({
  image: ImageSchema.default({__image_url__: "",
    __image_prompt__: "Company logo on transparent background, minimal and clean",
  }).meta({ description: "Client logo image" }),
  altText: z
    .string()
    .default("Logo")
    .meta({ description: "Accessible alt text / fallback text" }),
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
      Array.from({ length: 8 }, (_, i) => ({
        __image_url__: "",
        image: { __image_prompt__: `Client logo ${i + 1}` },
        altText: "Logo",
      }))
    )
    .meta({ description: "Up to 8 client logos for the 4×2 grid" }),
});

export const Schema = schema;
export type PitchOurClientsBeigeData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurClientsBeigeData>;
}

const PitchOurClientsBeigeSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, logos } = data;

  const list = logos ?? Array.from({ length: 8 }, (_, i) => ({ altText: "Logo" }));

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;600&family=Space+Mono:wght@700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col"
        style={{ backgroundColor: "#E4DDD0" }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 48px",
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              textTransform: "uppercase",
              color: "#111111",
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
              color: "rgba(0,0,0,0.4)",
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
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: 1,
            background: "rgba(0,0,0,0.1)",
            margin: "0 48px 32px",
          }}
        >
          {list.slice(0, 8).map((logo, i) => {
            const imgUrl =
              logo.image && (logo.image as any).__image_url__
                ? (logo.image as any).__image_url__
                : null;

            return (
              <div
                key={i}
                style={{
                  background: "#E4DDD0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={logo.altText ?? "Logo"}
                    style={{ maxWidth: "70%", maxHeight: "60%", objectFit: "contain" }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(0,0,0,0.3)",
                    }}
                  >
                    {logo.altText ?? "Logo"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PitchOurClientsBeigeSlide;
