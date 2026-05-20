import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-cuj-slide";
export const layoutName = "Cutouts User Journey Slide";
export const layoutDescription =
  "A distinct layout meant to highlight a Critical User Journey, Persona, or Role (e.g. Designers, Writers). Features a large elevated white card in the center with a neon drop shadow.";

const cutoutsCUJSchema = z.object({
  personaName: z.string().max(30).default("Designers").meta({
    description: "The name of the user or persona (displayed in the blue pill badge).",
  }),
  description: z.string().max(200).default("How this persona interacts with the product and what value they derive.").meta({
    description: "A large body of text describing the user journey or persona.",
  }),
  actionLink: z.string().max(40).default("View full journey").meta({
    description: "An underlined text link or call to action at the bottom right of the card.",
  }),
});

export const Schema = cutoutsCUJSchema;
export type CutoutsCUJData = z.infer<typeof cutoutsCUJSchema>;

interface CutoutsCUJProps {
  data: Partial<CutoutsCUJData>;
}

const CutoutsCUJSlide: React.FC<CutoutsCUJProps> = ({ data: slideData }) => {
  const { personaName, description, actionLink } = slideData;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundColor: "#0E1821",
        }}
      >
        {/* Center Card (Figma Left: 308px, Top: 174px, W: 664px, H: 372px) */}
        <div
          className="relative flex flex-col items-center justify-center p-12 w-[664px] min-h-[372px] rounded-[6px]"
          style={{
            backgroundColor: "#FAFAFA",
            boxShadow: "12px 12px 0px #5864FF", // Exactly matching Figma shadow
          }}
        >
          {/* Inner Content Area */}
          <div className="flex flex-col items-center gap-8 text-center max-w-[568px]">
            
            {/* Persona Pill Badge */}
            {personaName && (
              <div
                className="flex items-center px-8 py-3 rounded-full"
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
                  {personaName}
                </span>
              </div>
            )}

            {/* Main Description text */}
            {description && (
              <p
                style={{
                  fontFamily: "'Darker Grotesque', sans-serif",
                  fontWeight: 400,
                  fontSize: "40px",
                  lineHeight: "1.1",
                  color: "#525761", // dark-gray from figma
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Action Link (Bottom Right) */}
          {actionLink && (
            <div className="absolute right-8 bottom-8">
              <span
                style={{
                  fontFamily: "'Darker Grotesque', sans-serif",
                  fontWeight: 600,
                  fontSize: "30px",
                  lineHeight: "1.47",
                  letterSpacing: "-0.06em",
                  textDecoration: "underline",
                  color: "#BAC1CC", // Figma spec color for the link
                }}
              >
                 {actionLink}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CutoutsCUJSlide;
