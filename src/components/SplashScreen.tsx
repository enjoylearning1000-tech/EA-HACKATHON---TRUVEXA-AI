"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, Network } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Initial Reveal (0.4s)
    const t1 = setTimeout(() => setStage(1), 350);
    // Stage 2: Logo Glow & Particles (1.1s)
    const t2 = setTimeout(() => setStage(2), 1100);
    // Stage 3: Complete & Transition (2.1s)
    const t3 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#071426] via-[#0B1F38] to-[#040D1A] text-white overflow-hidden select-none">
      {/* Background Subtle Particle Network Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#071426" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridGlow)" />
          {/* Constellation lines */}
          <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="80%" y1="25%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="30%" y1="75%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.8" strokeDasharray="4 4" />
          <circle cx="20%" cy="30%" r="3" fill="#00D4FF" opacity="0.6" />
          <circle cx="80%" cy="25%" r="3" fill="#00D4FF" opacity="0.6" />
          <circle cx="30%" cy="75%" r="3" fill="#00D4FF" opacity="0.6" />
          <circle cx="75%" cy="80%" r="3" fill="#00D4FF" opacity="0.6" />
        </svg>
      </div>

      {/* Main Animated Geometric Logo Container */}
      <div className="relative flex flex-col items-center z-10 transition-all duration-700">
        <div
          className={`relative flex items-center justify-center w-28 h-28 rounded-2xl border-2 transition-all duration-700 ${
            stage >= 1
              ? "border-[#00D4FF] shadow-[0_0_50px_rgba(0,212,255,0.45)] bg-[#0B1F38]/90 scale-100 opacity-100"
              : "border-cyan-900 shadow-none scale-75 opacity-0"
          }`}
        >
          {/* Animated Cyan Scan Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent animate-pulse" />

          {/* Central Custom Geometric Symbol combining Shield, Nodes & Verification */}
          <div className="relative">
            <ShieldCheck
              className={`w-14 h-14 text-[#00D4FF] transition-transform duration-500 ${
                stage >= 2 ? "scale-110 drop-shadow-[0_0_15px_#00D4FF]" : "scale-90"
              }`}
            />
            <Network className="w-6 h-6 text-blue-400 absolute -bottom-1 -right-2 animate-bounce" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <h1
          className={`mt-6 text-3xl md:text-4xl font-extrabold tracking-wider transition-all duration-700 ${
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="text-white">TRUVEXA </span>
          <span className="text-[#00D4FF] drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]">AI</span>
        </h1>

        {/* Brand Tagline */}
        <div
          className={`mt-2 flex items-center gap-2 text-sm md:text-base text-cyan-200/80 font-medium tracking-wide transition-all duration-700 delay-150 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          <span>Every Claim Deserves Evidence.</span>
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-[#00D4FF] transition-all duration-1000 ease-out"
            style={{ width: stage === 0 ? "10%" : stage === 1 ? "55%" : "100%" }}
          />
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 text-xs text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest px-4 py-2"
      >
        Press to Skip
      </button>
    </div>
  );
}
