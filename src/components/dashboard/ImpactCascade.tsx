import type { ImpactPrediction } from "@/types";
import { DirectionBadge, PanelHeader } from "./shared";

const ORDER_LABELS: Record<number, { label: string; explain: string }> = {
  1: { label: "1st Order", explain: "Direct hit — happens immediately" },
  2: { label: "2nd Order", explain: "Ripple effect — follows within weeks" },
  3: { label: "3rd Order", explain: "Downstream — often where the trade is" },
};

export function ImpactCascade({ impacts }: { impacts: ImpactPrediction[] }) {
  const grouped = [1, 2, 3].map((order) => ({
    order,
    items: impacts.filter((p) => p.effect_order === order),
  }));

  return (
    <section className="panel flex flex-col h-full overflow-hidden">
      <PanelHeader
        title="Economic Consequence Engine™"
        subtitle="If this happens → what happens next"
        hint="Traces shockwaves through the global economy. ▲ = likely rises, ▼ = likely falls. P% = probability it plays out."
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {grouped.map(({ order, items }) => (
          <div key={order}>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent-gold)] mb-0.5">
              {ORDER_LABELS[order].label}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-2">{ORDER_LABELS[order].explain}</p>
            {items.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No effects predicted</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="p-3 rounded-md bg-[var(--bg-primary)] border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.node?.name ?? "Unknown"}</span>
                      <DirectionBadge direction={item.direction} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.reasoning}</p>
                    <div className="flex gap-3 mt-2 text-[10px] font-mono text-[var(--text-muted)]">
                      <span title="Probability this effect occurs">P: {Math.round(item.probability * 100)}%</span>
                      <span title="Expected time until effect shows">{item.time_horizon_days}d horizon</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
