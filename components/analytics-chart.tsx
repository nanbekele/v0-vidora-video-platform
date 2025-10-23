"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartProps {
  data: Array<{
    date: string
    views: number
  }>
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No view data available yet</div>
    )
  }

  return (
    <ChartContainer
      config={{
        views: {
          label: "Views",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px] w-full"
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#fillViews)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}
