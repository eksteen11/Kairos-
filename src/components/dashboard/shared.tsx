export function InfoTip({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[var(--border)] text-[9px] text-[var(--text-muted)] cursor-help ml-1 align-middle hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      ?
    </span>
  );
}

function scoreClass(score: number) {
  if (score >= 80) return "score-high";
  if (score >= 60) return "score-mid";
  return "score-low";
}

export function ScoreBadge({
  label,
  score,
  hint,
}: {
  label: string;
  score: number | null;
  hint?: string;
}) {
  if (score === null) return null;
  return (
    <div className="flex flex-col items-center gap-0.5" title={hint}>
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

export function PanelHeader({
  title,
  subtitle,
  hint,
}: {
  title: string;
  subtitle?: string;
  hint?: string;
}) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border)]">
      <h2 className="text-sm font-semibold inline-flex items-center">
        {title}
        {hint && <InfoTip text={hint} />}
      </h2>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
    </div>
  );
}
