import React from "react";
import * as z from "zod";

export const layoutId = "pitch-our-purpose";
export const layoutName = "Pitch Our Purpose";
export const layoutDescription =
  "Beige two-column slide: bold serif heading on the left, descriptive paragraph on the right.";

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
      "Tell the client what the team is all about — who you are at your core, and what you aim to achieve. This is the place to be clear about your values, your vision, and your commitment to doing great work."
    )
    .meta({ description: "Body copy displayed in the right column" }),
});

export const Schema = schema;
export type PitchOurPurposeData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurPurposeData>;
}

const PitchOurPurposeSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, description } = data;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;500&family=Space+Mono&display=swap"
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
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.4)",
            }}
          >
            Our Purpose
          </span>
          <div style={{ display: "flex", gap: 60, color: "rgba(0,0,0,0.4)" }}>
            <span>{agencyLabel ?? "Agency Name × Partner Name"}</span>
            <span>{phase ?? "Phase X"}</span>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            alignItems: "flex-end",
            gap: 60,
            padding: "0 48px 48px",
          }}
        >
          {/* Left: heading */}
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              textTransform: "uppercase",
              lineHeight: 1.1,
              color: "#111111",
              margin: 0,
            }}
          >
            Our
            <br />
            Purpose
          </h2>

          {/* Right: body copy */}
          <p
            style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 18,
              lineHeight: 1.75,
              color: "#444444",
              margin: 0,
              maxWidth: 560,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </>
  );
};

export default PitchOurPurposeSlide;
