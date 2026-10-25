"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  ChevronDown,
  LogOut,
  FolderKanban,
  Check,
  Plus,
  Moon,
  Sparkles,
} from "lucide-react";
import { UserProfile, Workspace } from "@/types";
import { TruvexaStore } from "@/lib/store";

interface TopNavProps {
  user: UserProfile;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onOpenCreateWs: () => void;
}

export default function TopNav({
  user,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenSearch,
  onLogout,
  onOpenCreateWs,
}: TopNavProps) {
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <header className="h-16 bg-[#071426] border-b border-cyan-900/40 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
      {/* Brand & Workspace Selector */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B1F38] border border-[#00D4FF]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            <ShieldCheck className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-black tracking-wider text-white">
              TRUVEXA <span className="text-[#00D4FF]">AI</span>
            </div>
            <div className="text-[9px] text-cyan-300/70 font-mono tracking-widest uppercase">
              EVIDENCE INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-cyan-950 hidden md:block" />

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWsMenu(!showWsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1F38] border border-cyan-800/60 hover:border-cyan-500/60 text-xs font-medium text-white transition-all shadow-sm"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="max-w-[140px] md:max-w-[200px] truncate">
              {activeWs ? activeWs.name : "Select Workspace"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showWsMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-[#0B1F38] border border-cyan-500/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-2 z-50 text-white animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-2 py-1">
                Intelligence Workspaces
              </div>
              <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setShowWsMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      ws.id === activeWorkspaceId
                        ? "bg-cyan-950 text-[#00D4FF] border border-cyan-500/40"
                        : "hover:bg-[#071426] text-slate-300"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspaceId && <Check className="w-3.5 h-3.5 text-[#00D4FF]" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-cyan-900/60">
                <button
                  onClick={() => {
                    setShowWsMenu(false);
                    onOpenCreateWs();
                  }}
                  className="w-full py-1.5 px-2.5 text-xs text-[#00D4FF] hover:bg-cyan-950/50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-[#0B1F38] border border-slate-700/80 hover:border-[#00D4FF] rounded-lg text-xs text-slate-400 hover:text-white transition-all w-72"
      >
        <Search className="w-3.5 h-3.5 text-[#00D4FF]" />
        <span>Search claims, facts, docs...</span>
        <kbd className="ml-auto text-[10px] bg-[#071426] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">
          Ctrl+K
        </kbd>
      </button>

      {/* Right Controls: Theme + User Menu */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg bg-[#0B1F38] text-slate-300 hover:text-white"
        >
          <Search className="w-4 h-4 text-[#00D4FF]" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#0B1F38] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-[#00D4FF] flex items-center justify-center text-xs font-bold text-navy-950">
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white leading-none">{user.fullName}</div>
              <div className="text-[10px] text-cyan-300/70 font-mono mt-0.5">{user.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0B1F38] border border-cyan-500/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-2 z-50 text-white animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-cyan-900/60">
                <div className="text-xs font-bold text-white">{user.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
