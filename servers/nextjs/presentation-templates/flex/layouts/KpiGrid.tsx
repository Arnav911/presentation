import React from 'react'
import type { FlexSlideData } from '../schema'
import { FlexIcon } from '../components/FlexIcon'

export function KpiGrid({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#111111'
  const textSecondary = '#71717a'
  const items = data.items ?? []

  // Determine grid columns based on item count
  const cols = items.length <= 2 ? 2 : items.length <= 4 ? 2 : 3
  // Scale down card content for many items
  const manyItems = items.length > 4

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <div
        className="w-12 h-1.5 rounded-full mb-6"
        style={{ background: data.accentColor }}
      />
      <h1 className="text-5xl font-black mb-3 tracking-tighter" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-lg mb-10 opacity-80" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      <div
        className="grid flex-1 gap-6"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {items.map((item, i) => {
          const cardColor = item.color ?? data.accentColor
          return (
            <div
              key={i}
              className="rounded-3xl flex flex-col justify-between relative overflow-hidden group border transition-all duration-300 hover:shadow-2xl"
              style={{
                background: cardColor + '08',
                borderColor: cardColor + '20',
                padding: manyItems ? '1.25rem' : '2rem',
              }}
            >
              {/* Decorative accent icon in background */}
              <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform">
                <FlexIcon name={item.icon || "metrics"} size={120} color={cardColor} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em]"
                   style={{ color: cardColor }}>
                  {item.label}
                </p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                  <FlexIcon name={item.icon || "metrics"} size={18} color={cardColor} />
                </div>
              </div>

              <div className="relative z-10">
                <p
                  className="font-black leading-none tracking-tighter"
                  style={{
                    color: textPrimary,
                    fontSize: item.value && item.value.length > 8 ? (manyItems ? '1.75rem' : '2.5rem') : (manyItems ? '2.5rem' : '4rem'),
                  }}
                >
                  {item.value}
                </p>
                {item.subtitle && (
                  <p className="text-sm mt-3 font-medium opacity-70" style={{ color: textSecondary }}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
