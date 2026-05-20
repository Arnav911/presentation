import React from "react";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export const layoutId = "market-validation-slide";
export const layoutName = "Market Validation Slide";
export const layoutDescription =
  "A slide layout designed to present market validation data, including flexible market validation metrics, comparisons, and an optional decorative image.";

// Make the schema generic: allow any label/value pairs for comparison
const marketValidationSchema = z.object({
  companyName: z.string().min(2).max(50).default("Presentation AI").meta({
    description: "Company name displayed in header",
  }),
  date: z.string().min(5).max(50).default("June 13, 2038").meta({
    description: "Today Date displayed in header",
  }),
  title: z.string().min(3).max(20).default("Market Validation").meta({
    description: "Title of the slide",
  }),
  description: z
    .string()
    .min(50)
    .max(400)
    .default(
      "It’s a market testing stage to ensure that the products produced by the company can be accepted and effectively used by the broad market. For start-up companies, we can use data already achieved by similar products from other companies.",
    )
    .meta({
      description:
        "Main description text for the slide explaining market validation",
    }),
  // Generic comparisonData: label for row, label for metric, and value
  comparisonData: z
    .array(
      z.object({
        label: z.string().min(2).max(50).meta({
          description:
            "Name of comparison entity (e.g., company, product, etc.)",
        }),
        metricLabel: z.string().min(2).max(50).meta({
          description:
            "Label for the metric being compared (e.g., Users, Revenue, etc.)",
        }),
        value: z.number().min(0).meta({
          description: "Numeric value for the metric",
        }),
      }),
    )
    .min(2)
    .max(5)
    .default([
      { label: "Thynk Unlimited", metricLabel: "Revenue ($K)", value: 2650 },
      { label: "Salford & Co.", metricLabel: "Revenue ($K)", value: 1850 },
      { label: "Liceria & Co.", metricLabel: "Revenue ($K)", value: 1010 },
    ])
    .meta({
      description:
        "Comparison data for market validation, allowing flexible labels and values",
    }),
  image: ImageSchema.optional().meta({
    description: "Optional decorative image",
  }),
});

export const Schema = marketValidationSchema;

export type MarketValidationSlideData = z.infer<typeof marketValidationSchema>;

interface MarketValidationSlideLayoutProps {
  data?: Partial<MarketValidationSlideData>;
}

const MarketValidationSlideLayout: React.FC<
  MarketValidationSlideLayoutProps
> = ({ data: slideData }) => {
  const comparisonData = slideData?.comparisonData || [];

  // Chart color palette (shadcn blue and gray)
  const chartColors = ["#2563eb", "#1e40af", "#60a5fa", "#93c5fd", "#dbeafe"];

  // Determine the metric label to use (assume all rows use the same metricLabel)
  const metricLabel =
    comparisonData.length > 0 ? comparisonData[0].metricLabel : "Metric";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        className="w-full max-w-[1280px] aspect-video mx-auto rounded overflow-hidden relative z-20"
        style={{
          fontFamily: "Montserrat, sans-serif",
          backgroundColor: 'var(--theme-bg, #ffffff)',
          color: 'var(--theme-text, #000000)'
        }}
      >
        {/* Header */}
        <div className="absolute top-8 left-10 right-10 flex justify-between items-center text-sm font-semibold" style={{ color: 'var(--theme-accent)' }}>
          <span>{slideData?.companyName}</span>
          <span>{slideData?.date}</span>
        </div>

        {/* Main Content */}
        <div className="px-16 py-16 flex h-full gap-8">
          {/* Left Column */}
          <div className="flex-1 pr-12 flex flex-col justify-center text-left">
            <h1 className="text-6xl font-bold mb-8 leading-tight" style={{ color: 'var(--theme-accent)' }}>
              {slideData?.title}
            </h1>
            <p className="text-sm leading-relaxed font-normal mb-12 max-w-lg opacity-90">
              {slideData?.description}
            </p>
          </div>

          {/* Right Column - Chart on top, Table on bottom */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            {/* Bar Chart */}
            <Card className="w-full p-4 flex flex-col items-center" style={{ backgroundColor: 'rgba(var(--theme-accent-rgb), 0.05)', borderColor: 'rgba(var(--theme-accent-rgb), 0.1)' }}>
              <div className="w-full h-64">
                <ChartContainer
                  config={{
                    value: { label: metricLabel, color: "var(--theme-accent)" },
                  }}
                >
                  <BarChart
                    data={comparisonData}
                    layout="vertical"
                    margin={{ left: 32, right: 16, top: 16, bottom: 16 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={120}
                      tick={{ fill: 'var(--theme-text)', fontWeight: 600, fontSize: 12 }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-accent)' }} />
                    <Bar
                      dataKey="value"
                      name={metricLabel}
                      radius={[8, 8, 8, 8]}
                      fill="var(--theme-accent)"
                    >
                      {comparisonData.map((entry, idx) => (
                        <Cell
                          key={entry.label}
                          fill={idx === 0 ? "var(--theme-accent)" : `rgba(var(--theme-accent-rgb), ${0.8 - (idx * 0.2)})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </Card>
            {/* Table of comparison data */}
            <Card className="w-full overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
              <Table>
                <TableHeader style={{ backgroundColor: 'rgba(var(--theme-accent-rgb), 0.1)' }}>
                  <tr>
                    <th className="text-left px-4 py-2" style={{ color: 'var(--theme-accent)' }}>
                      {comparisonData.length > 0 ? "Name" : "Name"}
                    </th>
                    <th className="text-left px-4 py-2" style={{ color: 'var(--theme-accent)' }}>
                      {metricLabel}
                    </th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((entry) => (
                    <tr key={entry.label} style={{ borderBottomColor: 'rgba(var(--theme-accent-rgb), 0.1)' }}>
                      <td className="px-4 py-2" style={{ color: 'var(--theme-text)' }}>{entry.label}</td>
                      <td className="px-4 py-2" style={{ color: 'var(--theme-text)' }}>
                        {entry.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--theme-accent)' }} />
      </div>
    </>
  );
};

export default MarketValidationSlideLayout;
