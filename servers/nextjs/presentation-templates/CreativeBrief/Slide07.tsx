import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide07";
export const layoutName = "Creative Brief Slide07";
export const layoutDescription = "Audience insights slide layout.";

export const Schema = z.object({
  label: z.string().default("AUDIENCE INSIGHT").meta({ description: "Section label" }),
  statement: z.string().default("Write a brief statement capturing a truth...").meta({ description: "Main audience insight statement" }),
  insight1Label: z.string().default("Behavioral insight"),
  insight1Text: z.string().default("Researchers crave efficiency but fear oversimplification..."),
  insight2Label: z.string().default("Emotional insight"),
  insight2Text: z.string().default("They are motivated by curiosity, validation..."),
  insight3Label: z.string().default("Cultural insight"),
  insight3Text: z.string().default("In a field built on precision...")
});

export default function Slide07({ data }: any) {
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
          width: "45%",
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
          {data?.label || "AUDIENCE INSIGHT"}
        </span>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(14px, 2.2vw, 30px)",
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{ __html: data?.statement || "Write a brief statement capturing a truth about your audience — something emotional, behavioral, or cultural that can drive creative inspiration. <strong style=\"fontWeight: 700\">Keep it real and human.</strong>" }}
          />
        </div>

        <div
          style={{
            height: "clamp(80px, 14vw, 180px)",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #D4E0D0 0%, #C8D4C0 30%, #E0D8B0 60%, #D4CC90 100%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 300 180">
            <circle cx="80" cy="100" r="55" fill="none" stroke="rgba(180,170,140,0.5)" strokeWidth="20" />
            <circle cx="180" cy="90" r="45" fill="none" stroke="rgba(160,150,110,0.4)" strokeWidth="15" />
            <ellipse cx="220" cy="130" rx="35" ry="20" fill="rgba(140,160,100,0.4)" />
            <path d="M 160 160 Q 155 120 140 80 Q 135 60 130 40" stroke="rgba(100,130,80,0.5)" strokeWidth="3" fill="none" />
            <ellipse cx="135" cy="50" rx="20" ry="12" fill="rgba(120,160,80,0.4)" transform="rotate(-20, 135, 50)" />
          </svg>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "5% 5% 4% 5%",
            borderBottom: "1px solid #E8E8E8",
          }}
        >
          <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(10px, 1.5vw, 18px)", letterSpacing: "0.01em" }}>
            {data?.insight1Label || "Behavioral insight"}
          </p>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(13px, 1.9vw, 26px)",
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {data?.insight1Text || "Researchers crave efficiency but fear oversimplification. They want tools that understand their process — not ones that replace it."}
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div
            style={{
              padding: "4% 4% 4% 5%",
              borderRight: "1px solid #E8E8E8",
            }}
          >
            <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(8px, 1vw, 14px)", letterSpacing: "0.01em" }}>
              {data?.insight2Label || "Emotional insight"}
            </p>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }}>
              {data?.insight2Text || "They are motivated by curiosity, validation, and peer recognition."}
            </p>
          </div>

          <div
            style={{
              padding: "4% 5% 4% 4%",
            }}
          >
            <p style={{ color: "#888", fontSize: "clamp(8px, 0.8vw, 11px)", margin: "0 0 clamp(8px, 1vw, 14px)", letterSpacing: "0.01em" }}>
              {data?.insight3Label || "Cultural insight"}
            </p>
            <p style={{ color: "#1A1A1A", fontSize: "clamp(10px, 1.15vw, 15px)", lineHeight: 1.65, margin: 0 }}>
              {data?.insight3Text || "In a field built on precision, trust is earned through transparency and depth of understanding."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
