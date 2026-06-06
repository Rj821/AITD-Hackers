"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

const backendUrl = "http://localhost:8000";

interface GraphNodeData {
  label: string;
  description: string;
  source: string;
  category: string;
}

interface GraphResponse {
  nodes: Array<{ id: string; label: string; description: string; category: string; source: string }>;
  edges: Array<{ id: string; source: string; target: string; label: string }>;
}

const categoryStyles: Record<string, string> = {
  incident: "bg-rose-600 text-rose-100 border-rose-500",
  decision: "bg-emerald-600 text-emerald-100 border-emerald-500",
  meeting: "bg-sky-600 text-sky-100 border-sky-500",
  feedback: "bg-violet-600 text-violet-100 border-violet-500",
  documentation: "bg-amber-600 text-amber-100 border-amber-500",
  general: "bg-slate-700 text-slate-100 border-slate-500",
};

function MemoryCardNode({ data }: { data: GraphNodeData }) {
  return (
    <div className="rounded-3xl border p-4 shadow-xl shadow-slate-950/20">
      <Handle type="target" position={Position.Top} className="!bg-sky-400" />
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${categoryStyles[data.category]}`}>
          {data.category}
        </span>
        <span className="text-xs text-slate-400">{data.source}</span>
      </div>
      <div className="mt-4 text-sm font-semibold leading-6 text-slate-100">{data.label}</div>
      <p className="mt-3 text-xs leading-5 text-slate-400">{data.description}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-sky-400" />
    </div>
  );
}

const nodeTypes = { memoryCard: MemoryCardNode };

export default function KnowledgeGraph() {
  const [graph, setGraph] = useState<GraphResponse>({ nodes: [], edges: [] });

  useEffect(() => {
    const fetchGraph = async () => {
      const response = await fetch(`${backendUrl}/graph`);
      if (response.ok) {
        setGraph(await response.json());
      }
    };
    fetchGraph();
  }, []);

  const nodes = useMemo<Node<GraphNodeData>[]>(() => {
    return graph.nodes.map((node, index) => ({
      id: node.id,
      type: "memoryCard",
      data: {
        label: node.label,
        description: node.description,
        source: node.source,
        category: node.category,
      },
      position: { x: (index % 2) * 420, y: Math.floor(index / 2) * 220 },
      draggable: false,
    }));
  }, [graph.nodes]);

  const edges = useMemo<Edge[]>(() => {
    return graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: "#38bdf8" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#38bdf8",
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: "#0f172a", color: "#f8fafc", fillOpacity: 0.85 },
    }));
  }, [graph.edges]);

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
      <h2 className="text-2xl font-semibold text-slate-100">Knowledge Graph</h2>
      <p className="mt-2 text-slate-400">Visualize how incidents, decisions, and documentation connect across your organization.</p>
      <div className="mt-6 h-[560px] rounded-3xl bg-slate-950/95">
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView attributionPosition="bottom-left">
            <Background color="#334155" gap={16} />
            <MiniMap nodeStrokeColor="#334155" nodeColor="#0f172a" nodeBorderRadius={12} />
            <Controls showZoom={true} showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </section>
  );
}
