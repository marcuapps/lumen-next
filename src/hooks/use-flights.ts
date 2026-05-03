"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { FlightsQueryParams, FlightsResponse } from "@/lib/types";

async function fetchFlights(
  params: FlightsQueryParams,
): Promise<FlightsResponse> {
  const search = new URLSearchParams({
    airport: params.airport,
    page: String(params.page),
    limit: String(params.limit),
    search: params.search,
    delayedOnly: String(params.delayedOnly),
    terminal: params.terminal,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const res = await fetch(`/api/flights?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function useFlights(params: FlightsQueryParams) {
  return useQuery({
    queryKey: [
      "flights",
      params.airport,
      params.page,
      params.limit,
      params.search,
      params.delayedOnly,
      params.terminal,
      params.sortBy,
      params.sortOrder,
    ],
    queryFn: () => fetchFlights(params),
    placeholderData: keepPreviousData,
  });
}
