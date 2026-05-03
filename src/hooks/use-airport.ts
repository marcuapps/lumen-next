"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AirportCode } from "@/lib/types";

const VALID_AIRPORTS: AirportCode[] = ["LAX", "JFK", "SFO"];
const DEFAULT_AIRPORT: AirportCode = "LAX";

/**
 * Reads/writes the selected airport from the URL (`?airport=`).
 * Backing the selector with a search param keeps it in sync across
 * pages, refresh, and shareable links.
 */
export function useAirport(): [AirportCode, (next: AirportCode) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = params.get("airport");
  const airport: AirportCode = VALID_AIRPORTS.includes(raw as AirportCode)
    ? (raw as AirportCode)
    : DEFAULT_AIRPORT;

  const setAirport = React.useCallback(
    (next: AirportCode) => {
      const search = new URLSearchParams(params.toString());
      search.set("airport", next);
      router.replace(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return [airport, setAirport];
}
