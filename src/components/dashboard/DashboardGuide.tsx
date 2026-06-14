"use client";

import { useState } from "react";

const STEPS = [
  {
    num: "1",
    title: "Spot the event",
    where: "Left column",
    body: "Kairos scans global news and ranks what matters. The gold number is Priority Score (Impact × Urgency). Higher = act first.",
  },
  {
    num: "2",
    title: "Trace the shockwave",
    where: "Middle column",
    body: "See who gets hit first, second, and third. ▲ positive = likely rises. ▼ negative = likely falls. P% = probability.",
  },
  {
    num: "3",
    title: "Find mispriced volatility",
    where: "Right column",
    body: "When macro risk is high but options are cheap, the market hasn't caught up. That's your edge.",
  },
  {
    num: "4",
    title: "Build your trade",
    where: "Your broker",
    body: "High opportunity score + clear direction = consider calls (bullish) or puts (bearish) before the crowd prices it in.",
  },
];

const METRICS = [
  { label: "Impact", range: "0–100", meaning: "How much this event can move markets globally." },
  { label: "Urgency", range: "0–100", meaning: "How fast you need to pay attention — hours, not weeks." },
  { label: "Confidence", range: "0–100", meaning: "How sure Kairos is about the analysis." },
  { label: "Priority", range: "Gold #", meaning: "Impact × Urgency ÷ 100. Your sort order." },
  { label: "HV", range: "%", meaning: "Historical volatility — how much the stock actually moves." },
  { label: "VIX Pct", range: "0–100", meaning: "Where fear is vs the last year. Low = calm market." },
  { label: "Opp Score", range: "0–100", meaning: "Gap between real macro risk and priced volatility. Higher = bigger edge." },
];

export function DashboardGuide() {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"flow" | "metrics" | "playbook">("flow");

  if (!open) {
    return (
      <section className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--bg-panel-hover)] transition-colors"
        >
          ? How this dashboard works
        </button>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">How Kairos Works</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Read this once — then the board makes sense in 30 seconds
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
        >
          Hide guide
        </button>
      </div>

      <div className="flex border-b border-[var(--border)]">
        {(["flow", "metrics", "playbook"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--bg-panel-hover)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t === "flow" ? "4-step flow" : t === "metrics" ? "Score guide" : "Money playbook"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "flow" && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                {i < STEPS.length - 1 && (
                  <span className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] z-10">
                    →
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--accent-gold)]">{step.where}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </section>
        )}

        {tab === "metrics" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {METRICS.map((m) => (
              <div key={m.label} className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-gold)]">{m.range}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{m.meaning}</p>
              </div>
            ))}
          </section>
        )}

        {tab === "playbook" && (
          <section className="space-y-4">
            <div className="p-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">The Kairos edge</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Charts show what happened. Kairos shows what happens next — and whether options markets have priced it in yet.
                You are not trading the news. You are trading the gap between the news and what the market expects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--positive)] mb-1">Bullish setup</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Event impact 80+ · 1st-order effects ▲ positive · Opp score 75+ → Look at <strong className="text-[var(--text-primary)]">calls or call spreads</strong> on named tickers before IV rises.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--negative)] mb-1">Bearish setup</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Event impact 80+ · 1st-order effects ▼ negative · Opp score 75+ → Look at <strong className="text-[var(--text-primary)]">puts or put spreads</strong> while premiums are still cheap.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--accent-gold)] mb-1">Uncertainty setup</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  High impact but mixed direction · Low VIX percentile → Consider <strong className="text-[var(--text-primary)]">straddles/strangles</strong> — big move coming, direction unclear.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] italic">
              Kairos generates ideas only — it does not execute trades. Always size positions and define risk before entering.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}
