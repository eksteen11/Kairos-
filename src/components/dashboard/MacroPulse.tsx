import type { MacroIndicator } from "@/types";

export function MacroPulse({ indicators }: { indicators: MacroIndicator[] }) {
  return (
    <section className="panel">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Macro Pulse</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
        {indicators.map((ind) => (
          <div key={ind.seriesId} className="bg-[var(--bg-panel)] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{ind.label}</p>
            <p className="text-xl font-mono font-semibold mt-1">
              {ind.value.toFixed(ind.unit === "index" ? 1 : 2)}
              <span className="text-xs text-[var(--text-muted)] ml-1">{ind.unit}</span>
            </p>
            <p className={`text-xs font-mono mt-0.5 ${ind.change >= 0 ? "text-[var(--negative)]" : "text-[var(--positive)]"}`}>
              {ind.change >= 0 ? "+" : ""}{ind.change.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
