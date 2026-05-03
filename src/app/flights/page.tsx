"use client";

import * as React from "react";

import { FlightsTable } from "@/components/dashboard/FlightsTable";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { Card } from "@/components/ui/card";
import { useAirport } from "@/hooks/use-airport";
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

type TableState = Omit<FlightsQueryParams, "airport">;

const DEFAULT_TABLE_STATE: TableState = {
  page: 1,
  limit: 10,
  search: "",
  delayedOnly: false,
  terminal: "all",
  sortBy: "eta",
  sortOrder: "asc",
};

function FlightsView() {
  const [airport] = useAirport();
  const [state, setState] = React.useState<TableState>(DEFAULT_TABLE_STATE);
  const [searchInput, setSearchInput] = React.useState("");

  // Reset table-specific state when the airport changes (terminals differ
  // per airport, so a stale terminal filter would mask all results).
  React.useEffect(() => {
    setState((s) => ({ ...s, page: 1, terminal: "all" }));
  }, [airport]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      setState((s) =>
        s.search === searchInput ? s : { ...s, search: searchInput, page: 1 },
      );
    }, 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params: FlightsQueryParams = { ...state, airport };
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFlights(params);

  const handleSortChange = (field: SortField) => {
    setState((s) => {
      let nextOrder: SortOrder = "asc";
      if (s.sortBy === field) nextOrder = s.sortOrder === "asc" ? "desc" : "asc";
      else if (field === "eta" || field === "airline") nextOrder = "asc";
      else nextOrder = "desc";
      return { ...s, sortBy: field, sortOrder: nextOrder, page: 1 };
    });
  };

  const showInitialLoading = isLoading && !data;
  const terminals = TERMINALS_BY_AIRPORT[airport];

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Inbound flights
        </h2>
        <p className="text-sm text-muted-foreground">
          Server-side filtered, sorted, and paginated. Showing arrivals at{" "}
          <span className="font-mono font-medium text-foreground">{airport}</span>
          .
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              All arrivals
            </h3>
            <p className="text-xs text-muted-foreground">
              {data?.pagination.total ?? 0} flights in this snapshot
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
          delayedOnly={state.delayedOnly}
          onDelayedOnlyChange={(v) =>
            setState((s) => ({ ...s, delayedOnly: v, page: 1 }))
          }
          terminal={state.terminal}
          terminals={terminals}
          onTerminalChange={(v) =>
            setState((s) => ({ ...s, terminal: v, page: 1 }))
          }
        />

        <FlightsTable
          flights={data?.data}
          loading={showInitialLoading}
          error={isError ? (error as Error) : null}
          onRetry={() => refetch()}
          pageSize={state.limit}
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          onSortChange={handleSortChange}
        />

        <PaginationControls
          pagination={data?.pagination}
          pageSize={state.limit}
          onPageSizeChange={(v) =>
            setState((s) => ({ ...s, limit: v, page: 1 }))
          }
          onPageChange={(page) =>
            setState((s) => ({ ...s, page: Math.max(1, page) }))
          }
        />
      </Card>
    </main>
  );
}

export default function FlightsPage() {
  return (
    <React.Suspense fallback={<FlightsSkeleton />}>
      <FlightsView />
    </React.Suspense>
  );
}

function FlightsSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-[520px] animate-pulse rounded-xl border bg-card" />
    </main>
  );
}
