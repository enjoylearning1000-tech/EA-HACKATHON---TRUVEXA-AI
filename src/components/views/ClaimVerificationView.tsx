"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  Search,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { DocumentItem, DocumentChunk, ClaimVerification, VerificationCategory } from "@/types";
import { TruvexaStore } from "@/lib/store";
import { executeClaimVerification } from "@/lib/intelligence";
import { SAMPLE_CLAIMS_FOR_CLICK } from "@/lib/sampleData";

interface ClaimVerificationViewProps {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  activeWorkspaceId: string;
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
  onRefreshClaims: () => void;
}

export default function ClaimVerificationView({
  documents,
  chunks,
  activeWorkspaceId,
  onOpenPdf,
  onRefreshClaims,
}: ClaimVerificationViewProps) {
  const [claimInput, setClaimInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeResult, setActiveResult] = useState<ClaimVerification | null>(null);
  const [verifiedList, setVerifiedList] = useState<ClaimVerification[]>(() =>
    TruvexaStore.getVerifications(activeWorkspaceId)
  );

  const handleVerify = async (textToVerify?: string) => {
    const claim = (textToVerify || claimInput).trim();
    if (!claim || isVerifying) return;

    setIsVerifying(true);
    try {
      const result = await executeClaimVerification(claim, chunks, activeWorkspaceId);
      setActiveResult(result);
      TruvexaStore.addVerification(result);
      setVerifiedList((prev) => [result, ...prev.filter((v) => v.id !== result.id)]);

      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Claim Verified",
        details: `Classified claim as [${result.category}]: "${claim.slice(0, 45)}..."`,
        type: "verify",
      });

      onRefreshClaims();
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const getCategoryBadge = (cat: VerificationCategory) => {
    switch (cat) {
      case "Supported":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            SUPPORTED BY EVIDENCE
          </span>
        );
      case "Contradicted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold font-mono">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            CONTRADICTED BY PRIMARY EVIDENCE
          </span>
        );
      case "Partially Supported":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            PARTIALLY SUPPORTED
          </span>
        );
      case "Insufficient Evidence":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            INSUFFICIENT EVIDENCE
          </span>
        );
    }
  };

  const handleCitationClick = (docName: string, page: number, excerpt?: string) => {
    const targetDoc = documents.find((d) => d.name === docName);
    if (targetDoc) {
      onOpenPdf(targetDoc, page, excerpt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#00D4FF]" />
            AI Claim Verification Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test factual statements against your indexed documents. Classifies support status with line-level citations.
          </p>
        </div>
      </div>

      {/* Claim Input Box */}
      <div className="p-5 rounded-2xl bg-[#0B1F38] border border-cyan-800/60 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
            Input Factual Claim or Paragraph
          </label>
          <div className="relative">
            <textarea
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value)}
              placeholder="e.g. 'ApexCorp reported an annual revenue of ₹120 Crore in fiscal year 2024.'"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#071426] border border-cyan-900 focus:border-[#00D4FF] focus:outline-none text-xs md:text-sm text-white placeholder-slate-500 resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Clickable Quick Test Claims */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Quick Test Claims:</span>
          {SAMPLE_CLAIMS_FOR_CLICK.map((claim, idx) => (
            <button
              key={idx}
              onClick={() => {
                setClaimInput(claim);
                handleVerify(claim);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-900/80 hover:border-cyan-500/60 text-slate-300 hover:text-white transition-colors truncate max-w-xs"
            >
              {claim}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleVerify()}
            disabled={!claimInput.trim() || isVerifying}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,212,255,0.25)]"
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Run Fact Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Verification Assessment Result */}
      {activeResult && (
        <div className="p-6 rounded-2xl bg-[#0B1F38] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,212,255,0.15)] space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-900/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                Factual Assessment Report
              </span>
              <h3 className="text-base font-bold text-white italic">
                &quot;{activeResult.claimText}&quot;
              </h3>
            </div>
            <div>{getCategoryBadge(activeResult.category)}</div>
          </div>

          {/* AI Explanation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Analysis Rationale
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {activeResult.explanation}
            </p>
          </div>

          {/* Supporting Evidence Excerpts */}
          {activeResult.supportingEvidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Supporting Evidence Passages
              </h4>
              <div className="space-y-2">
                {activeResult.supportingEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCitationClick(ev.docName, ev.page, ev.excerpt)}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer text-xs text-emerald-200 transition-colors"
                  >
                    <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                      <span>{ev.docName} — Page {ev.page}</span>
                      <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                        Click to Open in PDF <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <p className="italic text-emerald-100">&quot;{ev.excerpt}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contradicting Evidence Excerpts */}
          {activeResult.contradictingEvidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Opposing / Contradicting Evidence Passages
              </h4>
              <div className="space-y-2">
                {activeResult.contradictingEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCitationClick(ev.docName, ev.page, ev.excerpt)}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-400 cursor-pointer text-xs text-rose-200 transition-colors"
                  >
                    <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                      <span>{ev.docName} — Page {ev.page}</span>
                      <span className="text-[10px] text-rose-400/80 font-mono flex items-center gap-1">
                        Click to Open in PDF <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <p className="italic text-rose-100">&quot;{ev.excerpt}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Information & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cyan-900/40 text-xs">
            <div className="p-3 rounded-xl bg-[#071426] border border-cyan-900/60">
              <span className="font-bold text-amber-300 block mb-1">Missing / Incomplete Context:</span>
              <p className="text-slate-400">{activeResult.missingInformation}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#071426] border border-cyan-900/60">
              <span className="font-bold text-cyan-300 block mb-1">Recommended Follow-Up:</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {activeResult.recommendedChecks.map((check, i) => (
                  <li key={i}>{check}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Verified Claims History Table */}
      {verifiedList.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Verified Claims in Workspace ({verifiedList.length})
          </h3>
          <div className="space-y-2">
            {verifiedList.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveResult(item)}
                className="p-4 rounded-xl bg-[#0B1F38]/60 border border-cyan-900/50 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">&quot;{item.claimText}&quot;</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{item.explanation}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {getCategoryBadge(item.category)}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
