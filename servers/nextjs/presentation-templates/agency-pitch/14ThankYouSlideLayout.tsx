import React from "react";
import * as z from "zod";

export const layoutId = "pitch-thank-you";
export const layoutName = "Pitch Thank You";
export const layoutDescription =
  "Dark closing slide with agency/partner credits and a massive serif 'Thank You' heading.";

const schema = z.object({
  agencyName: z
    .string()
    .default("Agency Name")
    .meta({ description: "Agency name shown in the bottom-left credits" }),
  partnerName: z
    .string()
    .default("Partner Name")
    .meta({ description: "Partner name shown in the bottom-left credits" }),
  title: z
    .string()
    .default("Thank\nYou")
    .meta({ description: "Closing title — use \\n to split across lines" }),
});

export const Schema = schema;
export type PitchThankYouData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchThankYouData>;
}

const PitchThankYouSlide: React.FC<Props> = ({ data }) => {
  const { agencyName, partnerName, title } = data;

  const titleLines = (title ?? "Thank\nYou").split("\n");

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col justify-end"
        style={{ backgroundColor: "#111111" }}
      >
        <div
          style={{
            padding: "0 56px 52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Credits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
            {[agencyName, partnerName].map((name, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                — {name}
              </span>
            ))}
          </div>

          {/* Title */}
          {titleLines.map((line, i) => (
            <h1
              key={i}
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(80px, 12vw, 148px)",
                color: "#F5F2EC",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {line}
            </h1>
          ))}
        </div>
      </div>
    </>
  );
};

export default PitchThankYouSlide;
