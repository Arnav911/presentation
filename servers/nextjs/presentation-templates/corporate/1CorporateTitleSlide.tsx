import React from "react";
import * as z from "zod";

export const layoutId = "corporate-title-slide";
export const layoutName = "Corporate Title Slide";
export const layoutDescription =
  "A minimalistic and professional title slide for corporate presentations. Features a large centered title, a crisp subtitle, and the presenter's name at the bottom.";

// 1. Define the Schema (What the AI needs to generate)
const corporateTitleSchema = z.object({
  title: z.string().min(5).max(60).default("Corporate Strategy 2026").meta({
    description: "The main presentation title",
  }),
  subtitle: z.string().max(100).default("A vision for the future").meta({
    description: "A short, catchy subtitle explaining the deck's purpose",
  }),
  presenter: z.string().default("Jane Doe, CEO").meta({
    description: "The name and title of the person presenting",
  }),
});

export const Schema = corporateTitleSchema;

// 2. Infer types from Schema
export type CorporateTitleData = z.infer<typeof corporateTitleSchema>;

interface CorporateTitleSlideProps {
  data: Partial<CorporateTitleData>;
}

// 3. Create the React Component (How it looks)
const CorporateTitleSlide: React.FC<CorporateTitleSlideProps> = ({
  data: slideData,
}) => {
  const { title, subtitle, presenter } = slideData;

  return (
    <div
      className="w-full max-w-[1280px] bg-slate-50 aspect-video mx-auto relative overflow-hidden flex flex-col justify-center items-center px-20 text-slate-900 border-8 border-slate-900"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Decorative corporate line */}
      <div className="absolute top-0 left-0 w-full h-4 bg-blue-700"></div>

      <div className="text-center max-w-4xl space-y-6">
        <h1 className="text-7xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-3xl text-slate-600 font-medium">{subtitle}</p>
      </div>

      <div className="absolute bottom-12 left-12 flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {presenter ? presenter.charAt(0) : "P"}
        </div>
        <div>
          <p className="text-lg font-bold">{presenter}</p>
        </div>
      </div>
    </div>
  );
};

export default CorporateTitleSlide;
