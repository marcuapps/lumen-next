import { NextResponse } from "next/server";

import { FLIGHTS, SNAPSHOT_TIMESTAMP } from "@/data/flights";
import { applyFiltersAndSort, parseQueryParams } from "@/lib/flights-query";
import { computeInsights } from "@/lib/insights";
import type { FlightsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const SIMULATED_LATENCY_MS = 300;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  await wait(SIMULATED_LATENCY_MS);

  const url = new URL(request.url);
  const params = parseQueryParams(url);

  const flightsForAirport = FLIGHTS.filter((f) => f.airport === params.airport);

  const { rows, pagination } = applyFiltersAndSort(flightsForAirport, params);

  const snapshotDate = new Date(SNAPSHOT_TIMESTAMP);
  const insights = computeInsights(
    flightsForAirport,
    params.airport,
    snapshotDate,
  );

  const response: FlightsResponse = {
    data: rows,
    pagination,
    snapshot: {
      airport: params.airport,
      timestamp: SNAPSHOT_TIMESTAMP,
    },
    insights,
  };

  return NextResponse.json(response);
}
