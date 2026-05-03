"use client";

import * as React from "react";
import { Clock, Plane, Timer, TrendingUp } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DemandCharts } from "@/components/dashboard/DemandCharts";
import { FlightsTable } from "@/components/dashboard/FlightsTable";
import { HeroInsightCard } from "@/components/dashboard/HeroInsightCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { Card } from "@/components/ui/card";
import { useFlights } from "@/hooks/use-flights";
import type {
  AirportCode,
  FlightsQueryParams,
  SortField,
  SortOrder,
} from "@/lib/types";

const TERMINALS_BY_AIRPORT: Record<AirportCode, string[]> = {
  LAX: ["1", "2", "3", "4", "5", "6", "7", "B"],
  JFK: ["1", "4", "5", "7", "8"],
  SFO: ["1", "2", "3", "I"],
};

const DEFAULT_PARAMS: FlightsQueryParams = {
  airport: "LAX",
  page: 1,
  limit: 10,
  search: "",
  delayedOnly: false,
  terminal: "all",
  sortBy: "eta",
  sortOrder: "asc",
};

export default function DashboardPage() {
  const [params, setParams] = React.useState<FlightsQueryParams>(DEFAULT_PARAMS);
  const [searchInput, setSearchInput] = React.useState("");

  // Debounce search to keep typing snappy without thrashing the API
  React.useEffect(() => {
    const id = setTimeout(() => {
      setParams((p) =>
        p.search === searchInput ? p : { ...p, search: searchInput, page: 1 },
      );
    }, 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFlights(params);

  const handleAirportChange = (airport: AirportCode) => {
    setParams((p) => ({ ...p, airport, page: 1, terminal: "all" }));
  };

  const handleSortChange = (field: SortField) => {
    setParams((p) => {
      let nextOrder: SortOrder = "asc";
      if (p.sortBy === field) nextOrder = p.sortOrder === "asc" ? "desc" : "asc";
      else if (field === "eta" || field === "airline") nextOrder = "asc";
      else nextOrder = "desc";
      return { ...p, sortBy: field, sortOrder: nextOrder, page: 1 };
    });
  };

  const insights = data?.insights;
  const terminals = TERMINALS_BY_AIRPORT[params.airport];
  const showInitialLoading = isLoading && !data;

  return (
    <div className="min-h-screen">
      <DashboardHeader
        airport={params.airport}
        onAirportChange={handleAirportChange}
        snapshotTimestamp={data?.snapshot.timestamp}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeroInsightCard insights={insights} loading={showInitialLoading} />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total arrivals"
            value={insights?.totalArrivals}
            hint={`Across ${params.airport} for this snapshot`}
            icon={Plane}
            loading={showInitialLoading}
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
            loading={showInitialLoading}
          />
          <MetricCard
            label="Avg delay"
            value={insights ? `${insights.averageDelay} min` : undefined}
            hint="Across all snapshot flights"
            icon={Clock}
            tone="warning"
            loading={showInitialLoading}
          />
          <MetricCard
            label="Peak demand window"
            value={insights?.peakWindow}
            hint="Densest 30-minute pickup cluster"
            icon={TrendingUp}
            tone="info"
            loading={showInitialLoading}
          />
        </section>

        <section>
          <DemandCharts
            buckets={insights?.arrivalsByWindow}
            loading={showInitialLoading}
          />
        </section>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Inbound flights
              </h3>
              <p className="text-xs text-muted-foreground">
                Server-side filtered, sorted, and paginated
              </p>
            </div>
            <span
              className={`text-xs text-muted-foreground transition-opacity ${isFetching && !isLoading ? "opacity-100" : "opacity-0"}`}
              aria-live="polite"
            >
              Updating…
            </span>
          </div>

          <TableToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            delayedOnly={params.delayedOnly}
            onDelayedOnlyChange={(v) =>
              setParams((p) => ({ ...p, delayedOnly: v, page: 1 }))
            }
            terminal={params.terminal}
            terminals={terminals}
            onTerminalChange={(v) =>
              setParams((p) => ({ ...p, terminal: v, page: 1 }))
            }
          />

          <FlightsTable
            flights={data?.data}
            loading={showInitialLoading}
            error={isError ? (error as Error) : null}
            onRetry={() => refetch()}
            pageSize={params.limit}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSortChange={handleSortChange}
          />

          <PaginationControls
            pagination={data?.pagination}
            pageSize={params.limit}
            onPageSizeChange={(v) =>
              setParams((p) => ({ ...p, limit: v, page: 1 }))
            }
            onPageChange={(page) =>
              setParams((p) => ({ ...p, page: Math.max(1, page) }))
            }
          />
        </Card>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Lumen · Snapshot analytics, not a live tracker · Mock data
        </footer>
      </main>
    </div>
  );
}
