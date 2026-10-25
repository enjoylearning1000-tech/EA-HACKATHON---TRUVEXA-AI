"use client";

import React, { useState, useMemo } from "react";
import {
  Share2,
  Filter,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
} from "lucide-react";
import {
  DocumentItem,
  ClaimVerification,
  ContradictionFinding,
  GraphNode,
  GraphEdge,
} from "@/types";

interface EvidenceGraphViewProps {
  documents: DocumentItem[];
  claims: ClaimVerification[];
  contradictions: ContradictionFinding[];
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
}

export default function EvidenceGraphView({
  documents,
  claims,
  contradictions,
  onOpenPdf,
}: EvidenceGraphViewProps) {
  const [filterRel, setFilterRel] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Generate graph nodes and edges from real database records
  const { nodes, edges } = useMemo(() => {
    const nList: GraphNode[] = [];
    const eList: GraphEdge[] = [];

    // Document Nodes (Center-Left)
    documents.forEach((doc, idx) => {
      nList.push({
        id: `node_doc_${doc.id}`,
        label: doc.name.replace(".pdf", ""),
        type: "document",
        sourceDoc: doc.name,
        page: 1,
        snippet: `${doc.pageCount} pages, ${doc.chunksCount} indexed vector chunks`,
        x: 180,
        y: 140 + idx * 220,
      });
    });

    // Claim Nodes (Center-Right)
    claims.forEach((claim, idx) => {
      const claimNodeId = `node_claim_${claim.id}`;
      nList.push({
        id: claimNodeId,
        label: claim.claimText.slice(0, 36) + "...",
        type: "claim",
        category: claim.category,
        snippet: claim.explanation,
        x: 540,
        y: 100 + idx * 160,
      });

      // Supporting Edges from Documents
      claim.supportingEvidence.forEach((ev) => {
        const targetDoc = documents.find((d) => d.name === ev.docName);
        if (targetDoc) {
          eList.push({
            id: `edge_${targetDoc.id}_${claim.id}`,
            source: `node_doc_${targetDoc.id}`,
            target: claimNodeId,
            relation: "supports",
            label: `Supports (Pg ${ev.page})`,
          });
        }
      });

      // Contradicting Edges
      claim.contradictingEvidence.forEach((ev) => {
        const targetDoc = documents.find((d) => d.name === ev.docName);
        if (targetDoc) {
          eList.push({
            id: `edge_contra_${targetDoc.id}_${claim.id}`,
            source: `node_doc_${targetDoc.id}`,
            target: claimNodeId,
            relation: "contradicts",
            label: `Contradicts (Pg ${ev.page})`,
          });
        }
      });
    });

    // Contradiction Nodes (Bottom Right)
    contradictions.forEach((ctrd, idx) => {
      const ctrdNodeId = `node_ctrd_${ctrd.id}`;
      nList.push({
        id: ctrdNodeId,
        label: ctrd.title,
        type: "contradiction",
        category: ctrd.category,
        snippet: ctrd.explanation,
        x: 880,
        y: 160 + idx * 190,
      });

      const docANode = documents.find((d) => d.name === ctrd.docA.name);
      const docBNode = documents.find((d) => d.name === ctrd.docB.name);

      if (docANode) {
        eList.push({
          id: `edge_c_a_${ctrd.id}`,
          source: `node_doc_${docANode.id}`,
          target: ctrdNodeId,
          relation: "contradicts",
          label: `${ctrd.docA.claim} (Pg ${ctrd.docA.page})`,
        });
      }
      if (docBNode) {
        eList.push({
          id: `edge_c_b_${ctrd.id}`,
          source: `node_doc_${docBNode.id}`,
          target: ctrdNodeId,
          relation: "contradicts",
          label: `${ctrd.docB.claim} (Pg ${ctrd.docB.page})`,
        });
      }
    });

    return { nodes: nList, edges: eList };
  }, [documents, claims, contradictions]);

  const filteredEdges = edges.filter((e) => {
    if (filterRel === "all") return true;
    return e.relation === filterRel;
  });

  const getNodeColor = (node: GraphNode) => {
    if (node.type === "document") return "#2563EB"; // Blue
    if (node.type === "contradiction") return "#EF4444"; // Red
    if (node.type === "claim") {
      if (node.category === "Supported") return "#10B981"; // Green
      if (node.category === "Contradicted") return "#EF4444"; // Red
      return "#F59E0B"; // Amber
    }
    return "#00D4FF"; // Cyan
  };

  const getEdgeStroke = (relation: string) => {
    if (relation === "supports") return "#10B981";
    if (relation === "contradicts") return "#EF4444";
    if (relation === "references") return "#00D4FF";
    return "#8B5CF6";
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#00D4FF]" />
            Interactive Evidence Graph
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize topological linkages between raw PDF filings, extracted claims, and conflicting statements.
          </p>
        </div>

        {/* Filter Relations */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Edge Relation:
          </span>
          <select
            value={filterRel}
            onChange={(e) => setFilterRel(e.target.value)}
            className="bg-[#0B1F38] border border-cyan-900 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="all">All Relations ({edges.length})</option>
            <option value="supports">Supports (Green)</option>
            <option value="contradicts">Contradicts (Red)</option>
          </select>
        </div>
      </div>

      {/* Main Canvas Area + Side Inspector */}
      <div className="relative h-[620px] rounded-2xl bg-[#040D1A] border border-cyan-900/60 overflow-hidden shadow-2xl flex">
        {/* Canvas SVG */}
        <div className="flex-1 relative overflow-hidden cursor-crosshair">
          {/* Zoom controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#0B1F38]/90 border border-cyan-800/60 px-2.5 py-1.5 rounded-xl shadow-lg">
            <button
              onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
              className="text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-cyan-300 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
              className="text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="text-slate-400 hover:text-white ml-1 border-l border-cyan-900 pl-1.5"
              title="Reset"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Viewport */}
          <svg
            className="w-full h-full select-none"
            viewBox="0 0 1100 700"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
          >
            <defs>
              <marker id="arrowSupports" markerWidth="8" markerHeight="8" refX="16" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#10B981" />
              </marker>
              <marker id="arrowContradicts" markerWidth="8" markerHeight="8" refX="16" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#EF4444" />
              </marker>
            </defs>

            {/* Connecting Edges */}
            {filteredEdges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.source);
              const trgNode = nodes.find((n) => n.id === edge.target);
              if (!srcNode || !trgNode) return null;
              const sx = srcNode.x ?? 100;
              const sy = srcNode.y ?? 100;
              const tx = trgNode.x ?? 500;
              const ty = trgNode.y ?? 500;

              const isHighlighted =
                selectedNode && (selectedNode.id === srcNode.id || selectedNode.id === trgNode.id);

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`}
                    fill="none"
                    stroke={getEdgeStroke(edge.relation)}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    strokeDasharray={edge.relation === "contradicts" ? "6 3" : undefined}
                    opacity={isHighlighted ? 1 : 0.65}
                    markerEnd={edge.relation === "supports" ? "url(#arrowSupports)" : "url(#arrowContradicts)"}
                  />
                  {/* Midpoint Label */}
                  {edge.label && (
                    <text
                      x={(sx + tx) / 2}
                      y={(sy + ty) / 2 - 6}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const nodeColor = getNodeColor(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer Glow Ring */}
                  <circle
                    r={isSelected ? 32 : 24}
                    fill={nodeColor}
                    fillOpacity="0.15"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 2.5 : 1}
                    className="transition-all"
                  />

                  {/* Inner Solid Hub */}
                  <circle r={14} fill={nodeColor} />

                  {/* Node Label */}
                  <text
                    y={38}
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="drop-shadow"
                  >
                    {node.label}
                  </text>
                  <text
                    y={50}
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.type.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 bg-[#071426] border-l border-cyan-900/80 p-5 flex flex-col justify-between text-xs text-white z-10 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#00D4FF]">
                  Node Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              <h4 className="font-bold text-sm text-white mb-1">{selectedNode.label}</h4>
              <div className="text-[10px] font-mono text-cyan-300 uppercase mb-3">
                Type: {selectedNode.type} {selectedNode.category && `(${selectedNode.category})`}
              </div>

              <div className="p-3 rounded-xl bg-[#0B1F38] border border-cyan-900/60 text-slate-300 leading-relaxed text-xs">
                <span className="font-semibold text-white block mb-1">Evidence Summary:</span>
                {selectedNode.snippet || "No direct snippet attached."}
              </div>
            </div>

            {selectedNode.sourceDoc && (
              <button
                onClick={() => {
                  const doc = documents.find((d) => d.name === selectedNode.sourceDoc);
                  if (doc) onOpenPdf(doc, selectedNode.page || 1);
                }}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <span>Open in PDF Viewer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
