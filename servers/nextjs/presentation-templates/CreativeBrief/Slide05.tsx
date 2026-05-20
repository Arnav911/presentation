import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide05";
export const layoutName = "Creative Brief Slide05";
export const layoutDescription = "Objectives slide with 3 columns.";

export const Schema = z.object({
  label: z.string().default("OBJECTIVES").meta({ description: "Section label" }),
  statement: z.string().default("Write a brief statement outlining what success looks like...").meta({ description: "Main statement or description" }),
  tip: z.string().default("Keep goals specific and measurable.").meta({ description: "Tip text in the box" }),
  goal1Label: z.string().default("Primary business goal"),
  goal1Text: z.string().default("Increase enterprise and university adoption..."),
  goal2Label: z.string().default("Communication or brand goal"),
  goal2Text: z.string().default("Achieve a 20% rise in share of voice..."),
  goal3Label: z.string().default("Engagement / conversion goal"),
  goal3Text: z.string().default("Secure three new strategic partnerships...")
});

export default function Slide05({ data }: any) {
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
          background: "linear-gradient(135deg, #F5C4B0 0%, #ECA88C 30%, #D8906C 60%, #CC8060 80%, #C07060 100%)",
          padding: "clamp(16px, 2.5vw, 32px) clamp(24px, 5%, 64px)",
          display: "flex",
          alignItems: "flex-start",
          gap: "clamp(16px, 4vw, 56px)",
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "clamp(7px, 0.7vw, 10px)",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.9)",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            paddingTop: "4px",
          }}
        >
          {data?.label || "OBJECTIVES"}
        </span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(13px, 2vw, 26px)",
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{ __html: data?.statement || "Write a brief statement outlining what success looks like for this campaign. Focus on 2–3 key goals that connect directly to business or communication outcomes." }}
          />
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "8px",
            padding: "clamp(8px, 1vw, 14px) clamp(10px, 1.5vw, 18px)",
            minWidth: "clamp(90px, 12vw, 160px)",
            flexShrink: 0,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(7px, 0.7vw, 10px)", margin: "0 0 4px", fontWeight: 600 }}>Tip:</p>
          <p style={{ color: "#FFFFFF", fontSize: "clamp(8px, 0.8vw, 11px)", fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
            {data?.tip || "Keep goals specific and measurable."}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "clamp(20px, 3vw, 40px) clamp(24px, 5%, 64px)",
          gap: "clamp(16px, 3vw, 40px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(10px, 1.5vw, 18px)", letterSpacing: "0.01em" }}>
            {data?.goal1Label || "Primary business goal"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }} dangerouslySetInnerHTML={{ __html: data?.goal1Text || "Increase enterprise and university research team adoption by <strong>30% within six months</strong>, with at least 15 new institutional accounts onboarded and active collaborative projects launched by Q3 2026." }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(10px, 1.5vw, 18px)", letterSpacing: "0.01em" }}>
            {data?.goal2Label || "Communication or brand goal"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }} dangerouslySetInnerHTML={{ __html: data?.goal2Text || "Achieve a <strong>20% rise in share of voice</strong> across key academic and R&D media outlets, measured through mentions, guest features, and citations, while growing <strong>brand recall to &gt;60%</strong> in post-campaign awareness surveys." }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(10px, 1.5vw, 18px)", letterSpacing: "0.01em" }}>
            {data?.goal3Label || "Engagement / conversion goal"}
          </p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }} dangerouslySetInnerHTML={{ __html: data?.goal3Text || "Secure three new strategic partnerships and <strong>convert 10% of trial users to paid</strong> institutional plans by end of Q4 2025, supported by improved brand trust scores and successful investor communications." }} />
        </div>
      </div>
    </div>
  );
}
