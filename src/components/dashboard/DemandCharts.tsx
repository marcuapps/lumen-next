"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { WindowBucket } from "@/lib/types";

const arrivalsConfig = {
  arrivals: {
    label: "On time",
    color: "hsl(var(--chart-1))",
  },
  delayed: {
    label: "Delayed",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const demandConfig = {
  estimatedPickups: {
    label: "Estimated pickups",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface Props {
  buckets?: WindowBucket[];
  loading?: boolean;
}

export function DemandCharts({ buckets, loading }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Arrivals by 15-minute window
          </CardTitle>
          <CardDescription>
            On-time vs delayed arrivals over the next four hours
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {loading || !buckets ? (
            <Skeleton className="aspect-video w-full" />
          ) : (
            <ChartContainer
              config={arrivalsConfig}
              className="aspect-[16/9] w-full"
            >
              <BarChart
                data={buckets.map((b) => ({
                  ...b,
                  onTime: b.arrivals - b.delayed,
                }))}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={32}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(label) => `Arrival window · ${label}`}
                    />
                  }
                />
                <Bar
                  dataKey="onTime"
                  stackId="a"
                  fill="var(--color-arrivals)"
                  radius={[0, 0, 4, 4]}
                  name="On time"
                />
                <Bar
                  dataKey="delayed"
                  stackId="a"
                  fill="var(--color-delayed)"
                  radius={[4, 4, 0, 0]}
                  name="Delayed"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Estimated pickup demand
          </CardTitle>
          <CardDescription>
            Modeled rideshare/taxi pickups based on passenger volume
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {loading || !buckets ? (
            <Skeleton className="aspect-video w-full" />
          ) : (
            <ChartContainer
              config={demandConfig}
              className="aspect-[16/9] w-full"
            >
              <AreaChart
                data={buckets}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-estimatedPickups)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-estimatedPickups)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={32}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(label) => `Window · ${label}`}
                      valueFormatter={(value) => `${value} pickups`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="estimatedPickups"
                  stroke="var(--color-estimatedPickups)"
                  strokeWidth={2}
                  fill="url(#demandFill)"
                  name="Estimated pickups"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
