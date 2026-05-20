import React from 'react'
import type { FlexSlideData } from '../schema'
import { FlexIcon } from '../components/FlexIcon'

export function TwoColCompare({ data }: { data: FlexSlideData }) {
  const left = data.leftColumn
  const right = data.rightColumn
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#111111'
  const textSecondary = '#71717a'

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <h1 className="text-4xl font-black mb-1 tracking-tight" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-lg mb-10 opacity-70" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      {/* Two columns */}
      <div className="flex flex-1 gap-12 min-h-0">
        {/* Left column */}
        <div
          className="flex-1 rounded-3xl p-10 flex flex-col border transition-all duration-300 hover:shadow-xl"
          style={{ 
            background: (left?.color ?? data.accentColor) + '08',
            borderColor: (left?.color ?? data.accentColor) + '20'
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                 style={{ background: left?.color ?? data.accentColor }}>
              <FlexIcon name={left?.heading} size={24} color="#fff" />
            </div>
            <h2
              className="text-2xl font-black tracking-tight"
              style={{ color: left?.color ?? data.accentColor }}
            >
              {left?.heading}
            </h2>
          </div>
          
          <div className="flex flex-col gap-6 overflow-y-auto pr-4 custom_scrollbar">
            {left?.items.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="mt-1 shrink-0">
                  <FlexIcon name={item.icon || "check"} size={18} color={left?.color ?? data.accentColor} />
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: textPrimary }}>
                    {item.label}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm mt-1 opacity-70 leading-relaxed" style={{ color: textSecondary }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div
          className="flex-1 rounded-3xl p-10 flex flex-col border transition-all duration-300 hover:shadow-xl"
          style={{ 
            background: (right?.color ?? data.secondaryColor ?? '#888') + '08',
            borderColor: (right?.color ?? data.secondaryColor ?? '#888') + '20'
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                 style={{ background: right?.color ?? data.secondaryColor ?? '#888' }}>
              <FlexIcon name={right?.heading} size={24} color="#fff" />
            </div>
            <h2
              className="text-2xl font-black tracking-tight"
              style={{ color: right?.color ?? data.secondaryColor ?? '#888' }}
            >
              {right?.heading}
            </h2>
          </div>
          
          <div className="flex flex-col gap-6 overflow-y-auto pr-4 custom_scrollbar">
            {right?.items.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="mt-1 shrink-0">
                  <FlexIcon name={item.icon || "check"} size={18} color={right?.color ?? data.secondaryColor ?? '#888'} />
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: textPrimary }}>
                    {item.label}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm mt-1 opacity-70 leading-relaxed" style={{ color: textSecondary }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
