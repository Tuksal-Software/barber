"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"
import type { WeeklyAppointmentData } from "@/lib/actions/stats.actions"

interface WeeklyAppointmentsChartProps {
  data: WeeklyAppointmentData[]
}

const chartConfig = {
  count: {
    label: "Randevu Sayısı",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function WeeklyAppointmentsChart({ data }: WeeklyAppointmentsChartProps) {
  const isMobile = useIsMobile()

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Haftalık Randevular</CardTitle>
        <CardDescription className="text-muted-foreground">
          Bu hafta günlük randevu sayısı
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full sm:h-[300px]"
        >
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: isMobile ? 5 : 10,
              left: isMobile ? -10 : 0,
              bottom: isMobile ? 5 : 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => isMobile ? value.substring(0, 3) : value}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={isMobile ? 30 : 40}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    const dayData = data.find((d) => d.dayLabel === value)
                    return dayData ? `${dayData.dayLabel} - ${dayData.day}` : value
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

