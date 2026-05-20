import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide11";
export const layoutName = "Creative Brief Slide11";
export const layoutDescription = "Budget and timeline slide with 3 milestone phases.";

export const Schema = z.object({
  label: z.string().default("BUDGET & TIMELINE").meta({ description: "Section label" }),
  description: z.string().default("Write a brief statement describing how the campaign should sound...").meta({ description: "General description" }),
  budgetRange: z.string().default("10K - 25K USD").meta({ description: "Budget range, e.g. 10K - 25K USD" }),
  launchDate: z.string().default("Q4 2025").meta({ description: "Projected launch date" }),
  phases: z.array(z.object({
    phase: z.string(),
    title: z.string(),
    time: z.string(),
    active: z.boolean()
  })).default([
    { phase: "Phase one", title: "Concept", time: "Wk 2 Oct", active: false },
    { phase: "Phase two", title: "Production", time: "Wk 1 November", active: false },
    { phase: "Phase three", title: "Launch", time: "Wk 2 December", active: true }
  ]).meta({ description: "Array of timeline phases" })
});

export default function Slide11({ data }: any) {
  const phases = data?.phases || [
    { phase: "Phase one", title: "Concept", time: "Wk 2 Oct", active: false },
    { phase: "Phase two", title: "Production", time: "Wk 1 November", active: false },
    { phase: "Phase three", title: "Launch", time: "Wk 2 December", active: true },
  ];

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
          flex: 1,
          padding: "5%",
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
          {data?.label || "BUDGET & TIMELINE"}
        </span>

        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8% 0" }}>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(13px, 1.8vw, 24px)",
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {data?.description || "Write a brief statement describing how the campaign should sound and feel. Use adjectives or short phrases that set the emotional tone and guide design and copy decisions."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "clamp(20px, 5vw, 60px)" }}>
          <div>
            <div style={{ width: "clamp(30px, 4vw, 50px)", height: "1px", background: "#999", marginBottom: "8px" }} />
            <p style={{ color: "#888", fontSize: "clamp(7px, 0.7vw, 10px)", margin: "0 0 6px", letterSpacing: "0.05em" }}>Budget range</p>
            <p
              style={{
                color: "#1A1A1A",
                fontSize: "clamp(18px, 3.5vw, 46px)",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
              dangerouslySetInnerHTML={{ __html: data?.budgetRange || "<span style=\"fontWeight: 300\">10K - </span>25K USD" }}
            />
            <div style={{ display: "flex", gap: "clamp(20px, 4vw, 50px)", marginTop: "4px" }}>
              <span style={{ color: "#888", fontSize: "clamp(7px, 0.65vw, 9px)" }}>Minimum</span>
              <span style={{ color: "#888", fontSize: "clamp(7px, 0.65vw, 9px)" }}>Maximum</span>
            </div>
          </div>

          <div>
            <div style={{ width: "clamp(30px, 4vw, 50px)", height: "1px", background: "#999", marginBottom: "8px" }} />
            <p style={{ color: "#888", fontSize: "clamp(7px, 0.7vw, 10px)", margin: "0 0 6px", letterSpacing: "0.05em" }}>Launch date</p>
            <p
              style={{
                color: "#1A1A1A",
                fontSize: "clamp(18px, 3.5vw, 46px)",
                fontWeight: 300,
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {data?.launchDate || "Q4 2025"}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "40%",
          padding: "5% 6% 5% 4%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "calc(4% + clamp(4px, 0.5vw, 7px))",
            top: "12%",
            bottom: "12%",
            width: "1px",
            borderLeft: "1.5px dashed #CCCCCC",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {phases.map((p: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "clamp(12px, 2vw, 24px)",
                flex: 1,
                alignContent: "center",
                paddingTop: i === 0 ? 0 : "clamp(16px, 3vw, 40px)",
              }}
            >
              <div
                style={{
                  width: "clamp(10px, 1.2vw, 15px)",
                  height: "clamp(10px, 1.2vw, 15px)",
                  borderRadius: "50%",
                  background: p.active ? "#C84040" : "#E0E0E0",
                  border: p.active ? "none" : "1.5px solid #CCCCCC",
                  flexShrink: 0,
                  marginTop: "2px",
                  zIndex: 1,
                }}
              />
              <div>
                <p style={{ color: "#888", fontSize: "clamp(7px, 0.75vw, 10px)", margin: "0 0 2px", letterSpacing: "0.05em" }}>
                  {p.phase}
                </p>
                <p
                  style={{
                    color: "#1A1A1A",
                    fontSize: "clamp(12px, 1.6vw, 22px)",
                    fontWeight: p.active ? 400 : 700,
                    margin: "0 0 2px",
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </p>
                <p style={{ color: "#666", fontSize: "clamp(8px, 0.9vw, 12px)", margin: 0 }}>
                  {p.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
