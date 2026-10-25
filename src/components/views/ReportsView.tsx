"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Copy,
  Printer,
  Sparkles,
  FileCheck2,
  AlertTriangle,
  FileText,
  Check,
  Plus,
} from "lucide-react";
import {
  DocumentItem,
  ClaimVerification,
  ContradictionFinding,
  EvidenceReport,
} from "@/types";
import { TruvexaStore } from "@/lib/store";

interface ReportsViewProps {
  documents: DocumentItem[];
  claims: ClaimVerification[];
  contradictions: ContradictionFinding[];
  reports: EvidenceReport[];
  activeWorkspaceId: string;
  onRefreshReports: () => void;
}

export default function ReportsView({
  documents,
  claims,
  contradictions,
  reports,
  activeWorkspaceId,
  onRefreshReports,
}: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<EvidenceReport | null>(
    reports.length > 0 ? reports[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: EvidenceReport = {
        id: `rep_${Date.now()}`,
        workspaceId: activeWorkspaceId,
        title: `TRUVEXA AI — Evidence Intelligence Report (${new Date().toLocaleDateString()})`,
        createdAt: new Date().toISOString(),
        analyzedDocs: documents.map((d) => d.name),
        executiveSummary: `Audit of ${documents.length} filings across active workspace identified ${contradictions.length} factual discrepancies and verified ${claims.length} assertions. Key conflicts center on financial revenue reconciliations (₹120 Cr vs ₹105 Cr) and project launch timelines.`,
        keyFindings: [
          `Factual alignment established on ${claims.filter((c) => c.category === "Supported").length} primary metrics.`,
          `${contradictions.length} cross-document contradictions require executive clarification before sign-off.`,
          "Data retention policies remain consistent at 90 days across all scrutinized documents.",
        ],
        supportedClaims: claims.filter((c) => c.category === "Supported"),
        contradictions,
        unverifiedClaims: [
          "Alleged international acquisitions in non-core territories.",
          "Secondary vendor subcontractor insurance policies.",
        ],
        limitations:
          "Evidence is limited strictly to the uploaded document pages. Audited adjustments may have occurred in supplementary filings not yet submitted to the workspace.",
        recommendedNextSteps: [
          "Cross-examine the finance department regarding the ₹15 Cr variance in FY2024 certified revenue.",
          "Confirm vendor licensing terms supporting the updated ₹22 Cr budget ceiling.",
          "Review board minutes corresponding to the Q4 2025 launch rescheduling.",
        ],
      };

      TruvexaStore.addReport(newReport);
      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Evidence Report Generated",
        details: `Compiled ${newReport.title} containing ${contradictions.length} documented conflicts.`,
        type: "report",
      });

      setActiveReport(newReport);
      setIsGenerating(false);
      onRefreshReports();
    }, 700);
  };

  const handleCopySummary = () => {
    if (!activeReport) return;
    const text = `${activeReport.title}\n\nEXECUTIVE SUMMARY:\n${activeReport.executiveSummary}\n\nKEY FINDINGS:\n${activeReport.keyFindings.join(
      "\n"
    )}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!activeReport) return;
    let csv = "Type,Title/Claim,Category/Status,Doc A,Doc B,Explanation\n";

    activeReport.contradictions.forEach((c) => {
      csv += `"Contradiction","${c.title.replace(/"/g, '""')}","${c.status}","${c.docA.name} Pg ${
        c.docA.page
      }","${c.docB.name} Pg ${c.docB.page}","${c.explanation.replace(/"/g, '""')}"\n`;
    });

    activeReport.supportedClaims.forEach((cl) => {
      csv += `"Supported Claim","${cl.claimText.replace(/"/g, '""')}","${cl.category}","${
        cl.supportingEvidence[0]?.docName || "N/A"
      }","N/A","${cl.explanation.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Truvexa_Evidence_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00D4FF]" />
            AI Evidence Intelligence Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile defensible, auditable diligence reports with verified citations and contradiction findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Synthesizing Report..." : "Generate New Evidence Report"}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Saved Reports List, Right Report View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Reports Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Saved Reports ({reports.length})
          </h3>
          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setActiveReport(rep)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                  activeReport?.id === rep.id
                    ? "bg-[#0B1F38] border-cyan-400 shadow-lg text-white"
                    : "bg-[#0B1F38]/50 border-cyan-900/40 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold truncate">{rep.title}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {new Date(rep.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Content View */}
        <div className="lg:col-span-3">
          {activeReport ? (
            <div className="bg-[#0B1F38] border border-cyan-800/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-white">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-900/60">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                    Official Intelligence Dossier
                  </span>
                  <h3 className="text-xl font-extrabold text-white">{activeReport.title}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Analyzed Filings: {activeReport.analyzedDocs.join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="py-1.5 px-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Summary"}</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="py-1.5 px-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="py-1.5 px-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
                  1. Executive Summary
                </h4>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-[#071426] p-4 rounded-xl border border-cyan-900/60">
                  {activeReport.executiveSummary}
                </p>
              </div>

              {/* 2. Key Findings */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
                  2. Key Findings
                </h4>
                <div className="space-y-2">
                  {activeReport.keyFindings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Potential Contradictions Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> 3. Flagged Cross-Document Contradictions (
                  {activeReport.contradictions.length})
                </h4>
                <div className="space-y-3">
                  {activeReport.contradictions.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-rose-300 font-bold">
                        <span>{c.title}</span>
                        <span className="font-mono text-[10px] uppercase">{c.status}</span>
                      </div>
                      <p className="text-slate-300">{c.explanation}</p>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                        <span>
                          Doc A: {c.docA.name} (Pg {c.docA.page})
                        </span>
                        <span>
                          Doc B: {c.docB.name} (Pg {c.docB.page})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Supported Claims Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" /> 4. Corroborated Claims (
                  {activeReport.supportedClaims.length})
                </h4>
                <div className="space-y-2">
                  {activeReport.supportedClaims.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200"
                    >
                      <div className="font-semibold text-emerald-300 mb-1">&quot;{sc.claimText}&quot;</div>
                      <p className="text-slate-300 text-[11px]">{sc.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Limitations & Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cyan-900/60 text-xs">
                <div className="p-4 rounded-xl bg-[#071426] border border-slate-700/60">
                  <h5 className="font-bold text-amber-300 mb-1">Evidence Limitations</h5>
                  <p className="text-slate-400 leading-relaxed">{activeReport.limitations}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#071426] border border-slate-700/60">
                  <h5 className="font-bold text-cyan-300 mb-1">Recommended Next Steps</h5>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    {activeReport.recommendedNextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#0B1F38]/40 border border-cyan-900/40 text-slate-400">
              No reports generated yet. Click &quot;Generate New Evidence Report&quot; above to compile your
              findings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
