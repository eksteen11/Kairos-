import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { ingestAllNews } from "@/lib/integrations/news-ingest";
import { hashUrl } from "@/lib/integrations/news-ingest";
import { scoreNewsEvent } from "@/lib/agents/news-agent";
import { predictImpacts, findTriggerNode, simulateShockwave } from "@/lib/agents/impact-engine";
import { scoreVolatilityOpportunity } from "@/lib/volatility/radar";
import { getEdges, getNodes } from "@/lib/data/queries";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const supabase = createServiceClient();
  const results = { ingested: 0, scored: 0, impacts: 0, volatility: 0, errors: [] as string[] };

  try {
    const rawNews = await ingestAllNews();
    const [nodes, edges] = await Promise.all([getNodes(), getEdges()]);

    for (const item of rawNews.slice(0, 10)) {
      try {
        const urlHash = hashUrl(item.url || item.title);
        const scores = await scoreNewsEvent(item.title, item.summary, item.source);

        if (supabase) {
          const { data: existing } = await supabase
            .from("news_events")
            .select("id")
            .eq("url_hash", urlHash)
            .maybeSingle();

          if (existing) continue;

          const { data: event, error } = await supabase
            .from("news_events")
            .insert({
              title: item.title,
              summary: scores.summary,
              source: item.source,
              url: item.url,
              url_hash: urlHash,
              published_at: item.publishedAt.toISOString(),
              impact_score: scores.impact_score,
              confidence_score: scores.confidence_score,
              urgency_score: scores.urgency_score,
              economic_importance: scores.economic_importance,
              entities: scores.entities,
              raw_payload: item.rawPayload ?? {},
              processed: false,
            })
            .select()
            .single();

          if (error || !event) {
            results.errors.push(error?.message ?? "insert failed");
            continue;
          }

          results.ingested++;

          const predictions = await predictImpacts(
            item.title,
            scores.summary,
            scores.entities,
            nodes,
            edges
          );

          for (const pred of predictions) {
            const node = nodes.find(
              (n) => n.name.toLowerCase() === pred.node_name.toLowerCase()
            );
            await supabase.from("impact_predictions").insert({
              news_event_id: event.id,
              affected_node_id: node?.id ?? null,
              effect_order: pred.effect_order,
              direction: pred.direction,
              probability: pred.probability,
              reasoning: pred.reasoning,
              time_horizon_days: pred.time_horizon_days,
            });
            results.impacts++;
          }

          const trigger = findTriggerNode(scores.entities, nodes);
          if (trigger) {
            const path = simulateShockwave(trigger.id, nodes, edges);
            await supabase.from("shockwave_simulations").insert({
              trigger_event_id: event.id,
              trigger_node_id: trigger.id,
              propagation_path: path,
              max_depth: Math.max(...path.map((p) => p.depth), 0),
              total_impact: path.reduce((s, p) => s + p.impact, 0),
            });
          }

          const tickers = scores.entities.tickers ?? [];
          for (const ticker of tickers.slice(0, 3)) {
            const node = nodes.find((n) => n.symbol === ticker);
            const signal = await scoreVolatilityOpportunity({
              symbol: ticker,
              nodeName: node?.name ?? ticker,
              macroRiskScore: scores.impact_score,
              newsEventId: event.id,
              nodeId: node?.id,
            });
            await supabase.from("volatility_signals").insert(signal);
            results.volatility++;
          }

          await supabase
            .from("news_events")
            .update({ processed: true })
            .eq("id", event.id);

          results.scored++;
        } else {
          results.ingested++;
          results.scored++;
        }
      } catch (e) {
        results.errors.push(e instanceof Error ? e.message : "unknown error");
      }
    }

    if (supabase) {
      await supabase.from("agent_runs").insert({
        agent_type: "pipeline",
        input_ref: "cron/ingest-news",
        output: results,
        duration_ms: Date.now() - start,
        status: results.errors.length ? "partial" : "success",
      });
    }

    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - start,
      demo_mode: !supabase,
      ...results,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "pipeline failed" },
      { status: 500 }
    );
  }
}
