import type { FlexSlideData } from '../schema'

export function DataTable({ data }: { data: FlexSlideData }) {
  const isDark = data.theme === 'dark'
  const bg = '#ffffff'
  const textPrimary = '#111111'
  const textSecondary = '#666666'
  const borderColor = isDark ? '#2a2a2a' : '#f0f0f0'
  const headerBg = isDark ? '#1a1a1a' : '#f9f9f9'
  const headers = data.headers ?? []
  const rows = data.rows ?? []

  return (
    <div className="w-full h-full flex flex-col px-14 py-12" style={{ background: bg }}>
      <div
        className="w-10 h-1 rounded mb-4"
        style={{ background: data.accentColor }}
      />
      <h1 className="text-3xl font-bold mb-2" style={{ color: textPrimary }}>
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="text-sm mb-8" style={{ color: textSecondary }}>
          {data.subheading}
        </p>
      )}

      <div
        className="flex-1 rounded-2xl overflow-hidden border"
        style={{ borderColor }}
      >
        <table className="w-full h-full border-collapse">
          {/* Header row */}
          <thead>
            <tr style={{ background: headerBg }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left text-xs font-bold uppercase tracking-wider px-6 py-4"
                  style={{
                    color: i === 0 ? textSecondary : data.accentColor,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? 'transparent' : (isDark ? '#161616' : '#fcfcfc'),
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-6 py-4 text-sm"
                    style={{
                      color: ci === 0 ? textSecondary : textPrimary,
                      fontWeight: ci === 0 ? 600 : 400,
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
