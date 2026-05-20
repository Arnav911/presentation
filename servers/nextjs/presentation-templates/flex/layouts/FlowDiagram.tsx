import React from 'react'
import type { FlexSlideData } from '../schema'
import { FlexIcon } from '../components/FlexIcon'

export function FlowDiagram({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#fafafa'
  const textPrimary = '#111111'
  const textSecondary = '#666666'
  const arrowColor = '#d1d5db'
  const items = data.items ?? []

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <div
        className="w-10 h-1 rounded mb-4"
        style={{ background: data.accentColor }}
      />
      <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-base mb-12 opacity-80" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      {/* Flow row */}
      <div className="flex items-start flex-1 justify-between gap-2 overflow-hidden">
        {items.map((item, i) => {
          const nodeColor = item.color ?? data.accentColor
          return (
            <React.Fragment key={i}>
              {/* Step card */}
              <div className="flex flex-col items-center text-center flex-1 min-w-0">
                {/* Step icon bubble */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center
                              text-white shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                  style={{ background: nodeColor }}
                >
                  <div className="-rotate-3">
                    {item.icon ? (
                      <FlexIcon name={item.icon} size={32} color="#fff" />
                    ) : (
                      <span className="text-xl font-black">{i + 1}</span>
                    )}
                  </div>
                </div>
                
                <h3
                  className="font-bold text-lg mb-2 leading-tight px-2"
                  style={{ color: textPrimary }}
                >
                  {item.label}
                </h3>
                
                {item.subtitle && (
                  <p
                    className="text-sm leading-relaxed px-4 break-words"
                    style={{ color: textSecondary }}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Arrow between steps */}
              {i < items.length - 1 && (
                <div className="flex items-center self-center pt-8 opacity-40">
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                    <path 
                      d="M5 10H30M30 10L22 2M30 10L22 18" 
                      stroke={nodeColor} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
