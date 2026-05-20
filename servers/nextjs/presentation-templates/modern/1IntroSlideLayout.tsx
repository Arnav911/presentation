import React from "react";
import * as z from "zod";

export const layoutId = "intro-pitchdeck-slide";
export const layoutName = "Intro Pitch Deck Slide";
export const layoutDescription =
  "A visually appealing introduction slide for a pitch deck, featuring a large title, company name, date, and contact information with a modern design. This Slide is always the first slide in a pitch deck, setting the tone for the presentation with a clean and professional look.";
const introPitchDeckSchema = z.object({
  title: z.string().min(2).max(15).default("Pitch Deck").meta({
    description: "Main title of the slide",
  }),
  description: z.string().default("").meta({
    description: "Description as per the design",
  }),
  contactNumber: z.string().default("+123-456-7890").meta({
    description: "Contact phone number displayed in footer",
  }),
  contactAddress: z
    .string()
    .default("123 Anywhere St., Any City, ST 123")
    .meta({
      description: "Contact address displayed in footer",
    }),
  contactWebsite: z.string().default("www.reallygreatsite.com").meta({
    description: "Contact website URL displayed in footer",
  }),
  companyName: z.string().default("Presentation AI").meta({
    description: "Company name displayed in header",
  }),
  date: z.string().default("June 13, 2038").meta({
    description: "Date of the presentation",
  }),
});

export const Schema = introPitchDeckSchema;
export type IntroPitchDeckData = z.infer<typeof introPitchDeckSchema>;

interface IntroSlideLayoutProps {
  data: Partial<IntroPitchDeckData>;
}

const IntroPitchDeckSlide: React.FC<IntroSlideLayoutProps> = ({
  data: slideData,
}) => {
  const {
    title,
    description,
    contactNumber,
    contactAddress,
    contactWebsite,
    companyName,
    date,
  } = slideData;
  return (
    <>
      {/* Montserrat Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video mx-auto relative overflow-hidden rounded-md"
        style={{
          fontFamily: "Montserrat, sans-serif",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: 'var(--theme-bg, #ffffff)',
          color: 'var(--theme-text, #000000)'
        }}
      >
        {/* Top Header */}
        <div className="absolute top-8 left-10 right-10 flex justify-between items-center text-[var(--theme-accent)] text-sm font-semibold" style={{ color: 'var(--theme-accent)' }}>
          <p>{slideData?.companyName}</p>
          <p>{slideData?.date}</p>
        </div>

        {/* Main Title */}
        <div
          className="absolute left-10"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {title && (
            <div className="relative inline-block">
              <h1
                className="text-7xl font-bold leading-none"
                style={{ color: 'var(--theme-accent)' }}
                id="pitchdeck-title"
              >
                {title}
              </h1>
              {/* Theme underline */}
              <span
                className="block h-[4px] absolute left-0"
                style={{
                  width: "50%",
                  bottom: "-0.5em",
                  transition: "width 0.3s",
                  backgroundColor: 'var(--theme-accent)'
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Contact Row */}
        <div className="absolute bottom-8 left-10 right-10 flex flex-wrap items-center gap-10 text-sm font-medium" style={{ color: 'var(--theme-accent)' }}>
          {contactNumber && (
            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <span>{contactNumber}</span>
            </div>
          )}
          {contactAddress && (
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>{contactAddress}</span>
            </div>
          )}
          {contactWebsite && (
            <div className="flex items-center gap-2">
              <span className="text-lg">🌐</span>
              <span>{contactWebsite}</span>
            </div>
          )}
          {description && (
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span>{description}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IntroPitchDeckSlide;
