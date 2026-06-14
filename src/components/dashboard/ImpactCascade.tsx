import type { ImpactPrediction } from "@/types";
import { DirectionBadge } from "./shared";

const ORDER_LABELS: Record<number, string> = {
  1: "1st Order",
  2: "2nd Order",
  3: "3rd Order",
};

export function ImpactCascade({ impacts }: { impacts: ImpactPrediction[] }) {
  const grouped = [1, 2, 3].map((order) => ({
    order,
    items: impacts.filter((p) => p.effect_order === order),
  }));

  return (
    <section className="panel flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Economic Consequence Engine™</h2>
        <p className="text-xs text-[var(--text-muted)]">1st → 2nd → 3rd order effects</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {grouped.map(({ order, items }) => (
          <div key={order}>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent-gold)] mb-2">
              {ORDER_LABELS[order]}
            </h3>
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
                      <span>P: {Math.round(item.probability * 100)}%</span>
                      <span>{item.time_horizon_days}d horizon</span>
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
