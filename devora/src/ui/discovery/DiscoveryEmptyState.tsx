// Discovery Grid empty state — Neo-Brutalist theme law.
// High contrast and clean card surface for both light and dark mode.
// Displays an authentic onboarding welcome when no public students exist yet.
// Strictly ZERO emojis.

"use client";

import Link from "next/link";
import { UserCheck, ArrowRight } from "lucide-react";
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

  // Authentic clean empty state when database has no public students yet (NO emojis)
  return (
    <div
      className={`max-w-3xl mx-auto my-8 sm:my-12 p-8 sm:p-12 rounded-xl transition-all ${
        isLight
          ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
          : "bg-[#0e0817] border-[2px] border-white/20 shadow-[6px_6px_0px_#000000] text-white"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <span
          className={`inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] px-4 py-1.5 rounded-full mb-5 ${
            isLight
              ? "bg-[#f4f4f2] text-[#0a0a0a] border border-[#0a0a0a]"
              : "bg-[#18121d] text-white border border-white/30"
          }`}
        >
          <UserCheck size={14} className="shrink-0" />
          <span>CECS Directory · Verified UM-Dearborn</span>
        </span>

        <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight mb-4">
          Grid Ready For Classmates
        </h2>

        <p
          className={`font-mono text-sm sm:text-base leading-relaxed max-w-xl mb-8 ${
            isLight ? "text-[#374151]" : "text-[#d1c7d8]"
          }`}
        >
          You are among the first CECS students on Devora. As classmates sign in with their @umich.edu accounts and make their profiles public, their cards will populate this grid automatically.
        </p>

        {/* Feature roadmap pill grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8 text-left">
          <div
            className={`p-4 rounded-lg border ${
              isLight
                ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
                : "bg-[#15101a] border-[rgba(255,255,255,0.12)] shadow-[2px_2px_0px_#000000]"
            }`}
          >
            <p className="font-mono text-xs font-bold uppercase text-[#ff5ca8] mb-1">Step 01</p>
            <p className="font-mono text-xs font-semibold">Filter by major, CIA, and software engineering tracks</p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isLight
                ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
                : "bg-[#15101a] border-[rgba(255,255,255,0.12)] shadow-[2px_2px_0px_#000000]"
            }`}
          >
            <p className="font-mono text-xs font-bold uppercase text-[#ff5ca8] mb-1">Step 02</p>
            <p className="font-mono text-xs font-semibold">Connect with students taking your current courses</p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isLight
                ? "bg-[#fafaf9] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
                : "bg-[#15101a] border-[rgba(255,255,255,0.12)] shadow-[2px_2px_0px_#000000]"
            }`}
          >
            <p className="font-mono text-xs font-bold uppercase text-[#ff5ca8] mb-1">Step 03</p>
            <p className="font-mono text-xs font-semibold">Form hackathon teams, study crews, and project groups</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/account-page"
            className="h-11 px-6 rounded-lg font-mono text-xs font-extrabold uppercase tracking-[0.1em] cursor-pointer inline-flex items-center gap-2 select-none bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Set Up Your Profile</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/activity-center"
            className={`h-11 px-6 rounded-lg font-mono text-xs font-bold uppercase tracking-[0.1em] cursor-pointer inline-flex items-center gap-2 select-none transition-all ${
              isLight
                ? "bg-white text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#f4f4f2]"
                : "bg-[#18121d] text-white border-2 border-[rgba(255,255,255,0.2)] shadow-[2px_2px_0px_#000000] hover:border-[#ff5ca8]"
            }`}
          >
            <span>Explore Activity Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
