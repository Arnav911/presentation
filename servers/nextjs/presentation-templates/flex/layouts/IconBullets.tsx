import React from 'react'
import type { FlexSlideData } from '../schema'
import { FlexIcon } from '../components/FlexIcon'

export function IconBullets({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#1a1a1a'
  const textSecondary = '#52525b'
  const items = data.items ?? []

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <div
        className="w-12 h-1.5 rounded-full mb-6"
        style={{ background: data.accentColor }}
      />
      <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-lg mb-10 opacity-90 max-w-2xl" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-12 gap-y-8 flex-1 items-center pb-8">
        {items.map((item, i) => {
          const itemColor = item.color ?? data.accentColor
          return (
            <div key={i} className="flex items-start gap-6 group">
              {/* Icon bubble */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center
                            shrink-0 text-white shadow-lg group-hover:scale-105 transition-transform duration-200"
                style={{ background: itemColor }}
              >
                {item.icon ? (
                  <FlexIcon name={item.icon} size={28} color="#fff" />
                ) : (
                  <span className="text-xl font-bold">{i + 1}</span>
                )}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-xl mb-1 leading-tight" style={{ color: textPrimary }}>
                  {item.label}
                </h3>
                {item.subtitle && (
                  <p className="text-sm leading-relaxed opacity-80" style={{ color: textSecondary }}>
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
