import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide04";
export const layoutName = "Creative Brief Slide04";
export const layoutDescription = "Two-column text layout for campaign details and challenges.";

export const Schema = z.object({
  label: z.string().default("BACKGROUND").meta({ description: "Section label" }),
  date: z.string().default("July 2025").meta({ description: "Key date" }),
  deliverables: z.array(z.string()).default(["Website", "Brand identity", "Strategy"]).meta({ description: "Array of deliverable items" }),
  question1: z.string().default("What is the campaign or project about?").meta({ description: "First heading or question" }),
  answer1: z.string().default("Our goal is to convey InsightFlow as the go-to AI research workspace...").meta({ description: "First answer or paragraph" }),
  question2: z.string().default("What business or cultural challenge are we addressing?").meta({ description: "Second heading or question" }),
  answer2: z.string().default("Researchers are overwhelmed by fragmented tools...").meta({ description: "Second answer or paragraph" })
});

export default function Slide04({ data }: any) {
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
          width: "18%",
          padding: "5% 0 5% 5%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #E8E8E8",
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

        <div>
          <div style={{ width: "clamp(24px, 3vw, 40px)", height: "1px", background: "#999", marginBottom: "8px" }} />
          <p style={{ color: "#888", fontSize: "clamp(7px, 0.65vw, 9px)", margin: "0 0 3px", letterSpacing: "0.05em" }}>Date</p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 0.95vw, 13px)", fontWeight: 700, margin: "0 0 20px" }}>{data?.date || "July 2025"}</p>

          <div style={{ width: "clamp(24px, 3vw, 40px)", height: "1px", background: "#999", marginBottom: "8px" }} />
          <p style={{ color: "#888", fontSize: "clamp(7px, 0.65vw, 9px)", margin: "0 0 3px", letterSpacing: "0.05em" }}>Deliverables</p>
          <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 0.95vw, 13px)", fontWeight: 700, margin: 0, lineHeight: 1.7 }}>
            {delivs.map((d: string, i: number) => (
              <React.Fragment key={i}>
                {d}<br />
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "5% 4%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #E8E8E8",
        }}
      >
        <div>
          <p
            style={{
              color: "#B84040",
              fontSize: "clamp(9px, 0.9vw, 12px)",
              fontWeight: 600,
              margin: "0 0 clamp(8px, 1vw, 14px)",
              letterSpacing: "0.01em",
            }}
          >
            {data?.question1 || "What is the campaign or project about? Why are we doing this now?"}
          </p>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(10px, 1.2vw, 16px)",
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {data?.answer1 || "Our goal is to convey InsightFlow as the go-to AI research workspace, a place where teams can turn scattered studies and data into actionable insights."}
          </p>
        </div>

        <div>
           <p
            style={{
              color: "#B84040",
              fontSize: "clamp(9px, 0.9vw, 12px)",
              fontWeight: 600,
              margin: "0 0 clamp(8px, 1vw, 14px)",
              letterSpacing: "0.01em",
            }}
          >
            {data?.question2 || "What business or cultural challenge are we addressing?"}
          </p>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(10px, 1.2vw, 16px)",
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {data?.answer2 || "Researchers are overwhelmed by fragmented tools, isolated data, and time-consuming information retrieval. InsightFlow offers a unified, intelligent platform."}
          </p>
        </div>
      </div>

      <div
        style={{
          width: "35%",
          background: "linear-gradient(135deg, #C8D8D8 0%, #E0CCBC 40%, #ECC8B0 70%, #D8C4B0 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 500" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="glow2" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FFD0B4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="500" fill="url(#glow2)" />
          {[...Array(6)].map((_, i) => (
            <ellipse
              key={i}
              cx={200}
              cy={220}
              rx={30 + i * 18}
              ry={100 + i * 20}
              fill="none"
              stroke="rgba(255,190,140,0.3)"
              strokeWidth={2.5}
              transform={`rotate(${i * 30 + 15}, 200, 220)`}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <rect key={i} x={i * 26} y={0} width={1.5} height={500} fill="rgba(120,120,120,0.12)" />
          ))}
        </svg>
      </div>
    </div>
  );
}
