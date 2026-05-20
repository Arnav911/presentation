import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide08";
export const layoutName = "Creative Brief Slide08";
export const layoutDescription = "Key messages slide with supporting points.";

export const Schema = z.object({
  label: z.string().default("KEY MESSAGES").meta({ description: "Section label" }),
  mainMessageLabel: z.string().default("Main message"),
  mainMessageText: z.string().default("InsightFlow transforms fragmented research...").meta({ description: "Primary message body" }),
  supportingPointsLabel: z.string().default("Supporting points"),
  supportingPoints: z.array(z.string()).default([
    "Organize and summarize complex literature in minutes.",
    "Collaborate with peers securely across institutions.",
    "Turn data into decisions faster through integrated AI insights.",
    "Scale knowledge-sharing with structured research graphs."
  ]).meta({ description: "Array of supporting bullet points" })
});

export default function Slide08({ data }: any) {
  const points = data?.supportingPoints || [
    "Organize and summarize complex literature in minutes.",
    "Collaborate with peers securely across institutions.",
    "Turn data into decisions faster through integrated AI insights.",
    "Scale knowledge-sharing with structured research graphs."
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
          {data?.label || "KEY MESSAGES"}
        </span>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ color: "#888", fontSize: "clamp(8px, 0.85vw, 11px)", margin: "0 0 clamp(10px, 1.5vw, 18px)", letterSpacing: "0.01em" }}>
            {data?.mainMessageLabel || "Main message"}
          </p>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(13px, 2vw, 27px)",
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {data?.mainMessageText || "InsightFlow transforms fragmented research into collective intelligence by connecting people, data, and ideas in one intuitive workspace. Our platform helps researchers uncover insights faster, collaborate seamlessly across teams, and turn complex information into meaningful breakthroughs. It's not just a tool — it's an ecosystem built to accelerate discovery."}
          </p>
        </div>
      </div>

      <div
        style={{
          width: "42%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #D8D0C8 0%, #C8C0B0 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
              <rect x="0" y="0" width="200" height="200" fill="#C8C4B8" />
              <circle cx="70" cy="70" r="22" fill="#A89888" />
              <rect x="48" y="88" width="44" height="55" rx="4" fill="#A09080" />
              <circle cx="130" cy="70" r="22" fill="#B0A090" />
              <rect x="108" y="88" width="44" height="55" rx="4" fill="#A8988A" />
              <rect x="30" y="135" width="140" height="8" rx="2" fill="#888078" opacity="0.5" />
              <rect x="50" y="148" width="100" height="5" rx="2" fill="#888078" opacity="0.35" />
            </svg>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #C84030 0%, #E05040 30%, #D84838 60%, #C04030 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
              {[...Array(12)].map((_, i) => (
                <path
                  key={i}
                  d={`M ${((i * 47) % 200)} 0 Q ${100 + (i % 2 === 0 ? 80 : -80)} ${100 + i * 15} ${((i * 73) % 200)} 200`}
                  stroke="rgba(255,180,160,0.25)"
                  strokeWidth="6"
                  fill="none"
                />
              ))}
            </svg>
          </div>
        </div>

        <div
          style={{
            background: "#B84040",
            padding: "clamp(14px, 2vw, 24px) clamp(16px, 2.5vw, 30px)",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(8px, 0.85vw, 11px)",
              fontWeight: 700,
              margin: "0 0 clamp(8px, 1.2vw, 16px)",
              letterSpacing: "0.05em",
            }}
          >
            {data?.supportingPointsLabel || "Supporting points"}
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(4px, 0.6vw, 8px)",
            }}
          >
            {points.map((point: string, i: number) => (
              <li
                key={i}
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "clamp(9px, 0.9vw, 12px)",
                  lineHeight: 1.5,
                  paddingLeft: "clamp(10px, 1.2vw, 16px)",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "0.4em",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                    display: "inline-block",
                  }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
