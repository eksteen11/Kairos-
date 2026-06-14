function scoreClass(score: number) {
  if (score >= 80) return "score-high";
  if (score >= 60) return "score-mid";
  return "score-low";
}

export function ScoreBadge({ label, score }: { label: string; score: number | null }) {
  if (score === null) return null;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-mono font-semibold ${scoreClass(score)}`}>{score}</span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

export function DirectionBadge({ direction }: { direction: string }) {
  return (
    <span className={`text-xs font-mono uppercase direction-${direction}`}>
      {direction === "positive" ? "▲" : direction === "negative" ? "▼" : "●"} {direction}
    </span>
  );
}

export function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
    </div>
  );
}
