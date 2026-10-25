"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  ShieldAlert,
  GitFork,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import {
  DocumentItem,
  ClaimVerification,
  ContradictionFinding,
  EvidenceReport,
} from "@/types";
import { TabId } from "./Sidebar";

interface GlobalSearchModalProps {
  documents: DocumentItem[];
  claims: ClaimVerification[];
  contradictions: ContradictionFinding[];
  reports: EvidenceReport[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: TabId) => void;
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
}

export default function GlobalSearchModal({
  documents,
  claims,
  contradictions,
  reports,
  isOpen,
  onClose,
  onSelectTab,
  onOpenPdf,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Documents
  const matchedDocs = q
    ? documents.filter(
        (d) => d.name.toLowerCase().includes(q) || d.extractedText.toLowerCase().includes(q)
      )
    : [];

  // Search Claims
  const matchedClaims = q
    ? claims.filter(
        (c) => c.claimText.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q)
      )
    : [];

  // Search Contradictions
  const matchedContradictions = q
    ? contradictions.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.explanation.toLowerCase().includes(q) ||
          c.docA.claim.toLowerCase().includes(q) ||
          c.docB.claim.toLowerCase().includes(q)
      )
    : [];

  // Search Reports
  const matchedReports = q
    ? reports.filter(
        (r) => r.title.toLowerCase().includes(q) || r.executiveSummary.toLowerCase().includes(q)
      )
    : [];

  const totalMatches =
    matchedDocs.length + matchedClaims.length + matchedContradictions.length + matchedReports.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0B1F38] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,212,255,0.2)] text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 bg-[#071426] border-b border-cyan-900/60 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#00D4FF]" />
          <input
            type="text"
            placeholder="Search across all documents, claims, contradictions, and reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {!q && (
            <div className="text-center py-8 text-slate-500">
              <p>Type keywords to search across the entire intelligence repository.</p>
              <div className="flex justify-center gap-2 mt-3 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Revenue</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Budget</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Titan</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Retention</span>
              </div>
            </div>
          )}

          {q && totalMatches === 0 && (
            <div className="text-center py-8 text-slate-400">
              No matching records found for &quot;{query}&quot;.
            </div>
          )}

          {/* Matched Documents */}
          {matchedDocs.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documents ({matchedDocs.length})
              </div>
              <div className="space-y-1.5">
                {matchedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onOpenPdf(doc, 1);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#071426] border border-cyan-900/60 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{doc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {doc.pageCount} Pages · {doc.chunksCount} Indexed Chunks
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Contradictions */}
          {matchedContradictions.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5" /> Contradiction Findings ({matchedContradictions.length})
              </div>
              <div className="space-y-1.5">
                {matchedContradictions.map((ctrd) => (
                  <div
                    key={ctrd.id}
                    onClick={() => {
                      onSelectTab("contradictions");
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-400 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-rose-300">{ctrd.title}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{ctrd.explanation}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Claims */}
          {matchedClaims.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Verified Claims ({matchedClaims.length})
              </div>
              <div className="space-y-1.5">
                {matchedClaims.map((cl) => (
                  <div
                    key={cl.id}
                    onClick={() => {
                      onSelectTab("claim-verification");
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-emerald-300">&quot;{cl.claimText}&quot;</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{cl.explanation}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Reports */}
          {matchedReports.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Intelligence Reports ({matchedReports.length})
              </div>
              <div className="space-y-1.5">
                {matchedReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      onSelectTab("reports");
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#071426] border border-blue-900/60 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-blue-300">{rep.title}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{rep.executiveSummary}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
