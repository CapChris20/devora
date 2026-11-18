// Empty state for Discovery Grid — Coach Connect "Design Law" (discovery-empty-state.html).
// Left: Classroom seat map filling up with initial avatars (YOU at seat 16).
// Right: Copy, "OPENS AS CLASSMATES JOIN" sticker, 3-step progress track, CTAs.
// When filters match nobody: "No one matches these filters" with "Reset all filters" button.
// Zero emojis, zero pink borders, zero AI slop.

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";
import type { DiscoveryProfile } from "./mock-profiles";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

const INVITE_PATH = "/auth/signup";
const COPIED_LABEL_DURATION_MS = 2200;

const SEAT_GRADIENTS = [
  "bg-gradient-to-br from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a]", // brand
  "bg-gradient-to-br from-[#a78bfa] to-[#e879f9] text-[#0a0a0a]", // orchid
  "bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] text-[#0a0a0a]", // sky
  "bg-gradient-to-br from-[#fda4af] to-[#fb923c] text-[#0a0a0a]", // blush
];

const INITIALS_POOL = ["MK", "AS", "TJ", "RL", "NP", "DV", "HB", "OC", "SY", "EZ", "LW", "GF"];

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
  const [isInviteCopied, setIsInviteCopied] = useState(false);

  // Seat state for 24 seats (index 15 is "YOU")
  const [seatedAvatars, setSeatedAvatars] = useState<Record<number, { initials: string; gradientClass: string }>>({
    4: { initials: "AS", gradientClass: SEAT_GRADIENTS[1] },
    8: { initials: "MK", gradientClass: SEAT_GRADIENTS[0] },
    19: { initials: "RL", gradientClass: SEAT_GRADIENTS[2] },
  });

  const seatMapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const stickerRef = useRef<HTMLSpanElement>(null);

  // Compute profile checklist progress
  const isProfileCreated = Boolean(viewerProfile?.onboardingComplete);
  const isProfilePublic = viewerProfile
    ? viewerProfile.isPublic !== false && !viewerProfile.isDeactivated
    : false;
  const hasExperience = Boolean(
    viewerProfile?.hasExperience && viewerProfile?.experienceDetails?.trim()
  );

  // Stage: 0 = none, 1 = created, 2 = public, 3 = all done
  let currentStage = 0;
  if (isProfileCreated) currentStage = 1;
  if (isProfileCreated && isProfilePublic) currentStage = 2;
  if (isProfileCreated && isProfilePublic && hasExperience) currentStage = 3;

  const STEPS = [
    { label: "Create your profile", isDone: currentStage >= 1, isNext: currentStage === 0 },
    { label: "Make it public", isDone: currentStage >= 2, isNext: currentStage === 1 },
    { label: "Add experience & goals", isDone: currentStage >= 3, isNext: currentStage === 2 },
  ];

  // Dynamic avatar popping in seat map
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setSeatedAvatars((prev) => {
        const occupiedKeys = Object.keys(prev).map(Number);
        // Available seats (excluding index 15 "YOU")
        const allPossible = Array.from({ length: 24 }, (_, i) => i).filter((i) => i !== 15);
        const free = allPossible.filter((i) => !occupiedKeys.includes(i));

        if (free.length === 0 || occupiedKeys.length >= 6) {
          // Remove an older one
          const removeIdx = occupiedKeys[0];
          const next = { ...prev };
          delete next[removeIdx];
          return next;
        }

        const chosenSeat = free[Math.floor(Math.random() * free.length)];
        const randomInitials = INITIALS_POOL[Math.floor(Math.random() * INITIALS_POOL.length)];
        const randomGrad = SEAT_GRADIENTS[Math.floor(Math.random() * SEAT_GRADIENTS.length)];

        return {
          ...prev,
          [chosenSeat]: { initials: randomInitials, gradientClass: randomGrad },
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyInviteLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${INVITE_PATH}`);
      setIsInviteCopied(true);
      onToast?.("Invite link copied to clipboard.");
      setTimeout(() => setIsInviteCopied(false), COPIED_LABEL_DURATION_MS);
    } catch {
      onToast?.("Could not copy link.");
    }
  };

  // Branch 1: Filters matched nobody
  if (hasPublicStudents) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto">
        <article
          className={`rounded-[10px] p-8 sm:p-10 text-center border-[3px] transition-all ${
            isLight
              ? "bg-white border-[#0a0a0a] shadow-[7px_7px_0px_#0a0a0a]"
              : "bg-[#120c1c] border-2 border-white/25 shadow-[8px_8px_0px_#000000]"
          }`}
        >
          <h2 className="m-0 font-display uppercase font-normal text-2xl sm:text-3xl lg:text-4xl text-[#0a0a0a] dark:text-white leading-[0.95]">
            No one matches these filters
          </h2>
          <p className="mt-3 mb-6 font-body text-base sm:text-lg text-[#575757] dark:text-neutral-300 max-w-[42ch] mx-auto">
            Try widening your search, removing major or course filters, or clearing them all.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[10px] border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer dark:bg-white dark:text-[#0a0a0a] dark:border-white"
          >
            Reset all filters
          </button>
        </article>
      </div>
    );
  }

  // Branch 2: Empty grid (seat map + copy + progress track)
  const trackWidth = `${Math.min(currentStage, 2) * 50}%`;

  return (
    <div className="py-6 sm:py-10 max-w-[1140px] mx-auto px-4 sm:px-6">
      <article
        ref={cardRef}
        className={`rounded-[10px] overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] border-[3px] transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[7px_7px_0px_#0a0a0a]"
            : "bg-[#120c1c] border-2 border-white/25 shadow-[8px_8px_0px_#000000]"
        }`}
      >
        {/* ── Left Column: Classroom Seat Map ── */}
        <div
          ref={seatMapRef}
          className={`p-6 sm:p-8 flex flex-col justify-center gap-4 border-b-[3px] lg:border-b-0 lg:border-r-[3px] ${
            isLight
              ? "bg-[#f2f2f0] border-[#0a0a0a]"
              : "bg-[#161022] border-white/20"
          }`}
        >
          {/* Front of classroom marker */}
          <span className="self-center px-4 py-1 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#1f1630] font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0a0a0a] dark:text-white shadow-[2px_2px_0px_#0a0a0a]">
            FRONT OF CLASS
          </span>

          {/* 24-Seat Grid */}
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 max-w-[380px] mx-auto w-full">
            {Array.from({ length: 24 }).map((_, idx) => {
              const isYou = idx === 15;
              const occupant = seatedAvatars[idx];

              if (isYou) {
                return (
                  <div
                    key={idx}
                    className="aspect-square flex items-center justify-center rounded-[9px] border-[2.5px] border-[#0a0a0a] dark:border-white bg-white dark:bg-[#201730] text-[#0a0a0a] dark:text-white font-mono text-[11px] font-black tracking-wider shadow-[2px_2px_0px_#0a0a0a]"
                  >
                    YOU
                  </div>
                );
              }

              if (occupant) {
                return (
                  <div
                    key={idx}
                    className={`aspect-square flex items-center justify-center rounded-[9px] border-[2.5px] border-[#0a0a0a] font-bold text-xs shadow-[2px_2px_0px_#0a0a0a] ${occupant.gradientClass}`}
                  >
                    {occupant.initials}
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="aspect-square flex items-center justify-center rounded-[9px] border-[2.5px] border-dashed border-[#9b9b96] dark:border-white/20"
                />
              );
            })}
          </div>

          <p className="text-center font-mono text-xs text-[#575757] dark:text-neutral-400 mt-1">
            Fills as classmates join
          </p>
        </div>

        {/* ── Right Column: Copy + Progress Track + CTAs ── */}
        <div className="relative p-6 sm:p-9 flex flex-col justify-between min-w-0">
          {/* Top Sticker */}
          <div className="flex items-start justify-end">
            <span
              ref={stickerRef}
              className="px-3 py-1 rounded-[8px] border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] font-mono text-[11px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] rotate-[4deg] select-none"
            >
              OPENS AS CLASSMATES JOIN
            </span>
          </div>

          {/* Headline */}
          <h2 className="mt-4 font-display uppercase font-normal text-3xl sm:text-4xl lg:text-[42px] leading-[0.92] tracking-tight text-[#0a0a0a] dark:text-white">
            Find your people
          </h2>

          <p className="mt-3.5 font-body text-base sm:text-[17px] leading-[1.6] text-[#575757] dark:text-neutral-300 max-w-[46ch]">
            CECS students at UM-Dearborn populate this grid as they make their profiles public. Be one
            of the first, or invite a friend to see who&apos;s in your courses.
          </p>

          {/* 3-Step Progress Track */}
          <div className="relative mt-8 mb-6">
            {/* Horizontal Track Bar */}
            <div
              aria-hidden="true"
              className="absolute top-[22px] left-[16.66%] right-[16.66%] h-2.5 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#181124] overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-[#6206f1] via-[#eb2d85] to-[#ff6a1f] transition-all duration-500"
                style={{ width: trackWidth }}
              />
            </div>

            {/* 3 Step Nodes */}
            <ol className="relative grid grid-cols-3 gap-2 list-none p-0 m-0">
              {STEPS.map((step, idx) => {
                let nodeStyle = "bg-white text-[#0a0a0a] border-[#0a0a0a] dark:bg-[#1a1426] dark:text-white dark:border-white/30";
                if (step.isDone) {
                  nodeStyle = "bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] border-[#0a0a0a]";
                } else if (step.isNext) {
                  nodeStyle = "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[0_0_0_3px_#ffffff,0_0_0_5px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white dark:shadow-[0_0_0_3px_#120c1c,0_0_0_5px_#ffffff]";
                }

                let statusLabel = "To do";
                if (step.isDone) statusLabel = "Done";
                else if (step.isNext) statusLabel = "Next";
                else if (idx === 2) statusLabel = "Optional";

                return (
                  <li key={step.label} className="flex flex-col items-center text-center gap-1.5">
                    <span
                      className={`w-11 h-11 rounded-full border-[3px] flex items-center justify-center font-display text-sm font-normal select-none transition-all ${nodeStyle}`}
                    >
                      {step.isDone ? <Check size={18} strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className="font-body font-bold text-xs sm:text-sm leading-tight text-[#0a0a0a] dark:text-white mt-1">
                      {step.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                        step.isNext
                          ? "px-2 py-0.5 rounded-full border border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a]"
                          : "text-[#575757] dark:text-neutral-400"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/account-page"
              className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[10px] border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer dark:bg-white dark:text-[#0a0a0a] dark:border-white"
            >
              {currentStage > 0 ? "View your profile" : "Set up your profile"}
            </Link>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className={`inline-flex items-center gap-2 min-h-[46px] px-5 rounded-[10px] border-[3px] font-bold text-sm uppercase tracking-wider transition-all duration-120 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isLight
                  ? "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:bg-[#f2f2f0]"
                  : "bg-[#181124] text-white border-white/30 shadow-[4px_4px_0px_#000000] hover:border-white/60"
              }`}
            >
              <Copy size={16} />
              <span>{isInviteCopied ? "Link copied" : "Copy invite link"}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
