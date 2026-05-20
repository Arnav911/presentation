import React from "react";
import * as z from "zod";
import SvgSlide from "../../components/SlideSvg";

export const layoutId = "vector-concept";
export const layoutName = "Vector Concept";
export const layoutDescription = "A slide focused on explaining a specific concept or idea.";

const schema = z.object({
  title: z.string().default("The Core Concept"),
  points: z.array(z.string()).default(["Innovative Design", "Seamless Integration", "High Performance"]),
});

export const Schema = schema;
export type VectorConceptData = z.infer<typeof schema>;

interface Props {
  data: Partial<VectorConceptData>;
}

const VectorConceptSlide: React.FC<Props> = ({ data }) => {
  const { title, points } = data;

  return (
    <div className="w-full h-full relative bg-white overflow-hidden flex items-start justify-start p-20">
      <div 
        className="absolute h-full z-0" 
        style={{ 
          width: 'calc(720px * 10560 / 1080)',
          left: 'calc(-720px * 4320 / 1080)'
        }}
      >
        <SvgSlide className="w-full h-full object-cover" />
      </div>

      {/* Eraser for "Introduction" placeholder on the right */}
      <div 
        className="absolute bg-white/95 z-5 blur-xl"
        style={{
          width: '40%',
          height: '60%',
          right: '5%',
          top: '20%',
        }}
      />

      <div className="relative z-10 p-12 flex flex-col items-start gap-8 max-w-[650px]">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none drop-shadow-sm">
          {title}
        </h2>
        <ul className="flex flex-col gap-5 text-slate-800">
          {(points || []).map((point, i) => (
            <li key={i} className="flex items-center gap-4 text-2xl font-bold uppercase tracking-wider drop-shadow-sm">
              <div className="w-4 h-4 bg-slate-900 rotate-45" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VectorConceptSlide;
