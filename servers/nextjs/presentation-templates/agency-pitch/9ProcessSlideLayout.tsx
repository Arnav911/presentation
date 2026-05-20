import React from "react";
import * as z from "zod";

export const layoutId = "pitch-our-process";
export const layoutName = "Pitch Our Process";
export const layoutDescription =
  "Beige slide with four vertically-ruled process steps, each showing a step number, title, and description.";

const ProcessStepSchema = z.object({
  number: z.string().default("01"),
  title: z.string().default("Phase of Process"),
  description: z.string().default("Break down the phases of your process for your client."),
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
  steps: z
    .array(ProcessStepSchema)
    .default([
      { number: "01", title: "Phase of Process", description: "Break down the phases of your process for your client, so they understand how you do your work." },
      { number: "02", title: "Phase of Process", description: "Provide details for each step, like what's involved, how long it takes, and any other critical bits." },
      { number: "03", title: "Phase of Process", description: "You can change the width of each step, and the rest will adjust automatically." },
      { number: "04", title: "Phase of Process", description: "You can use multiple copies of this slide if you have more steps in your process." },
    ])
    .meta({ description: "Up to 4 process steps, each with a number, short title, and description" }),
});

export const Schema = schema;
export type PitchOurProcessData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurProcessData>;
}

const PitchOurProcessSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, steps } = data;

  const list = steps ?? [
    { number: "01", title: "Phase of Process", description: "Break down the phases of your process for your client." },
    { number: "02", title: "Phase of Process", description: "Provide details for each step." },
    { number: "03", title: "Phase of Process", description: "You can change the width of each step." },
    { number: "04", title: "Phase of Process", description: "Use multiple copies of this slide for more steps." },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;500;600&family=Space+Mono:wght@700&display=swap"
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
            Our Process
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

        {/* ── Process steps ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${list.length}, 1fr)`,
            borderTop: "1px solid rgba(0,0,0,0.12)",
            margin: "0 48px",
          }}
        >
          {list.map((step, i) => (
            <div
              key={i}
              style={{
                padding: i === 0 ? "28px 20px 32px 0" : i === list.length - 1 ? "28px 0 32px 20px" : "28px 20px 32px",
                borderRight: i < list.length - 1 ? "1px solid rgba(0,0,0,0.12)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.35)",
                }}
              >
                {step.number}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#111111",
                  lineHeight: 1.4,
                }}
              >
                {step.title}
              </span>
              <p
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: "#555555",
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PitchOurProcessSlide;
