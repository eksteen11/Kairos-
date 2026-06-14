export type NodeType =
  | "country"
  | "company"
  | "commodity"
  | "sector"
  | "etf"
  | "currency"
  | "rate"
  | "bond"
  | "industry";

export type ImpactDirection = "positive" | "negative" | "neutral";

export interface EconomicNode {
  id: string;
  type: NodeType;
  name: string;
  symbol: string | null;
  metadata: Record<string, unknown>;
}

export interface EconomicEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  strength: number;
  confidence: number;
  historical_accuracy: number;
  time_horizon_days: number;
  description: string | null;
}

export interface NewsEvent {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  url: string | null;
  published_at: string;
  impact_score: number | null;
  confidence_score: number | null;
  urgency_score: number | null;
  economic_importance: number | null;
  entities: NewsEntities;
  processed: boolean;
}

export interface NewsEntities {
  countries?: string[];
  tickers?: string[];
  commodities?: string[];
  sectors?: string[];
}

export interface ImpactPrediction {
  id: string;
  news_event_id: string;
  affected_node_id: string | null;
  effect_order: number;
  direction: ImpactDirection;
  probability: number;
  reasoning: string | null;
  time_horizon_days: number;
  node?: EconomicNode;
}

export interface VolatilitySignal {
  id: string;
  node_id: string | null;
  news_event_id: string | null;
  signal_type: string;
  hv_20d: number | null;
  vix_percentile: number | null;
  macro_risk_score: number | null;
  volatility_opportunity_score: number | null;
  reasoning: string | null;
  node?: EconomicNode;
}

export interface ShockwaveStep {
  nodeId: string;
  nodeName: string;
  depth: number;
  impact: number;
  direction: ImpactDirection;
}

export interface MacroIndicator {
  seriesId: string;
  label: string;
  value: number;
  change: number;
  unit: string;
}

export interface RawNewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  rawPayload?: Record<string, unknown>;
}
