import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-title-slide";
export const layoutName = "Cutouts Title Slide";
export const layoutDescription =
  "A minimalistic and impactful large bold title slide. It features a bright neon blue pill badge indicating the topic, a massive title, and a small subtitle.";

const cutoutsTitleSchema = z.object({
  badgeText: z.string().max(20).default("The opportunity").meta({
    description: "The text inside the colored pill badge",
  }),
  title: z.string().min(5).max(70).default("WHAT IS THE VISION?").meta({
    description: "The massive uppercase heading (keep it punchy)",
  }),
  subtitle: z.string().max(120).default("The overarching narrative").meta({
    description: "The smaller subtitle text below the main heading",
  }),
});

export const Schema = cutoutsTitleSchema;
export type CutoutsTitleData = z.infer<typeof cutoutsTitleSchema>;

interface CutoutsTitleProps {
  data: Partial<CutoutsTitleData>;
}

const CutoutsTitleSlide: React.FC<CutoutsTitleProps> = ({ data: slideData }) => {
  const { badgeText, title, subtitle } = slideData;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col justify-center gap-[108px]"
        style={{
          backgroundColor: "#0E1821",
          paddingLeft: "64px", // From Figma left: 64px
        }}
      >
        <div className="flex flex-col items-start gap-4">
          {/* Badge */}
          {badgeText && (
            <div
              className="flex items-center px-10 py-3 rounded-full"
              style={{ backgroundColor: "#5864FF" }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  letterSpacing: "-0.06em",
                  color: "#FFFFFF",
                }}
              >
                {badgeText}
              </span>
            </div>
          )}

          {/* Title */}
          {title && (
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "100px", // Reduced from 140px to prevent overflow on long words
                letterSpacing: "-0.06em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                lineHeight: "1",
                maxWidth: "1000px",
                wordWrap: "break-word",
              }}
            >
              {title}
            </h2>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontFamily: "'Darker Grotesque', sans-serif",
              fontWeight: 400,
              fontSize: "48px",
              lineHeight: "1",
              color: "#BAC1CC",
              maxWidth: "1000px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </>
  );
};

export default CutoutsTitleSlide;
