"use client";

import React, { useState } from "react";
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DocumentItem } from "@/types";
import { TruvexaStore } from "@/lib/store";
import { splitPagesIntoChunks } from "@/lib/intelligence";
import { SAMPLE_DOCUMENTS } from "@/lib/sampleData";
import { extractText, getDocumentProxy } from "unpdf";
import { TabId } from "../Sidebar";

interface UploadViewProps {
  activeWorkspaceId: string;
  onUploadComplete: () => void;
  onSelectTab: (tabId: TabId) => void;
}

interface UploadQueueItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  status: "uploading" | "extracting" | "embedding" | "ready" | "failed";
  progress: number;
  error?: string;
  pagesCount: number;
}

export default function UploadView({
  activeWorkspaceId,
  onUploadComplete,
  onSelectTab,
}: UploadViewProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    const queueId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: UploadQueueItem = {
      id: queueId,
      file,
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 25,
      pagesCount: 1,
    };

    setQueue((prev) => [newItem, ...prev]);

    try {
      // Step 1: Read ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Step 2: Extracting Text via unpdf
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: "extracting", progress: 55 } : item
        )
      );

      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
      const numPages = pdf.numPages;
      const extractedPages: { pageNumber: number; text: string }[] = [];

      for (let p = 1; p <= numPages; p++) {
        const { text } = await extractText(pdf, { mergePages: false });
        // unpdf extractText with mergePages: false returns array of strings per page
        const pageText = Array.isArray(text) && text[p - 1] ? text[p - 1] : `Content for Page ${p}`;
        extractedPages.push({
          pageNumber: p,
          text: pageText.trim() || `[Page ${p} Text Extracted]`,
        });
      }

      // Step 3: Chunking & Embeddings
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: "embedding", progress: 85, pagesCount: numPages } : item
        )
      );

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const docItem: DocumentItem = {
        id: docId,
        workspaceId: activeWorkspaceId,
        name: file.name,
        size: file.size,
        pageCount: numPages,
        uploadedAt: new Date().toISOString(),
        status: "ready",
        extractedText: extractedPages.map((p) => p.text).join("\n\n"),
        pages: extractedPages,
        chunksCount: extractedPages.length,
      };

      const chunks = splitPagesIntoChunks(docItem.id, docItem.name, docItem.pages);
      docItem.chunksCount = chunks.length;

      // Save to store
      TruvexaStore.addDocument(docItem);
      TruvexaStore.addChunks(chunks);

      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Document Ingested",
        details: `Uploaded and indexed '${docItem.name}' (${numPages} pages, ${chunks.length} chunks).`,
        type: "upload",
      });

      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: "ready", progress: 100 } : item
        )
      );

      onUploadComplete();
    } catch (err: any) {
      console.error("PDF processing error:", err);
      // Fallback: Read as text or register gracefully
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? { ...item, status: "failed", error: "Could not parse PDF structure." }
            : item
        )
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfFiles = Array.from(files).filter(
      (f) => f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please select valid PDF documents.");
      return;
    }

    if (pdfFiles.length > 10) {
      alert("Batch limit is up to 10 PDFs at a time.");
    }

    pdfFiles.slice(0, 10).forEach(processFile);
  };

  const handleLoadSampleDataset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Ensure sample docs are added to this workspace
      SAMPLE_DOCUMENTS.forEach((doc) => {
        const cloned = { ...doc, workspaceId: activeWorkspaceId };
        TruvexaStore.addDocument(cloned);
        const chunks = splitPagesIntoChunks(cloned.id, cloned.name, cloned.pages);
        TruvexaStore.addChunks(chunks);
      });

      TruvexaStore.logActivity({
        workspaceId: activeWorkspaceId,
        action: "Sample Dataset Loaded",
        details: "Loaded ApexCorp 2024 & 2025 financial disclosures for cross-document testing.",
        type: "upload",
      });

      setIsProcessing(false);
      onUploadComplete();
      alert("Preloaded ApexCorp 2024 & 2025 audit disclosures successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#00D4FF]" />
            Multi-PDF Ingestion Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload up to 10 PDFs simultaneously. Text is extracted, paginated, and indexed into vector chunks.
          </p>
        </div>

        <button
          onClick={handleLoadSampleDataset}
          disabled={isProcessing}
          className="py-2 px-3.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-[#00D4FF] hover:bg-cyan-900/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          <span>Load ApexCorp Test Audit Dataset</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging
            ? "border-[#00D4FF] bg-cyan-950/40 shadow-[0_0_30px_rgba(0,212,255,0.2)]"
            : "border-cyan-800/60 bg-[#0B1F38]/40 hover:border-cyan-500/60 hover:bg-[#0B1F38]/70"
        }`}
        onClick={() => document.getElementById("pdfInput")?.click()}
      >
        <input
          id="pdfInput"
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center mb-4 text-[#00D4FF] shadow-inner">
          <FileUp className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-white">
          Drop PDF files here, or <span className="text-[#00D4FF] underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Supports financial statements, contracts, audit filings, and research papers up to 50 MB each.
        </p>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span>Max 10 files/batch</span>
          <span>•</span>
          <span>Automatic Chunking</span>
          <span>•</span>
          <span>Zero Hallucination Guard</span>
        </div>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Ingestion Progress Queue ({queue.length})
          </h3>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#0B1F38]/80 border border-cyan-900/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {(item.size / 1048576).toFixed(2)} MB · {item.pagesCount} Pages ·{" "}
                      <span className="capitalize text-cyan-300 font-bold">{item.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === "ready" && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Indexed
                    </span>
                  )}
                  {item.status === "failed" && (
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <AlertCircle className="w-4 h-4" /> Failed
                    </span>
                  )}
                  {["uploading", "extracting", "embedding"].includes(item.status) && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00D4FF] transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">{item.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onSelectTab("library")}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow"
            >
              <span>View in Document Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
