import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-principles-slide";
export const layoutName = "Cutouts Principles Slide";
export const layoutDescription =
  "A dual-column slide listing 3 design principles or key points on the right, and a matching descriptive paragraph on the left.";

const cutoutsPrinciplesSchema = z.object({
  mainTitle: z.string().max(80).default("Understanding how we make users' lives easier...").meta({
    description: "The large explanatory text displayed on the left half of the slide.",
  }),
  badgeText: z.string().max(30).default("Key design principles").meta({
    description: "The text inside the white pill badge above the list.",
  }),
  principle1Title: z.string().max(40).default("MEET NEW USERS").meta({
    description: "Uppercase mini-title for the first principle",
  }),
  principle1Text: z.string().max(60).default("Meet new users where they are").meta({
    description: "Main text for the first principle",
  }),
  principle2Title: z.string().max(40).default("TEACH THROUGH ACTION").meta({
    description: "Uppercase mini-title for the second principle",
  }),
  principle2Text: z.string().max(60).default("Teach through action, not exposition").meta({
    description: "Main text for the second principle",
  }),
  principle3Title: z.string().max(40).default("ELEVATE USERS").meta({
    description: "Uppercase mini-title for the third principle",
  }),
  principle3Text: z.string().max(60).default("Elevate users from beginner to adept").meta({
    description: "Main text for the third principle",
  }),
});

export const Schema = cutoutsPrinciplesSchema;
export type CutoutsPrinciplesData = z.infer<typeof cutoutsPrinciplesSchema>;

interface CutoutsPrinciplesProps {
  data: Partial<CutoutsPrinciplesData>;
}

const CutoutsPrinciplesSlide: React.FC<CutoutsPrinciplesProps> = ({ data: slideData }) => {
  const {
    mainTitle,
    badgeText,
    principle1Title,
    principle1Text,
    principle2Title,
    principle2Text,
    principle3Title,
    principle3Text,
  } = slideData;

  const principles = [
    { title: principle1Title, text: principle1Text },
    { title: principle2Title, text: principle2Text },
    { title: principle3Title, text: principle3Text },
  ].filter((p) => p.text);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&family=Basis+Grotesque+Pro&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden"
        style={{ backgroundColor: "#0E1821" }}
      >
        {/* LEFT COLUMN */}
        <div className="absolute left-[64px] top-[288px] flex flex-row gap-6 w-[400px]">
          {/* Vertical neon bar | */}
          <div
            style={{
              fontFamily: "'Darker Grotesque', sans-serif",
              fontSize: "46px",
              color: "#5864FF",
              lineHeight: "1.17",
            }}
          >
            |
          </div>
          {/* Main Title Paragraph */}
          {mainTitle && (
            <p
              style={{
                fontFamily: "'Darker Grotesque', sans-serif",
                fontWeight: 400,
                fontSize: "40px",
                lineHeight: "1.1",
                color: "#BAC1CC",
                maxWidth: "446px",
              }}
            >
              {mainTitle}
            </p>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="absolute left-[540px] top-[204px] flex flex-col gap-8 w-[650px]">
          {/* White Pill Badge */}
          {badgeText && (
            <div
              className="inline-flex items-center px-10 py-3 rounded-full self-start"
              style={{ backgroundColor: "#FAFAFA" }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  letterSpacing: "-0.06em",
                  color: "#5864FF",
                }}
              >
                {badgeText}
              </span>
            </div>
          )}

          {/* List Items */}
          <div className="flex flex-col gap-6 w-full">
            {principles.map((principle, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-row items-center gap-4 w-full">
                  {/* Rotated Neon Square Bullet point */}
                  <div
                    style={{
                      width: "21.59px",
                      height: "21.59px",
                      backgroundColor: "#5864FF", // For active, #525761 for inactive in figma, defaulting to active
                      transform: "rotate(-45deg)",
                      flexShrink: 0,
                    }}
                  />
                  {/* Principle Info */}
                  <div className="flex flex-col flex-1">
                    {principle.title && (
                      <span
                        style={{
                          fontFamily: "'Darker Grotesque', sans-serif",
                          fontWeight: 700,
                          fontSize: "12px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#5864FF",
                        }}
                      >
                        {principle.title}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "'Darker Grotesque', sans-serif",
                        fontWeight: 600,
                        fontSize: "28px",
                        lineHeight: "1.2",
                        color: "#FAFAFA",
                        wordWrap: "break-word",
                      }}
                    >
                      {principle.text}
                    </span>
                  </div>
                </div>
                {/* Divider Line (not on the last item) */}
                {index < principles.length - 1 && (
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

export default CutoutsPrinciplesSlide;
