import type {
  AirportCode,
  Flight,
  Insights,
  Recommendation,
  WindowBucket,
} from "@/lib/types";

const WINDOW_MINUTES = 15;

function floorToWindow(date: Date) {
  const ms = date.getTime();
  const windowMs = WINDOW_MINUTES * 60_000;
  return new Date(Math.floor(ms / windowMs) * windowMs);
}

function formatWindowLabel(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
  });
}

function tzLabel(airport: AirportCode) {
  switch (airport) {
    case "JFK":
      return "America/New_York";
    case "SFO":
    case "LAX":
    default:
      return "America/Los_Angeles";
  }
}

function formatLocal(d: Date, airport: AirportCode) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tzLabel(airport),
  });
}

/**
 * Group flights into 15-minute arrival windows starting at the snapshot time.
 * Returns a fixed-length series so the chart x-axis is stable across renders.
 */
export function buildWindowBuckets(
  flights: Flight[],
  airport: AirportCode,
  snapshot: Date,
  hoursAhead = 4,
): WindowBucket[] {
  const start = floorToWindow(snapshot);
  const buckets: WindowBucket[] = [];
  const totalWindows = (hoursAhead * 60) / WINDOW_MINUTES;

  for (let i = 0; i < totalWindows; i++) {
    const windowStart = new Date(start.getTime() + i * WINDOW_MINUTES * 60_000);
    buckets.push({
      windowStart: windowStart.toISOString(),
      label: formatLocal(windowStart, airport),
      arrivals: 0,
      delayed: 0,
      estimatedPickups: 0,
    });
  }

  for (const flight of flights) {
    const eta = new Date(flight.eta);
    if (eta < start) continue;
    const idx = Math.floor(
      (eta.getTime() - start.getTime()) / (WINDOW_MINUTES * 60_000),
    );
    if (idx < 0 || idx >= buckets.length) continue;
    const bucket = buckets[idx];
    bucket.arrivals += 1;
    if (flight.delayMinutes >= 15) bucket.delayed += 1;
    // ~38% of arriving passengers take a rideshare/taxi pickup
    bucket.estimatedPickups += Math.round(flight.passengerEstimate * 0.38);
  }

  return buckets;
}

function pickRecommendation(
  buckets: WindowBucket[],
  averageDelay: number,
): { recommendation: Recommendation; reason: string; peakWindow: string } {
  if (buckets.length === 0) {
    return {
      recommendation: "Wait 30 minutes",
      reason: "No upcoming arrivals in the next four hours.",
      peakWindow: "—",
    };
  }

  // Find the densest 30-minute window (two consecutive buckets)
  let bestIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < buckets.length - 1; i++) {
    const score = buckets[i].arrivals + buckets[i + 1].arrivals;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  const peak = buckets[bestIdx];
  const peakNext = buckets[bestIdx + 1];
  const peakArrivals = (peak?.arrivals ?? 0) + (peakNext?.arrivals ?? 0);
  const peakDelayed = (peak?.delayed ?? 0) + (peakNext?.delayed ?? 0);
  const peakWindow = peak?.label ?? "—";

  // Recommendation logic
  // - Soonest dense window starting now → head over
  // - Dense window 30+ min away → wait
  // - Lots of delays bunched up → avoid
  if (peakArrivals === 0) {
    return {
      recommendation: "Wait 30 minutes",
      reason: "No meaningful demand cluster detected in the immediate window.",
      peakWindow,
    };
  }

  const delayShare = peakDelayed / Math.max(peakArrivals, 1);
  if (delayShare > 0.55 && averageDelay > 25) {
    return {
      recommendation: "Avoid airport",
      reason: `Peak window has ${peakDelayed} of ${peakArrivals} flights delayed — pickups will be unpredictable.`,
      peakWindow,
    };
  }

  if (bestIdx === 0) {
    return {
      recommendation: "Head to airport now",
      reason: `${peakArrivals} arrivals land within 30 minutes, including ${peakDelayed} delayed flights.`,
      peakWindow,
    };
  }

  return {
    recommendation: "Wait 30 minutes",
    reason: `Peak demand starts at ${peakWindow} with ${peakArrivals} arrivals and ${peakDelayed} delays.`,
    peakWindow,
  };
}

export function computeInsights(
  flights: Flight[],
  airport: AirportCode,
  snapshot: Date,
): Insights {
  const totalArrivals = flights.length;
  const delayedFlights = flights.filter((f) => f.delayMinutes >= 15).length;
  const delaySum = flights.reduce(
    (sum, f) => sum + Math.max(f.delayMinutes, 0),
    0,
  );
  const averageDelay =
    totalArrivals > 0 ? Math.round(delaySum / totalArrivals) : 0;

  const buckets = buildWindowBuckets(flights, airport, snapshot);
  const { recommendation, reason, peakWindow } = pickRecommendation(
    buckets,
    averageDelay,
  );

  return {
    totalArrivals,
    delayedFlights,
    averageDelay,
    peakWindow,
    recommendation,
    recommendationReason: reason,
    arrivalsByWindow: buckets,
    demandByWindow: buckets,
  };
}

export { formatWindowLabel };
