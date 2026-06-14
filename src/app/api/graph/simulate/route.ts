import { NextRequest, NextResponse } from "next/server";
import { simulateShockwave } from "@/lib/agents/impact-engine";
import { getEdges, getNodes } from "@/lib/data/queries";

export async function POST(req: NextRequest) {
  const { triggerNodeId } = await req.json();

  if (!triggerNodeId) {
    return NextResponse.json({ error: "triggerNodeId required" }, { status: 400 });
  }

  const [nodes, edges] = await Promise.all([getNodes(), getEdges()]);
  const path = simulateShockwave(triggerNodeId, nodes, edges);

  return NextResponse.json({
    path,
    maxDepth: Math.max(...path.map((p) => p.depth), 0),
    totalImpact: path.reduce((sum, p) => sum + p.impact, 0),
  });
}
