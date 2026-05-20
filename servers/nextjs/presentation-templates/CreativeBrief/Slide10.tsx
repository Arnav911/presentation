import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide10";
export const layoutName = "Creative Brief Slide10";
export const layoutDescription = "Deliverables layout with 3 visual columns.";

export const Schema = z.object({
  label: z.string().default("DELIVERABLES").meta({ description: "Section label" }),
  description: z.string().default("Write a brief statement listing what will be created...").meta({ description: "Heading description" }),
  assetHeading: z.string().default("Assets"),
  assetDescription: z.string().default("Mobile and web mockups, hero animations..."),
  identityHeading: z.string().default("Brand identity"),
  identityDescription: z.string().default("Refreshed logo system..."),
  strategyHeading: z.string().default("Strategy deck"),
  strategyDescription: z.string().default("Storytelling framework..."),
  marketingHeading: z.string().default("Marketing campaign"),
  marketingDescription: z.string().default("Awareness launch across web...")
});

export default function Slide10({ data }: any) {
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
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "clamp(7px, 0.7vw, 10px)",
            letterSpacing: "0.18em",
            color: "#555",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {data?.label || "DELIVERABLES"}
        </span>
        <p
          style={{
            color: "#999",
            fontSize: "clamp(9px, 1.1vw, 14px)",
            margin: 0,
            lineHeight: 1.6,
            flex: 1,
          }}
        >
          {data?.description || "Write a brief statement listing what will be created and why each deliverable matters. Keep it high-level but clear enough for creative and production teams to align."}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
        }}
      >
        <div
          style={{
            borderRight: "1px solid #E8E8E8",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "linear-gradient(160deg, #E8E4F0 0%, #C4C0E0 30%, #A0A8D0 60%, #8090C0 80%, #6070B0 100%)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 300 340" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <radialGradient id="phoneBg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#B0B8E8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#5060A0" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <rect width="300" height="340" fill="url(#phoneBg)" />
              <rect x="95" y="30" width="110" height="200" rx="14" fill="rgba(20,20,40,0.7)" />
              <rect x="100" y="35" width="100" height="190" rx="11" fill="rgba(40,50,80,0.8)" />
              <rect x="105" y="50" width="90" height="155" rx="4" fill="rgba(70,90,140,0.6)" />
            </svg>
          </div>

          <div style={{ padding: "clamp(12px, 1.8vw, 22px) clamp(14px, 2.5%, 28px)" }}>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: "0 0 4px" }}>{data?.assetHeading || "Assets"}</p>
            <p style={{ color: "#666", fontSize: "clamp(8px, 0.85vw, 11px)", margin: 0, lineHeight: 1.5 }}>
              {data?.assetDescription || "Mobile and web mockups, hero animations, product explainers"}
            </p>
          </div>
        </div>

        <div
          style={{
            borderRight: "1px solid #E8E8E8",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #F8D0A0 0%, #F0B870 30%, #E8A050 60%, #E09040 100%)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 300 340" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <radialGradient id="tabletBg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFCC80" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#D07020" stopOpacity="0.8" />
                </radialGradient>
              </defs>
              <rect width="300" height="340" fill="url(#tabletBg)" />
              <rect x="50" y="40" width="200" height="240" rx="16" fill="rgba(30,20,10,0.4)" />
              <rect x="55" y="45" width="190" height="230" rx="13" fill="rgba(50,30,10,0.3)" />
              <rect x="60" y="55" width="180" height="210" rx="6" fill="rgba(255,180,80,0.3)" />
            </svg>
          </div>

          <div style={{ padding: "clamp(12px, 1.8vw, 22px) clamp(14px, 2.5%, 28px)" }}>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: "0 0 4px" }}>{data?.identityHeading || "Brand identity"}</p>
            <p style={{ color: "#666", fontSize: "clamp(8px, 0.85vw, 11px)", margin: "0 0 clamp(10px, 1.2vw, 16px)", lineHeight: 1.5 }}>
              {data?.identityDescription || "Refreshed logo system, motion language, and product visuals"}
            </p>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: "0 0 4px" }}>{data?.strategyHeading || "Strategy deck"}</p>
            <p style={{ color: "#666", fontSize: "clamp(8px, 0.85vw, 11px)", margin: 0, lineHeight: 1.5 }}>
              {data?.strategyDescription || "Storytelling framework for enterprise outreach"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #C8D8D8 0%, #E0CCBC 40%, #ECC8B0 70%, #D8C4B0 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 300 340" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <radialGradient id="techBg" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FFD0B4" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="300" height="340" fill="#C8D0D0" />
              <rect width="300" height="340" fill="url(#techBg)" />
              {[...Array(12)].map((_, i) => (
                <rect key={i} x={i * 24} y={0} width={1.5} height={340} fill="rgba(100,100,100,0.12)" />
              ))}
              {[...Array(5)].map((_, i) => (
                <ellipse
                  key={i}
                  cx={150}
                  cy={160}
                  rx={25 + i * 20}
                  ry={90 + i * 18}
                  fill="none"
                  stroke="rgba(255,180,130,0.25)"
                  strokeWidth={2}
                  transform={`rotate(${i * 36 + 10}, 150, 160)`}
                />
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                bottom: "12%",
                left: "5%",
                display: "flex",
                gap: "clamp(6px, 1vw, 12px)",
              }}
            >
              {["♡", "○", "↗"].map((icon, i) => (
                <span key={i} style={{ color: "#555", fontSize: "clamp(10px, 1.2vw, 14px)" }}>{icon}</span>
              ))}
              <span style={{ color: "#555", fontSize: "clamp(10px, 1.2vw, 14px)", marginLeft: "auto" }}>□</span>
            </div>
          </div>

          <div style={{ padding: "clamp(12px, 1.8vw, 22px) clamp(14px, 2.5%, 28px)" }}>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(9px, 1vw, 13px)", fontWeight: 700, margin: "0 0 4px" }}>{data?.marketingHeading || "Marketing campaign"}</p>
            <p style={{ color: "#666", fontSize: "clamp(8px, 0.85vw, 11px)", margin: 0, lineHeight: 1.5 }}>
              {data?.marketingDescription || "Awareness launch across web, social, and industry media"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
