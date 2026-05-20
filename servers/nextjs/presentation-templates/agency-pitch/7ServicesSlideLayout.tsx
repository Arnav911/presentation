import React from "react";
import * as z from "zod";

export const layoutId = "pitch-what-we-do";
export const layoutName = "Pitch What We Do";
export const layoutDescription =
  "Beige two-column slide: heading on the left, a ruled list of specialties on the right.";

const schema = z.object({
  agencyLabel: z
    .string()
    .default("Agency Name × Partner Name")
    .meta({ description: "Header label on the right" }),
  phase: z
    .string()
    .default("Phase X")
    .meta({ description: "Phase label on the far right" }),
  items: z
    .array(z.string())
    .default([
      "Quickly list your team's specialties.",
      "Keep each of them short and sweet.",
      "Make them easy to scan and remember.",
      "Only highlight the most important bits.",
    ])
    .meta({ description: "List of specialties or bullet points, one per line" }),
});

export const Schema = schema;
export type PitchWhatWeDoData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchWhatWeDoData>;
}

const PitchWhatWeDoSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, items } = data;

  const list = items ?? [
    "Quickly list your team's specialties.",
    "Keep each of them short and sweet.",
    "Make them easy to scan and remember.",
    "Only highlight the most important bits.",
  ];

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
            What We Do
          </span>
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

        {/* ── Two-column body ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            alignItems: "center",
            gap: 60,
            padding: "0 48px 48px",
          }}
        >
          {/* Left: heading */}
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              textTransform: "uppercase",
              lineHeight: 1.1,
              color: "#111111",
              margin: 0,
            }}
          >
            What
            <br />
            We Do
          </h2>

          {/* Right: ruled list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {list.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.15)",
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 17,
                  fontWeight: 400,
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "#aaaaaa",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  —
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PitchWhatWeDoSlide;
