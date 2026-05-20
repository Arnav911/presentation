import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide09";
export const layoutName = "Creative Brief Slide09";
export const layoutDescription = "Tone and brand voice slide with 3 traits.";

export const Schema = z.object({
  label: z.string().default("TONE & BRAND VOICE").meta({ description: "Section label" }),
  statement: z.string().default("This campaign should sound:").meta({ description: "Main heading statement" }),
  description: z.string().default("Write a brief statement describing how the campaign should sound and feel...").meta({ description: "Description or subtitle" }),
  tones: z.array(z.object({
    word: z.string(),
    description: z.string()
  })).default([
    { word: "Informed", description: "Grounded in credibility and backed by real research expertise..." },
    { word: "Empowering", description: "We emphasize the transformative potential of knowledge..." },
    { word: "Curious", description: "We ask, explore, and uncover patterns that others might overlook..." }
  ]).meta({ description: "Array of tone objects with a word and description. Make sure there are 3." })
});

export default function Slide09({ data }: any) {
  const tones = data?.tones || [
    { word: "Informed", description: "Grounded in credibility and backed by real research expertise, our tone reflects depth of understanding without being overly technical." },
    { word: "Empowering", description: "We emphasize the transformative potential of knowledge and collaboration. Every message should make researchers feel capable of achieving more, unlocking possibilities through the right tools and shared discovery" },
    { word: "Curious", description: "We ask, explore, and uncover patterns that others might overlook. Our voice invites experimentation and continuous learning, encouraging audiences to see research as a journey of discovery." },
  ];

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "4% 5% 3%",
          gap: "clamp(16px, 4vw, 60px)",
          borderBottom: "1px solid #E8E8E8",
        }}
      >
        <div style={{ minWidth: "clamp(100px, 18vw, 240px)" }}>
          <span
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "clamp(7px, 0.7vw, 10px)",
              letterSpacing: "0.18em",
              color: "#555",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "clamp(6px, 0.8vw, 12px)",
            }}
          >
            {data?.label || "TONE & BRAND VOICE"}
          </span>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(12px, 1.6vw, 20px)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {data?.statement || "This campaign should sound:"}
          </p>
        </div>
        <p
          style={{
            color: "#999",
            fontSize: "clamp(9px, 1vw, 13px)",
            margin: 0,
            lineHeight: 1.6,
            flex: 1,
            alignSelf: "center",
          }}
        >
          {data?.description || "Write a brief statement describing how the campaign should sound and feel. Use adjectives or short phrases that set the emotional tone and guide design and copy decisions."}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {tones.map((tone: any, i: number) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "clamp(100px, 18vw, 240px) 1fr",
              borderBottom: i < tones.length - 1 ? "1px solid #E8E8E8" : "none",
            }}
          >
            <div
              style={{
                padding: "0 clamp(16px, 3vw, 40px) 0 5%",
                display: "flex",
                alignItems: "center",
                borderRight: "1px solid #E8E8E8",
              }}
            >
              <span
                style={{
                  color: "#B84040",
                  fontSize: "clamp(20px, 3.5vw, 48px)",
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                }}
              >
                {tone.word}
              </span>
            </div>

            <div
              style={{
                padding: "0 5% 0 clamp(16px, 3vw, 40px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#888", fontSize: "clamp(7px, 0.75vw, 10px)", margin: "0 0 clamp(4px, 0.6vw, 8px)", letterSpacing: "0.05em" }}>
                Description
              </p>
              <p
                style={{
                  color: "#1A1A1A",
                  fontSize: "clamp(10px, 1.15vw, 15px)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {tone.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
