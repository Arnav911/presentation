import type { FlexSlideData } from '../schema'

export function DuotoneSplit({ data }: { data: FlexSlideData }) {
  const leftColor = data.leftColor ?? data.accentColor
  const rightColor = data.rightColor ?? data.secondaryColor ?? '#1a1a1a'

  // If no comparison labels are provided, render as a hero cover slide (no VS badge)
  const isComparison = !!(data.leftLabel && data.rightLabel)

  if (!isComparison) {
    // Clean hero cover layout
    return (
      <div className="w-full h-full relative overflow-hidden flex" style={{ background: leftColor }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${leftColor} 0%, ${rightColor} 100%)` }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-20 text-center">
          <div className="w-16 h-1.5 rounded-full mb-8 bg-white/60" />
          <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-6 drop-shadow-lg">
            {data.heading}
          </h1>
          {(data.subheading || data.subtitle) && (
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
              {data.subheading || data.subtitle}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex">
      {/* Left half */}
      <div
        className="w-1/2 h-full flex flex-col items-center justify-center gap-4"
        style={{ background: leftColor }}
      >
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
          <span className="text-white text-3xl font-black">
            {data.leftLabel?.[0] ?? 'A'}
          </span>
        </div>
        <p className="text-white text-xl font-bold text-center px-6">{data.leftLabel}</p>
      </div>

      {/* VS badge */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-14 h-14 rounded-full bg-white flex items-center justify-center
                    z-10 shadow-2xl"
      >
        <span
          className="font-black text-sm"
          style={{ color: leftColor }}
        >
          VS
        </span>
      </div>

      {/* Right half */}
      <div
        className="w-1/2 h-full flex flex-col items-center justify-center gap-4"
        style={{ background: rightColor }}
      >
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
          <span className="text-white text-3xl font-black">
            {data.rightLabel?.[0] ?? 'B'}
          </span>
        </div>
        <p className="text-white text-xl font-bold text-center px-6">{data.rightLabel}</p>
      </div>

      {/* Bottom title overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-14 py-10 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-lg">
          {data.heading}
        </h1>
        {data.subtitle && (
          <p className="text-white/80 text-lg mt-3">{data.subtitle}</p>
        )}
      </div>
    </div>
  )
}
