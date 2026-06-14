import { z } from "zod";
import OpenAI from "openai";
import type { EconomicEdge, EconomicNode, ImpactDirection, ShockwaveStep } from "@/types";

export const impactSchema = z.object({
  predictions: z.array(
    z.object({
      node_name: z.string(),
      effect_order: z.number().min(1).max(3),
      direction: z.enum(["positive", "negative", "neutral"]),
      probability: z.number().min(0).max(1),
      reasoning: z.string(),
      time_horizon_days: z.number(),
    })
  ),
});

export async function predictImpacts(
  title: string,
  summary: string,
  entities: Record<string, string[] | undefined>,
  nodes: EconomicNode[],
  edges: EconomicEdge[]
): Promise<z.infer<typeof impactSchema>["predictions"]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return heuristicImpacts(title, entities, nodes, edges);
  }

  const nodeList = nodes.map((n) => `${n.name} (${n.type})`).join(", ");
  const edgeList = edges
    .slice(0, 30)
    .map((e) => {
      const src = nodes.find((n) => n.id === e.source_id)?.name ?? "?";
      const tgt = nodes.find((n) => n.id === e.target_id)?.name ?? "?";
      return `${src} → ${tgt} (${e.relationship_type}, strength: ${e.strength})`;
    })
    .join("\n");

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a macro impact analyst. Predict 1st, 2nd, and 3rd order economic effects of news events. Use the economic graph relationships. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Event: ${title}\nSummary: ${summary}\nEntities: ${JSON.stringify(entities)}\n\nGraph nodes: ${nodeList}\n\nGraph edges:\n${edgeList}\n\nReturn JSON: { predictions: [{ node_name, effect_order (1-3), direction, probability (0-1), reasoning, time_horizon_days }] }`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? '{"predictions":[]}';
  return impactSchema.parse(JSON.parse(text)).predictions;
}

function heuristicImpacts(
  title: string,
  entities: Record<string, string[] | undefined>,
  nodes: EconomicNode[],
  edges: EconomicEdge[]
) {
  const text = title.toLowerCase();
  const predictions: z.infer<typeof impactSchema>["predictions"] = [];

  const matchNode = (keyword: string) => nodes.find((n) => n.name.toLowerCase().includes(keyword));

  if (text.includes("china") || entities.countries?.includes("China")) {
    const iron = matchNode("iron");
    const copper = matchNode("copper");
    const mining = matchNode("mining");
    if (iron) predictions.push({ node_name: iron.name, effect_order: 1, direction: "positive", probability: 0.85, reasoning: "China demand directly lifts iron ore", time_horizon_days: 30 });
    if (copper) predictions.push({ node_name: copper.name, effect_order: 1, direction: "positive", probability: 0.82, reasoning: "Infrastructure spending drives copper demand", time_horizon_days: 45 });
    if (mining) predictions.push({ node_name: mining.name, effect_order: 2, direction: "positive", probability: 0.75, reasoning: "Commodity demand flows to mining sector", time_horizon_days: 60 });
  }

  if (text.includes("oil") || text.includes("opec") || entities.commodities?.includes("Crude Oil")) {
    const oil = matchNode("oil");
    const airlines = matchNode("airline");
    if (oil) predictions.push({ node_name: oil.name, effect_order: 1, direction: "positive", probability: 0.88, reasoning: "Supply constraints support crude prices", time_horizon_days: 14 });
    if (airlines) predictions.push({ node_name: airlines.name, effect_order: 2, direction: "negative", probability: 0.8, reasoning: "Higher fuel costs hurt airline margins", time_horizon_days: 30 });
  }

  if (text.includes("fed") || text.includes("rate")) {
    const banks = matchNode("bank");
    const housing = matchNode("housing");
    if (banks) predictions.push({ node_name: banks.name, effect_order: 2, direction: "positive", probability: 0.72, reasoning: "Rate stability supports bank margins", time_horizon_days: 60 });
    if (housing) predictions.push({ node_name: housing.name, effect_order: 2, direction: "positive", probability: 0.68, reasoning: "Lower rates could revive housing", time_horizon_days: 90 });
  }

  if (!predictions.length && edges.length) {
    const edge = edges[0];
    const tgt = nodes.find((n) => n.id === edge.target_id);
    if (tgt) {
      predictions.push({
        node_name: tgt.name,
        effect_order: 1,
        direction: "neutral",
        probability: 0.6,
        reasoning: `Graph-linked effect via ${edge.relationship_type}`,
        time_horizon_days: edge.time_horizon_days,
      });
    }
  }

  return predictions;
}

export function simulateShockwave(
  triggerNodeId: string,
  nodes: EconomicNode[],
  edges: EconomicEdge[],
  maxDepth = 3
): ShockwaveStep[] {
  const adjacency = new Map<string, EconomicEdge[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.source_id) ?? [];
    list.push(edge);
    adjacency.set(edge.source_id, list);
  }

  const steps: ShockwaveStep[] = [];
  const visited = new Set<string>();
  const queue: { nodeId: string; depth: number; impact: number }[] = [
    { nodeId: triggerNodeId, depth: 0, impact: 1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.nodeId) || current.depth > maxDepth) continue;
    visited.add(current.nodeId);

    const node = nodes.find((n) => n.id === current.nodeId);
    if (!node) continue;

    const direction: ImpactDirection = current.impact > 0.6 ? "positive" : current.impact < 0.4 ? "negative" : "neutral";

    steps.push({
      nodeId: current.nodeId,
      nodeName: node.name,
      depth: current.depth,
      impact: current.impact,
      direction,
    });

    const outgoing = adjacency.get(current.nodeId) ?? [];
    for (const edge of outgoing) {
      const nextImpact = current.impact * edge.strength * 0.85;
      if (nextImpact > 0.1) {
        queue.push({ nodeId: edge.target_id, depth: current.depth + 1, impact: nextImpact });
      }
    }
  }

  return steps;
}

export function findTriggerNode(
  entities: Record<string, string[] | undefined>,
  nodes: EconomicNode[]
): EconomicNode | null {
  const searchTerms = [
    ...(entities.countries ?? []),
    ...(entities.commodities ?? []),
    ...(entities.sectors ?? []),
    ...(entities.tickers ?? []),
  ];

  for (const term of searchTerms) {
    const match = nodes.find(
      (n) =>
        n.name.toLowerCase().includes(term.toLowerCase()) ||
        n.symbol?.toLowerCase() === term.toLowerCase()
    );
    if (match) return match;
  }

  return nodes.find((n) => n.type === "country") ?? nodes[0] ?? null;
}
