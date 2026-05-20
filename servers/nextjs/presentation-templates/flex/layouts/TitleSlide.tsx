import React from 'react'
import type { FlexSlideData } from '../schema'

/**
 * TitleSlide — Premium cover / hero slide for the start of a presentation.
 * Uses a bold typographic layout with a color bar + large heading + subtitle.
 */
export function TitleSlide({ data }: { data: FlexSlideData }) {
  const accent = data.accentColor ?? '#1e4cd9'
  const secondary = data.secondaryColor ?? '#f0f4ff'

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col"
      style={{ background: '#0d0d0d' }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute top-0 right-0 w-[55%] h-full"
        style={{
          background: `linear-gradient(145deg, ${accent}22 0%, ${accent}08 60%, transparent 100%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40%] h-[3px]"
        style={{ background: accent }}
      />
      <div
        className="absolute top-16 right-14 w-64 h-64 rounded-full opacity-10"
        style={{ background: accent, filter: 'blur(60px)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-16 py-14">
        {/* Top accent bar */}
        <div
          className="w-14 h-1.5 rounded-full mb-10"
          style={{ background: accent }}
        />

        {/* Main heading */}
        <h1
          className="text-7xl font-black leading-[1.0] tracking-tighter mb-6 text-white"
          style={{ maxWidth: '70%', textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}
        >
          {data.heading}
        </h1>

        {/* Subtitle / sub-heading */}
        {(data.subheading || data.subtitle) && (
          <p
            className="text-xl font-medium mt-2 max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {data.subheading || data.subtitle}
          </p>
        )}

        {/* Optional items as tag pills (e.g. key themes) */}
        {data.items && data.items.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-10">
            {data.items.map((item, i) => (
              <span
                key={i}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                style={{ background: item.color ?? `${accent}44`, border: `1px solid ${accent}66` }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom right slide label */}
      <div
        className="absolute bottom-8 right-14 text-xs font-bold tracking-[0.18em] uppercase"
        style={{ color: `${accent}80` }}
      >
        {data.attribution ?? ''}
      </div>
    </div>
  )
}
