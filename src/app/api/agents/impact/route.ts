import { NextResponse } from "next/server";
import { getImpactPredictions } from "@/lib/data/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const impacts = await getImpactPredictions(eventId);
  return NextResponse.json({ impacts });
}
