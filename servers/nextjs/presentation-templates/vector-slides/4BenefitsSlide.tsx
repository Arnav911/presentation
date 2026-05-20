import React from "react";
import * as z from "zod";
import SvgSlide from "../../components/SlideSvg";

export const layoutId = "vector-benefits";
export const layoutName = "Vector Benefits";
export const layoutDescription = "Highlighting key benefits or features with a background graphic.";

const schema = z.object({
  title: z.string().default("Key Benefits"),
  content: z.string().default("Leveraging automated systems to minimize overhead and maximize output."),
});

export const Schema = schema;
export type VectorBenefitsData = z.infer<typeof schema>;

interface Props {
  data: Partial<VectorBenefitsData>;
}

const VectorBenefitsSlide: React.FC<Props> = ({ data }) => {
  const { title, content } = data;

  return (
    <div className="w-full h-full relative bg-[#136f64] overflow-hidden flex items-center justify-center">
      <div 
        className="absolute h-full z-0" 
        style={{ 
          width: 'calc(720px * 10560 / 1080)',
          left: 'calc(-720px * 6480 / 1080)'
        }}
      >
        <SvgSlide className="w-full h-full object-cover" />
      </div>

      {/* Eraser for "Introduction" placeholder on the teal background */}
      <div 
        className="absolute bg-[#136f64] z-5 blur-2xl opacity-90"
        style={{
          width: '40%',
          height: '50%',
          right: '5%',
          top: '25%',
        }}
      />

      <div className="relative z-10 p-16 flex flex-col items-center text-center gap-8 max-w-[85%]">
        <h2 className="text-7xl font-black text-white tracking-tighter uppercase drop-shadow-md">
          {title}
        </h2>
        <p className="text-4xl font-bold text-white/90 leading-tight drop-shadow-sm">
          {content}
        </p>
      </div>
    </div>
  );
};

export default VectorBenefitsSlide;
