import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const envContent = readFileSync(".env.local", "utf8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const NODES = [
  { type: "country", name: "China", symbol: "CN" },
  { type: "country", name: "United States", symbol: "US" },
  { type: "commodity", name: "Iron Ore", symbol: "IRON" },
  { type: "commodity", name: "Copper", symbol: "HG" },
  { type: "commodity", name: "Crude Oil", symbol: "CL" },
  { type: "sector", name: "Mining", symbol: null },
  { type: "sector", name: "Airlines", symbol: null },
  { type: "sector", name: "Banks", symbol: null },
  { type: "sector", name: "Housing", symbol: null },
  { type: "sector", name: "Retail", symbol: null },
  { type: "company", name: "BHP Group", symbol: "BHP" },
  { type: "company", name: "Freeport-McMoRan", symbol: "FCX" },
  { type: "company", name: "Delta Air Lines", symbol: "DAL" },
  { type: "company", name: "JPMorgan Chase", symbol: "JPM" },
  { type: "rate", name: "Federal Funds Rate", symbol: "FEDFUNDS" },
  { type: "rate", name: "VIX", symbol: "VIXCLS" },
  { type: "industry", name: "Steel Production", symbol: null },
  { type: "industry", name: "Shipping", symbol: null },
  { type: "currency", name: "Australian Dollar", symbol: "AUD" },
  { type: "etf", name: "XLE Energy ETF", symbol: "XLE" },
];

const EDGES = [
  ["China", "Iron Ore", "demand", 0.92, "China stimulus drives iron ore demand"],
  ["China", "Copper", "demand", 0.88, "Infrastructure spending lifts copper"],
  ["Iron Ore", "Mining", "supply_chain", 0.9, "Iron ore feeds mining sector"],
  ["Copper", "Mining", "supply_chain", 0.85, "Copper demand supports miners"],
  ["Mining", "BHP Group", "earnings", 0.8, "Mining boom lifts BHP"],
  ["Mining", "Freeport-McMoRan", "earnings", 0.78, "Copper prices drive FCX"],
  ["Crude Oil", "Airlines", "cost_pressure", 0.85, "Oil prices hit airline margins"],
  ["Airlines", "Delta Air Lines", "earnings", 0.75, "Fuel costs impact Delta"],
  ["Crude Oil", "XLE Energy ETF", "correlation", 0.82, "Oil moves energy ETF"],
  ["Federal Funds Rate", "Banks", "policy", 0.9, "Rate hikes affect bank margins"],
  ["Banks", "Housing", "lending", 0.85, "Banks finance housing"],
  ["Housing", "Retail", "wealth_effect", 0.7, "Housing wealth drives retail"],
  ["Banks", "JPMorgan Chase", "earnings", 0.8, "Rate environment impacts JPM"],
  ["United States", "Federal Funds Rate", "policy", 0.95, "Fed sets rates"],
  ["Federal Funds Rate", "VIX", "volatility", 0.75, "Rate uncertainty lifts VIX"],
  ["Copper", "Australian Dollar", "currency_link", 0.72, "Copper lifts commodity currencies"],
  ["China", "Steel Production", "demand", 0.86, "China drives steel demand"],
  ["China", "Shipping", "demand", 0.8, "Export demand lifts shipping"],
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase.from("economic_nodes").select("id").limit(1);
  if (existing?.length) {
    console.log("Graph already has data, skipping seed");
    return;
  }

  const { data: insertedNodes, error } = await supabase
    .from("economic_nodes")
    .insert(NODES.map((n) => ({ ...n, metadata: {} })))
    .select();

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  const nameToId = new Map(insertedNodes!.map((n) => [n.name, n.id]));
  let edgeCount = 0;

  for (const [src, tgt, type, strength, desc] of EDGES) {
    const sourceId = nameToId.get(src);
    const targetId = nameToId.get(tgt);
    if (!sourceId || !targetId) continue;

    const { error: eErr } = await supabase.from("economic_edges").insert({
      source_id: sourceId,
      target_id: targetId,
      relationship_type: type,
      strength,
      confidence: strength - 0.05,
      historical_accuracy: 0.75,
      time_horizon_days: 30,
      description: desc,
    });
    if (!eErr) edgeCount++;
  }

  console.log(`Seeded ${insertedNodes!.length} nodes, ${edgeCount} edges`);
}

main();
