import { TwoColCompare } from './layouts/TwoColCompare'
import { Timeline } from './layouts/Timeline'
import { KpiGrid } from './layouts/KpiGrid'
import { DuotoneSplit } from './layouts/DuotoneSplit'
import { QuoteHero } from './layouts/QuoteHero'
import { IconBullets } from './layouts/IconBullets'
import { DataTable } from './layouts/DataTable'
import { FlowDiagram } from './layouts/FlowDiagram'
import { TitleSlide } from './layouts/TitleSlide'
import { BigStatement } from './layouts/BigStatement'
import { FlexSlideSchema } from './schema'
import type { FlexSlideData } from './schema'

// Map layout string → component
const LAYOUT_MAP: Record<FlexSlideData['layout'], React.ComponentType<{ data: FlexSlideData }>> = {
  'two-col-compare': TwoColCompare,
  'timeline':        Timeline,
  'kpi-grid':        KpiGrid,
  'duotone-split':   DuotoneSplit,
  'quote-hero':      QuoteHero,
  'icon-bullets':    IconBullets,
  'data-table':      DataTable,
  'flow-diagram':    FlowDiagram,
  'title-slide':     TitleSlide,
  'big-statement':   BigStatement,
}

interface FlexSlideProps {
  data: FlexSlideData
  forceTheme?: 'light' | 'dark'
}

export function FlexSlide({ data, forceTheme }: FlexSlideProps) {
  // Validate with Zod before rendering
  const parsed = FlexSlideSchema.safeParse(data)
  if (!parsed.success) {
    console.error('[FlexSlide] Invalid data:', parsed.error)
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 text-red-500 text-sm p-8">
        FlexSlide data validation failed. Check console for details.
      </div>
    )
  }

  // Override theme if forced (keeps all slides consistent in a deck)
  const resolvedData: FlexSlideData = forceTheme ? { ...parsed.data, theme: forceTheme } : parsed.data

  const Layout = LAYOUT_MAP[resolvedData.layout]
  if (!Layout) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 text-yellow-500 text-sm">
        Unknown layout: {resolvedData.layout}
      </div>
    )
  }

  // Detect empty-content slides (LLM failed to fill items/steps)
  const hasItems = (resolvedData.items?.length ?? 0) > 0
  const hasSteps = (resolvedData.steps?.length ?? 0) > 0
  const hasQuote = !!(resolvedData.quote)
  const hasRows = (resolvedData.rows?.length ?? 0) > 0
  const hasCols = !!(resolvedData.leftColumn || resolvedData.rightColumn)
  const needsContent = ['icon-bullets','flow-diagram','kpi-grid','timeline','data-table','two-col-compare'].includes(resolvedData.layout)
  const isEmpty = needsContent && !hasItems && !hasSteps && !hasRows && !hasCols

  if (isEmpty) {
    const isDark = resolvedData.theme === 'dark'
    const bg = '#ffffff'
    const textPrimary = '#111111'
    const textSecondary = '#71717a'
    return (
      <div className="w-full h-full flex flex-col justify-center px-14 py-12" style={{ background: bg }}>
        <div className="w-12 h-1.5 rounded-full mb-6" style={{ background: resolvedData.accentColor }} />
        <h1 className="text-5xl font-black tracking-tight" style={{ color: textPrimary }}>{resolvedData.heading}</h1>
        {resolvedData.subheading && (
          <p className="text-xl mt-4 opacity-80" style={{ color: textSecondary }}>{resolvedData.subheading}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <Layout data={resolvedData} />
    </div>
  )
}

// Export schema for registration
export const Schema = FlexSlideSchema
export const layoutId = "flex"
export const layoutName = "Flexible Smart Layout"
export const layoutDescription = "A dynamic layout that automatically restructures itself into 8 different visual formats based on the content (e.g., timeline, comparison, metric grid)."
// Make sure it exports under default too if other templates do, but usually they're imported specifically.
export default FlexSlide
