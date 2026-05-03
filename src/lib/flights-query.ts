import type {
  AirportCode,
  Flight,
  FlightsQueryParams,
  PaginationMeta,
  SortField,
  SortOrder,
} from "@/lib/types";

const DEMAND_RANK: Record<Flight["demandImpact"], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Peak: 3,
};

function compareBy(field: SortField) {
  return (a: Flight, b: Flight) => {
    switch (field) {
      case "eta":
        return new Date(a.eta).getTime() - new Date(b.eta).getTime();
      case "delay":
        return a.delayMinutes - b.delayMinutes;
      case "airline":
        return a.airline.localeCompare(b.airline);
      case "demandImpact":
        return DEMAND_RANK[a.demandImpact] - DEMAND_RANK[b.demandImpact];
    }
  };
}

export interface ApplyParams
  extends Omit<FlightsQueryParams, "airport" | "page" | "limit"> {
  page: number;
  limit: number;
}

export function applyFiltersAndSort(
  flights: Flight[],
  params: ApplyParams,
): { rows: Flight[]; pagination: PaginationMeta } {
  let rows = flights;

  if (params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    rows = rows.filter(
      (f) =>
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q),
    );
  }

  if (params.delayedOnly) {
    rows = rows.filter((f) => f.delayMinutes >= 15);
  }

  if (params.terminal && params.terminal !== "all") {
    rows = rows.filter((f) => f.terminal === params.terminal);
  }

  const cmp = compareBy(params.sortBy);
  rows = [...rows].sort((a, b) => {
    const v = cmp(a, b);
    return params.sortOrder === "asc" ? v : -v;
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * params.limit;
  const paged = rows.slice(start, start + params.limit);

  return {
    rows: paged,
    pagination: {
      page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

const VALID_AIRPORTS: AirportCode[] = ["LAX", "JFK", "SFO"];
const VALID_SORT_FIELDS: SortField[] = ["eta", "delay", "airline", "demandImpact"];
const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

export function parseQueryParams(url: URL): FlightsQueryParams {
  const params = url.searchParams;

  const airportRaw = (params.get("airport") ?? "LAX").toUpperCase();
  const airport: AirportCode = (
    VALID_AIRPORTS.includes(airportRaw as AirportCode)
      ? airportRaw
      : "LAX"
  ) as AirportCode;

  const sortByRaw = params.get("sortBy") ?? "eta";
  const sortBy: SortField = (
    VALID_SORT_FIELDS.includes(sortByRaw as SortField)
      ? sortByRaw
      : "eta"
  ) as SortField;

  const sortOrderRaw = params.get("sortOrder") ?? "asc";
  const sortOrder: SortOrder = (
    VALID_SORT_ORDERS.includes(sortOrderRaw as SortOrder)
      ? sortOrderRaw
      : "asc"
  ) as SortOrder;

  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const limit = Math.min(
    100,
    Math.max(5, Number(params.get("limit") ?? 10) || 10),
  );

  return {
    airport,
    page,
    limit,
    search: params.get("search") ?? "",
    delayedOnly: params.get("delayedOnly") === "true",
    terminal: params.get("terminal") ?? "all",
    sortBy,
    sortOrder,
  };
}
