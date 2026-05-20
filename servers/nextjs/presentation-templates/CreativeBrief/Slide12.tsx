import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide12";
export const layoutName = "Creative Brief Slide12";
export const layoutDescription = "Closing contact slide with call to action.";

export const Schema = z.object({
  headline: z.string().default("Let's get\nstarted").meta({ description: "Big wrap up message. Use \n for breaks" }),
  validityNote: z.string().default("Quotes shown are valid until January 28th 2026").meta({ description: "Disclaimer" }),
  contactLabel: z.string().default("Questions? Contact Sarah").meta({ description: "Contact heading" }),
  contactEmail: z.string().default("sarah@example.com").meta({ description: "Contact email" })
});

export default function Slide12({ data }: any) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #C17060 0%, #C98060 30%, #D4956A 55%, #C4967A 75%, #B8A090 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          padding: "0 6% 5%",
        }}
      >
        <h1
          style={{
            color: "#0D0D0D",
            fontSize: "clamp(40px, 10vw, 130px)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: 0.95,
            whiteSpace: "pre-line"
          }}
        >
          {data?.headline || "Let's get\nstarted"}
        </h1>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.15)",
          padding: "clamp(12px, 1.5vw, 20px) 6%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            color: "rgba(0,0,0,0.5)",
            fontSize: "clamp(7px, 0.8vw, 11px)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          {data?.validityNote || "Quotes shown are valid until January 28th 2026"}
        </p>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              color: "#0D0D0D",
              fontSize: "clamp(9px, 1.1vw, 14px)",
              fontWeight: 700,
              margin: "0 0 2px",
            }}
          >
            {data?.contactLabel || "Questions? Contact Sarah"}
          </p>
          <p
            style={{
              color: "#1A1A1A",
              fontSize: "clamp(9px, 1vw, 13px)",
              fontWeight: 400,
              margin: 0,
            }}
          >
            {data?.contactEmail || "sarah@example.com"}
          </p>
        </div>
      </div>
    </div>
  );
}
