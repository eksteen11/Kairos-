"use client";

import { useCallback, useEffect, useState } from "react";
import { EventsFeed } from "@/components/dashboard/EventsFeed";
import { ImpactCascade } from "@/components/dashboard/ImpactCascade";
import { MacroPulse } from "@/components/dashboard/MacroPulse";
import { VolatilityPanel } from "@/components/dashboard/VolatilityPanel";
import type { ImpactPrediction, MacroIndicator, NewsEvent, VolatilitySignal } from "@/types";

export default function DashboardPage() {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [volatility, setVolatility] = useState<VolatilitySignal[]>([]);
  const [macro, setMacro] = useState<MacroIndicator[]>([]);
  const [impacts, setImpacts] = useState<ImpactPrediction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setEvents(data.events ?? []);
    setVolatility(data.volatility ?? []);
    setMacro(data.macro ?? []);
    setImpacts(data.impacts ?? []);
    setSelectedId(data.selectedEventId ?? data.events?.[0]?.id ?? null);
    setLoading(false);
  }, []);

  const loadImpacts = useCallback(async (eventId: string) => {
    const res = await fetch(`/api/agents/impact?eventId=${eventId}`);
    const data = await res.json();
    setImpacts(data.impacts ?? []);
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    loadImpacts(id);
  };

  const selectedEvent = events.find((e) => e.id === selectedId);

  if (loading) {
    return (
      <section className="flex items-center justify-center h-[80vh]">
        <p className="text-sm text-[var(--text-muted)] font-mono">Loading intelligence...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <MacroPulse indicators={macro} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        <div className="lg:col-span-4">
          <EventsFeed events={events} selectedId={selectedId} onSelect={handleSelect} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          {selectedEvent && (
            <section className="panel p-4">
              <h2 className="text-sm font-semibold mb-1">{selectedEvent.title}</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selectedEvent.summary}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedEvent.entities?.countries?.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] font-mono">{c}</span>
                ))}
                {selectedEvent.entities?.commodities?.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] font-mono text-[var(--accent-gold)]">{c}</span>
                ))}
              </div>
            </section>
          )}
          <ImpactCascade impacts={impacts} />
        </div>

        <div className="lg:col-span-3">
          <VolatilityPanel signals={volatility} />
        </div>
      </div>
    </section>
  );
}
