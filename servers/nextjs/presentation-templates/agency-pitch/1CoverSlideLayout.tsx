import React from "react";
import * as z from "zod";

export const layoutId = "pitch-cover";
export const layoutName = "Pitch Cover";
export const layoutDescription =
  "Dark cover slide with oversized serif title, date, and agency/partner credits.";

const schema = z.object({
  date: z
    .string()
    .default("Today's Date")
    .meta({ description: "Date displayed at the top of the slide" }),
  title: z
    .string()
    .default("Pitch\nDeck")
    .meta({ description: "Main title — use \\n to split across lines" }),
  agencyName: z
    .string()
    .default("Agency Name")
    .meta({ description: "Your agency name shown in the bottom-right credits" }),
  partnerName: z
    .string()
    .default("Partner Name")
    .meta({ description: "Your partner name shown in the bottom-right credits" }),
});

export const Schema = schema;
export type PitchCoverData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchCoverData>;
}

const PitchCoverSlide: React.FC<Props> = ({ data }) => {
  const { date, title, agencyName, partnerName } = data;

  const titleLines = (title ?? "Pitch\nDeck").split("\n");

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col justify-between"
        style={{ backgroundColor: "#111111" }}
      >
        {/* ── Top block: date + title ── */}
        <div style={{ padding: "44px 56px 0" }}>
          {date && (
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                marginBottom: 16,
              }}
            >
              {date}
            </p>
          )}
          {titleLines.map((line, i) => (
            <h1
              key={i}
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(80px, 11.8vw, 152px)",
                color: "#F5F2EC",
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* ── Bottom block: agency / partner credits ── */}
        <div
          style={{
            padding: "0 56px 48px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            {[agencyName, partnerName].map((name, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                — {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PitchCoverSlide;
