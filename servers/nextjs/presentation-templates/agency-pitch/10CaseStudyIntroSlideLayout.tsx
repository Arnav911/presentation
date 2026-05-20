import React from "react";
import * as z from "zod";

export const layoutId = "pitch-case-study-intro";
export const layoutName = "Pitch Case Study Intro";
export const layoutDescription =
  "Dark section-divider slide introducing the Case Study portion of the presentation.";

const schema = z.object({
  agencyLabel: z
    .string()
    .default("Agency Name × Partner Name")
    .meta({ description: "Header label on the right" }),
  phase: z
    .string()
    .default("Phase X")
    .meta({ description: "Phase label on the far right" }),
  sectionLabel: z
    .string()
    .default("Section")
    .meta({ description: "Small mono label above the title" }),
  title: z
    .string()
    .default("Case Study")
    .meta({ description: "Large serif heading for the section" }),
  description: z
    .string()
    .default(
      "Show what you can do — walk through some work your team has done that's relevant to the pitch."
    )
    .meta({ description: "Supporting copy below the title" }),
});

export const Schema = schema;
export type PitchCaseStudyIntroData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchCaseStudyIntroData>;
}

const PitchCaseStudyIntroSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, sectionLabel, title, description } = data;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;500&family=Space+Mono&display=swap"
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
            justifyContent: "flex-end",
            padding: "18px 48px",
            gap: 60,
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <span>{agencyLabel ?? "Agency Name × Partner Name"}</span>
          <span>{phase ?? "Phase X"}</span>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sectionLabel && (
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {sectionLabel}
              </span>
            )}
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(60px, 9vw, 108px)",
                color: "#F5F2EC",
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h1>
            {description && (
              <p
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                  maxWidth: 540,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PitchCaseStudyIntroSlide;
