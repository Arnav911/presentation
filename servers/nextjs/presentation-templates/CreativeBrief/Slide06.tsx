import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide06";
export const layoutName = "Creative Brief Slide06";
export const layoutDescription = "Target audience slide with 3 questions/attributes.";

export const Schema = z.object({
  label: z.string().default("TARGET AUDIENCE").meta({ description: "Section label" }),
  statement: z.string().default("Write a brief statement describing your ideal audience...").meta({ description: "Highlighted target audience statement" }),
  q1: z.string().default("Who are we talking to?").meta({ description: "First attribute question" }),
  a1: z.string().default("Our target audience includes research scientists...").meta({ description: "First attribute answer" }),
  q2: z.string().default("What do they care about?").meta({ description: "Second attribute question" }),
  a2: z.string().default("They are analytical yet time-poor...").meta({ description: "Second attribute answer" }),
  q3: z.string().default("What motivates or frustrates them?").meta({ description: "Third attribute question" }),
  a3: z.string().default("They connect emotionally to products that make collaboration effortless...").meta({ description: "Third attribute answer" })
});

export default function Slide06({ data }: any) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "row",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "28%",
          display: "flex",
          flexDirection: "column",
          padding: "5%",
          gap: "clamp(12px, 1.5vw, 20px)",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "clamp(7px, 0.7vw, 10px)",
            letterSpacing: "0.18em",
            color: "#555",
            textTransform: "uppercase",
          }}
        >
          {data?.label || "TARGET AUDIENCE"}
        </span>

        <div
          style={{
            background: "linear-gradient(135deg, #F5C4AC 0%, #F0A888 50%, #E8906C 100%)",
            borderRadius: "12px",
            padding: "clamp(14px, 2vw, 24px)",
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(11px, 1.4vw, 18px)",
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {data?.statement || "Write a brief statement describing your ideal audience. Highlight their motivations, habits, and what makes them emotionally connect to the brand or message."}
          </p>
        </div>

        <div
          style={{
            height: "clamp(60px, 10vw, 130px)",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #C8B890 0%, #D4C490 40%, #B8A870 100%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 130">
            <circle cx="60" cy="65" r="30" fill="rgba(180,160,100,0.5)" />
            <circle cx="140" cy="65" r="25" fill="rgba(160,140,80,0.4)" />
            <ellipse cx="100" cy="110" rx="60" ry="20" fill="rgba(100,80,40,0.2)" />
          </svg>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: "linear-gradient(160deg, #C8B8A0 0%, #B8A888 30%, #A89880 60%, #988870 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 500" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="face1" cx="50%" cy="35%" r="45%">
              <stop offset="0%" stopColor="#D4A880" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#A08060" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <rect width="400" height="500" fill="url(#face1)" />
          <ellipse cx="200" cy="180" rx="70" ry="85" fill="rgba(200,160,110,0.5)" />
          <circle cx="200" cy="360" r="120" fill="rgba(140,100,70,0.3)" />
          <rect x="0" y="0" width="400" height="500" fill="rgba(180,140,100,0.08)" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: "linear-gradient(to bottom, rgba(180,150,170,0.7) 0%, rgba(160,130,150,0.3) 100%)",
          }}
        />
      </div>

      <div
        style={{
          width: "32%",
          padding: "5% 5% 5% 4%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          borderLeft: "1px solid #E8E8E8",
        }}
      >
        <div>
          <p style={{ color: "#B84040", fontSize: "clamp(8px, 0.85vw, 11px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "0.01em" }}>
            {data?.q1 || "Who are we talking to?"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }}>
            {data?.a1 || "Our target audience includes research scientists, graduate students, and R&D managers in both academia and industry."}
          </p>
        </div>

        <div>
          <p style={{ color: "#B84040", fontSize: "clamp(8px, 0.85vw, 11px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "0.01em" }}>
            {data?.q2 || "What do they care about?"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }}>
            {data?.a2 || "They are analytical yet time-poor, seeking tools that simplify complex information without sacrificing rigor."}
          </p>
        </div>

        <div>
          <p style={{ color: "#B84040", fontSize: "clamp(8px, 0.85vw, 11px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "0.01em" }}>
            {data?.q3 || "What motivates or frustrates them?"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }}>
            {data?.a3 || "They connect emotionally to products that make collaboration effortless and empower them to focus on discovery, not documentation."}
          </p>
        </div>
      </div>
    </div>
  );
}
