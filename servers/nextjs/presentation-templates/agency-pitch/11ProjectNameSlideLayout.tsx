import React from "react";
import * as z from "zod";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";

export const layoutId = "pitch-project-name";
export const layoutName = "Pitch Project Name";
export const layoutDescription =
  "Full-bleed image slide with a centered mono project name overlaid on the photo.";

const schema = z.object({
  backgroundImage: ImageSchema.default({
    __image_url__: "",
    __image_prompt__:
      "Abstract sculptural mobile hanging from ceiling, gray background, editorial photography, minimalist",
  }).meta({ description: "Full-bleed background image for the project slide" }),
  projectName: z
    .string()
    .default("Project Name")
    .meta({ description: "Project name displayed centered over the image" }),
});

export const Schema = schema;
export type PitchProjectNameData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchProjectNameData>;
}

const PitchProjectNameSlide: React.FC<Props> = ({ data }) => {
  const { backgroundImage, projectName } = data;

  const bgUrl =
    backgroundImage && (backgroundImage as any).__image_url__
      ? (backgroundImage as any).__image_url__
      : null;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#D0CCCA" }}
      >
        {/* ── Background image (or decorative placeholder) ── */}
        {bgUrl ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${bgUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : (
          /* Decorative geometric placeholder that echoes the Figma slide */
          <div style={{ position: "absolute", inset: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(160deg,#BEB9B5 0%,#9E9996 50%,#8C8884 100%)",
              }}
            />
            {/* Floating disc shapes */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "calc(48% - 9%)",
                width: "18%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.18)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "calc(50% - 4%)",
                width: "8%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "#E8622A",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "15%",
                left: "35%",
                width: "15%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
              }}
            />
            {/* Diagonal wire lines */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line x1="30" y1="85" x2="55" y2="15" stroke="rgba(0,0,0,0.25)" strokeWidth="0.3" />
              <line x1="70" y1="90" x2="50" y2="40" stroke="rgba(0,0,0,0.25)" strokeWidth="0.3" />
            </svg>
          </div>
        )}

        {/* ── Project name overlay ── */}
        <h1
          style={{
            position: "relative",
            zIndex: 2,
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(28px, 4vw, 52px)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#111111",
            margin: 0,
          }}
        >
          {projectName}
        </h1>
      </div>
    </>
  );
};

export default PitchProjectNameSlide;
