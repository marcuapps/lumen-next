"use client";

import * as React from "react";
import { Clock, Plane, Timer, TrendingUp } from "lucide-react";

import { DemandCharts } from "@/components/dashboard/DemandCharts";
import { HeroInsightCard } from "@/components/dashboard/HeroInsightCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useAirport } from "@/hooks/use-airport";
import { useInsights } from "@/hooks/use-insights";

function AnalyticsView() {
  const [airport] = useAirport();
  const { data, isLoading } = useInsights(airport);
  const insights = data?.insights;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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

// useSearchParams (via useAirport) requires a Suspense boundary so Next.js
// can statically prerender the shell while the airport-aware view hydrates.
export default function AnalyticsPage() {
  return (
    <React.Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsView />
    </React.Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-44 animate-pulse rounded-2xl border bg-card" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="aspect-video animate-pulse rounded-xl border bg-card" />
        <div className="aspect-video animate-pulse rounded-xl border bg-card" />
      </div>
    </main>
  );
}
