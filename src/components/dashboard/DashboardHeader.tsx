"use client";

import { Plane } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { AirportCode } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const AIRPORTS: { value: AirportCode; label: string; sub: string }[] = [
  { value: "LAX", label: "LAX", sub: "Los Angeles Intl." },
  { value: "JFK", label: "JFK", sub: "John F. Kennedy" },
  { value: "SFO", label: "SFO", sub: "San Francisco Intl." },
];

interface Props {
  airport: AirportCode;
  onAirportChange: (airport: AirportCode) => void;
  snapshotTimestamp?: string;
}

export function DashboardHeader({
  airport,
  onAirportChange,
  snapshotTimestamp,
}: Props) {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Plane className="h-4 w-4 -rotate-45" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Lumen
            </h1>
            <p className="text-xs text-muted-foreground">
              Airport demand intelligence from saved flight snapshots
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Airport
            </span>
            <Select
              value={airport}
              onValueChange={(v) => onAirportChange(v as AirportCode)}
            >
              <SelectTrigger className="mt-0.5 h-9 w-[180px] font-medium">
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

          <Separator orientation="vertical" className="hidden h-10 md:block" />

          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Snapshot
            </span>
            <span className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {snapshotTimestamp ? formatDateTime(snapshotTimestamp) : "—"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
