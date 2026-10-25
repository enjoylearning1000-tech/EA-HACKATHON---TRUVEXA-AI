"use client";

import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileUp,
  Files,
  Bot,
  ShieldAlert,
  GitFork,
  Columns2,
  Share2,
  FileSpreadsheet,
  History,
  Settings,
} from "lucide-react";

export type TabId =
  | "overview"
  | "workspaces"
  | "upload"
  | "library"
  | "assistant"
  | "claim-verification"
  | "contradictions"
  | "comparison"
  | "evidence-graph"
  | "reports"
  | "history"
  | "settings";

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  documentCount: number;
  contradictionCount: number;
  claimsCount: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  documentCount,
  contradictionCount,
  claimsCount,
}: SidebarProps) {
  const menuItems: { id: TabId; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "workspaces", label: "My Workspaces", icon: FolderKanban },
    { id: "upload", label: "Upload Documents", icon: FileUp },
    { id: "library", label: "Document Library", icon: Files, badge: documentCount },
    { id: "assistant", label: "AI Research Assistant", icon: Bot },
    { id: "claim-verification", label: "Claim Verification", icon: ShieldAlert, badge: claimsCount, badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    {
      id: "contradictions",
      label: "Contradiction Explorer",
      icon: GitFork,
      badge: contradictionCount > 0 ? `${contradictionCount} Flagged` : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
    },
    { id: "comparison", label: "Document Comparison", icon: Columns2 },
    { id: "evidence-graph", label: "Evidence Graph", icon: Share2 },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "history", label: "Analysis History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#071426] border-r border-cyan-900/40 flex flex-col shrink-0 overflow-y-auto">
      {/* Navigation Label */}
      <div className="px-4 pt-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400/80">
        Investigation Suite
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-950 to-[#0B1F38] text-[#00D4FF] border border-cyan-500/50 shadow-[0_0_15px_rgba(0,212,255,0.15)] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#0B1F38]/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-[#00D4FF]" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border shrink-0 ${
                    item.badgeColor || "bg-cyan-950 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#0B1F38] to-[#040D1A] border border-cyan-500/30 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Evidence Grounded</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Anti-hallucination guardrails active. Every response is anchored in verified PDF chunks.
        </p>
      </div>
    </aside>
  );
}
