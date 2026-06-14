"use client";

import type { NewsEvent } from "@/types";
import { ScoreBadge } from "./shared";

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
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Global Event Feed</h2>
        <p className="text-xs text-[var(--text-muted)]">Ranked by impact × urgency</p>
      </div>
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
                <span className="text-xs font-mono text-[var(--accent-gold)] shrink-0">
                  {Math.round(rank / 100)}
                </span>
              </div>
              <div className="flex gap-4 mt-2">
                <ScoreBadge label="Impact" score={event.impact_score} />
                <ScoreBadge label="Urgency" score={event.urgency_score} />
                <ScoreBadge label="Confidence" score={event.confidence_score} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
