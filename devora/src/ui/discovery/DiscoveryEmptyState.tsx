// Discovery Grid empty state — Neo-Brutalist CECS Logic Schematic & Diagnostics.
// High contrast, interactive logic gates simulator, circuit telemetry, and zero emojis.
// Designed specifically for UM-Dearborn Computer Engineering & Computer Science students.

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Cpu, Radio, Sparkles, Terminal, Sliders, RefreshCw } from "lucide-react";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

import type { UserProfile } from "@/backend/firebase";
import type { DiscoveryProfile } from "./mock-profiles";

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
  onViewProfile?: (profile: DiscoveryProfile) => void;
  requestedProfileIds?: string[];
};

export default function DiscoveryEmptyState({
  hasPublicStudents,
  onClearFilters,
}: DiscoveryEmptyStateProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Interactive Logic Gate Simulator State
  const [pinA, setPinA] = useState<0 | 1>(1);
  const [pinB, setPinB] = useState<0 | 1>(1);
  const [pinC, setPinC] = useState<0 | 1>(1);

  // Logic Calculations
  const andGateOutput = (pinA & pinB) as 0 | 1;
  const orGateOutput = (andGateOutput | pinC) as 0 | 1;
  const xorGateOutput = (pinA ^ pinB) as 0 | 1;

  // If search/filter returns 0 results
  if (hasPublicStudents) {
    return (
      <div
        className={`max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-xl text-center transition-all ${
          isLight
            ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0e0817] border-[2px] border-white/20 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        <span
          className={`inline-block font-mono text-xs font-bold uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full mb-4 ${
            isLight
              ? "bg-[#f4f4f2] text-[#0a0a0a] border border-[#0a0a0a]"
              : "bg-[#18121d] text-white border border-white/30"
          }`}
        >
          No Matches Found
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3">
          No students match these filters
        </h3>
        <p
          className={`font-mono text-sm leading-relaxed max-w-lg mx-auto mb-8 ${
            isLight ? "text-[#4b5563]" : "text-[#b3a7be]"
          }`}
        >
          Try removing one or more filter tags, or clear your search keyword to see all classmates on the discovery grid.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="h-11 px-6 rounded-lg font-mono text-xs font-extrabold uppercase tracking-[0.1em] cursor-pointer select-none bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  // Authentic CECS Logic Schematic & Signal Diagnostics (Strictly ZERO emojis)
  return (
    <div
      className={`max-w-4xl mx-auto my-6 sm:my-10 p-6 sm:p-10 rounded-2xl transition-all ${
        isLight
          ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
          : "bg-[#0c0814] border-[2px] border-white/20 shadow-[8px_8px_0px_#000000] text-white"
      }`}
    >
      {/* ── 1. Telemetry Status Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-dashed border-neutral-300 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.16em]">
            DIAGNOSTIC // BUS_IDLE [0x00]
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>PORT: 443/CECS</span>
          <span className="hidden sm:inline">FREQ: 100.00 MHz</span>
          <span>CAMPUS: 42.3168° N, 83.2325° W</span>
        </div>
      </div>

      {/* ── 2. Hero Headline & Context ── */}
      <div className="text-center pt-8 pb-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full mb-4 border border-[#0a0a0a] dark:border-white/25 bg-[#faf8f5] dark:bg-[#161022] shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]">
          <Cpu size={14} className="text-[#fb923c]" />
          <span>CECS Logic Core · Awaiting Incoming Beacons</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
          Discovery Bus Online
        </h2>

        <p className={`font-mono text-xs sm:text-sm leading-relaxed ${isLight ? "text-[#4b5563]" : "text-[#c2b6cb]"}`}>
          All logic routing channels are open. As UM-Dearborn CECS classmates register and set their profiles public, their nodes will populate this bus automatically in real time.
        </p>
      </div>

      {/* ── 3. Interactive Logic Schematic Visualizer ── */}
      <div
        className={`my-6 p-5 sm:p-7 rounded-xl border relative overflow-hidden transition-all ${
          isLight
            ? "bg-[#f8fafc] border-[2px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a]"
            : "bg-[#110b1a] border-[1.5px] border-white/20 shadow-[4px_4px_0px_#000000]"
        }`}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#fb923c]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Live Circuit Schematic // ECE-270 Logic Gate Core
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-neutral-500">Click pins to test logic:</span>
              <button
                type="button"
                onClick={() => {
                  setPinA(1);
                  setPinB(1);
                  setPinC(1);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-400 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-mono cursor-pointer"
              >
                <RefreshCw size={10} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Interactive Input Pin Switchers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setPinA((prev) => (prev === 1 ? 0 : 1))}
              className={`p-3 rounded-lg border-2 text-left font-mono transition-all cursor-pointer select-none ${
                pinA === 1
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[2px_2px_0px_#10b981]"
                  : "border-neutral-400 dark:border-neutral-700 bg-transparent text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase">
                <span>PIN_A: AUTH_VERIFIED</span>
                <span className="px-1.5 py-0.5 rounded font-black bg-neutral-900 text-white text-[10px]">
                  {pinA}
                </span>
              </div>
              <p className="text-[11px] mt-1 text-neutral-500">UM-Dearborn @umich.edu auth</p>
            </button>

            <button
              type="button"
              onClick={() => setPinB((prev) => (prev === 1 ? 0 : 1))}
              className={`p-3 rounded-lg border-2 text-left font-mono transition-all cursor-pointer select-none ${
                pinB === 1
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[2px_2px_0px_#10b981]"
                  : "border-neutral-400 dark:border-neutral-700 bg-transparent text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase">
                <span>PIN_B: CECS_ACTIVE</span>
                <span className="px-1.5 py-0.5 rounded font-black bg-neutral-900 text-white text-[10px]">
                  {pinB}
                </span>
              </div>
              <p className="text-[11px] mt-1 text-neutral-500">Enrolled in Engineering/CS</p>
            </button>

            <button
              type="button"
              onClick={() => setPinC((prev) => (prev === 1 ? 0 : 1))}
              className={`p-3 rounded-lg border-2 text-left font-mono transition-all cursor-pointer select-none ${
                pinC === 1
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[2px_2px_0px_#10b981]"
                  : "border-neutral-400 dark:border-neutral-700 bg-transparent text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase">
                <span>PIN_C: PROFILE_PUBLIC</span>
                <span className="px-1.5 py-0.5 rounded font-black bg-neutral-900 text-white text-[10px]">
                  {pinC}
                </span>
              </div>
              <p className="text-[11px] mt-1 text-neutral-500">Visible on Discovery Grid</p>
            </button>
          </div>

          {/* SVG Schematic Board */}
          <div className="w-full overflow-x-auto py-2">
            <svg
              viewBox="0 0 740 210"
              className="w-full min-w-[620px] h-auto font-mono text-[11px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wire A to AND Gate */}
              <path
                d="M 60 45 L 180 45"
                stroke={pinA ? "#10b981" : "#6b7280"}
                strokeWidth={pinA ? "2.5" : "1.5"}
                strokeDasharray={pinA ? "none" : "3 3"}
              />
              <circle cx="60" cy="45" r="4" fill={pinA ? "#10b981" : "#6b7280"} />
              <text x="15" y="49" fill="currentColor" fontWeight="700">IN_A</text>

              {/* Wire B to AND Gate */}
              <path
                d="M 60 85 L 180 85"
                stroke={pinB ? "#10b981" : "#6b7280"}
                strokeWidth={pinB ? "2.5" : "1.5"}
                strokeDasharray={pinB ? "none" : "3 3"}
              />
              <circle cx="60" cy="85" r="4" fill={pinB ? "#10b981" : "#6b7280"} />
              <text x="15" y="89" fill="currentColor" fontWeight="700">IN_B</text>

              {/* ── AND GATE ── */}
              <g transform="translate(180, 25)">
                <path
                  d="M 0 10 L 30 10 A 30 30 0 0 1 30 70 L 0 70 Z"
                  fill={andGateOutput ? (isLight ? "#e6fffa" : "#064e3b") : (isLight ? "#ffffff" : "#1e1528")}
                  stroke={andGateOutput ? "#10b981" : (isLight ? "#0a0a0a" : "#ffffff")}
                  strokeWidth="2"
                />
                <text x="16" y="44" fill="currentColor" fontWeight="800" fontSize="12">AND</text>
              </g>

              {/* AND Output Line */}
              <path
                d="M 240 65 L 340 65"
                stroke={andGateOutput ? "#10b981" : "#6b7280"}
                strokeWidth={andGateOutput ? "2.5" : "1.5"}
              />
              <circle cx="240" cy="65" r="3.5" fill={andGateOutput ? "#10b981" : "#6b7280"} />
              <text x="255" y="58" fill={andGateOutput ? "#10b981" : "#6b7280"} fontWeight="700">
                Q1: {andGateOutput}
              </text>

              {/* Wire C directly into OR Gate */}
              <path
                d="M 60 145 L 340 145 L 340 105 L 370 105"
                stroke={pinC ? "#10b981" : "#6b7280"}
                strokeWidth={pinC ? "2.5" : "1.5"}
              />
              <circle cx="60" cy="145" r="4" fill={pinC ? "#10b981" : "#6b7280"} />
              <text x="15" y="149" fill="currentColor" fontWeight="700">IN_C</text>

              {/* Connection from Q1 into OR Gate */}
              <path
                d="M 340 65 L 370 65"
                stroke={andGateOutput ? "#10b981" : "#6b7280"}
                strokeWidth={andGateOutput ? "2.5" : "1.5"}
              />

              {/* ── OR GATE ── */}
              <g transform="translate(370, 45)">
                <path
                  d="M 0 0 Q 15 25 0 70 Q 35 70 55 45 Q 65 35 70 35 Q 65 35 55 25 Q 35 0 0 0 Z"
                  fill={orGateOutput ? (isLight ? "#fff7ed" : "#7c2d12") : (isLight ? "#ffffff" : "#1e1528")}
                  stroke={orGateOutput ? "#f97316" : (isLight ? "#0a0a0a" : "#ffffff")}
                  strokeWidth="2"
                />
                <text x="18" y="40" fill="currentColor" fontWeight="800" fontSize="12">OR</text>
              </g>

              {/* OR Output to Bus Core */}
              <path
                d="M 440 80 L 520 80"
                stroke={orGateOutput ? "#f97316" : "#6b7280"}
                strokeWidth={orGateOutput ? "3" : "1.5"}
              />
              <circle cx="440" cy="80" r="4" fill={orGateOutput ? "#f97316" : "#6b7280"} />

              {/* ── OUTPUT BUS HUD BOX ── */}
              <g transform="translate(520, 40)">
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="82"
                  rx="8"
                  fill={isLight ? "#ffffff" : "#1a1224"}
                  stroke={orGateOutput ? "#f97316" : (isLight ? "#0a0a0a" : "#ffffff")}
                  strokeWidth="2"
                />
                <text x="14" y="24" fill="currentColor" fontWeight="800" fontSize="11" letterSpacing="0.08em">
                  BROADCAST_BUS_STATE
                </text>
                <text
                  x="14"
                  y="48"
                  fill={orGateOutput ? "#10b981" : "#ef4444"}
                  fontWeight="900"
                  fontSize="14"
                >
                  {orGateOutput ? "ARMED: SIGNAL HIGH" : "OFFLINE: SIGNAL LOW"}
                </text>
                <text x="14" y="68" fill="currentColor" opacity="0.6" fontSize="10">
                  PEERS_ONLINE: 0 // LISTENING
                </text>
              </g>

              {/* Waveform trace representation at bottom */}
              <g transform="translate(60, 180)" stroke="currentColor" opacity="0.4" strokeWidth="1">
                <text x="-45" y="10" fontSize="9" fill="currentColor">CLK</text>
                <path d="M 0 10 L 25 10 L 25 0 L 50 0 L 50 10 L 75 10 L 75 0 L 100 0 L 100 10 L 125 10 L 125 0 L 150 0 L 150 10 L 175 10 L 175 0 L 200 0 L 200 10 L 225 10 L 225 0 L 250 0 L 250 10 L 275 10 L 275 0 L 300 0 L 300 10 L 325 10 L 325 0 L 350 0 L 350 10 L 375 10 L 375 0 L 400 0 L 400 10 L 425 10 L 425 0 L 450 0 L 450 10 L 475 10 L 475 0 L 500 0 L 500 10 L 525 10 L 525 0 L 550 0 L 550 10 L 575 10 L 575 0 L 600 0 L 600 10 L 625 10" />
              </g>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-dashed border-neutral-300 dark:border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500">
              TRUTH TABLE LOGIC: (A ∧ B) ∨ C = <span className="font-bold text-emerald-500">{orGateOutput}</span>
            </span>
            <span className="text-neutral-500">
              COMPARATOR (A ⊕ B) = <span className="font-bold text-[#fb923c]">{xorGateOutput}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Technical Node Channels (Replacing generic Step 1/2/3) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        <div
          className={`p-5 rounded-xl border transition-all ${
            isLight
              ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
              : "bg-[#140e1d] border-white/15 shadow-[3px_3px_0px_#000000]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider text-[#fb923c]">
            <Radio size={14} />
            <span>Channel 01 // Identity</span>
          </div>
          <p className="font-mono text-xs leading-relaxed opacity-90">
            CECS authentication verified via @umich.edu. No recruiters, no bots, and zero off-campus spam.
          </p>
        </div>

        <div
          className={`p-5 rounded-xl border transition-all ${
            isLight
              ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
              : "bg-[#140e1d] border-white/15 shadow-[3px_3px_0px_#000000]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider text-[#fb923c]">
            <Sliders size={14} />
            <span>Channel 02 // Routing</span>
          </div>
          <p className="font-mono text-xs leading-relaxed opacity-90">
            Real-time filter matrix across CIS, CE, Software Engineering, Data Science, and Cybersecurity niches.
          </p>
        </div>

        <div
          className={`p-5 rounded-xl border transition-all ${
            isLight
              ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
              : "bg-[#140e1d] border-white/15 shadow-[3px_3px_0px_#000000]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider text-[#fb923c]">
            <Sparkles size={14} />
            <span>Channel 03 // Peer Cohorts</span>
          </div>
          <p className="font-mono text-xs leading-relaxed opacity-90">
            Direct peer connections for Hack Dearborn cohorts, course study groups, and student org collaboration.
          </p>
        </div>
      </div>

      {/* ── 5. Action Buttons ── */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-800">
        <Link
          href="/account-page"
          className="h-11 px-7 rounded-lg font-mono text-xs font-black uppercase tracking-[0.1em] cursor-pointer inline-flex items-center gap-2.5 select-none bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span>Set Up Your Profile</span>
          <ArrowRight size={14} />
        </Link>

        <Link
          href="/activity-center"
          className={`h-11 px-7 rounded-lg font-mono text-xs font-bold uppercase tracking-[0.1em] cursor-pointer inline-flex items-center gap-2 select-none transition-all ${
            isLight
              ? "bg-white text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#f4f4f2]"
              : "bg-[#18121d] text-white border-2 border-white/30 shadow-[3px_3px_0px_#000000] hover:border-white"
          }`}
        >
          <span>Explore Activity Center</span>
        </Link>
      </div>
    </div>
  );
}
