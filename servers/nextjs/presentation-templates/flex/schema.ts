import { z } from 'zod'

// A single data item used across multiple layouts
const FlexItemSchema = z.object({
  label: z.string().default("Item"),
  value: z.string().optional(),      // used in KPI grid (e.g. "57%")
  subtitle: z.string().optional(),   // secondary line below label
  icon: z.any().optional(),          // string or object {__icon_query__: string, __icon_url__: string}
  color: z.string().optional(),      // hex color for this specific item
  tag: z.string().optional(),        // small badge text (e.g. "New", "2024")
})

// A column used in two-col-compare layout
const FlexColumnSchema = z.object({
  heading: z.string().default("Column Heading"),               // column title (e.g. company name)
  color: z.string().default("#1e4cd9"),                 // brand color for this column
  items: z.array(FlexItemSchema).default([]),
})

// A step used in timeline layout
const FlexStepSchema = z.object({
  year: z.string().optional(),       // label on the timeline node (e.g. "2020")
  label: z.string().default("Step Title"),                 // short title for this step
  description: z.string().default("Step description."),           // one sentence detail
  color: z.string().optional(),      // override color for this node
})

export const FlexSlideSchema = z.object({
  // REQUIRED by all layouts
  layout: z.enum([
    'two-col-compare',   // side-by-side comparison (e.g. Company A vs B)
    'timeline',          // horizontal timeline with nodes
    'kpi-grid',          // 2x2 or 1x4 grid of metric cards
    'quote-hero',        // large centered quote with attribution
    'icon-bullets',      // list with icons, used for lessons/takeaways
    'duotone-split',     // cover slide: two color halves with logos
    'data-table',        // structured table with headers and rows
    'flow-diagram',      // left-to-right step flow (process/strategy)
    'title-slide',       // premium dark cover slide for presentation opening
    'big-statement',     // bold centered insight or turning-point slide
  ]).default('icon-bullets'),
  heading: z.string().default("Slide Heading"),
  subheading: z.string().optional(),
  accentColor: z.string().default("#1e4cd9"),           // primary brand color (hex)
  secondaryColor: z.string().optional(),
  theme: z.enum(['light', 'dark']).default('light'),

  // two-col-compare
  leftColumn: FlexColumnSchema.optional(),
  rightColumn: FlexColumnSchema.optional(),

  // kpi-grid, icon-bullets, flow-diagram
  items: z.array(FlexItemSchema).default([]),

  // timeline
  steps: z.array(FlexStepSchema).default([]),

  // quote-hero
  quote: z.string().optional(),
  attribution: z.string().optional(),

  // data-table
  headers: z.array(z.string()).default([]),
  rows: z.array(z.array(z.string())).default([]),

  // duotone-split (cover)
  leftLabel: z.string().optional(),   // e.g. "Zomato"
  rightLabel: z.string().optional(),  // e.g. "Swiggy"
  leftColor: z.string().optional(),
  rightColor: z.string().optional(),
  subtitle: z.string().optional(),
})

export type FlexSlideData = z.infer<typeof FlexSlideSchema>
