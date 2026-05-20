import React from "react";
import * as z from "zod";

export const layoutId = "cutouts-ui-slide";
export const layoutName = "Cutouts UI Demo Slide";
export const layoutDescription =
  "A slide layout containing a stylized 'browser or app window' mock UI in the center with a descriptive sub-heading at the top. Great for showing platform capabilities or demoing a concept.";

const cutoutsUISchema = z.object({
  subtitle: z.string().max(120).default("Demonstrating the intuitive interface and functionality").meta({
    description: "The centered text description at the top of the slide.",
  }),
  feature1: z.string().max(30).default("Component A").meta({
    description: "Text label for the first UI block.",
  }),
  feature2: z.string().max(30).default("Component B").meta({
    description: "Text label for the second UI block.",
  }),
  feature3: z.string().max(30).default("Component C").meta({
    description: "Text label for the third UI block.",
  }),
});

export const Schema = cutoutsUISchema;
export type CutoutsUIData = z.infer<typeof cutoutsUISchema>;

interface CutoutsUIProps {
  data: Partial<CutoutsUIData>;
}

const CutoutsUISlide: React.FC<CutoutsUIProps> = ({ data: slideData }) => {
  const { subtitle, feature1, feature2, feature3 } = slideData;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col items-center gap-[40px] pt-[104px]"
        style={{
          backgroundColor: "#0E1821",
        }}
      >
        {/* Top Centered Subtitle */}
        {subtitle && (
          <p
            className="text-center"
            style={{
              fontFamily: "'Darker Grotesque', sans-serif",
              fontWeight: 400,
              fontSize: "40px",
              lineHeight: "1.1",
              color: "#FAFAFA", // light color from Figma
              maxWidth: "800px", // Widen slightly from original 449 for better text wrap
              zIndex: 10,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Scaled Abstract UI Component (Figma Slide 19 & 20) */}
        <div
          className="relative mt-8"
          style={{
            width: "660px",
            height: "488px", // The CSS explicitly stated Left 310, Top 256 for a 660x488 box
            border: "2px solid #FAFAFA",
            borderRadius: "6px",
            backgroundColor: "transparent",
            boxSizing: "border-box",
          }}
        >
          {/* Browser Window Dots */}
          <div className="absolute flex flex-row gap-[6px] left-[16px] top-[9px]">
            <div className="w-2 h-2 rounded-full border-2 border-[#FAFAFA]" />
            <div className="w-2 h-2 rounded-full border-2 border-[#FAFAFA]" />
            <div className="w-2 h-2 rounded-full border-2 border-[#FAFAFA]" />
          </div>

          <div
            className="absolute left-0 top-[24px] w-full"
            style={{ borderBottom: "2px solid #FAFAFA" }}
          />

          <div
            className="absolute left-0 top-[56px] w-full"
            style={{ borderBottom: "2px solid #FAFAFA" }}
          />

          {/* Top Navbar Section */}
          <div
            className="absolute left-[32px] top-[96px] w-[596px] h-[158px]"
            style={{
               border: "2px solid #FAFAFA",
               borderRadius: "6px",
            }}
          >
             {/* Small transparent background pill inside the header */}
             <div className="absolute right-[60px] top-[24px] px-6 py-2 border-2 border-[#FAFAFA] rounded-[6px] bg-white bg-opacity-10 text-[#FAFAFA] font-bold text-sm tracking-wide">
                MENU
             </div>
          </div>

          {/* Content Body Grid */}
          <div
            className="absolute left-[32px] top-[288px] w-[596px] h-[186px]"
            style={{
               border: "2px solid #FAFAFA",
               borderRadius: "6px",
            }}
          />

          {/* Three Interior Cards inside Body */}
          <div className="absolute left-[64px] top-[320px] w-[531px] h-[173px] flex flex-row gap-[24px] z-10">
            {/* Card 1 */}
            <div
              className="flex-1 border-2 border-[#FAFAFA] rounded-[6px] flex items-center justify-center p-2 text-center bg-[#0E1821] overflow-hidden"
            >
              <span className="text-[#FAFAFA] font-semibold text-lg leading-tight break-words" style={{ fontFamily: "'Darker Grotesque', sans-serif" }}>{feature1}</span>
            </div>
            
            {/* Card 2 */}
            <div
              className="flex-1 border-2 border-[#FAFAFA] rounded-[6px] flex items-center justify-center p-2 text-center bg-[#0E1821] overflow-hidden"
            >
              <span className="text-[#FAFAFA] font-semibold text-lg leading-tight break-words" style={{ fontFamily: "'Darker Grotesque', sans-serif" }}>{feature2}</span>
            </div>

            {/* Card 3 */}
            <div
              className="flex-1 border-2 border-[#FAFAFA] rounded-[6px] flex items-center justify-center p-2 text-center bg-[#0E1821] overflow-hidden"
            >
              <span className="text-[#FAFAFA] font-semibold text-lg leading-tight break-words" style={{ fontFamily: "'Darker Grotesque', sans-serif" }}>{feature3}</span>
            </div>
          </div>

          {/* Neon Spotlight/Highlight overlay from slide 20 */}
          <div 
             className="absolute"
             style={{
                width: "200px",
                height: "200px",
                right: "-50px",
                bottom: "-50px",
                background: "radial-gradient(50% 50% at 50% 50%, rgba(88, 100, 255, 0.4) 0%, rgba(88, 100, 255, 0) 100%)",
                borderRadius: "50%",
                pointerEvents: "none"
             }}
          />

        </div>
      </div>
    </>
  );
};

export default CutoutsUISlide;
