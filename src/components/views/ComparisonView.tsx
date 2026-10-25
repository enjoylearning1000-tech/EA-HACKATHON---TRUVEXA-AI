"use client";

import React, { useState } from "react";
import {
  Columns2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { DocumentItem, DocumentChunk, DocumentComparisonResult } from "@/types";
import { executeDocumentComparison } from "@/lib/intelligence";

interface ComparisonViewProps {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  onOpenPdf: (doc: DocumentItem, page?: number, excerpt?: string) => void;
}

export default function ComparisonView({
  documents,
  chunks,
  onOpenPdf,
}: ComparisonViewProps) {
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || "");
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || "");

  const docA = documents.find((d) => d.id === docAId);
  const docB = documents.find((d) => d.id === docBId);

  const comparison: DocumentComparisonResult | null =
    docA && docB && docA.id !== docB.id
      ? executeDocumentComparison(docA, docB)
      : null;

  const handleCitationClick = (doc: DocumentItem, page: number) => {
    onOpenPdf(doc, page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-[#00D4FF]" />
            Smart Document Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select two files to generate a structured side-by-side reconciliation matrix across key business dimensions.
          </p>
        </div>
      </div>

      {/* Document Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#0B1F38] border border-cyan-800/60 shadow-lg">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
            Baseline Document (A)
          </label>
          <select
            value={docAId}
            onChange={(e) => setDocAId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#071426] border border-cyan-900 rounded-xl text-white focus:outline-none focus:border-[#00D4FF]"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.pageCount} pgs)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-rose-300 mb-1.5">
            Comparative Document (B)
          </label>
          <select
            value={docBId}
            onChange={(e) => setDocBId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#071426] border border-rose-900 rounded-xl text-white focus:outline-none focus:border-rose-400"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.pageCount} pgs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {comparison ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
            <span className="font-bold text-white uppercase tracking-wider block mb-1">
              Reconciliation Summary:
            </span>
            {comparison.summary}
          </div>

          <div className="rounded-2xl border border-cyan-900/60 bg-[#0B1F38]/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071426] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-cyan-900/60">
                  <tr>
                    <th className="py-3 px-4">Dimension</th>
                    <th className="py-3 px-4">{docA?.name} (A)</th>
                    <th className="py-3 px-4">{docB?.name} (B)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Citations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-900/30 text-slate-300">
                  {comparison.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <span className="text-[10px] text-cyan-400 font-mono block uppercase">
                          {row.category}
                        </span>
                        {row.aspect}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-200">
                        {row.docAValue}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-rose-200">
                        {row.docBValue}
                      </td>

                      <td className="py-3.5 px-4">
                        {row.status === "conflict" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 font-mono">
                            <AlertTriangle className="w-3.5 h-3.5" /> Conflict
                          </span>
                        )}
                        {row.status === "match" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aligned
                          </span>
                        )}
                        {row.status === "missing" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 font-mono">
                            <MinusCircle className="w-3.5 h-3.5" /> Incomplete
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px]">
                        <div className="flex items-center justify-end gap-1.5">
                          {docA && (
                            <button
                              onClick={() => handleCitationClick(docA, row.docAPage)}
                              className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[#00D4FF] hover:bg-cyan-900"
                              title={`View in ${docA.name}`}
                            >
                              Pg {row.docAPage}
                            </button>
                          )}
                          {docB && (
                            <button
                              onClick={() => handleCitationClick(docB, row.docBPage)}
                              className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900"
                              title={`View in ${docB.name}`}
                            >
                              Pg {row.docBPage}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#0B1F38]/40 border border-cyan-900/40 text-slate-400">
          Please select two different documents above to generate the comparison matrix.
        </div>
      )}
    </div>
  );
}
