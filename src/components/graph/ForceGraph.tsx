"use client";

import ForceGraph2D from "react-force-graph-2d";
import { useMemo } from "react";
import type { EconomicEdge, EconomicNode, ShockwaveStep } from "@/types";

interface Props {
  nodes: EconomicNode[];
  edges: EconomicEdge[];
  nodeColors: Record<string, string>;
  shockwave: ShockwaveStep[];
  onNodeClick: (node: EconomicNode) => void;
}

export default function ForceGraph({ nodes, edges, nodeColors, shockwave, onNodeClick }: Props) {
  const shockwaveIds = useMemo(() => new Set(shockwave.map((s) => s.nodeId)), [shockwave]);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        val: shockwaveIds.has(n.id) ? 3 : 1,
        color: shockwaveIds.has(n.id) ? "#d4a853" : (nodeColors[n.type] ?? "#8b92a5"),
      })),
      links: edges.map((e) => ({
        source: e.source_id,
        target: e.target_id,
        strength: e.strength,
      })),
    }),
    [nodes, edges, nodeColors, shockwaveIds]
  );

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeColor={(n) => (n as { color: string }).color}
      nodeVal={(n) => (n as { val: number }).val}
      linkWidth={(l) => ((l as { strength: number }).strength ?? 0.5) * 2}
      linkColor={() => "rgba(139,146,165,0.3)"}
      backgroundColor="#0b0d12"
      onNodeClick={(node) => {
        const full = nodes.find((n) => n.id === (node as { id: string }).id);
        if (full) onNodeClick(full);
      }}
      width={typeof window !== "undefined" ? window.innerWidth * 0.65 : 800}
      height={typeof window !== "undefined" ? window.innerHeight - 160 : 600}
    />
  );
}
