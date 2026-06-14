import { NextResponse } from "next/server";
import { getNewsEvents, getVolatilitySignals, getMacroPulse } from "@/lib/data/queries";
import { getImpactPredictions } from "@/lib/data/queries";

export async function GET() {
  const [events, volatility, macro] = await Promise.all([
    getNewsEvents(10),
    getVolatilitySignals(5),
    getMacroPulse(),
  ]);

  const topEvent = events[0];
  const impacts = topEvent ? await getImpactPredictions(topEvent.id) : [];

  return NextResponse.json({ events, volatility, macro, impacts, selectedEventId: topEvent?.id });
}
