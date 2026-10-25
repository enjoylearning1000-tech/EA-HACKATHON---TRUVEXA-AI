"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { DocumentItem, DocumentChunk, ChatMessage, CitationItem } from "@/types";
import { TruvexaStore } from "@/lib/store";
import { executeRAGQuery } from "@/lib/intelligence";

interface AssistantViewProps {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  activeWorkspaceId: string;
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
}

export default function AssistantView({
  documents,
  chunks,
  activeWorkspaceId,
  onOpenPdf,
}: AssistantViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    TruvexaStore.getMessages(activeWorkspaceId)
  );
  const [input, setInput] = useState("");
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>("ALL");
  const [isGenerating, setIsGenerating] = useState(false);

  const sampleQuestions = [
    "What are the main differences between the 2024 and 2025 financial reports?",
    "What was the allocated budget for Project Titan?",
    "What is the company's stated security data retention policy?",
    "Did employee headcount increase or decrease between 2024 and 2025?",
  ];

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      workspaceId: activeWorkspaceId,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    TruvexaStore.addMessage(userMsg);
    setInput("");
    setIsGenerating(true);

    try {
      const settings = TruvexaStore.getSettings();
      const targetDoc = selectedDocFilter !== "ALL" ? selectedDocFilter : undefined;

      const result = await executeRAGQuery(
        query,
        chunks,
        documents,
        settings.geminiApiKey || settings.openaiApiKey,
        targetDoc
      );

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        workspaceId: activeWorkspaceId,
        role: "assistant",
        content: result.answer,
        timestamp: new Date().toISOString(),
        supportingEvidence: result.supportingEvidence,
        conflictingEvidence: result.conflictingEvidence,
        limitations: result.limitations,
        citations: result.citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      TruvexaStore.addMessage(assistantMsg);

      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "AI Research Query",
        details: `Queried: "${query.slice(0, 50)}..." with ${result.citations.length} cited pages.`,
        type: "chat",
      });
    } catch (err) {
      console.error("RAG Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCitationClick = (docName: string, page: number, excerpt?: string) => {
    const targetDoc = documents.find((d) => d.name === docName);
    if (targetDoc) {
      onOpenPdf(targetDoc, page, excerpt);
    } else {
      alert(`Source file '${docName}' not found in active workspace.`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B1F38]/80 border border-cyan-900/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00D4FF]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Grounded AI Research Assistant
            </h2>
            <p className="text-[10px] text-slate-400">
              Retrieval-Augmented Generation across {chunks.length} indexed chunks.
            </p>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Corpus:</span>
          <select
            value={selectedDocFilter}
            onChange={(e) => setSelectedDocFilter(e.target.value)}
            className="bg-[#071426] border border-cyan-900/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="ALL">All Workspace Documents ({documents.length})</option>
            {documents.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.pageCount} pgs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-[#0B1F38]/40 border border-cyan-900/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-medium shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                  : "bg-[#0B1F38] border border-cyan-800/40 text-slate-100 shadow-lg"
              }`}
            >
              {/* Role Header */}
              <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] uppercase opacity-75">
                {msg.role === "user" ? (
                  <span>You (Analyst)</span>
                ) : (
                  <span className="flex items-center gap-1 text-[#00D4FF] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> TRUVEXA Grounded Model
                  </span>
                )}
              </div>

              {/* Main Content */}
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Evidence Sections for Assistant */}
              {msg.role === "assistant" && (
                <div className="mt-4 pt-4 border-t border-cyan-900/60 space-y-3">
                  {/* Supporting Evidence */}
                  {msg.supportingEvidence && msg.supportingEvidence.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" /> Supporting Evidence Passages:
                      </div>
                      <div className="space-y-1.5">
                        {msg.supportingEvidence.map((ev, i) => (
                          <div
                            key={i}
                            onClick={() => handleCitationClick(ev.docName, ev.page, ev.excerpt)}
                            className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 text-xs hover:border-emerald-400 cursor-pointer transition-colors"
                          >
                            <span className="font-semibold text-emerald-300">
                              [{ev.docName} — Page {ev.page}]:
                            </span>{" "}
                            &quot;{ev.excerpt}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conflicting Evidence */}
                  {msg.conflictingEvidence && msg.conflictingEvidence.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Cross-Document Variance / Contradiction:
                      </div>
                      <div className="space-y-1.5">
                        {msg.conflictingEvidence.map((ev, i) => (
                          <div
                            key={i}
                            onClick={() => handleCitationClick(ev.docName, ev.page, ev.excerpt)}
                            className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-200/90 text-xs hover:border-rose-400 cursor-pointer transition-colors"
                          >
                            <span className="font-semibold text-rose-300">
                              [{ev.docName} — Page {ev.page}]:
                            </span>{" "}
                            &quot;{ev.excerpt}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Limitations */}
                  {msg.limitations && (
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-1.5">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-300">Evidence Limitations:</span>{" "}
                        {msg.limitations}
                      </div>
                    </div>
                  )}

                  {/* Clickable Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">Verify in Source:</span>
                      {msg.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCitationClick(c.docName, c.page)}
                          className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-500/40 text-[#00D4FF] hover:bg-cyan-900/60 text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{c.docName} — Pg {c.page}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0B1F38] border border-cyan-800/40 text-xs text-cyan-300">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Retrieving indexed vector chunks and synthesizing evidence citations...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-slate-500 shrink-0 text-[11px] font-mono">Suggested:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-lg bg-[#0B1F38] border border-cyan-900/60 hover:border-cyan-500/60 text-slate-300 hover:text-white shrink-0 text-xs transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Query Input Bar */}
      <div className="relative shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask any question about your uploaded documents (e.g. 'Compare revenues or deadlines between files')..."
          rows={2}
          className="w-full pl-4 pr-24 py-3 rounded-2xl bg-[#0B1F38] border border-cyan-800/60 focus:border-[#00D4FF] focus:outline-none text-xs md:text-sm text-white placeholder-slate-500 resize-none shadow-inner"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isGenerating}
          className="absolute right-3 top-3.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 disabled:opacity-40 transition-all shadow"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
