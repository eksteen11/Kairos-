import { PanelHeader } from "./shared";
import type { MacroIndicator } from "@/types";

export function MacroPulse({ indicators }: { indicators: MacroIndicator[] }) {
  return (
    <section className="panel">
      <PanelHeader
        title="Macro Pulse"
        subtitle="Background conditions — context for every trade"
        hint="VIX = market fear. Fed Funds = rate environment. CPI = inflation pressure. 10Y = bond market signal."
      />
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
