"use client";

import { useEffect, useState } from "react";
import { VolatilityPanel } from "@/components/dashboard/VolatilityPanel";
import { MacroPulse } from "@/components/dashboard/MacroPulse";
import type { MacroIndicator, VolatilitySignal } from "@/types";

export default function VolatilityPage() {
  const [signals, setSignals] = useState<VolatilitySignal[]>([]);
  const [macro, setMacro] = useState<MacroIndicator[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setSignals(data.volatility ?? []);
        setMacro(data.macro ?? []);
      });
  }, []);

  return (
    <section className="space-y-4">
      <div className="panel p-4">
        <h2 className="text-lg font-semibold">Volatility Radar™</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Identifies future volatility before options markets fully price it.
          Scores based on VIX percentile, historical volatility, and macro risk signals.
        </p>
        <p className="text-xs text-[var(--accent-gold)] mt-2 font-mono">
          Note: MVP uses proxy scoring (VIX + HV + macro risk). True IV rank requires paid options data.
        </p>
      </div>

      <MacroPulse indicators={macro} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: "400px" }}>
        <VolatilityPanel signals={signals} />
        <section className="panel p-4">
          <h3 className="text-sm font-semibold mb-3">Scoring Methodology</h3>
          <div className="space-y-3 text-xs text-[var(--text-muted)] leading-relaxed">
            <p><strong className="text-[var(--text-primary)]">VIX Percentile</strong> — Where current VIX sits vs 252-day history</p>
            <p><strong className="text-[var(--text-primary)]">Historical Volatility</strong> — 20-day HV from daily price candles</p>
            <p><strong className="text-[var(--text-primary)]">Macro Risk Score</strong> — News impact score from Intelligence Agent</p>
            <p><strong className="text-[var(--text-primary)]">Opportunity Score</strong> — Gap between macro risk and priced volatility</p>
          </div>
        </section>
      </div>
    </section>
  );
}
