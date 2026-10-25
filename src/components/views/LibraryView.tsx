"use client";

import React, { useState } from "react";
import {
  Files,
  FileText,
  Search,
  Trash2,
  ExternalLink,
  Filter,
  ArrowUpDown,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { DocumentItem } from "@/types";
import { TruvexaStore } from "@/lib/store";
import { TabId } from "../Sidebar";

interface LibraryViewProps {
  documents: DocumentItem[];
  activeWorkspaceId: string;
  onRefreshDocs: () => void;
  onOpenPdf: (doc: DocumentItem, page?: number) => void;
  onSelectTab: (tabId: TabId) => void;
}

export default function LibraryView({
  documents,
  activeWorkspaceId,
  onRefreshDocs,
  onOpenPdf,
  onSelectTab,
}: LibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");

  const filtered = documents
    .filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size - a.size;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete document '${name}' and its indexed vector chunks?`)) {
      TruvexaStore.deleteDocument(id);
      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Document Deleted",
        details: `Removed '${name}' from index.`,
        type: "upload",
      });
      onRefreshDocs();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Files className="w-5 h-5 text-[#00D4FF]" />
            Document Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Indexed PDF corpus for the active workspace. Every document is chunked with preserved page coordinates.
          </p>
        </div>

        <button
          onClick={() => onSelectTab("upload")}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow transition-all"
        >
          <span>Upload More Documents</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#0B1F38] border border-cyan-900/80 rounded-xl text-white focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0B1F38] border border-cyan-900/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="date">Upload Date</option>
            <option value="name">File Name</option>
            <option value="size">File Size</option>
          </select>
        </div>
      </div>

      {/* Document Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B1F38]/40 border border-cyan-900/40">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Documents Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload PDFs or load the pre-verified test audit dataset to begin analyzing.
          </p>
          <button
            onClick={() => onSelectTab("upload")}
            className="mt-4 py-2 px-4 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00D4FF] text-xs font-semibold hover:bg-cyan-900/40 transition-colors"
          >
            Go to Upload Pipeline
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-cyan-900/60 bg-[#0B1F38]/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071426] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-cyan-900/60">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/30 text-slate-300">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-cyan-950/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00D4FF]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{doc.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {doc.id.slice(0, 14)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{doc.pageCount} Pages</td>
                    <td className="py-3.5 px-4 font-mono">{(doc.size / 1048576).toFixed(2)} MB</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {doc.chunksCount} chunks
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Indexed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenPdf(doc, 1)}
                          className="py-1 px-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[#00D4FF] hover:bg-cyan-900/60 font-medium transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View PDF</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
