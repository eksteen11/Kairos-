import type { MacroIndicator, VolatilitySignal } from "@/types";
import {
  computeHistoricalVolatility,
  computePercentile,
  fetchFinnhubCandles,
  fetchFredSeries,
} from "@/lib/integrations/market-data";

export async function fetchMacroPulse(): Promise<MacroIndicator[]> {
  const series = [
    { id: "VIXCLS", label: "VIX", unit: "index" },
    { id: "FEDFUNDS", label: "Fed Funds Rate", unit: "%" },
    { id: "CPIAUCSL", label: "CPI Index", unit: "index" },
    { id: "DGS10", label: "10Y Treasury", unit: "%" },
  ];

  const results: MacroIndicator[] = [];

  for (const s of series) {
    const observations = await fetchFredSeries(s.id, 30);
    if (observations.length < 2) continue;

    const current = observations[0].value;
    const previous = observations[1].value;

    results.push({
      seriesId: s.id,
      label: s.label,
      value: current,
      change: current - previous,
      unit: s.unit,
    });
  }

  return results;
}

export async function computeVixPercentile(): Promise<number> {
  const observations = await fetchFredSeries("VIXCLS", 252);
  if (!observations.length) return 50;

  const values = observations.map((o: { value: number }) => o.value);
  return computePercentile(values, values[0]);
}

export async function computeTickerHV(symbol: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 86400;
  const candles = await fetchFinnhubCandles(symbol, thirtyDaysAgo, now);

  if (!candles?.c?.length) return 0;
  return computeHistoricalVolatility(candles.c);
}

export async function scoreVolatilityOpportunity(input: {
  symbol: string;
  nodeName: string;
  macroRiskScore: number;
  newsEventId?: string;
  nodeId?: string;
}): Promise<Omit<VolatilitySignal, "id" | "created_at">> {
  const [hv, vixPct] = await Promise.all([
    computeTickerHV(input.symbol),
    computeVixPercentile(),
  ]);

  const hvRank = hv > 0 ? Math.min(100, hv * 2) : 30;
  const mispricing = input.macroRiskScore - vixPct;
  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(mispricing * 0.4 + hvRank * 0.2 + input.macroRiskScore * 0.4)
    )
  );

  let reasoning = "";
  if (mispricing > 20) {
    reasoning = `${input.nodeName}: Macro risk (${input.macroRiskScore}) exceeds VIX percentile (${vixPct}) — volatility likely underpriced`;
  } else if (mispricing < -20) {
    reasoning = `${input.nodeName}: VIX percentile (${vixPct}) exceeds macro risk — volatility may be overpriced`;
  } else {
    reasoning = `${input.nodeName}: HV ${hv.toFixed(1)}%, VIX pct ${vixPct} — moderate opportunity`;
  }

  return {
    node_id: input.nodeId ?? null,
    news_event_id: input.newsEventId ?? null,
    signal_type: "opportunity",
    hv_20d: hv || null,
    vix_percentile: vixPct,
    macro_risk_score: input.macroRiskScore,
    volatility_opportunity_score: score,
    reasoning,
  };
}
