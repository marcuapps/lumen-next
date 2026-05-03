"use client";

import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Insights, Recommendation } from "@/lib/types";

interface Props {
  insights?: Insights;
  loading?: boolean;
}

const RECOMMENDATION_STYLES: Record<
  Recommendation,
  {
    icon: typeof TrendingUp;
    label: string;
    dot: string;
    accent: string;
  }
> = {
  "Head to airport now": {
    icon: TrendingUp,
    label: "GO NOW",
    dot: "bg-emerald-500",
    accent:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  "Wait 30 minutes": {
    icon: Clock,
    label: "HOLD",
    dot: "bg-amber-500",
    accent:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  "Avoid airport": {
    icon: Sparkles,
    label: "AVOID",
    dot: "bg-rose-500",
    accent:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

export function HeroInsightCard({ insights, loading }: Props) {
  if (loading || !insights) {
    return (
      <div className="rounded-[1.5rem] border border-border/60 bg-card p-8 shadow-card">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  const style = RECOMMENDATION_STYLES[insights.recommendation];
  const Icon = style.icon;
  const headline = buildHeadline(insights);

  return (
    <section className="rounded-[1.5rem] border border-border/60 bg-card p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-stretch md:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                style.accent,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              {style.label}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pickup recommendation
            </span>
          </div>

          <h2 className="font-display text-balance text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-[42px]">
            {headline}
          </h2>

          <p className="max-w-2xl text-balance text-sm text-muted-foreground sm:text-[15px]">
            {insights.recommendationReason}
          </p>
        </div>

        <div className="flex shrink-0 flex-col justify-between gap-4 rounded-2xl bg-foreground p-5 text-background md:min-w-[260px]">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-background/60">
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
            Recommended action
          </div>
          <div className="space-y-1.5">
            <div className="font-display text-2xl font-bold leading-tight tracking-tight">
              {insights.recommendation}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-background/70">
              <span>Peak window starts</span>
              <span className="font-mono font-semibold tabular-nums text-background">
                {insights.peakWindow}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-background/80">
            View affected flights
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </section>
  );
}

function buildHeadline(insights: Insights) {
  if (insights.peakWindow === "—") {
    return "No major demand cluster in the next four hours.";
  }
  return `Demand spike expected at ${insights.peakWindow}`;
}
