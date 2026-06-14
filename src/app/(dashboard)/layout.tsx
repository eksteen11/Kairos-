import Link from "next/link";

const NAV = [
  { href: "/", label: "Event Dashboard" },
  { href: "/graph", label: "Digital Twin" },
  { href: "/volatility", label: "Volatility Radar" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Kairos <span className="text-[var(--accent)]">AI</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Intelligence Before Markets Move</p>
          </div>
          <nav className="flex gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-hover)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--accent-gold)]">LIVE</span>
          <div className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" />
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </section>
  );
}
