import React from "react";
import * as z from "zod";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const layoutId = "business-model-slide";
export const layoutName = "Business Model Slide";
export const layoutDescription =
  "A business model presentation slide displaying CAC metrics and monetization strategy.";

const businessModelSchema = z.object({
  companyName: z.string().min(2).max(50).default("Presentation AI").meta({
    description: "Company name displayed in header",
  }),
  date: z.string().min(5).max(50).default("June 13, 2038").meta({
    description: "Today Date displayed in header",
  }),
  title: z.string().min(3).max(20).default("Business Model"),
  description: z
    .string()
    .default(
      "Describe how you monetize, who your customers are, your distribution channels or fee structure. The goal is to give an idea of how this business will sustain your product or service and explain how your company will make money and achieve its goals. This can be shown with graphs, statistics, or charts. Use the Lifetime Value (LTV) and Customer Acquisition Cost (CAC) metrics to provide a clearer picture.",
    )
    .meta({
      description:
        "Description of the business model, monetization strategy, and customer acquisition costs.",
    }),
  cacChart: z
    .array(
      z.object({
        label: z.string().min(3).max(20),
        percentage: z.number().min(0).max(100),
      }),
    )
    .min(2)
    .max(5)
    .default([
      { label: "Internet of Things", percentage: 70 },
      { label: "Artificial Intelligence", percentage: 60 },
      { label: "Blockchain", percentage: 50 },
      { label: "Cloud Computing", percentage: 40 },
      { label: "Cybersecurity", percentage: 30 },
    ])
    .meta({
      description:
        "Array of objects representing Customer Acquisition Cost (CAC) metrics for different business segments or channels. Each object should include a 'label' (the name of the segment or channel) and a 'percentage' (the CAC as a percentage value, from 0 to 100). This data is visualized in the bar chart to illustrate the distribution of CAC across various categories.",
    }),
});

export const Schema = businessModelSchema;
export type BusinessModelData = z.infer<typeof businessModelSchema>;

interface Props {
  data?: Partial<BusinessModelData>;
}

const BusinessModelSlide: React.FC<Props> = ({ data }) => {
  const hasChart =
    data?.cacChart && Array.isArray(data.cacChart) && data.cacChart.length > 0;
  const cacChartData = hasChart ? data.cacChart : [];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative z-20 mx-auto overflow-hidden"
        style={{
          fontFamily: "Montserrat, sans-serif",
          backgroundColor: 'var(--theme-bg, #ffffff)',
          color: 'var(--theme-text, #000000)'
        }}
      >
        {/* Header */}
        <div className="absolute top-8 left-10 right-10 flex justify-between items-center text-sm font-semibold" style={{ color: 'var(--theme-accent)' }}>
          <span>{data?.companyName}</span>
          <span>{data?.date}</span>
        </div>

        {/* Main Content */}
        <div className="px-16 py-16 flex h-full gap-8">
          {/* Left Column - Chart with Title Below */}
          <div className="flex-1 pr-12 flex flex-col justify-center text-left">
            <h1 className="text-6xl font-bold mb-4 leading-tight" style={{ color: 'var(--theme-accent)' }}>
              {data?.title}
            </h1>
            {hasChart && (
              <div className="rounded-lg shadow p-4 mb-8" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'rgba(var(--theme-accent-rgb), 0.1)', borderWidth: '1px' }}>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cacChartData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid stroke="rgba(var(--theme-accent-rgb), 0.1)" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "var(--theme-accent)", fontWeight: 600, fontSize: 10 }}
                      />
                      <YAxis
                        tick={{ fill: "var(--theme-accent)", fontWeight: 600, fontSize: 10 }}
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--theme-bg)",
                          borderColor: "var(--theme-accent)",
                          color: "var(--theme-text)",
                        }}
                        labelStyle={{ color: "var(--theme-accent)" }}
                      />
                      <Legend
                        wrapperStyle={{ color: "var(--theme-accent)", fontWeight: 600 }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="percentage"
                        fill="var(--theme-accent)"
                        name="CAC %"
                        maxBarSize={48}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Description */}
          <div className="flex flex-col items-start justify-center w-[52%] gap-8 text-left">
            <p className="text-base leading-relaxed font-normal mb-6 max-w-xl opacity-90" style={{ color: 'var(--theme-text)' }}>
              {data?.description}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--theme-accent)' }} />
      </div>
    </>
  );
};

export default BusinessModelSlide;
