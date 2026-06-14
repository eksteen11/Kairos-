"use client";

import type { NewsEvent } from "@/types";
import { PanelHeader, ScoreBadge } from "./shared";

export function EventsFeed({
  events,
  selectedId,
  onSelect,
}: {
  events: NewsEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel flex flex-col h-full overflow-hidden">
      <PanelHeader
        title="Global Event Feed"
        subtitle="Click an event — middle and right panels update"
        hint="News ranked by economic importance. Priority (gold #) = Impact × Urgency. Start with the highest number."
      />
      <div className="flex-1 overflow-y-auto">
        {events.map((event) => {
          const rank = (event.impact_score ?? 0) * (event.urgency_score ?? 0);
          const isSelected = event.id === selectedId;
          return (
            <button
              key={event.id}
              onClick={() => onSelect(event.id)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--border)] transition-colors ${
                isSelected ? "bg-[var(--bg-panel-hover)] border-l-2 border-l-[var(--accent)]" : "hover:bg-[var(--bg-panel-hover)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{event.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {event.source} · {new Date(event.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right shrink-0" title="Priority = Impact × Urgency">
                  <span className="text-lg font-mono font-semibold text-[var(--accent-gold)]">
                    {Math.round(rank / 100)}
                  </span>
                  <p className="text-[9px] uppercase text-[var(--text-muted)]">Priority</p>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <ScoreBadge label="Impact" score={event.impact_score} hint="How much markets could move" />
                <ScoreBadge label="Urgency" score={event.urgency_score} hint="How fast to react" />
                <ScoreBadge label="Confidence" score={event.confidence_score} hint="AI certainty on this read" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
