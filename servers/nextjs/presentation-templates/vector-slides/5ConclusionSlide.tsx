import React from "react";
import * as z from "zod";
import SvgSlide from "../../components/SlideSvg";

export const layoutId = "vector-conclusion";
export const layoutName = "Vector Conclusion";
export const layoutDescription = "A concluding slide to wrap up the presentation.";

const schema = z.object({
  title: z.string().default("Thank You"),
  contact: z.string().default("Reach out at contact@example.com"),
});

export const Schema = schema;
export type VectorConclusionData = z.infer<typeof schema>;

interface Props {
  data: Partial<VectorConclusionData>;
}

const VectorConclusionSlide: React.FC<Props> = ({ data }) => {
  const { title, contact } = data;

  return (
    <div className="w-full h-full relative bg-white overflow-hidden flex flex-col items-center justify-center gap-10">
      <div 
        className="absolute h-full z-0" 
        style={{ 
          width: 'calc(720px * 10560 / 1080)',
          left: 'calc(-720px * 8640 / 1080)'
        }}
      >
        <SvgSlide className="w-full h-full object-cover" />
      </div>

      {/* Eraser for "THANK YOU" placeholder on the left */}
      <div 
        className="absolute bg-[#136f64] z-5 blur-xl"
        style={{
          width: '50%',
          height: '100%',
          left: '0',
          top: '0',
        }}
      />

      {/* Eraser for body text on the right */}
      <div 
        className="absolute bg-white z-5 blur-xl"
        style={{
          width: '50%',
          height: '100%',
          right: '0',
          top: '0',
        }}
      />

      <div className="relative z-10 p-20 flex flex-col items-center gap-6 text-center">
        <h2 className="text-9xl font-black text-slate-900 tracking-tighter uppercase leading-none drop-shadow-md">
          {title}
        </h2>
        <div className="h-3 w-64 bg-slate-900" />
        <p className="text-4xl font-black text-slate-800 tracking-widest uppercase drop-shadow-sm">
          {contact}
        </p>
      </div>
    </div>
  );
};

export default VectorConclusionSlide;
