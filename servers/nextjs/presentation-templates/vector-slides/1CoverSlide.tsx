import React from "react";
import * as z from "zod";
import SvgSlide from "../../components/SlideSvg";

export const layoutId = "vector-cover";
export const layoutName = "Vector Cover";
export const layoutDescription = "The first slide of the vector template with a large background graphic.";

const schema = z.object({
  title: z.string().default("Vector Presentation"),
  subtitle: z.string().default("Created from imported SVG assets"),
});

export const Schema = schema;
export type VectorCoverData = z.infer<typeof schema>;

interface Props {
  data: Partial<VectorCoverData>;
}

const VectorCoverSlide: React.FC<Props> = ({ data }) => {
  const { title, subtitle } = data;

  return (
    <div className="w-full h-full relative bg-white overflow-hidden flex items-center justify-center">
      <div 
        className="absolute h-full z-0" 
        style={{ 
          width: 'calc(720px * 10560 / 1080)',
          left: '0px'
        }}
      >
        <SvgSlide className="w-full h-full object-cover" />
      </div>
      {/* Eraser for "Welcome to this presentation!" */}
      <div 
        className="absolute bg-white z-5"
        style={{
          width: '80%',
          height: '40%',
          top: '30%',
          left: '10%',
          transform: 'rotate(-15deg)',
          filter: 'blur(20px)',
          opacity: 0.95
        }}
      />
      <div className="relative z-10 p-16 flex flex-col items-start gap-4 ml-20 max-w-[75%]">
        <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] drop-shadow-sm">
          {title}
        </h1>
        <p className="text-3xl font-medium text-slate-600 uppercase tracking-widest drop-shadow-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default VectorCoverSlide;
