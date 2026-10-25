"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  FileCheck2,
  GitFork,
  Sparkles,
} from "lucide-react";
import { UserProfile } from "@/types";
import { TruvexaStore } from "@/lib/store";

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("analyst@truvexa.ai");
  const [password, setPassword] = useState("Evidence123!");
  const [fullName, setFullName] = useState("Danisha Analyst");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid business email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        fullName: mode === "signup" ? fullName.trim() || "Research Analyst" : "Research Analyst",
        role: "Intelligence Lead",
        createdAt: new Date().toISOString(),
      };

      TruvexaStore.setUser(userProfile);
      TruvexaStore.logActivity({
        workspaceId: TruvexaStore.getActiveWorkspaceId(),
        action: mode === "signup" ? "User Registered" : "User Authenticated",
        details: `${userProfile.email} logged into the intelligence terminal.`,
        type: "workspace",
      });

      onLoginSuccess(userProfile);
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser: UserProfile = {
        id: "usr_lead_analyst_01",
        email: "danisha.analyst@truvexa.ai",
        fullName: "Danisha R (Lead Analyst)",
        role: "Senior Intelligence Architect",
        createdAt: new Date().toISOString(),
      };
      TruvexaStore.setUser(demoUser);
      onLoginSuccess(demoUser);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#071426] text-white">
      {/* Left Panel: Deep Navy Branding & Abstract Evidence Network */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#071426] via-[#0B1F38] to-[#040D1A] p-8 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-cyan-900/40 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="dotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#00D4FF" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B1F38] border border-[#00D4FF]/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <ShieldCheck className="w-7 h-7 text-[#00D4FF]" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-wider text-white">
              TRUVEXA <span className="text-[#00D4FF]">AI</span>
            </span>
            <p className="text-xs text-cyan-200/70 tracking-wide font-mono">
              EVIDENCE VERIFICATION PLATFORM
            </p>
          </div>
        </div>

        {/* Hero Value Proposition */}
        <div className="relative z-10 my-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
            Next-Gen Document Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-white mb-4">
            Every Claim Deserves <span className="text-[#00D4FF] underline decoration-cyan-500/30">Evidence</span>.
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Transform multi-page documents into trusted, auditable facts. Analyze contradictions,
            verify numerical claims, and ground every conclusion in traceable page sources.
          </p>

          {/* Three Key Pillar Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-cyan-900/40">
              <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Source-Grounded Verification:</span>
                <span className="text-slate-400 ml-1">No phantom hallucinations; all citations tie to verifiable PDF pages.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-cyan-900/40">
              <GitFork className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Cross-Document Contradiction Engine:</span>
                <span className="text-slate-400 ml-1">Exposes conflicting figures, timelines, and policy deviations.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>Enterprise Grade · AES-256 Vector Encryption</span>
          <span className="font-mono text-cyan-400/80">v1.0 Production Ready</span>
        </div>
      </div>

      {/* Right Panel: Clean Professional Auth Form */}
      <div className="md:w-1/2 bg-[#0A182D] p-8 md:p-14 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Tabs: Sign In / Create Account */}
          <div className="flex border-b border-slate-700/60 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-colors mr-6 ${
                mode === "login"
                  ? "border-[#00D4FF] text-[#00D4FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
                mode === "signup"
                  ? "border-[#00D4FF] text-[#00D4FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">
              {mode === "login" ? "Welcome Back" : "Begin Document Investigation"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {mode === "login"
                ? "Enter your credentials to access your intelligence workspaces."
                : "Register your analyst profile to start cross-verifying claims."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Danisha R"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#071426] border border-slate-700 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#071426] border border-slate-700 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link will be dispatched to your email address.")}
                    className="text-xs text-[#00D4FF] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#071426] border border-slate-700 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-[#00D4FF] focus:ring-0"
                />
                Remember this session
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-[#00D4FF] text-[#071426] font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.25)] mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Terminal" : "Initialize Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Evaluation Demo Access */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-lg border border-[#00D4FF]/40 bg-[#0B1F38]/60 hover:bg-[#0F2748] text-cyan-300 font-medium text-xs flex items-center justify-center gap-2 transition-all hover:border-[#00D4FF]"
            >
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
              <span>Instant Hackathon Review Access (1-Click Login)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
