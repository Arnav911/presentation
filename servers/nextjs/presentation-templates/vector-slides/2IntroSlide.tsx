import React from "react";
import * as z from "zod";
import SvgSlide from "../../components/SlideSvg";

export const layoutId = "vector-intro";
export const layoutName = "Vector Intro";
export const layoutDescription = "A clean intro slide with vector background elements.";

const schema = z.object({
  title: z.string().default("Project Introduction"),
  description: z.string().default("Breaking down the core concepts and workflows."),
});

export const Schema = schema;
export type VectorIntroData = z.infer<typeof schema>;

interface Props {
  data: Partial<VectorIntroData>;
}

const VectorIntroSlide: React.FC<Props> = ({ data }) => {
  const { title, description } = data;

  return (
    <div className="w-full h-full relative bg-white overflow-hidden flex items-center justify-end">
      <div 
        className="absolute h-full z-0" 
        style={{ 
          width: 'calc(720px * 10560 / 1080)',
          left: 'calc(-720px * 2160 / 1080)'
        }}
      >
        <SvgSlide className="w-full h-full object-cover" />
      </div>

      {/* Eraser for "Agenda" and placeholder bullets */}
      <div 
        className="absolute bg-white/95 z-5 backdrop-blur-sm"
        style={{
          width: '50%',
          height: '100%',
          right: '0',
          top: '0',
          maskImage: 'linear-gradient(to left, white 80%, transparent)'
        }}
      />

      <div className="relative z-10 p-16 flex flex-col items-end text-right gap-6 mr-20 max-w-[75%]">
        <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] drop-shadow-sm">
          {title}
        </h2>
        <p className="text-2xl font-semibold text-slate-700 leading-relaxed drop-shadow-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

export default VectorIntroSlide;
