import type { VolatilitySignal } from "@/types";
import { PanelHeader } from "./shared";

function actionHint(signal: VolatilitySignal): string {
  const score = signal.volatility_opportunity_score ?? 0;
  const reasoning = (signal.reasoning ?? "").toLowerCase();
  if (score >= 75 && reasoning.includes("underpriced")) return "→ Consider buying volatility (calls/puts) before IV catches up";
  if (score >= 75 && reasoning.includes("overpriced")) return "→ Vol may be rich — consider selling premium or waiting";
  if (score >= 60) return "→ Worth researching options chain on this name";
  return "→ Monitor — edge not clear yet";
}

export function VolatilityPanel({ signals }: { signals: VolatilitySignal[] }) {
  return (
    <section className="panel flex flex-col h-full overflow-hidden">
      <PanelHeader
        title="Volatility Radar™"
        subtitle="Where the market is wrong about risk"
        hint="High Opp Score = macro danger is real but options are cheap (or vice versa). That's the trade."
      />
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-primary)]">
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--accent-gold)] font-semibold">How to use:</span> Pick the highest Opp Score. Check direction in the middle panel. Open your broker and compare option prices.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {signals.map((signal) => (
          <div key={signal.id} className="px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{signal.node?.name ?? signal.node?.symbol ?? "Market"}</span>
              <div className="text-right" title="Volatility Opportunity Score — higher = bigger mispricing">
                <span className="text-lg font-mono font-semibold text-[var(--accent-gold)]">
                  {signal.volatility_opportunity_score}
                </span>
                <p className="text-[9px] uppercase text-[var(--text-muted)]">Opp</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{signal.reasoning}</p>
            <p className="text-[10px] text-[var(--accent)] mt-1.5">{actionHint(signal)}</p>
            <div className="flex gap-3 mt-2 text-[10px] font-mono text-[var(--text-muted)]">
              {signal.hv_20d != null && <span title="20-day historical volatility">HV: {signal.hv_20d.toFixed(1)}%</span>}
              {signal.vix_percentile != null && <span title="VIX vs last 12 months">VIX Pct: {signal.vix_percentile}</span>}
              {signal.macro_risk_score != null && <span title="Risk from current news flow">Risk: {signal.macro_risk_score}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
