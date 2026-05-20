import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-metrics-slide";
export const layoutName = "Cutouts Metrics Slide";
export const layoutDescription =
  "A structured grid slide displaying up to 6 key performance indicators (KPIs) or metrics, divided by clean lines with neon blue rotated square bullet points.";

const cutoutsMetricsSchema = z.object({
  mainTitle: z.string().max(80).default("How we'll measure success").meta({
    description: "Uppercase title displayed in the white pill badge.",
  }),
  subtitle: z.string().max(120).default("Tracking our growth through these core metrics").meta({
    description: "Subtitle describing the objective of the metrics grid.",
  }),
  metric1: z.string().max(50).default("Monthly recurring revenue (MRR)").meta({
    description: "The name of the first metric.",
  }),
  metric2: z.string().max(50).default("Traffic (paid/organic)").meta({
    description: "The name of the second metric.",
  }),
  metric3: z.string().max(50).default("Customer lifetime value (LTV)").meta({
    description: "The name of the third metric.",
  }),
  metric4: z.string().max(50).default("Bounce rate").meta({
    description: "The name of the fourth metric.",
  }),
  metric5: z.string().max(50).default("Customer acquisition cost (CAC)").meta({
    description: "The name of the fifth metric.",
  }),
  metric6: z.string().max(50).default("Retention rate").meta({
    description: "The name of the sixth metric.",
  }),
});

export const Schema = cutoutsMetricsSchema;
export type CutoutsMetricsData = z.infer<typeof cutoutsMetricsSchema>;

interface CutoutsMetricsProps {
  data: Partial<CutoutsMetricsData>;
}

const CutoutsMetricsSlide: React.FC<CutoutsMetricsProps> = ({ data: slideData }) => {
  const { mainTitle, subtitle, metric1, metric2, metric3, metric4, metric5, metric6 } = slideData;

  const metrics = [
    { text: metric1 },
    { text: metric2 },
    { text: metric3 },
    { text: metric4 },
    { text: metric5 },
    { text: metric6 },
  ].filter((m) => m.text);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col justify-center gap-12"
        style={{
          backgroundColor: "#0E1821",
          paddingLeft: "64px",
          paddingRight: "64px",
        }}
      >
        {/* Header Block */}
        <div className="flex flex-col items-start gap-8">
          {/* Badge */}
          {mainTitle && (
            <div
              className="flex items-center px-10 py-3 rounded-full"
              style={{ backgroundColor: "#5864FF" }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  letterSpacing: "-0.06em",
                  color: "#FFFFFF",
                }}
              >
                {mainTitle}
              </span>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontFamily: "'Darker Grotesque', sans-serif",
                fontWeight: 400,
                fontSize: "40px",
                lineHeight: "1.1",
                color: "#BAC1CC",
                maxWidth: "961px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Metrics Grid (Slide 22 format: Rows divided by lines) */}
        <div className="flex flex-col w-full max-w-[1152px]">
          {/* Top Divider */}
          <div className="w-full h-[1px] bg-[#525761] mb-6" />

          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            {metrics.map((metric, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-row items-center gap-4">
                  {/* Rotated Neon Square Bullet point */}
                  <div
                    style={{
                      width: "21.59px",
                      height: "21.59px",
                      backgroundColor: "#5864FF",
                      transform: "rotate(-45deg)",
                      flexShrink: 0,
                    }}
                  />
                  {/* Metric Name */}
                  <span
                    style={{
                      fontFamily: "'Darker Grotesque', sans-serif",
                      fontWeight: 600,
                      fontSize: "32px",
                      lineHeight: "1.1",
                      color: "#FAFAFA",
                    }}
                  >
                    {metric.text}
                  </span>
                </div>
                {/* Add a divider row after every two items (one full grid row), except the last one if it's the end */}
                {idx % 2 === 1 && idx < metrics.length - 1 && (
                  <div className="col-span-2 w-full h-[1px] bg-[#525761] my-2" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Divider */}
          {metrics.length > 0 && (
            <div className="w-full h-[1px] bg-[#525761] mt-6" />
          )}
        </div>
      </div>
    </>
  );
};

export default CutoutsMetricsSlide;
