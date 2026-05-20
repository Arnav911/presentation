import React from "react";
import * as z from "zod";

export const layoutId = "pitch-our-principles";
export const layoutName = "Pitch Our Principles";
export const layoutDescription =
  "Beige slide with four tall colored cards, each showing a large number, bold label, and short description.";

const CARD_COLORS = ["#9A7444", "#C0338A", "#FF4A1C", "#1A8A79"];

const PrincipleSchema = z.object({
  label: z.string().default("Principle Explainer"),
  description: z.string().default("Add a quick description of this principle."),
});

const schema = z.object({
  agencyLabel: z
    .string()
    .default("Agency Name × Partner Name")
    .meta({ description: "Header label on the right" }),
  phase: z
    .string()
    .default("Phase X")
    .meta({ description: "Phase label on the far right" }),
  principles: z
    .array(PrincipleSchema)
    .default([
      { label: "Principle Explainer", description: "Add a quick description of each of your principles — for building product, designing, etc." },
      { label: "Principle Explainer", description: "Keep them as short and sweet as possible, so they're easy to understand." },
      { label: "Principle Explainer", description: "If it's helpful, link to examples of your work that reflect each principle." },
      { label: "Principle Explainer", description: "If you have fewer than four, simply cut what you don't need and shift the rest around." },
    ])
    .meta({ description: "Exactly 4 principles with a label and short description each" }),
});

export const Schema = schema;
export type PitchOurPrinciplesData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurPrinciplesData>;
}

const PitchOurPrinciplesSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, principles } = data;

  const list = principles ?? [
    { label: "Principle Explainer", description: "Add a quick description of each of your principles." },
    { label: "Principle Explainer", description: "Keep them short and sweet." },
    { label: "Principle Explainer", description: "Link to examples of your work when helpful." },
    { label: "Principle Explainer", description: "Cut what you don't need and shift the rest around." },
  ];

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
            Our Principles
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

        {/* ── Cards ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            padding: "12px 48px 32px",
          }}
        >
          {list.map((p, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                background: CARD_COLORS[i % CARD_COLORS.length],
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px 24px 24px",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(64px, 9vw, 110px)",
                  lineHeight: 1,
                  color: "rgba(0,0,0,0.82)",
                }}
              >
                {i + 1}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.88)",
                    lineHeight: 1.4,
                  }}
                >
                  {p.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 11,
                    lineHeight: 1.55,
                    color: "rgba(0,0,0,0.65)",
                  }}
                >
                  {p.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PitchOurPrinciplesSlide;
