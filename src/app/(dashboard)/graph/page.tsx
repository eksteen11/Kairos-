"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { EconomicEdge, EconomicNode, ShockwaveStep } from "@/types";

const ForceGraph = dynamic(() => import("@/components/graph/ForceGraph"), { ssr: false });

const NODE_COLORS: Record<string, string> = {
  country: "#3b82f6",
  company: "#22c55e",
  commodity: "#d4a853",
  sector: "#a78bfa",
  etf: "#f472b6",
  currency: "#38bdf8",
  rate: "#ef4444",
  bond: "#fb923c",
  industry: "#94a3b8",
};

export default function GraphPage() {
  const [nodes, setNodes] = useState<EconomicNode[]>([]);
  const [edges, setEdges] = useState<EconomicEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<EconomicNode | null>(null);
  const [shockwave, setShockwave] = useState<ShockwaveStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((data) => {
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
        setLoading(false);
      });
  }, []);

  const handleNodeClick = useCallback(async (node: EconomicNode) => {
    setSelectedNode(node);
    const res = await fetch("/api/graph/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggerNodeId: node.id }),
    });
    const data = await res.json();
    setShockwave(data.path ?? []);
  }, []);

  if (loading) {
    return (
      <section className="flex items-center justify-center h-[80vh]">
        <p className="text-sm text-[var(--text-muted)] font-mono">Loading Digital Twin...</p>
      </section>
    );
  }

  const connectedEdges = selectedNode
    ? edges.filter((e) => e.source_id === selectedNode.id || e.target_id === selectedNode.id)
    : [];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: "calc(100vh - 100px)" }}>
      <div className="lg:col-span-9 panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold">Digital Twin of the World Economy™</h2>
          <p className="text-xs text-[var(--text-muted)]">Click a node to simulate shockwave propagation</p>
        </div>
        <ForceGraph
          nodes={nodes}
          edges={edges}
          nodeColors={NODE_COLORS}
          shockwave={shockwave}
          onNodeClick={handleNodeClick}
        />
      </div>

      <div className="lg:col-span-3 space-y-4 overflow-y-auto">
        {selectedNode && (
          <section className="panel p-4">
            <h3 className="text-sm font-semibold">{selectedNode.name}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 capitalize">{selectedNode.type}</p>
            {selectedNode.symbol && (
              <p className="text-xs font-mono text-[var(--accent-gold)] mt-1">{selectedNode.symbol}</p>
            )}
          </section>
        )}

        {shockwave.length > 0 && (
          <section className="panel">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold">Macro Shockwave Simulator™</h3>
            </div>
            <div className="p-3 space-y-1 max-h-60 overflow-y-auto">
              {shockwave.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[var(--text-muted)] w-4">{step.depth}</span>
                  <span className="flex-1">{step.nodeName}</span>
                  <span className="font-mono text-[var(--accent-gold)]">{(step.impact * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {connectedEdges.length > 0 && (
          <section className="panel">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold">Relationships</h3>
            </div>
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {connectedEdges.map((edge) => {
                const other = nodes.find(
                  (n) => n.id === (edge.source_id === selectedNode?.id ? edge.target_id : edge.source_id)
                );
                return (
                  <div key={edge.id} className="text-xs p-2 rounded bg-[var(--bg-primary)] border border-[var(--border)]">
                    <p className="font-medium">{other?.name}</p>
                    <p className="text-[var(--text-muted)] mt-0.5">{edge.description}</p>
                    <p className="font-mono text-[var(--accent-gold)] mt-1">strength: {edge.strength}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
