"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  GitFork,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  DocumentItem,
  ClaimVerification,
  ContradictionFinding,
  EvidenceReport,
  ActivityLog,
} from "@/types";
import { TabId } from "../Sidebar";

interface OverviewViewProps {
  documents: DocumentItem[];
  claims: ClaimVerification[];
  contradictions: ContradictionFinding[];
  reports: EvidenceReport[];
  activities: ActivityLog[];
  onSelectTab: (tab: TabId) => void;
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
}

export default function OverviewView({
  documents,
  claims,
  contradictions,
  reports,
  activities,
  onSelectTab,
  onOpenPdf,
}: OverviewViewProps) {
  const readyDocs = documents.filter((d) => d.status === "ready");
  const supportedClaims = claims.filter((c) => c.category === "Supported");
  const unreviewedContradictions = contradictions.filter((c) => c.status === "unreviewed");

  const statCards = [
    {
      label: "Uploaded Documents",
      value: documents.length,
      sub: `${readyDocs.length} Indexed & Chunked`,
      icon: FileText,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-950/20",
      tab: "library" as TabId,
    },
    {
      label: "Claims Verified",
      value: claims.length,
      sub: `${supportedClaims.length} Corroborated by Evidence`,
      icon: ShieldCheck,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/20",
      tab: "claim-verification" as TabId,
    },
    {
      label: "Cross-Doc Contradictions",
      value: contradictions.length,
      sub: `${unreviewedContradictions.length} Require Analyst Review`,
      icon: GitFork,
      color: "text-rose-400",
      border: "border-rose-500/30",
      bg: "bg-rose-950/20",
      tab: "contradictions" as TabId,
    },
    {
      label: "Intelligence Reports",
      value: reports.length,
      sub: "Exportable to PDF & CSV",
      icon: FileSpreadsheet,
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-950/20",
      tab: "reports" as TabId,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Value Proposition */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1F38] via-[#0D284C] to-[#0B1F38] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,212,255,0.1)] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
            Evidence-Backed Intelligence Active
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            TRUVEXA Evidence Hub
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            Every statement analyzed is mapped directly to indexed source chunks. Compare financial
            revisions, audit conflicting claims, and generate defensible reports.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => onSelectTab("contradictions")}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all"
            >
              <GitFork className="w-4 h-4" />
              <span>Review {contradictions.length} Flagged Contradictions</span>
            </button>
            <button
              onClick={() => onSelectTab("claim-verification")}
              className="py-2 px-4 rounded-xl bg-[#071426] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-[#00D4FF]" />
              <span>Verify Factual Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(card.tab)}
              className={`p-5 rounded-2xl bg-[#0B1F38]/80 border ${card.border} hover:border-[#00D4FF]/60 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-3 font-mono">{card.value}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                <span>{card.sub}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Evidence Health & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Indexed Documents Quick Access */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00D4FF]" />
              Active Workspace Documents
            </h3>
            <button
              onClick={() => onSelectTab("library")}
              className="text-xs text-[#00D4FF] hover:underline"
            >
              View All ({documents.length})
            </button>
          </div>

          <div className="space-y-3">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[#0B1F38]/60 border border-cyan-900/40 hover:border-cyan-500/40 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00D4FF]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {doc.pageCount} Pages · {doc.chunksCount} Chunks Indexed · {(doc.size / 1048576).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPdf(doc, 1)}
                    className="py-1 px-3 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[#00D4FF] hover:bg-cyan-900/60 text-xs font-medium transition-colors"
                  >
                    Open Viewer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Investigation Prompt */}
          <div className="p-4 rounded-xl bg-[#071426] border border-cyan-800/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Ask AI Research Assistant</div>
              <div className="text-[11px] text-slate-400">
                Ground answers across all {documents.length} loaded documents with exact page citations.
              </div>
            </div>
            <button
              onClick={() => onSelectTab("assistant")}
              className="py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] text-xs font-bold hover:opacity-95 transition-all shadow"
            >
              Open Assistant
            </button>
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Audit Activity Log
            </h3>
            <button
              onClick={() => onSelectTab("history")}
              className="text-xs text-[#00D4FF] hover:underline"
            >
              View Full History
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1F38]/60 border border-cyan-900/40 space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="text-xs pb-3 border-b border-slate-700/40 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-200">{act.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{act.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
