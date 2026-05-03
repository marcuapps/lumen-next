export type AirportCode = "LAX" | "JFK" | "SFO";

export type FlightStatus = "On Time" | "Delayed" | "Landed" | "Scheduled";

export type DemandImpact = "Low" | "Medium" | "High" | "Peak";

export type Recommendation =
  | "Head to airport now"
  | "Wait 30 minutes"
  | "Avoid airport";

export interface Flight {
  id: string;
  airport: AirportCode;
  flightNumber: string;
  airline: string;
  origin: string;
  eta: string; // ISO timestamp
  delayMinutes: number;
  terminal: string;
  aircraft: string;
  status: FlightStatus;
  passengerEstimate: number;
  demandImpact: DemandImpact;
}

export type SortField = "eta" | "delay" | "airline" | "demandImpact";
export type SortOrder = "asc" | "desc";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SnapshotMeta {
  airport: AirportCode;
  timestamp: string;
}

export interface WindowBucket {
  windowStart: string; // ISO
  label: string; // e.g., "6:30 PM"
  arrivals: number;
  delayed: number;
  estimatedPickups: number;
}

export interface Insights {
  totalArrivals: number;
  delayedFlights: number;
  averageDelay: number;
  peakWindow: string; // formatted label
  recommendation: Recommendation;
  recommendationReason: string;
  arrivalsByWindow: WindowBucket[];
  demandByWindow: WindowBucket[];
}

export interface FlightsResponse {
  data: Flight[];
  pagination: PaginationMeta;
  snapshot: SnapshotMeta;
  insights: Insights;
}

export interface FlightsQueryParams {
  airport: AirportCode;
  page: number;
  limit: number;
  search: string;
  delayedOnly: boolean;
  terminal: string; // "all" or terminal id
  sortBy: SortField;
  sortOrder: SortOrder;
}
