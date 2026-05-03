"use client";

import { useQuery } from "@tanstack/react-query";

import type { AirportCode, FlightsResponse, Insights } from "@/lib/types";

interface InsightsPayload {
  insights: Insights;
  snapshot: FlightsResponse["snapshot"];
}

async function fetchInsights(airport: AirportCode): Promise<InsightsPayload> {
  // The API computes insights from the unfiltered airport set, so any
  // single-row request returns the full insights payload cheaply.
  const search = new URLSearchParams({
    airport,
    page: "1",
    limit: "5",
    search: "",
    delayedOnly: "false",
    terminal: "all",
    sortBy: "eta",
    sortOrder: "asc",
  });
  const res = await fetch(`/api/flights?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = (await res.json()) as FlightsResponse;
  return { insights: json.insights, snapshot: json.snapshot };
}

/**
 * Fetches just the insights for an airport. Keyed only by airport so the
 * analytics page does not refetch when the flights table changes filters.
 */
export function useInsights(airport: AirportCode) {
  return useQuery({
    queryKey: ["insights", airport],
    queryFn: () => fetchInsights(airport),
  });
}
