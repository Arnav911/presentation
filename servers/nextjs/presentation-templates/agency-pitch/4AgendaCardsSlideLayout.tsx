import React from "react";
import * as z from "zod";

export const layoutId = "pitch-agenda-cards";
export const layoutName = "Pitch Agenda (Cards)";
export const layoutDescription =
  "Beige agenda slide with four tall colored numbered cards (gold, magenta, orange, teal).";

const CARD_COLORS = ["#9A7444", "#C0338A", "#FF4A1C", "#1A8A79"];

const AgendaCardSchema = z.object({
  number: z.string().default("01"),
  label: z.string().default("Agenda Item"),
  description: z.string().default("Add a short description of this agenda item here."),
});

const schema = z.object({
  cards: z
    .array(AgendaCardSchema)
    .default([
      { number: "01", label: "Agenda Item", description: "Add a short description of this agenda item here." },
      { number: "02", label: "Agenda Item", description: "Keep each item short and easy to scan." },
      { number: "03", label: "Agenda Item", description: "Highlight only the most critical points." },
      { number: "04", label: "Agenda Item", description: "Link out to additional context if needed." },
    ])
    .meta({ description: "Exactly 4 agenda cards with number, label, and short description" }),
});

export const Schema = schema;
export type PitchAgendaCardsData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchAgendaCardsData>;
}

const PitchAgendaCardsSlide: React.FC<Props> = ({ data }) => {
  const cards = data.cards ?? [
    { number: "01", label: "Agenda Item", description: "Add a short description of this agenda item here." },
    { number: "02", label: "Agenda Item", description: "Keep each item short and easy to scan." },
    { number: "03", label: "Agenda Item", description: "Highlight only the most critical points." },
    { number: "04", label: "Agenda Item", description: "Link out to additional context if needed." },
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
        {/* ── Heading ── */}
        <div style={{ padding: "28px 48px 0" }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              textTransform: "uppercase",
              color: "#111111",
              margin: 0,
            }}
          >
            Agenda
          </h2>
        </div>

        {/* ── Cards grid ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            padding: "16px 48px 32px",
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                background: CARD_COLORS[i % CARD_COLORS.length],
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "32px 28px 24px",
              }}
            >
              {/* Big number */}
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(72px, 10vw, 120px)",
                  color: "rgba(0,0,0,0.85)",
                  lineHeight: 1,
                }}
              >
                {card.number}
              </span>

              {/* Label + description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.9)",
                    lineHeight: 1.3,
                  }}
                >
                  {card.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: "rgba(0,0,0,0.7)",
                  }}
                >
                  {card.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PitchAgendaCardsSlide;
