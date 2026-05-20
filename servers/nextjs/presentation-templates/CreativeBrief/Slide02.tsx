import React from "react";
import * as z from "zod";

export const layoutId = "creative-brief-slide02";
export const layoutName = "Creative Brief Slide02";
export const layoutDescription = "Campaign rethinking or main headline slide.";

export const Schema = z.object({
  labelTop: z.string().default("CREATIVE BRIEF").meta({ description: "Small label at the top" }),
  date: z.string().default("1 JANUARY 2026").meta({ description: "Date displayed on the left" }),
  studio: z.string().default("STUDIO ARCADIA").meta({ description: "Studio or brand name on the right" }),
  headline: z.string().default("Rethink\nResearch\nCampaign").meta({ description: "Main large headline, use \n for line breaks" }),
  labelBottom: z.string().default("FOR INSIGHTFLOW").meta({ description: "Small label at the bottom" })
});

export default function Slide02({ data }: any) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 35%, #FAD5CB 70%, #F5C4BB 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "5.5%",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "clamp(8px, 0.8vw, 11px)",
          letterSpacing: "0.18em",
          color: "#333",
          textTransform: "uppercase",
        }}
      >
        {data?.labelTop || "CREATIVE BRIEF"}
      </span>

      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "clamp(7px, 0.75vw, 10px)",
          letterSpacing: "0.15em",
          color: "#333",
          textTransform: "uppercase",
        }}
      >
        {data?.date || "1 JANUARY 2026"}
      </span>

      <span
        style={{
          position: "absolute",
          right: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "clamp(7px, 0.75vw, 10px)",
          letterSpacing: "0.15em",
          color: "#333",
          textTransform: "uppercase",
        }}
      >
        {data?.studio || "STUDIO ARCADIA"}
      </span>

      <h1
        style={{
          color: "#0D0D0D",
          fontSize: "clamp(36px, 9.5vw, 120px)",
          fontWeight: 300,
          letterSpacing: "-0.02em",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.0,
          whiteSpace: "pre-line"
        }}
      >
        {data?.headline || "Rethink\nResearch\nCampaign"}
      </h1>

      <span
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "clamp(8px, 0.8vw, 11px)",
          letterSpacing: "0.18em",
          color: "#333",
          textTransform: "uppercase",
        }}
      >
        {data?.labelBottom || "FOR INSIGHTFLOW"}
      </span>
    </div>
  );
}
