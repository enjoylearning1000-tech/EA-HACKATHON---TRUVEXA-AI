"use client";

import React, { useState } from "react";
import {
  GitFork,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Check,
  RefreshCw,
} from "lucide-react";
import { DocumentItem, DocumentChunk, ContradictionFinding, ContradictionStatus } from "@/types";
import { TruvexaStore } from "@/lib/store";
import { executeContradictionScan } from "@/lib/intelligence";

interface ContradictionViewProps {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  activeWorkspaceId: string;
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
  onRefreshContradictions: () => void;
}

export default function ContradictionView({
  documents,
  chunks,
  activeWorkspaceId,
  onOpenPdf,
  onRefreshContradictions,
}: ContradictionViewProps) {
  const [contradictions, setContradictions] = useState<ContradictionFinding[]>(() =>
    TruvexaStore.getContradictions(activeWorkspaceId)
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [noteInputId, setNoteInputId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const findings = executeContradictionScan(documents, chunks, activeWorkspaceId);
      setContradictions(findings);
      TruvexaStore.setContradictions(findings);

      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Contradiction Scan Run",
        details: `Cross-analyzed ${documents.length} documents and discovered ${findings.length} factual discrepancies.`,
        type: "contradiction",
      });

      setIsScanning(false);
      onRefreshContradictions();
    }, 800);
  };

  const handleStatusUpdate = (id: string, status: ContradictionStatus) => {
    TruvexaStore.updateContradictionStatus(id, status);
    setContradictions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    onRefreshContradictions();
  };

  const handleSaveNote = (id: string) => {
    if (!noteText.trim()) return;
    TruvexaStore.updateContradictionStatus(id, undefined as any, noteText.trim());
    setContradictions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: noteText.trim() } : c))
    );
    setNoteInputId(null);
    setNoteText("");
    onRefreshContradictions();
  };

  const handleCitationClick = (docName: string, page: number, excerpt?: string) => {
    const targetDoc = documents.find((d) => d.name === docName);
    if (targetDoc) {
      onOpenPdf(targetDoc, page, excerpt);
    }
  };

  const filtered = contradictions.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-rose-400" />
            Cross-Document Contradiction Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify conflicting financial metrics, mismatched launch milestones, and divergent policy terms across uploaded files.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || documents.length < 2}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 disabled:opacity-40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "Cross-Auditing Corpus..." : "Run Cross-Document Contradiction Scan"}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-mono">Filter Status:</span>
        {(["all", "unreviewed", "confirmed", "resolved", "dismissed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-lg capitalize transition-colors font-medium ${
              filterStatus === s
                ? "bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold"
                : "bg-[#0B1F38] border border-cyan-900/40 text-slate-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Contradictions List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B1F38]/40 border border-cyan-900/40 text-white">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold">No Discrepancies Found in this View</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {documents.length < 2
              ? "Upload at least two related PDF filings to perform cross-document contradiction checks."
              : "All scanned statements are either aligned or filtered out."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-rose-500/40 bg-[#0B1F38] shadow-[0_0_30px_rgba(239,68,68,0.12)] overflow-hidden text-xs"
            >
              {/* Header Bar */}
              <div className="p-4 bg-gradient-to-r from-rose-950/60 via-[#0B1F38] to-[#0B1F38] border-b border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <div className="text-[10px] text-rose-300 font-mono tracking-wide uppercase">
                      Category: {item.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border ${
                      item.status === "confirmed"
                        ? "bg-rose-950 text-rose-300 border-rose-500/40"
                        : item.status === "resolved"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                        : item.status === "dismissed"
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : "bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Document A */}
                <div className="p-4 rounded-xl bg-[#071426] border border-cyan-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-cyan-300 font-bold mb-2">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {item.docA.name}
                      </span>
                      <span className="font-mono text-[11px] text-cyan-400">Page {item.docA.page}</span>
                    </div>

                    <div className="text-xs font-semibold text-white mb-2 pb-2 border-b border-cyan-950">
                      Assertion: {item.docA.claim}
                    </div>

                    <p className="italic text-slate-300 leading-relaxed text-xs">
                      &quot;{item.docA.excerpt}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => handleCitationClick(item.docA.name, item.docA.page, item.docA.excerpt)}
                    className="mt-4 pt-2 border-t border-cyan-950/60 text-[11px] text-[#00D4FF] hover:underline flex items-center justify-between font-mono"
                  >
                    <span>View Evidence in {item.docA.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Right Card: Document B (Conflicting) */}
                <div className="p-4 rounded-xl bg-[#071426] border border-rose-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-rose-300 font-bold mb-2">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {item.docB.name}
                      </span>
                      <span className="font-mono text-[11px] text-rose-400">Page {item.docB.page}</span>
                    </div>

                    <div className="text-xs font-semibold text-white mb-2 pb-2 border-b border-rose-950">
                      Assertion: {item.docB.claim}
                    </div>

                    <p className="italic text-slate-300 leading-relaxed text-xs">
                      &quot;{item.docB.excerpt}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => handleCitationClick(item.docB.name, item.docB.page, item.docB.excerpt)}
                    className="mt-4 pt-2 border-t border-rose-950/60 text-[11px] text-rose-400 hover:underline flex items-center justify-between font-mono"
                  >
                    <span>View Evidence in {item.docB.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* AI Explanation Panel */}
              <div className="px-4 pb-4">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold block mb-1">
                    AI Contradiction Explanation & Scope Analysis
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.explanation}</p>
                </div>

                {/* Review Notes if any */}
                {item.notes && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#071426] border border-slate-700/60 text-slate-300 text-xs">
                    <span className="font-semibold text-amber-300">Analyst Review Note:</span> {item.notes}
                  </div>
                )}

                {/* Note Input Field */}
                {noteInputId === item.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal auditor review note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#071426] border border-cyan-900 rounded-lg text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveNote(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-[#00D4FF] hover:bg-cyan-900/60 font-semibold text-xs"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setNoteInputId(null)}
                      className="px-2 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Review Actions Footer */}
              <div className="px-4 py-3 bg-[#071426] border-t border-cyan-900/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusUpdate(item.id, "confirmed")}
                    className="py-1 px-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-medium text-xs transition-colors"
                  >
                    Mark Confirmed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(item.id, "resolved")}
                    className="py-1 px-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-medium text-xs transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(item.id, "dismissed")}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium text-xs transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

                <button
                  onClick={() => {
                    setNoteInputId(item.id);
                    setNoteText(item.notes || "");
                  }}
                  className="text-xs text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{item.notes ? "Edit Note" : "Add Review Note"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
