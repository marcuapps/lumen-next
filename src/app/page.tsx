"use client";

import * as React from "react";
import { Clock, Plane, Timer, TrendingUp } from "lucide-react";

import { DemandCharts } from "@/components/dashboard/DemandCharts";
import { HeroInsightCard } from "@/components/dashboard/HeroInsightCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAirport } from "@/hooks/use-airport";
import { useInsights } from "@/hooks/use-insights";

function AnalyticsView() {
  const [airport] = useAirport();
  const { data, isLoading } = useInsights(airport);
  const insights = data?.insights;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Analytics overview"
        description={`Pickup-demand intelligence for arrivals at ${airport}, computed from this snapshot.`}
      />

      <HeroInsightCard insights={insights} loading={isLoading} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total arrivals"
          value={insights?.totalArrivals}
          hint={`Across ${airport} for this snapshot`}
          icon={Plane}
          loading={isLoading}
        />
        <MetricCard
          label="Delayed flights"
          value={insights?.delayedFlights}
          hint={
            insights
              ? `${Math.round((insights.delayedFlights / Math.max(insights.totalArrivals, 1)) * 100)}% of arrivals`
              : undefined
          }
          icon={Timer}
          tone="warning"
          loading={isLoading}
        />
        <MetricCard
          label="Avg delay"
          value={insights ? `${insights.averageDelay} min` : undefined}
          hint="Across all snapshot flights"
          icon={Clock}
          tone="warning"
          loading={isLoading}
        />
        <MetricCard
          label="Peak demand window"
          value={insights?.peakWindow}
          hint="Densest 30-minute pickup cluster"
          icon={TrendingUp}
          tone="info"
          loading={isLoading}
        />
      </section>

      <section>
        <DemandCharts
          buckets={insights?.arrivalsByWindow}
          loading={isLoading}
        />
      </section>
    </main>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsView />
    </React.Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <div className="h-12 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-44 animate-pulse rounded-[1.25rem] bg-card shadow-card" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[1.25rem] bg-card shadow-card"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="aspect-video animate-pulse rounded-[1.25rem] bg-card shadow-card" />
        <div className="aspect-video animate-pulse rounded-[1.25rem] bg-card shadow-card" />
      </div>
    </main>
  );
}
