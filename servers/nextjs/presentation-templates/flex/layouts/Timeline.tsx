import React from 'react'
import type { FlexSlideData } from '../schema'
import { FlexIcon } from '../components/FlexIcon'

export function Timeline({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#111111'
  const textSecondary = '#71717a'
  const lineColor = '#e4e4e7'
  const steps = data.steps ?? []

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <div
        className="w-10 h-1 rounded mb-4"
        style={{ background: data.accentColor }}
      />
      <h1 className="text-4xl font-black mb-3 tracking-tight" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-base mb-12 opacity-80" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      {/* Timeline track */}
      <div className="relative flex-1 flex items-center px-4">
        {/* Horizontal line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-[44px]"
          style={{ background: lineColor }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between w-full">
          {steps.map((step, i) => {
            const nodeColor = step.color ?? data.accentColor
            return (
              <div
                key={i}
                className="flex flex-col items-center group"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Year/Icon label above circle */}
                <span 
                  className="text-xs font-black mb-3 uppercase tracking-widest opacity-60"
                  style={{ color: nodeColor }}
                >
                  {step.year ?? `Step ${i + 1}`}
                </span>

                {/* Node circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center
                              text-white z-10 shadow-lg border-4 transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: nodeColor,
                    borderColor: bg
                  }}
                >
                  <span className="text-sm font-black">{i + 1}</span>
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <h3
                    className="text-sm font-extrabold text-center leading-tight mb-2"
                    style={{ color: textPrimary }}
                  >
                    {step.label}
                  </h3>
                  <p
                    className="text-[11px] text-center leading-relaxed px-4 opacity-70"
                    style={{ color: textSecondary }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
