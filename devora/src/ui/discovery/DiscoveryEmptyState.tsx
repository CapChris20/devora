// Empty state for the Discovery Grid (DESIGN_SCOPE.md anti-patterns, DESIGN.md NOT list).
// Two cases: filters matched nobody (small reset card), or nobody is public yet
// (isometric drawing on the left; kicker, headline, profile checklist and CTAs on the right).
// One solid card surface: no boxes inside boxes, no pink borders, no emojis.

"use client";

// ===== IMPORTS =====

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";
import type { DiscoveryProfile } from "./mock-profiles";
import IsometricEmptyDrawing from "./IsometricEmptyDrawing";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// ===== NAMED CONSTANTS =====

const INVITE_PATH = "/auth/signup";
const COPIED_LABEL_DURATION_MS = 2400;

const PRIMARY_BUTTON_CLASS_NAME =
  "inline-flex items-center justify-center h-12 px-6 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider " +
  "bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#000000] " +
  "transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_#000000] " +
  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000000] cursor-pointer select-none";

// ===== TYPES =====

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
  onViewProfile?: (profile: DiscoveryProfile) => void;
  requestedProfileIds?: string[];
};

type ChecklistStepStatus = "done" | "next" | "later";

type ChecklistStep = {
  label: string;
  isDone: boolean;
  isOptional: boolean;
};

// ===== HELPERS =====

// The first step that is not done is "next"; the ones after it wait.
function getStepStatuses(steps: ChecklistStep[]): ChecklistStepStatus[] {
  const firstUnfinishedIndex = steps.findIndex((step) => !step.isDone);
  return steps.map((step, stepIndex) => {
    if (step.isDone) return "done";
    if (stepIndex === firstUnfinishedIndex) return "next";
    return "later";
  });
}

function getStepStatusLabel(status: ChecklistStepStatus, isOptional: boolean): string {
  if (status === "done") return "Done";
  if (status === "next") return "Next";
  if (isOptional) return "Optional";
  return "To do";
}

// ===== MAIN =====

export default function DiscoveryEmptyState({
  hasPublicStudents,
  onClearFilters,
  viewerProfile,
  onToast,
}: DiscoveryEmptyStateProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [isInviteCopied, setIsInviteCopied] = useState(false);

  // 1. Copy the sign-up link so the viewer can invite classmates
  const handleCopyInviteLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${INVITE_PATH}`);
      setIsInviteCopied(true);
      onToast?.("Invite link copied to clipboard.");
      setTimeout(() => setIsInviteCopied(false), COPIED_LABEL_DURATION_MS);
    } catch {
      onToast?.("Could not copy the link. Copy it from the address bar instead.");
    }
  };

  // 2. Work out the viewer's profile checklist from their Firestore profile
  const isProfileCreated = Boolean(viewerProfile?.onboardingComplete);
  const isProfilePublic = viewerProfile
    ? viewerProfile.isPublic !== false && !viewerProfile.isDeactivated
    : false;
  const hasExperience = Boolean(
    viewerProfile?.hasExperience && viewerProfile?.experienceDetails?.trim()
  );

  const checklistSteps: ChecklistStep[] = [
    { label: "Create your profile", isDone: isProfileCreated, isOptional: false },
    { label: "Make it public", isDone: isProfilePublic, isOptional: false },
    {
      label: "Add experience & what you're looking for",
      isDone: hasExperience,
      isOptional: true,
    },
  ];
  const checklistStatuses = getStepStatuses(checklistSteps);

  const cardSurfaceClassName = isLight
    ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
    : "bg-[#120c1c] border-2 border-white/20 shadow-[8px_8px_0px_#000000] text-white";
  const mutedTextClassName = isLight ? "text-neutral-600" : "text-neutral-300";

  // 3. Filters matched nobody: a small card that resets them
  if (hasPublicStudents) {
    return (
      <div className={`max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-2xl text-center ${cardSurfaceClassName}`}>
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3">
          No students match your filters
        </h3>
        <p className={`font-body text-base leading-[1.6] max-w-lg mx-auto mb-8 ${mutedTextClassName}`}>
          Clear a filter or a keyword to see every classmate on the grid again.
        </p>
        <button type="button" onClick={onClearFilters} className={PRIMARY_BUTTON_CLASS_NAME}>
          Reset all filters
        </button>
      </div>
    );
  }

  // 4. Nobody is public yet: drawing, headline, checklist and CTAs
  return (
    <div className="w-full max-w-5xl mx-auto my-8 sm:my-12 px-2 sm:px-4">
      <div
        className={`rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-14 items-center ${cardSurfaceClassName}`}
      >
        {/* Left: animated isometric grid */}
        <div className="flex items-center justify-center w-full max-w-md mx-auto overflow-hidden">
          <IsometricEmptyDrawing />
        </div>

        {/* Right: copy, checklist, actions */}
        <div className="flex flex-col min-w-0">
          <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full border border-dashed border-[#ff9a3d]/60 bg-[#ff9a3d]/10 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff9a3d]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9a3d] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff9a3d]" />
            </span>
            <span>OPENS AS CLASSMATES JOIN // LIVE RADAR</span>
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[44px] font-black uppercase tracking-tight leading-[0.98]">
            No classmates on the{" "}
            <span className={isLight ? "text-[#0a0a0a]" : "bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] bg-clip-text text-transparent"}>
              grid yet
            </span>
          </h2>

          <p className={`mt-5 font-body text-base sm:text-[17px] leading-[1.6] ${mutedTextClassName}`}>
            CECS students at UM-Dearborn show up here once they make their profile public. Your own
            profile is hidden from your view, so the grid stays empty until others join.
          </p>

          <ol
            aria-label="Profile checklist"
            className={`mt-7 list-none p-0 border-t-2 ${isLight ? "border-[#0a0a0a]/15" : "border-white/10"}`}
          >
            {checklistSteps.map((step, stepIndex) => (
              <ChecklistRow
                key={step.label}
                step={step}
                stepNumber={stepIndex + 1}
                status={checklistStatuses[stepIndex]}
                isLight={isLight}
              />
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/account-page" className={PRIMARY_BUTTON_CLASS_NAME}>
              {isProfileCreated ? "View your profile" : "Set up your profile"}
            </Link>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className={`inline-flex items-center gap-2 h-12 px-5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-2 transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 cursor-pointer select-none ${
                isLight
                  ? "bg-white border-[#0a0a0a] text-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] active:shadow-[2px_2px_0px_#0a0a0a]"
                  : "bg-[#1b1428] border-white/30 text-white shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000]"
              }`}
            >
              <Copy size={15} aria-hidden="true" />
              <span>{isInviteCopied ? "Link copied" : "Copy invite link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CHECKLIST ROW =====

type ChecklistRowProps = {
  step: ChecklistStep;
  stepNumber: number;
  status: ChecklistStepStatus;
  isLight: boolean;
};

// One line of the checklist, sitting directly on the card with a divider under it
function ChecklistRow({ step, stepNumber, status, isLight }: ChecklistRowProps) {
  const isDone = status === "done";
  const isNext = status === "next";
  const dividerClassName = isLight ? "border-[#0a0a0a]/15" : "border-white/10";

  let discClassName = isLight
    ? "border-2 border-[#0a0a0a]/30 text-neutral-500"
    : "border-2 border-white/25 text-neutral-400";
  if (isDone) discClassName = "bg-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a]";
  if (isNext) {
    discClassName = isLight
      ? "bg-[#0a0a0a] text-white border-2 border-[#0a0a0a]"
      : "bg-white text-[#0a0a0a] border-2 border-white";
  }

  let labelClassName = isLight ? "text-neutral-500" : "text-neutral-400";
  if (isDone || isNext) labelClassName = isLight ? "text-[#0a0a0a]" : "text-white";

  let statusClassName = isLight ? "text-neutral-500" : "text-neutral-400";
  if (isNext) statusClassName = "text-[#FB923C]";

  return (
    <li className={`flex items-center gap-4 py-3.5 border-b-2 ${dividerClassName}`}>
      <span
        aria-hidden="true"
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold ${discClassName}`}
      >
        {isDone ? <Check size={15} strokeWidth={3} /> : stepNumber}
      </span>
      <span className={`flex-1 font-body text-[15px] sm:text-base font-semibold leading-snug ${labelClassName}`}>
        {step.label}
      </span>
      <span className={`font-mono text-xs font-bold uppercase tracking-wider ${statusClassName}`}>
        {getStepStatusLabel(status, step.isOptional)}
      </span>
    </li>
  );
}
