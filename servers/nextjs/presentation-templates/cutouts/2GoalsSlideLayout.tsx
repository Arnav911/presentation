import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-goals-slide";
export const layoutName = "Cutouts Goals Slide";
export const layoutDescription =
  "A dark-themed slide designed to list 3 primary goals. Features a white pill badge for the section title, and 3 list items with neon blue rotated square bullet points.";

const cutoutsGoalsSchema = z.object({
  badgeText: z.string().max(20).default("Goals").meta({
    description: "The text in the white pill badge (e.g., 'Goals', 'Objectives')",
  }),
  goal1: z.string().min(10).max(120).default("First primary goal").meta({
    description: "The first goal description",
  }),
  goal2: z.string().min(10).max(120).default("Second primary goal").meta({
    description: "The second goal description",
  }),
  goal3: z.string().min(10).max(120).default("Third primary goal").meta({
    description: "The third goal description",
  }),
  sideBadge: z.string().max(20).default("The 'why'").meta({
    description: "Text for the neon blue side badge",
  }),
  sideDescription: z.string().max(200).default("Explain the overarching reason behind these goals.").meta({
    description: "The descriptive text on the left explaining the 'why'",
  })
});

export const Schema = cutoutsGoalsSchema;
export type CutoutsGoalsData = z.infer<typeof cutoutsGoalsSchema>;

interface CutoutsGoalsProps {
  data: Partial<CutoutsGoalsData>;
}

const CutoutsGoalsSlide: React.FC<CutoutsGoalsProps> = ({ data: slideData }) => {
  const { badgeText, goal1, goal2, goal3, sideBadge, sideDescription } = slideData;

  const goals = [goal1, goal2, goal3].filter(Boolean);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex"
        style={{
          backgroundColor: "#0E1821",
        }}
      >
        {/* LEFT COLUMN: Setting the Context */}
        <div className="flex flex-col items-start gap-8 absolute left-[64px] top-[293px] w-[476px]">
          {/* Neon Blue Badge */}
          {sideBadge && (
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
                {sideBadge}
              </span>
            </div>
          )}

          {/* Subtitle / Description */}
          {sideDescription && (
            <p
              style={{
                fontFamily: "'Darker Grotesque', sans-serif",
                fontWeight: 400,
                fontSize: "40px",
                lineHeight: "1.1",
                color: "#BAC1CC",
              }}
            >
              {sideDescription}
            </p>
          )}
        </div>

        {/* RIGHT COLUMN: The Goals List */}
        <div className="flex flex-col items-start gap-8 absolute left-[672px] top-[293px] w-[504px]">
          {/* White Badge */}
          {badgeText && (
            <div
              className="flex items-center px-10 py-3 rounded-full"
              style={{ backgroundColor: "#FAFAFA" }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  letterSpacing: "-0.06em",
                  color: "#5864FF", // Neon text on white badge
                }}
              >
                {badgeText}
              </span>
            </div>
          )}

          {/* Goals List */}
          <div className="flex flex-col gap-6 w-full mt-2">
            {goals.map((goal, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-row items-center gap-4 w-full">
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
                  {/* Goal Text */}
                  <p
                    style={{
                      fontFamily: "'Darker Grotesque', sans-serif",
                      fontWeight: 600,
                      fontSize: "24px",
                      lineHeight: "1.17",
                      color: "#FAFAFA",
                      maxWidth: "460px",
                    }}
                  >
                    {goal}
                  </p>
                </div>
                {/* Divider Line (not on the last item) */}
                {index < goals.length - 1 && (
                  <div
                    style={{
                      width: "100%",
                      height: "1px",
                      backgroundColor: "#525761",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CutoutsGoalsSlide;
