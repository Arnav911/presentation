import React from "react";
import * as z from "zod";

export const layoutId = "pitch-agenda-text";
export const layoutName = "Pitch Agenda (Text)";
export const layoutDescription =
  "Beige agenda slide with four oversized serif numerals and short labels.";

const AgendaItemSchema = z.object({
  number: z.string().default("1"),
  label: z.string().default("Item"),
});

const schema = z.object({
  items: z
    .array(AgendaItemSchema)
    .default([
      { number: "1", label: "Intros" },
      { number: "2", label: "Background" },
      { number: "3", label: "Proposal" },
      { number: "4", label: "Q&A" },
    ])
    .meta({ description: "Up to 4 agenda items, each with a number and short label" }),
});

export const Schema = schema;
export type PitchAgendaTextData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchAgendaTextData>;
}

const PitchAgendaTextSlide: React.FC<Props> = ({ data }) => {
  const items = data.items ?? [
    { number: "1", label: "Intros" },
    { number: "2", label: "Background" },
    { number: "3", label: "Proposal" },
    { number: "4", label: "Q&A" },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col"
        style={{ backgroundColor: "#E4DDD0" }}
      >
        {/* ── Heading ── */}
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(48px, 7vw, 88px)",
            color: "#111111",
            lineHeight: 1,
            margin: 0,
            padding: "36px 64px 0",
          }}
        >
          Agenda
        </h2>

        {/* ── Items row ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 80,
            padding: "20px 80px",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(64px, 8vw, 100px)",
                  color: "#111111",
                  lineHeight: 1,
                }}
              >
                {item.number}
              </span>
              <span
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#555555",
                  textAlign: "center",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PitchAgendaTextSlide;
