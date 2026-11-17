// Empty state for the Discovery Grid per DESIGN.md § 5.3.
// Features the animated IsometricEmptyDrawing on the left,
// and on the right: "Opens as classmates join" stamp, "No classmates on the grid yet" headline,
// dynamic onboarding profile checklist, and CTAs to finish profile or copy invite link.
// Strictly ZERO emojis, zero pink borders, zero pink shadows.

"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, Copy } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";
import type { DiscoveryProfile } from "./mock-profiles";
import IsometricEmptyDrawing from "./IsometricEmptyDrawing";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

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
  viewerProfile,
  onToast,
}: DiscoveryEmptyStateProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/auth/signup`);
      setCopied(true);
      if (onToast) {
        onToast("Invite link copied to clipboard.");
      }
      setTimeout(() => setCopied(false), 2400);
    }
  };

  // Compute profile checklist states dynamically from viewerProfile per DESIGN.md § 5.3
  const isProfileCreated = Boolean(viewerProfile?.onboardingComplete);
  const isProfilePublic = viewerProfile
    ? viewerProfile.isPublic !== false && !viewerProfile.isDeactivated
    : true;
  const hasExperience = Boolean(
    viewerProfile?.hasExperience && viewerProfile?.experienceDetails?.trim()
  );

  // If search/filter returns 0 results
  if (hasPublicStudents) {
    return (
      <div
        className={`max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-2xl text-center transition-all ${
          isLight
            ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0e0918] border-2 border-white/20 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        <span
          className={`inline-block font-mono text-xs font-bold uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full mb-4 ${
            isLight
              ? "bg-[#f4f4f2] text-[#0a0a0a] border border-[#0a0a0a]"
              : "bg-[#18121d] text-white border border-white/20"
          }`}
        >
          No Matches Found
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3">
          No students match your filters
        </h3>
        <p
          className={`font-sans text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8 ${
            isLight ? "text-neutral-600" : "text-neutral-300"
          }`}
        >
          Try resetting your filters or clearing keywords to see all classmates on the discovery grid.
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

  // True empty grid state with IsometricEmptyDrawing & Onboarding Checklist per DESIGN.md § 5.3
  return (
    <div className="w-full max-w-5xl mx-auto my-8 sm:my-12 px-2 sm:px-4">
      <div
        className={`rounded-2xl transition-all p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center ${
          isLight
            ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0d0916] border-2 border-white/20 shadow-[8px_8px_0px_#000000] text-white"
        }`}
      >
        {/* Left: Isometric 3D Grid Animation */}
        <div className="flex items-center justify-center w-full max-w-md mx-auto overflow-hidden">
          <IsometricEmptyDrawing />
        </div>

        {/* Right: Content & Profile Checklist */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Stamp */}
          <div
            className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded border border-dashed font-mono text-xs font-bold uppercase tracking-wider ${
              isLight
                ? "border-[#0a0a0a] text-[#0a0a0a] bg-neutral-100"
                : "border-white/30 text-neutral-300 bg-white/5"
            }`}
          >
            <Sparkles size={13} className="text-[#fb923c]" />
            <span>Opens as classmates join</span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-tight">
            No classmates on the grid yet
          </h2>

          {/* Subtitle */}
          <p
            className={`font-sans text-sm sm:text-base leading-relaxed ${
              isLight ? "text-neutral-600" : "text-neutral-300"
            }`}
          >
            CECS students at UM-Dearborn show up here once they make their profile public. Your own profile is hidden from your view, so the grid stays empty until others join.
          </p>

          {/* Checklist */}
          <ol className="flex flex-col gap-2.5 my-2 list-none p-0" aria-label="Profile completion steps">
            {/* Step 1: Create your profile */}
            <li
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isProfileCreated
                  ? isLight
                    ? "bg-neutral-100 text-[#0a0a0a]"
                    : "bg-white/5 text-neutral-200"
                  : isLight
                  ? "bg-[#0a0a0a] text-white shadow-md"
                  : "bg-white/10 text-white border border-white/20 shadow-md"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isProfileCreated
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-[#fb923c] text-[#fb923c]"
                }`}
              >
                {isProfileCreated ? <Check size={14} strokeWidth={3} /> : <span className="w-2 h-2 rounded-full bg-[#fb923c]" />}
              </span>
              <span className="flex-1">Create your profile</span>
              <span
                className={`font-mono text-xs uppercase font-bold tracking-wider ${
                  isProfileCreated ? "opacity-60" : "text-[#fb923c]"
                }`}
              >
                {isProfileCreated ? "Done" : "Next"}
              </span>
            </li>

            {/* Step 2: Make it public */}
            <li
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isProfilePublic
                  ? isLight
                    ? "bg-neutral-100 text-[#0a0a0a]"
                    : "bg-white/5 text-neutral-200"
                  : isLight
                  ? "bg-[#0a0a0a] text-white shadow-md"
                  : "bg-white/10 text-white border border-white/20 shadow-md"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isProfilePublic
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-[#fb923c] text-[#fb923c]"
                }`}
              >
                {isProfilePublic ? <Check size={14} strokeWidth={3} /> : <span className="w-2 h-2 rounded-full bg-[#fb923c]" />}
              </span>
              <span className="flex-1">Make your profile public</span>
              <span
                className={`font-mono text-xs uppercase font-bold tracking-wider ${
                  isProfilePublic ? "opacity-60" : "text-[#fb923c]"
                }`}
              >
                {isProfilePublic ? "Done" : "Next"}
              </span>
            </li>

            {/* Step 3: Add experience & what you're looking for */}
            <li
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                hasExperience
                  ? isLight
                    ? "bg-neutral-100 text-[#0a0a0a]"
                    : "bg-white/5 text-neutral-200"
                  : isLight
                  ? "bg-neutral-50 text-neutral-700 border border-neutral-200"
                  : "bg-white/[0.03] text-neutral-400 border border-white/10"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  hasExperience
                    ? "bg-emerald-500 text-white"
                    : "border border-dashed border-neutral-400 text-neutral-400"
                }`}
              >
                {hasExperience ? <Check size={14} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />}
              </span>
              <span className="flex-1">Add experience & what you&apos;re looking for</span>
              <span className="font-mono text-xs uppercase font-bold tracking-wider opacity-60">
                {hasExperience ? "Done" : "Optional"}
              </span>
            </li>
          </ol>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/account-page"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {isProfileCreated ? "View Your Profile" : "Set Up Your Profile"}
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-2 h-12 px-5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                isLight
                  ? "bg-neutral-100 border-[#0a0a0a] text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:bg-neutral-200"
                  : "bg-white/5 border-white/25 text-white shadow-[3px_3px_0px_#000000] hover:bg-white/10"
              }`}
            >
              <Copy size={15} />
              <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
