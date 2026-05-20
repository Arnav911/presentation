import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide01";
export const layoutName = "Creative Brief Slide01";
export const layoutDescription = "Creative brief title slide.";

export const Schema = z.object({
  title: z.string().default("Creative Brief").meta({ description: "Main title of the slide" }),
  description: z.string().default("Define and share a solid creative brief for your team and client.").meta({ description: "Brief description or subtitle" })
});

export default function Slide01({ data }: any) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #C17060 0%, #C98060 30%, #D4956A 55%, #C4967A 75%, #B8A090 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          color: "#FFFFFF",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 300,
          letterSpacing: "-0.01em",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {data?.title || "Creative Brief"}
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "clamp(12px, 1.4vw, 18px)",
          fontWeight: 400,
          margin: "clamp(12px, 2vw, 24px) 0 0",
          textAlign: "center",
          maxWidth: "42%",
          lineHeight: 1.6,
          letterSpacing: "0.01em",
        }}
      >
        {data?.description || "Define and share a solid creative brief for your team and client. Outline goals, deliverables, timelines and quotes."}
      </p>
    </div>
  );
}
