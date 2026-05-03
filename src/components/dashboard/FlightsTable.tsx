"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatTime } from "@/lib/utils";
import type {
  DemandImpact,
  Flight,
  FlightStatus,
  SortField,
  SortOrder,
} from "@/lib/types";

interface Props {
  flights?: Flight[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  pageSize: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}

interface SortableHeaderProps {
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
  children: React.ReactNode;
}

function SortableHeader({
  field,
  currentField,
  currentOrder,
  onSort,
  align = "left",
  children,
}: SortableHeaderProps) {
  const isActive = currentField === field;
  const Icon = !isActive
    ? ArrowUpDown
    : currentOrder === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className={cn(
        "-ml-3 h-8 gap-1.5 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground",
        align === "right" && "ml-auto",
        isActive && "text-foreground",
      )}
    >
      {children}
      <Icon className="h-3 w-3" />
    </Button>
  );
}

export function FlightsTable({
  flights,
  loading,
  error,
  onRetry,
  pageSize,
  sortBy,
  sortOrder,
  onSortChange,
}: Props) {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[110px]">Flight</TableHead>
            <TableHead>
              <SortableHeader
                field="airline"
                currentField={sortBy}
                currentOrder={sortOrder}
                onSort={onSortChange}
              >
                Airline
              </SortableHeader>
            </TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>
              <SortableHeader
                field="eta"
                currentField={sortBy}
                currentOrder={sortOrder}
                onSort={onSortChange}
              >
                ETA
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                field="delay"
                currentField={sortBy}
                currentOrder={sortOrder}
                onSort={onSortChange}
              >
                Delay
              </SortableHeader>
            </TableHead>
            <TableHead>Terminal</TableHead>
            <TableHead className="hidden lg:table-cell">Aircraft</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <SortableHeader
                field="demandImpact"
                currentField={sortBy}
                currentOrder={sortOrder}
                onSort={onSortChange}
                align="right"
              >
                Demand
              </SortableHeader>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {error ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center">
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Couldn’t load flights
                  </p>
                  <p>{error.message}</p>
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="mt-2"
                    >
                      Try again
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : loading && !flights ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: 9 }).map((_, j) => (
                  <TableCell key={j} className="py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !flights || flights.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center">
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <Plane className="h-8 w-8 opacity-40" />
                  <p className="font-medium text-foreground">No flights match</p>
                  <p>Try clearing filters or adjusting your search.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            flights.map((f) => (
              <TableRow key={f.id} className="text-sm">
                <TableCell>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {f.flightNumber}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {f.airline}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-medium tracking-wide text-foreground">
                    {f.origin}
                  </span>
                </TableCell>
                <TableCell className="font-mono tabular-nums">
                  {formatTime(f.eta)}
                </TableCell>
                <TableCell>
                  <DelayPill minutes={f.delayMinutes} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  T{f.terminal}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {f.aircraft}
                </TableCell>
                <TableCell>
                  <StatusBadge status={f.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DemandBadge impact={f.demandImpact} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DelayPill({ minutes }: { minutes: number }) {
  if (minutes <= 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const isLong = minutes >= 60;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums",
        isLong
          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      )}
    >
      +{minutes}m
    </span>
  );
}

const STATUS_DOT: Record<FlightStatus, string> = {
  "On Time": "bg-emerald-500",
  Delayed: "bg-amber-500",
  Landed: "bg-muted-foreground/60",
  Scheduled: "bg-sky-500",
};

function StatusBadge({ status }: { status: FlightStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}

const DEMAND_STYLES: Record<DemandImpact, string> = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  Medium:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  High: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Peak: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

function DemandBadge({ impact }: { impact: DemandImpact }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        DEMAND_STYLES[impact],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          impact === "Peak" && "bg-rose-500",
          impact === "High" && "bg-violet-500",
          impact === "Medium" && "bg-sky-500",
          impact === "Low" && "bg-slate-400",
        )}
      />
      {impact}
    </span>
  );
}
