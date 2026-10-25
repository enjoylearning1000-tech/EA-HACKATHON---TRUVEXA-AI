"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Workspace, DocumentItem } from "@/types";
import { TruvexaStore } from "@/lib/store";

interface WorkspacesViewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  documents: DocumentItem[];
  onSelectWorkspace: (id: string) => void;
  onRefreshWorkspaces: () => void;
}

export default function WorkspacesView({
  workspaces,
  activeWorkspaceId,
  documents,
  onSelectWorkspace,
  onRefreshWorkspaces,
}: WorkspacesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "Multi-document evidence investigation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 0,
    };

    TruvexaStore.setWorkspaces([...workspaces, newWs]);
    TruvexaStore.setActiveWorkspaceId(newWs.id);
    TruvexaStore.logActivity({
      workspaceId: newWs.id,
      action: "Workspace Created",
      details: `Created new investigation workspace: '${newWs.name}'`,
      type: "workspace",
    });

    setNewName("");
    setNewDesc("");
    setShowCreateModal(false);
    onRefreshWorkspaces();
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    const updated = workspaces.map((w) => (w.id === id ? { ...w, name: editName.trim() } : w));
    TruvexaStore.setWorkspaces(updated);
    setEditingId(null);
    onRefreshWorkspaces();
  };

  const handleDelete = (id: string, name: string) => {
    if (workspaces.length <= 1) {
      alert("At least one workspace must remain active.");
      return;
    }
    if (confirm(`Are you sure you want to delete workspace '${name}'? This will remove associated documents.`)) {
      const remaining = workspaces.filter((w) => w.id !== id);
      TruvexaStore.setWorkspaces(remaining);
      if (activeWorkspaceId === id) {
        TruvexaStore.setActiveWorkspaceId(remaining[0].id);
      }
      onRefreshWorkspaces();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#00D4FF]" />
            Intelligence Workspaces
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize multi-PDF research projects, evidence links, and contradiction scans into isolated containers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(0,212,255,0.25)] transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          const wsDocs = documents.filter((d) => d.workspaceId === ws.id);

          return (
            <div
              key={ws.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-[#0B1F38] border-cyan-400 shadow-[0_0_25px_rgba(0,212,255,0.2)]"
                  : "bg-[#0B1F38]/60 border-cyan-900/40 hover:border-cyan-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive
                          ? "bg-cyan-950 text-[#00D4FF] border border-cyan-500/50"
                          : "bg-[#071426] text-slate-400 border border-slate-700/60"
                      }`}
                    >
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-[#00D4FF] border border-cyan-500/40 font-bold">
                        Active Workspace
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(ws.id);
                        setEditName(ws.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-cyan-950/40"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        onClick={() => handleDelete(ws.id, ws.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === ws.id ? (
                  <div className="flex items-center gap-2 my-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-[#071426] border border-cyan-500 rounded text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(ws.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-sm font-bold text-white mb-1">{ws.name}</h3>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ws.description || "No specific description set."}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 font-mono">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{wsDocs.length} Documents</span>
                </div>

                {!isActive ? (
                  <button
                    onClick={() => onSelectWorkspace(ws.id)}
                    className="text-xs text-[#00D4FF] hover:underline font-medium"
                  >
                    Switch Here →
                  </button>
                ) : (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0B1F38] border border-cyan-500/40 rounded-2xl p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create Intelligence Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set up a dedicated environment for cross-verifying a new set of reports or contracts.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Q3 Vendor RFP & Audit"
                  className="w-full px-3 py-2 rounded-lg bg-[#071426] border border-slate-700 focus:border-[#00D4FF] focus:outline-none text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Cross-checking compliance and billing statements."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#071426] border border-slate-700 focus:border-[#00D4FF] focus:outline-none text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 rounded-lg bg-[#071426] text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
