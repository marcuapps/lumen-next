"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// shadcn-style chart container that wires CSS color variables into recharts.

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

type ChartContextValue = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("Chart components must be used within <ChartContainer>");
  return ctx;
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uid = React.useId();
    const chartId = `chart-${(id ?? uid).replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line]:stroke-border/60",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/40",
            "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className,
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, v]) => v.color);
  if (!entries.length) return null;
  const css = entries
    .map(([key, value]) => `  --color-${key}: ${value.color};`)
    .join("\n");
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${css}\n}`,
      }}
    />
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    name: string;
    color?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  labelFormatter?: (label: string | number) => React.ReactNode;
  valueFormatter?: (value: number | string, name: string) => React.ReactNode;
  className?: string;
  indicator?: "dot" | "line";
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  className,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-md backdrop-blur",
        className,
      )}
    >
      {label !== undefined && (
        <div className="mb-1.5 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, idx) => {
          const key = entry.dataKey ?? entry.name;
          const cfg = config[key as string];
          const color = entry.color ?? cfg?.color ?? "hsl(var(--chart-1))";
          return (
            <div
              key={`${key}-${idx}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                {indicator === "dot" ? (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ) : (
                  <span
                    className="inline-block h-0.5 w-3"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-muted-foreground">
                  {cfg?.label ?? entry.name}
                </span>
              </div>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {valueFormatter
                  ? valueFormatter(entry.value, entry.name)
                  : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
