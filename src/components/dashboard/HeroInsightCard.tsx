"use client";

import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    badge: "success" | "warning" | "destructive";
    icon: typeof TrendingUp;
    glow: string;
    label: string;
  }
> = {
  "Head to airport now": {
    badge: "success",
    icon: TrendingUp,
    glow: "from-emerald-500/20 via-emerald-500/5",
    label: "GO NOW",
  },
  "Wait 30 minutes": {
    badge: "warning",
    icon: Clock,
    glow: "from-amber-500/20 via-amber-500/5",
    label: "HOLD",
  },
  "Avoid airport": {
    badge: "destructive",
    icon: Sparkles,
    glow: "from-rose-500/20 via-rose-500/5",
    label: "AVOID",
  },
};

export function HeroInsightCard({ insights, loading }: Props) {
  if (loading || !insights) {
    return (
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const style = RECOMMENDATION_STYLES[insights.recommendation];
  const Icon = style.icon;
  const headline = buildHeadline(insights);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent opacity-90",
          style.glow,
        )}
        aria-hidden
      />
      <div
        className="absolute inset-0 grid-bg opacity-40"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={style.badge}
              className="gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            >
              <Icon className="h-3 w-3" strokeWidth={2.5} />
              {style.label}
            </Badge>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pickup recommendation
            </span>
          </div>

          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-[34px]">
            {headline}
          </h2>

          <p className="max-w-2xl text-balance text-sm text-muted-foreground sm:text-base">
            {insights.recommendationReason}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 rounded-xl border bg-background/80 p-4 backdrop-blur md:items-end">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Action
          </span>
          <div className="flex items-center gap-2 text-base font-semibold">
            {insights.recommendation}
            <ArrowRight className="h-4 w-4" />
          </div>
          <span className="text-xs text-muted-foreground">
            Peak window · {insights.peakWindow}
          </span>
        </div>
      </div>
    </div>
  );
}

function buildHeadline(insights: Insights) {
  if (insights.peakWindow === "—") {
    return "No major demand cluster in the next four hours.";
  }
  return `Demand spike expected at ${insights.peakWindow}`;
}
