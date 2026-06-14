import { createServiceClient, isSupabaseConfigured } from "@/lib/db/supabase";
import {
  DEMO_EDGES,
  DEMO_IMPACTS,
  DEMO_MACRO,
  DEMO_NEWS,
  DEMO_NODES,
  DEMO_VOLATILITY,
} from "@/lib/demo/data";
import type { EconomicEdge, EconomicNode, ImpactPrediction, MacroIndicator, NewsEvent, VolatilitySignal } from "@/types";

export async function getNodes(): Promise<EconomicNode[]> {
  const supabase = createServiceClient();
  if (!supabase) return DEMO_NODES;

  const { data } = await supabase.from("economic_nodes").select("*").order("name");
  return data?.length ? data : DEMO_NODES;
}

export async function getEdges(): Promise<EconomicEdge[]> {
  const supabase = createServiceClient();
  if (!supabase) return DEMO_EDGES;

  const { data } = await supabase.from("economic_edges").select("*");
  return data?.length ? data : DEMO_EDGES;
}

export async function getNewsEvents(limit = 20): Promise<NewsEvent[]> {
  const supabase = createServiceClient();
  if (!supabase) return DEMO_NEWS.slice(0, limit);

  const { data } = await supabase
    .from("news_events")
    .select("*")
    .order("impact_score", { ascending: false })
    .limit(limit);

  return data?.length ? data : DEMO_NEWS.slice(0, limit);
}

export async function getImpactPredictions(eventId: string): Promise<ImpactPrediction[]> {
  const supabase = createServiceClient();
  if (!supabase) {
    return DEMO_IMPACTS.filter((p) => p.news_event_id === eventId);
  }

  const { data } = await supabase
    .from("impact_predictions")
    .select("*, node:economic_nodes(*)")
    .eq("news_event_id", eventId)
    .order("effect_order");

  if (data?.length) {
    return data.map((d) => ({ ...d, node: d.node as EconomicNode | undefined }));
  }

  return DEMO_IMPACTS.filter((p) => p.news_event_id === eventId);
}

export async function getVolatilitySignals(limit = 10): Promise<VolatilitySignal[]> {
  const supabase = createServiceClient();
  if (!supabase) return DEMO_VOLATILITY.slice(0, limit);

  const { data } = await supabase
    .from("volatility_signals")
    .select("*, node:economic_nodes(*)")
    .order("volatility_opportunity_score", { ascending: false })
    .limit(limit);

  if (data?.length) {
    return data.map((d) => ({ ...d, node: d.node as EconomicNode | undefined }));
  }

  return DEMO_VOLATILITY.slice(0, limit);
}

export async function getMacroPulse(): Promise<MacroIndicator[]> {
  if (!isSupabaseConfigured() && !process.env.FRED_API_KEY) {
    return DEMO_MACRO;
  }

  try {
    const { fetchMacroPulse } = await import("@/lib/volatility/radar");
    const live = await fetchMacroPulse();
    return live.length ? live : DEMO_MACRO;
  } catch {
    return DEMO_MACRO;
  }
}
