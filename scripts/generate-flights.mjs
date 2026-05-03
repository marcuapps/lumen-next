// Deterministic mock flight data generator. Run: node scripts/generate-flights.mjs
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple seeded PRNG so output is stable
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260503);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const AIRLINES = [
  { name: "United Airlines", code: "UA" },
  { name: "Delta Air Lines", code: "DL" },
  { name: "American Airlines", code: "AA" },
  { name: "Alaska Airlines", code: "AS" },
  { name: "Southwest Airlines", code: "WN" },
  { name: "JetBlue Airways", code: "B6" },
  { name: "Spirit Airlines", code: "NK" },
  { name: "Hawaiian Airlines", code: "HA" },
  { name: "Air Canada", code: "AC" },
  { name: "British Airways", code: "BA" },
  { name: "Lufthansa", code: "LH" },
  { name: "Air France", code: "AF" },
  { name: "Japan Airlines", code: "JL" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Emirates", code: "EK" },
];

const ORIGINS_BY_AIRPORT = {
  LAX: [
    "SFO", "SEA", "PDX", "LAS", "PHX", "DEN", "DFW", "ORD", "JFK", "BOS",
    "ATL", "MIA", "HNL", "OGG", "YVR", "NRT", "ICN", "LHR", "SYD", "MEX",
    "CDG", "FRA", "HKG", "SIN", "PVG", "AMS", "CUN", "GDL", "AKL", "MNL",
  ],
  JFK: [
    "LAX", "SFO", "ORD", "ATL", "MIA", "BOS", "DCA", "MCO", "FLL", "LAS",
    "SEA", "DEN", "DFW", "LHR", "CDG", "FRA", "AMS", "DUB", "MAD", "BCN",
    "FCO", "ZRH", "GRU", "EZE", "DXB", "DOH", "TLV", "NRT", "ICN", "HKG",
  ],
  SFO: [
    "LAX", "SEA", "PDX", "LAS", "PHX", "DEN", "DFW", "ORD", "JFK", "BOS",
    "ATL", "MIA", "HNL", "SAN", "YVR", "NRT", "HND", "ICN", "PVG", "TPE",
    "HKG", "SIN", "LHR", "CDG", "FRA", "AMS", "MUC", "DUB", "MEX", "GDL",
  ],
};

const TERMINALS = {
  LAX: ["1", "2", "3", "4", "5", "6", "7", "B"],
  JFK: ["1", "4", "5", "7", "8"],
  SFO: ["1", "2", "3", "I"],
};

const AIRCRAFT = [
  "Boeing 737-800",
  "Boeing 737 MAX 9",
  "Boeing 757-200",
  "Boeing 777-300ER",
  "Boeing 787-9",
  "Airbus A220-300",
  "Airbus A319",
  "Airbus A320neo",
  "Airbus A321neo",
  "Airbus A330-300",
  "Airbus A350-900",
  "Embraer E175",
  "Embraer E190",
];

// Snapshot frozen at a deterministic instant (for screenshot reproducibility)
const SNAPSHOT_TIMESTAMP = "2026-05-03T22:00:00.000Z"; // 3pm PT / 6pm ET

function pickStatus(delayMinutes, etaMs, snapMs) {
  if (etaMs < snapMs - 5 * 60_000) return "Landed";
  if (delayMinutes >= 15) return "Delayed";
  if (etaMs > snapMs + 4 * 60 * 60_000) return "Scheduled";
  return "On Time";
}

function pickDemandImpact(passengerEstimate, delayMinutes) {
  // High passenger counts + on-time/short-delay flights drive higher pickup demand
  let score = passengerEstimate / 50;
  if (delayMinutes > 30) score *= 0.7; // delayed flights spread pickups out
  if (score > 6) return "Peak";
  if (score > 4.5) return "High";
  if (score > 2.8) return "Medium";
  return "Low";
}

function buildFlight(idx, airport) {
  const airline = pick(AIRLINES);
  const origin = pick(ORIGINS_BY_AIRPORT[airport]);
  const terminal = pick(TERMINALS[airport]);
  const aircraft = pick(AIRCRAFT);
  const flightNumber = `${airline.code}${range(100, 4999)}`;

  // ETA spread across a 12-hour window centered on the snapshot,
  // weighted slightly toward the next 4 hours to make the dashboard interesting
  const snapMs = new Date(SNAPSHOT_TIMESTAMP).getTime();
  const skew = rand();
  let offsetMinutes;
  if (skew < 0.55) {
    // Next 4 hours (the "interesting" demand window)
    offsetMinutes = range(0, 240);
  } else if (skew < 0.8) {
    // Past 3 hours (already landed)
    offsetMinutes = -range(5, 180);
  } else {
    // 4-8 hours out (scheduled)
    offsetMinutes = range(240, 480);
  }
  const etaMs = snapMs + offsetMinutes * 60_000;

  // Delays: ~32% of flights are delayed
  const delayRoll = rand();
  let delayMinutes = 0;
  if (delayRoll < 0.18) delayMinutes = range(15, 35);
  else if (delayRoll < 0.28) delayMinutes = range(35, 75);
  else if (delayRoll < 0.32) delayMinutes = range(75, 150);

  const status = pickStatus(delayMinutes, etaMs, snapMs);

  // Wide-body international flights carry more passengers
  const isWideBody = /777|787|A330|A350/.test(aircraft);
  const passengerEstimate = isWideBody
    ? range(220, 340)
    : range(110, 195);

  const demandImpact = pickDemandImpact(passengerEstimate, delayMinutes);

  return {
    id: `${airport}-${String(idx).padStart(4, "0")}`,
    airport,
    flightNumber,
    airline: airline.name,
    origin,
    eta: new Date(etaMs).toISOString(),
    delayMinutes,
    terminal,
    aircraft,
    status,
    passengerEstimate,
    demandImpact,
  };
}

const flights = [];
let idx = 0;
// Distribution: LAX 80, JFK 70, SFO 65 = 215 records
const distribution = [
  ["LAX", 80],
  ["JFK", 70],
  ["SFO", 65],
];
for (const [airport, count] of distribution) {
  for (let i = 0; i < count; i++) {
    flights.push(buildFlight(++idx, airport));
  }
}

const fileContents = `// AUTO-GENERATED by scripts/generate-flights.mjs — do not edit by hand
import type { Flight } from "@/lib/types";

export { SNAPSHOT_TIMESTAMP } from "@/lib/snapshot";

export const FLIGHTS: Flight[] = ${JSON.stringify(flights, null, 2)};
`;

const outPath = resolve(__dirname, "..", "src", "data", "flights.ts");
writeFileSync(outPath, fileContents);
console.log(`Wrote ${flights.length} flights to ${outPath}`);
