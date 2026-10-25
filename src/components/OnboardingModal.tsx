"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FolderPlus,
  FileUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Workspace } from "@/types";
import { TruvexaStore } from "@/lib/store";

interface OnboardingModalProps {
  onComplete: () => void;
  onSelectTab: (tabId: string) => void;
}

export default function OnboardingModal({ onComplete, onSelectTab }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("Enterprise Audit & Due Diligence");
  const [description, setDescription] = useState("Cross-verifying fiscal disclosures, contracts, and strategic timelines.");

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim()) return;

    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name: workspaceName.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 2,
    };

    const current = TruvexaStore.getWorkspaces();
    TruvexaStore.setWorkspaces([...current, newWs]);
    TruvexaStore.setActiveWorkspaceId(newWs.id);

    TruvexaStore.logActivity({
      workspaceId: newWs.id,
      action: "Workspace Created",
      details: `Created workspace '${newWs.name}' via initial onboarding.`,
      type: "workspace",
    });

    setStep(3);
  };

  const handleFinish = (targetTab: string = "overview") => {
    onSelectTab(targetTab);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#0B1F38] to-[#071426] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,212,255,0.2)] text-white relative">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">TRUVEXA ONBOARDING</h2>
              <p className="text-[11px] text-cyan-300/70 font-mono">Step {step} of 3</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  s <= step ? "bg-[#00D4FF]" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome Overview */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
              Orientation Protocol
            </div>
            <h3 className="text-2xl font-extrabold text-white">Welcome to TRUVEXA AI</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Let&apos;s turn your documents into actionable intelligence. TRUVEXA AI analyzes multiple
              PDFs, surfaces contradictory metrics, and verifies factual claims with line-level source
              citations.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-700/60">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  1. Zero Hallucinations
                </span>
                <span className="text-[11px] text-slate-400">
                  Every answer must be substantiated by indexed source citations.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-700/60">
                <span className="text-xs font-semibold text-rose-400 block mb-1">
                  2. Cross-Doc Conflict
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatic side-by-side detection of conflicting dates, revenue, and headcounts.
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
              >
                <span>Continue to Workspace Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Create First Workspace */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <FolderPlus className="w-4 h-4" />
              <span>Workspace Configuration</span>
            </div>
            <h3 className="text-xl font-bold text-white">Name Your Intelligence Workspace</h3>
            <p className="text-xs text-slate-400">
              Workspaces isolate documents, evidence chunks, contradiction registries, and generated reports.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#071426] border border-cyan-800 focus:border-[#00D4FF] focus:outline-none text-sm text-white"
                  placeholder="e.g. 2025 Financial Document Review"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Scope / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#071426] border border-cyan-800 focus:border-[#00D4FF] focus:outline-none text-xs text-white"
                  placeholder="e.g. Audit of annual reports and board minutes."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
              >
                <span>Initialize Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Ingestion & Kickoff */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Workspace Initialized</span>
            </div>
            <h3 className="text-xl font-bold text-white">Ready for Investigation</h3>
            <p className="text-xs text-slate-300">
              We have pre-indexed two sample financial audit reports (ApexCorp 2024 vs 2025) with
              intentional factual discrepancies so you can test contradiction detection immediately.
            </p>

            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-cyan-200 font-medium">
                <span>Active Workspace:</span>
                <span className="font-semibold text-white">{workspaceName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Preloaded Test Documents:</span>
                <span className="font-mono text-emerald-300">2 Verified Reports</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Contradictions Flagged:</span>
                <span className="font-mono text-rose-300">Revenue, Budget & Timeline</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleFinish("contradictions")}
                className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/50 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  Explore Contradictions
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspect the side-by-side mismatch between 2024 & 2025 filings.
                </p>
              </button>

              <button
                onClick={() => handleFinish("upload")}
                className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/50 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
                  <FileUp className="w-3.5 h-3.5 text-cyan-400" />
                  Upload My Own PDFs
                </div>
                <p className="text-[11px] text-slate-400">
                  Add up to 10 of your personal documents for instant analysis.
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleFinish("overview")}
                className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-xs hover:opacity-95 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
              >
                Enter TRUVEXA Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
