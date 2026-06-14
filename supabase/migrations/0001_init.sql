-- Kairos AI MVP Phase 1 Schema

create extension if not exists "uuid-ossp";

create type node_type as enum (
  'country', 'company', 'commodity', 'sector', 'etf',
  'currency', 'rate', 'bond', 'industry'
);

create type impact_direction as enum ('positive', 'negative', 'neutral');

create table economic_nodes (
  id uuid primary key default uuid_generate_v4(),
  type node_type not null,
  name text not null,
  symbol text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table economic_edges (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid not null references economic_nodes(id) on delete cascade,
  target_id uuid not null references economic_nodes(id) on delete cascade,
  relationship_type text not null,
  strength numeric(4,3) not null check (strength between 0 and 1),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  historical_accuracy numeric(4,3) default 0.5 check (historical_accuracy between 0 and 1),
  time_horizon_days int not null default 30,
  description text,
  created_at timestamptz default now(),
  unique (source_id, target_id, relationship_type)
);

create table news_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text,
  source text not null,
  url text unique,
  url_hash text unique,
  published_at timestamptz not null,
  impact_score int check (impact_score between 0 and 100),
  confidence_score int check (confidence_score between 0 and 100),
  urgency_score int check (urgency_score between 0 and 100),
  economic_importance int check (economic_importance between 0 and 100),
  entities jsonb default '{}',
  raw_payload jsonb default '{}',
  processed boolean default false,
  created_at timestamptz default now()
);

create table impact_predictions (
  id uuid primary key default uuid_generate_v4(),
  news_event_id uuid not null references news_events(id) on delete cascade,
  affected_node_id uuid references economic_nodes(id) on delete set null,
  effect_order int not null check (effect_order between 1 and 3),
  direction impact_direction not null,
  probability numeric(4,3) not null check (probability between 0 and 1),
  reasoning text,
  time_horizon_days int default 30,
  created_at timestamptz default now()
);

create table volatility_signals (
  id uuid primary key default uuid_generate_v4(),
  node_id uuid references economic_nodes(id) on delete set null,
  news_event_id uuid references news_events(id) on delete set null,
  signal_type text not null default 'opportunity',
  hv_20d numeric(8,4),
  vix_percentile numeric(5,2),
  macro_risk_score int check (macro_risk_score between 0 and 100),
  volatility_opportunity_score int check (volatility_opportunity_score between 0 and 100),
  reasoning text,
  created_at timestamptz default now()
);

create table agent_runs (
  id uuid primary key default uuid_generate_v4(),
  agent_type text not null,
  input_ref text,
  output jsonb default '{}',
  duration_ms int,
  status text not null default 'success',
  error_message text,
  created_at timestamptz default now()
);

create table shockwave_simulations (
  id uuid primary key default uuid_generate_v4(),
  trigger_event_id uuid references news_events(id) on delete cascade,
  trigger_node_id uuid references economic_nodes(id) on delete set null,
  propagation_path jsonb not null default '[]',
  max_depth int default 3,
  total_impact numeric(8,4) default 0,
  created_at timestamptz default now()
);

create index idx_news_events_published on news_events(published_at desc);
create index idx_news_events_scores on news_events(impact_score desc, urgency_score desc);
create index idx_impact_predictions_event on impact_predictions(news_event_id);
create index idx_volatility_signals_score on volatility_signals(volatility_opportunity_score desc);
create index idx_economic_edges_source on economic_edges(source_id);
create index idx_economic_edges_target on economic_edges(target_id);

alter publication supabase_realtime add table news_events;
alter publication supabase_realtime add table impact_predictions;
alter publication supabase_realtime add table volatility_signals;
