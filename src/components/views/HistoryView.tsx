"use client";

import React, { useState } from "react";
import {
  History,
  Clock,
  Filter,
  FileText,
  ShieldAlert,
  GitFork,
  FileSpreadsheet,
  FolderKanban,
  Bot,
} from "lucide-react";
import { ActivityLog } from "@/types";

interface HistoryViewProps {
  activities: ActivityLog[];
}

export default function HistoryView({ activities }: HistoryViewProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = activities.filter((act) => {
    if (filterType === "all") return true;
    return act.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case "chat":
        return <Bot className="w-4 h-4 text-[#00D4FF]" />;
      case "verify":
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case "contradiction":
        return <GitFork className="w-4 h-4 text-rose-400" />;
      case "report":
        return <FileSpreadsheet className="w-4 h-4 text-blue-400" />;
      default:
        return <FolderKanban className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#00D4FF]" />
            Audit Analysis History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological audit log of all document uploads, queries, verifications, and contradiction flags.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          <span className="text-slate-400 text-[11px] font-mono mr-1">Filter:</span>
          {(["all", "upload", "chat", "verify", "contradiction", "report"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg capitalize text-xs transition-colors font-medium ${
                filterType === t
                  ? "bg-cyan-950 border border-cyan-500/50 text-[#00D4FF] font-bold"
                  : "bg-[#0B1F38] border border-cyan-900/40 text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-cyan-900/60 bg-[#0B1F38]/60 p-6 space-y-6 shadow-xl">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No activity records matching &quot;{filterType}&quot;.
          </div>
        ) : (
          <div className="relative border-l-2 border-cyan-900/80 ml-4 space-y-6">
            {filtered.map((act) => (
              <div key={act.id} className="relative pl-6 group">
                {/* Node Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#071426] border-2 border-[#00D4FF] flex items-center justify-center group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-xl bg-[#071426] border border-cyan-900/50 hover:border-cyan-500/40 transition-colors text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getIcon(act.type)}
                      <span className="font-bold text-white text-sm">{act.action}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {act.type}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
