# Kairos AI

**Intelligence Before Markets Move.**

Economic Intelligence Platform — MVP Phase 1.

## Quick Start

```bash
npm install
cp .env.example .env.local   # add your keys (optional for demo mode)
npm run dev
```

Open **http://localhost:3000** — works immediately with demo data. No API keys required.

## What Works Now

- **Global Event Dashboard** — live events, impact cascade, macro pulse, volatility panel
- **Digital Twin Graph** — interactive economic network with shockwave simulation
- **Volatility Radar** — opportunity scoring from VIX + HV + macro risk
- **News Intelligence Agent** — Finnhub, FRED, SEC, RSS ingestion
- **Economic Impact Engine** — 1st/2nd/3rd order effect predictions
- **Demo mode** — full UI works without Supabase or API keys

## Setup Supabase (optional)

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `supabase/migrations/0001_init.sql` in SQL Editor
3. Add keys to `.env.local`
4. Seed graph: `npm run seed`

## API Keys (all free)

| Key | Get it from |
|-----|-------------|
| `FINNHUB_API_KEY` | [finnhub.io/register](https://finnhub.io/register) |
| `FRED_API_KEY` | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| `FMP_API_KEY` | [financialmodelingprep.com/register](https://site.financialmodelingprep.com/register) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) (for AI scoring) |

## Trigger News Pipeline

```bash
curl http://localhost:3000/api/cron/ingest-news
```

## Pages

| Route | Feature |
|-------|---------|
| `/` | Global Event Dashboard |
| `/graph` | Digital Twin Graph |
| `/volatility` | Volatility Radar |
