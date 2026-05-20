import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-timeline-slide";
export const layoutName = "Cutouts Timeline Slide";
export const layoutDescription =
  "A timeline or roadmap slide showing sequential steps with connected 'pill' badges. Good for project schedules, delivery plans, or step-by-step processes.";

const cutoutsTimelineSchema = z.object({
  subtitle: z.string().max(120).default("The overarching narrative of how we'll get there.").meta({
    description: "The large descriptive text at the top of the slide.",
  }),
  stage1Badge: z.string().max(20).default("Build it").meta({
    description: "The main text inside the first pill badge on the timeline.",
  }),
  stage1Caption: z.string().max(20).default("Kick off").meta({
    description: "The caption text hanging below the first badge.",
  }),
  stage2Badge: z.string().max(20).default("Do it").meta({
    description: "The main text inside the second pill badge on the timeline.",
  }),
  stage2Caption: z.string().max(20).default("Demo day").meta({
    description: "The caption text hanging below the second badge.",
  }),
  stage3Badge: z.string().max(20).default("Test it").meta({
    description: "The main text inside the third pill badge on the timeline.",
  }),
  stage3Caption: z.string().max(20).default("Go / No go").meta({
    description: "The caption text hanging below the third badge.",
  }),
  stage4Badge: z.string().max(20).default("Deliver it").meta({
    description: "The main text inside the fourth pill badge on the timeline.",
  }),
  stage4Caption: z.string().max(20).default("Launch").meta({
    description: "The caption text hanging below the fourth badge.",
  }),
  stage5Badge: z.string().max(20).default("Use it").meta({
    description: "The main text inside the fifth pill badge on the timeline.",
  }),
  stage5Caption: z.string().max(20).default("Party!").meta({
    description: "The caption text hanging below the fifth badge.",
  }),
});

export const Schema = cutoutsTimelineSchema;
export type CutoutsTimelineData = z.infer<typeof cutoutsTimelineSchema>;

interface CutoutsTimelineProps {
  data: Partial<CutoutsTimelineData>;
}

const CutoutsTimelineSlide: React.FC<CutoutsTimelineProps> = ({ data: slideData }) => {
  const {
    subtitle,
    stage1Badge,
    stage1Caption,
    stage2Badge,
    stage2Caption,
    stage3Badge,
    stage3Caption,
    stage4Badge,
    stage4Caption,
    stage5Badge,
    stage5Caption,
  } = slideData;

  const stages = [
    { badge: stage1Badge, caption: stage1Caption },
    { badge: stage2Badge, caption: stage2Caption },
    { badge: stage3Badge, caption: stage3Caption },
    { badge: stage4Badge, caption: stage4Caption },
    { badge: stage5Badge, caption: stage5Caption },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col items-center justify-center gap-[100px]"
        style={{ backgroundColor: "#0E1821" }}
      >
        {/* Top Description */}
        {subtitle && (
          <p
            className="text-center mx-auto"
            style={{
              fontFamily: "'Darker Grotesque', sans-serif",
              fontWeight: 400,
              fontSize: "40px",
              lineHeight: "1.1",
              color: "#BAC1CC",
              maxWidth: "1152px",
              paddingLeft: "64px",
              paddingRight: "64px",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Timeline Component */}
        <div className="relative w-full max-w-[1000px] h-[188px] flex items-center mt-8">
          {/* Background Connecting Line */}
          <div
            className="absolute z-0 h-[2px] w-full bg-[#5864FF]"
            style={{ top: "37px" }} // Centered to the pills
          />

          {/* Timeline Stages container */}
          <div className="relative z-10 flex flex-row items-start justify-between w-full mx-auto px-4">
            {stages.map((stage, index) => (
              <div key={index} className="flex flex-col items-center gap-6 relative">
                {/* Visual Connector Dot/Pill */}
                <div
                  className="flex items-center px-[32px] py-4 rounded-full z-10"
                  style={{ backgroundColor: "#5864FF" }}
                >
                  <span
                    className="whitespace-nowrap"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      letterSpacing: "-0.06em",
                      color: "#FFFFFF",
                    }}
                  >
                    {stage.badge}
                  </span>
                </div>

                {/* Dropdown line to caption */}
                {stage.caption && (
                  <div className="flex flex-col items-center gap-[8px] absolute top-[52px] w-[180px]">
                    <div
                      style={{
                        width: "1px",
                        height: "24px",
                        backgroundColor: "#FAFAFA",
                      }}
                    />
                    <span
                      className="text-center w-full"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "1.2",
                        letterSpacing: "-0.06em",
                        color: "#FFFFFF",
                      }}
                    >
                      {stage.caption}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CutoutsTimelineSlide;
