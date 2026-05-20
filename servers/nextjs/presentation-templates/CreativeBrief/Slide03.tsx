import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide03";
export const layoutName = "Creative Brief Slide03";
export const layoutDescription = "Background information slide with paragraphs and key dates.";

export const Schema = z.object({
  label: z.string().default("BACKGROUND").meta({ description: "Section label" }),
  paragraphs: z.array(z.string()).default([
    "InsightFlow is developing an AI-powered platform that helps research teams organize papers, extract insights, and collaborate in real time.",
    "The campaign aims to reposition the brand from a niche productivity tool into a trusted research infrastructure partner."
  ]).meta({ description: "Array of paragraphs for the body text" }),
  date: z.string().default("July 2025").meta({ description: "Key date" }),
  deliverables: z.array(z.string()).default(["Website", "Brand identity", "Strategy"]).meta({ description: "Array of deliverable items" })
});

export default function Slide03({ data }: any) {
  const paras = data?.paragraphs || [
    "InsightFlow is developing an AI-powered platform that helps research teams organize papers, extract insights, and collaborate in real time.",
    "The campaign aims to reposition the brand from a niche productivity tool into a trusted research infrastructure partner.",
    "By highlighting how InsightFlow accelerates discovery and reduces duplication across institutions, the brand can reach a broader global research audience."
  ];

  const delivs = data?.deliverables || ["Website", "Brand identity", "Strategy"];

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
          width: "38%",
          padding: "5% 4% 5% 5%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
          {data?.label || "BACKGROUND"}
        </span>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "clamp(10px, 1.5vw, 20px)", padding: "8% 0" }}>
          {paras.map((p: string, i: number) => (
            <p
              key={i}
              style={{
                color: "#2C2C2C",
                fontSize: "clamp(10px, 1.2vw, 15px)",
                fontWeight: 400,
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              {p}
            </p>
          ))}
        </div>

        <div style={{ display: "flex", gap: "clamp(16px, 3vw, 40px)" }}>
          <div>
            <div
              style={{
                width: "clamp(24px, 3vw, 40px)",
                height: "1px",
                background: "#999",
                marginBottom: "8px",
              }}
            />
            <p style={{ color: "#888", fontSize: "clamp(7px, 0.7vw, 10px)", margin: "0 0 3px", letterSpacing: "0.05em" }}>Date</p>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: 0 }}>{data?.date || "July 2025"}</p>
          </div>
          <div>
            <div
              style={{
                width: "clamp(24px, 3vw, 40px)",
                height: "1px",
                background: "#999",
                marginBottom: "8px",
              }}
            />
            <p style={{ color: "#888", fontSize: "clamp(7px, 0.7vw, 10px)", margin: "0 0 3px", letterSpacing: "0.05em" }}>Deliverables</p>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: 0, lineHeight: 1.6 }}>
              {delivs.map((d: string, i: number) => (
                <React.Fragment key={i}>
                  {d}<br />
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #C8D8D8 0%, #E8D8CC 30%, #F0C8B8 55%, #E8C4A8 75%, #D8C4B0 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 700 500" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="glow1" cx="60%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFD0B8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="700" height="500" fill="url(#glow1)" />
          {[...Array(8)].map((_, i) => (
            <ellipse
              key={i}
              cx={300 + Math.sin(i * 0.8) * 120}
              cy={200 + Math.cos(i * 0.7) * 80}
              rx={20 + i * 8}
              ry={80 + i * 15}
              fill="none"
              stroke="rgba(255,200,160,0.35)"
              strokeWidth={2}
              transform={`rotate(${i * 22 + 30}, 350, 250)`}
            />
          ))}
        </svg>

        <svg width="100%" height="100%" viewBox="0 0 700 500" style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
          {[...Array(20)].map((_, i) => (
            <rect key={i} x={20 + i * 34} y={0} width={2} height={500} fill="#8A8A8A" />
          ))}
          {[...Array(10)].map((_, i) => (
            <rect key={i} x={0} y={40 + i * 44} width={700} height={1} fill="#8A8A8A" />
          ))}
        </svg>
      </div>
    </div>
  );
}
