"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  FileText,
  Bookmark,
  Share2,
} from "lucide-react";
import { DocumentItem } from "@/types";

interface PdfViewerModalProps {
  document: DocumentItem | null;
  targetPage?: number;
  highlightExcerpt?: string;
  onClose: () => void;
}

export default function PdfViewerModal({
  document,
  targetPage = 1,
  highlightExcerpt,
  onClose,
}: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(targetPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (targetPage && document && targetPage <= document.pageCount) {
      setCurrentPage(targetPage);
    }
  }, [targetPage, document]);

  if (!document) return null;

  const totalPages = document.pages.length || 1;
  const activePageObj = document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];
  const pageContent = activePageObj ? activePageObj.text : document.extractedText;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 text-white">
      <div className="w-full max-w-5xl h-[88vh] flex flex-col bg-[#071426] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,212,255,0.25)] overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-14 px-4 bg-[#0B1F38] border-b border-cyan-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-white truncate max-w-xs md:max-w-md">
                {document.name}
              </h3>
              <p className="text-[11px] text-cyan-300/70 font-mono">
                {document.pageCount} Pages · {(document.size / (1024 * 1024)).toFixed(2)} MB · Verified Source
              </p>
            </div>
          </div>

          {/* Controls: Search, Zoom, Page, Close */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Quick in-document search */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2 py-1 text-xs bg-[#071426] border border-cyan-900 rounded-md text-white focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#071426] px-2 py-1 rounded-md border border-cyan-900/80">
              <button
                onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                className="text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-cyan-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Navigator */}
            <div className="flex items-center gap-1.5 bg-[#071426] px-2.5 py-1 rounded-md border border-cyan-900/80">
              <button
                onClick={handlePrev}
                disabled={currentPage <= 1}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-white">
                Page <span className="text-[#00D4FF] font-bold">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-300 hover:bg-rose-900/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Citation Banner if opened from a specific excerpt */}
        {highlightExcerpt && (
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/80 via-blue-950/70 to-cyan-950/80 border-b border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-200">
            <Bookmark className="w-4 h-4 text-[#00D4FF] shrink-0" />
            <span className="font-semibold text-white">Target Evidence Passage (Page {currentPage}):</span>
            <span className="truncate italic text-cyan-100">&quot;{highlightExcerpt}&quot;</span>
          </div>
        )}

        {/* Main Document Reading Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#040D1A] flex justify-center">
          <div
            className="w-full max-w-3xl bg-white text-slate-900 p-8 md:p-12 rounded-xl shadow-2xl transition-all border border-slate-300 font-serif leading-relaxed"
            style={{ fontSize: `${(zoomLevel / 100) * 15}px` }}
          >
            {/* Document Header Representation */}
            <div className="pb-4 mb-6 border-b border-slate-300 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span className="font-semibold uppercase tracking-wider text-slate-700">
                {document.name.replace(".pdf", "")}
              </span>
              <span>PAGE {currentPage} OF {totalPages}</span>
            </div>

            {/* Page Body Text with Search Highlighting */}
            <div className="whitespace-pre-line text-slate-800">
              {pageContent.split("\n").map((line, idx) => {
                const isHighlighted =
                  highlightExcerpt &&
                  highlightExcerpt.length > 20 &&
                  line.toLowerCase().includes(highlightExcerpt.substring(0, 20).toLowerCase());

                const hasSearch =
                  searchTerm.trim().length > 1 &&
                  line.toLowerCase().includes(searchTerm.toLowerCase());

                return (
                  <p
                    key={idx}
                    className={`mb-3 transition-colors ${
                      isHighlighted
                        ? "bg-cyan-100 border-l-4 border-cyan-500 pl-3 py-1 text-cyan-950 font-medium"
                        : hasSearch
                        ? "bg-amber-100 font-medium"
                        : ""
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>

            {/* Document Footer Representation */}
            <div className="pt-8 mt-12 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-sans">
              <span>TRUVEXA EVIDENCE VERIFIED · TAMIL NADU / ENTERPRISE</span>
              <span>AUDIT ID: TRU-{document.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
