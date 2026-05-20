import React from "react";
import * as z from "zod";

export const layoutId = "pitch-our-mission";
export const layoutName = "Pitch Our Mission";
export const layoutDescription =
  "Dark full-bleed slide with a large serif 'Our Mission' heading and a supporting description.";

const schema = z.object({
  agencyLabel: z
    .string()
    .default("Agency Name × Partner Name")
    .meta({ description: "Header label on the right" }),
  phase: z
    .string()
    .default("Phase X")
    .meta({ description: "Phase label on the far right" }),
  description: z
    .string()
    .default(
      "Tell the client what the team is all about — who you are at your core, and what you aim to achieve."
    )
    .meta({ description: "Supporting copy below the mission heading" }),
});

export const Schema = schema;
export type PitchOurMissionData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurMissionData>;
}

const PitchOurMissionSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, description } = data;

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
            alignItems: "center",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 900 }}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(52px, 8vw, 100px)",
                color: "#F5F2EC",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Our
              <br />
              Mission
            </h1>
            {description && (
              <p
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                  maxWidth: 580,
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

export default PitchOurMissionSlide;
