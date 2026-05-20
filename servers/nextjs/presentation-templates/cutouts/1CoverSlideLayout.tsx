import React from "react";
import * as z from "zod";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";

export const layoutId = "cutouts-cover-slide";
export const layoutName = "Cutouts Cover Slide";
export const layoutDescription =
  "A bold, dark-themed cover slide with a large dynamic background image, a neon pill badge, a massive bold title, and a subtitle.";

// 1. Define the Schema
const cutoutsCoverSchema = z.object({
  backgroundImage: ImageSchema.default({__image_url__: "",
    __image_prompt__: "Abstract dark minimalist background with subtle textures",
  }).meta({
    description: "The full-bleed background image covering the entire slide",
  }),
  badgeText: z.string().max(20).default("BETA").meta({
    description: "Short text for the neon blue badge at the top",
  }),
  title: z
    .string()
    .min(2)
    .max(30)
    .default("CUTOUTS")
    .meta({
      description: "The massive main title of the presentation",
    }),
  subtitle: z
    .string()
    .max(100)
    .default("Deconstruct inspirations for easy retrieval")
    .meta({
      description: "The descriptive subtitle below the main title",
    }),
});

export const Schema = cutoutsCoverSchema;

export type CutoutsCoverData = z.infer<typeof cutoutsCoverSchema>;

interface CutoutsCoverProps {
  data: Partial<CutoutsCoverData>;
}

// 2. The React Component mapped from Figma CSS
const CutoutsCoverSlide: React.FC<CutoutsCoverProps> = ({ data: slideData }) => {
  const { backgroundImage, badgeText, title, subtitle } = slideData;

  // We use the image URL if provided by the backend image generator, or a placeholder
  const bgUrl =
    backgroundImage && (backgroundImage as any).__image_url__
      ? (backgroundImage as any).__image_url__
      : "/placeholder.jpg";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&family=Space+Mono:wght@700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden"
        style={{
          backgroundColor: "#0E1821", // dark background from Figma
        }}
      >
        {/* Full bleed background image */}
        <div
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scaleX(-1)", // 'transform: matrix(-1, 0, 0, 1, 0, 0)' from Figma
          }}
        />

        {/* Title Group Container - positioned based on Figma left: 64px, top: 374px */}
        <div className="absolute z-10 flex flex-col items-start gap-6 left-[64px] top-[320px] max-w-[1100px]">
          {/* Badge & Title Row Frame 35 */}
          <div className="flex flex-row items-center gap-8">
            {/* Title */}
            {title && (
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "150px", // Scaled slightly to fit 1280x720 safely
                  letterSpacing: "-0.06em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  lineHeight: "1",
                }}
              >
                {title}
              </h1>
            )}

            {/* BETA Badge (Frame 34) */}
            {badgeText && (
              <div
                className="flex items-center px-4 py-2"
                style={{ backgroundColor: "#5864FF" }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: "20px",
                    letterSpacing: "0.05em",
                    color: "#FFFFFF",
                  }}
                >
                  {badgeText}
                </span>
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontFamily: "'Darker Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "54px",
                lineHeight: "1.2",
                color: "#BAC1CC", // Figma color
                maxWidth: "851px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CutoutsCoverSlide;
