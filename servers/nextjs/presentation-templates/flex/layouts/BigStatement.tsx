import React from 'react'
import type { FlexSlideData } from '../schema'

/**
 * BigStatement — A bold single-message slide for turning points, insights,
 * and "wow" moments. Large centered quote/statement with an accent bar.
 * Richer than quote-hero; used for key assertions or conclusions.
 */
export function BigStatement({ data }: { data: FlexSlideData }) {
  const accent = data.accentColor ?? '#1e4cd9'
  const isDark = data.theme === 'dark'
  const bg = isDark ? '#111111' : '#ffffff'
  const textPrimary = isDark ? '#ffffff' : '#111111'
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : '#71717a'

  const statement = data.quote || data.heading
  const context = data.subheading || data.attribution

  // Supporting bullets if available
  const items = data.items ?? []

  return (
    <div
      className="w-full h-full flex flex-col px-16 py-14 relative overflow-hidden"
      style={{ background: bg }}
    >
      {/* Background accent splash */}
      <div
        className="absolute top-0 left-0 w-full h-[5px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }}
      />

      <div className="flex-1 flex flex-col justify-center">
        {/* Category label */}
        {data.attribution && (
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] mb-6"
            style={{ color: accent }}
          >
            {data.attribution}
          </p>
        )}

        {/* Bold statement */}
        <h1
          className="font-black leading-[1.05] tracking-tight"
          style={{
            color: textPrimary,
            fontSize: statement.length > 60 ? '3.2rem' : statement.length > 40 ? '4rem' : '5rem',
            maxWidth: items.length > 0 ? '65%' : '85%',
          }}
        >
          {statement}
        </h1>

        {context && !data.attribution && (
          <p
            className="text-xl mt-5 leading-relaxed max-w-2xl"
            style={{ color: textSecondary }}
          >
            {context}
          </p>
        )}

        {/* Supporting data points (optional) */}
        {items.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-8 max-w-2xl">
            {items.slice(0, 3).map((item, i) => (
              <div key={i}>
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: item.color ?? accent }}
                >
                  {item.value || item.label}
                </p>
                {item.value && (
                  <p className="text-sm" style={{ color: textSecondary }}>
                    {item.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="w-20 h-1 rounded-full mt-6"
        style={{ background: accent }}
      />
    </div>
  )
}
