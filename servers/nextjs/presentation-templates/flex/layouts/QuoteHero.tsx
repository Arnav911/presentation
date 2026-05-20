import type { FlexSlideData } from '../schema'

export function QuoteHero({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#111111'
  const textSecondary = '#888888'

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-24 text-center"
      style={{ background: bg }}
    >
      {/* Decorative quote mark */}
      <div
        className="text-8xl font-black leading-none mb-6 opacity-20"
        style={{ color: data.accentColor }}
      >
        "
      </div>

      {/* The quote */}
      <blockquote
        className="text-2xl font-semibold leading-relaxed max-w-3xl"
        style={{ color: textPrimary }}
      >
        {data.quote ?? data.heading}
      </blockquote>

      {/* Attribution line */}
      {data.attribution && (
        <div className="flex items-center gap-3 mt-10">
          <div className="w-12 h-px" style={{ background: data.accentColor }} />
          <p className="text-sm font-medium" style={{ color: textSecondary }}>
            {data.attribution}
          </p>
          <div className="w-12 h-px" style={{ background: data.accentColor }} />
        </div>
      )}

      {/* Subheading if present */}
      {data.subheading && !data.attribution && (
        <p className="text-base mt-6" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}
    </div>
  )
}
