import type { VolatilitySignal } from "@/types";

export function VolatilityPanel({ signals }: { signals: VolatilitySignal[] }) {
  return (
    <section className="panel flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Volatility Radar™</h2>
        <p className="text-xs text-[var(--text-muted)]">Mispriced volatility opportunities</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {signals.map((signal) => (
          <div key={signal.id} className="px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{signal.node?.name ?? signal.node?.symbol ?? "Market"}</span>
              <span className="text-lg font-mono font-semibold text-[var(--accent-gold)]">
                {signal.volatility_opportunity_score}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{signal.reasoning}</p>
            <div className="flex gap-3 mt-2 text-[10px] font-mono text-[var(--text-muted)]">
              {signal.hv_20d != null && <span>HV: {signal.hv_20d.toFixed(1)}%</span>}
              {signal.vix_percentile != null && <span>VIX Pct: {signal.vix_percentile}</span>}
              {signal.macro_risk_score != null && <span>Risk: {signal.macro_risk_score}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
