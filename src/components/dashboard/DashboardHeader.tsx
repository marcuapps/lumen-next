"use client";

import { Plane } from "lucide-react";

import { MainNav } from "@/components/dashboard/MainNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAirport } from "@/hooks/use-airport";
import { SNAPSHOT_TIMESTAMP } from "@/lib/snapshot";
import type { AirportCode } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const AIRPORTS: { value: AirportCode; label: string; sub: string }[] = [
  { value: "LAX", label: "LAX", sub: "Los Angeles Intl." },
  { value: "JFK", label: "JFK", sub: "John F. Kennedy" },
  { value: "SFO", label: "SFO", sub: "San Francisco Intl." },
];

export function DashboardHeader() {
  const [airport, setAirport] = useAirport();

  return (
    <header className="sticky top-0 z-40 bg-app/85 backdrop-blur supports-[backdrop-filter]:bg-app/70">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <Plane className="h-4 w-4 -rotate-45" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">
              Lumen
            </h1>
            <p className="text-xs text-muted-foreground">
              Airport demand intelligence
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-self-center">
          <MainNav />
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
          <div className="rounded-full border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <span className="font-medium uppercase tracking-wider">
              Snapshot ·{" "}
            </span>
            <span className="font-mono tabular-nums text-foreground">
              {formatDateTime(SNAPSHOT_TIMESTAMP)}
            </span>
          </div>

          <Select
            value={airport}
            onValueChange={(v) => setAirport(v as AirportCode)}
          >
            <SelectTrigger className="h-9 w-[160px] rounded-full border bg-card font-medium shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AIRPORTS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.sub}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
