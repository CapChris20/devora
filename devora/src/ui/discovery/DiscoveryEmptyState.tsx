// Empty state for the Discovery Grid per DESIGN.md § 5.3.
// Replaces the old faint placeholder cards.
// Paper poster with a pink hard shadow, padding 48, grid 1fr 1.1fr from 980px:
// Left: IsometricEmptyDrawing
// Right: "Opens as classmates join" stamp, "No classmates on the grid yet" h2,
// onboarding checklist <ol> with ink check discs / pink ring,
// primary button "Finish your profile" + .link "Copy invite link".

"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, Copy } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";
import IsometricEmptyDrawing from "./IsometricEmptyDrawing";

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
};

export default function DiscoveryEmptyState({
  hasPublicStudents,
  onClearFilters,
  viewerProfile,
  onToast,
}: DiscoveryEmptyStateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/auth/signup`);
      setCopied(true);
      if (onToast) {
        onToast("Invite link copied to clipboard.");
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Compute profile checklist states dynamically per DESIGN.md § 5.3
  const isProfileCreated = Boolean(viewerProfile?.onboardingComplete);
  const isProfilePublic = viewerProfile
    ? viewerProfile.isPublic !== false && !viewerProfile.isDeactivated
    : true;
  const hasExperience = Boolean(
    viewerProfile?.hasExperience && viewerProfile?.experienceDetails?.trim()
  );

  const isAllComplete = isProfileCreated && isProfilePublic && hasExperience;

  // If search/filter miss, show simple reset box
  if (hasPublicStudents) {
    return (
      <div className="poster w-full max-w-2xl mx-auto p-10 text-center my-8">
        <h2 className="t-card text-[22px] text-[var(--ink)] mb-3">
          No students match your filters
        </h2>
        <p className="text-[16px] text-[var(--ink-body)] mb-6">
          Try resetting your filters or clearing keywords to see all classmates on
          the grid.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="btn-primary mx-auto"
        >
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  // True empty network: per § 5.3
  return (
    <div className="discovery-empty-container">
      <div className="poster discovery-empty-poster">
        {/* Left: Isometric empty-grid drawing */}
        <div className="discovery-empty-drawing-col">
          <IsometricEmptyDrawing />
        </div>

        {/* Right: Content */}
        <div className="discovery-empty-content-col">
          {/* Stamp */}
          <div className="empty-stamp">
            <Sparkles size={14} color="#ff5ca8" />
            <span>Opens as classmates join</span>
          </div>

          {/* Heading */}
          <h2 className="empty-heading">
            No classmates on the grid yet
          </h2>

          {/* Body */}
          <p className="empty-body">
            CECS students at UM&#8209;Dearborn show up here once they make their
            profile public. Your own profile is hidden from your view, so the grid
            stays empty until others join.
          </p>

          {/* Checklist computed from real profile */}
          <ol className="empty-checklist" aria-label="Profile completion steps">
            {/* Step 1: Create your profile */}
            {isProfileCreated ? (
              <li className="step-item step-done">
                <span className="step-disc step-disc-done">
                  <Check size={14} color="var(--paper)" strokeWidth={3} />
                </span>
                <span className="step-text">Create your profile</span>
                <span className="step-status-chip">Done</span>
              </li>
            ) : (
              <li className="step-item step-next">
                <span className="step-disc step-disc-next">
                  <span className="next-dot" />
                </span>
                <span className="step-text text-white">Create your profile</span>
                <span className="step-status-chip next-chip">Next</span>
              </li>
            )}

            {/* Step 2: Make it public */}
            {isProfilePublic ? (
              <li className="step-item step-done">
                <span className="step-disc step-disc-done">
                  <Check size={14} color="var(--paper)" strokeWidth={3} />
                </span>
                <span className="step-text">Make it public</span>
                <span className="step-status-chip">Done</span>
              </li>
            ) : (
              <li className="step-item step-next">
                <span className="step-disc step-disc-next">
                  <span className="next-dot" />
                </span>
                <span className="step-text text-white">Make your profile public in Settings</span>
                <span className="step-status-chip next-chip">Next</span>
              </li>
            )}

            {/* Step 3: Add experience */}
            {hasExperience ? (
              <li className="step-item step-done">
                <span className="step-disc step-disc-done">
                  <Check size={14} color="var(--paper)" strokeWidth={3} />
                </span>
                <span className="step-text">Experience &amp; projects added</span>
                <span className="step-status-chip">Done</span>
              </li>
            ) : isProfilePublic ? (
              <li className="step-item step-next">
                <span className="step-disc step-disc-next">
                  <span className="next-dot" />
                </span>
                <span className="step-text text-white">
                  Add experience so classmates know what you work on
                </span>
                <span className="step-status-chip next-chip">Next</span>
              </li>
            ) : (
              <li className="step-item step-pending">
                <span className="step-disc step-disc-pending" />
                <span className="step-text text-[var(--ink-muted)]">
                  Add experience so classmates know what you work on
                </span>
                <span className="step-status-chip">Todo</span>
              </li>
            )}
          </ol>

          {/* Actions */}
          <div className="empty-actions-row">
            <Link href="/account-page" className="btn-primary">
              <span>{isAllComplete ? "View your profile" : "Finish your profile"}</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="copy-link-btn"
            >
              <Copy size={16} />
              <span>{copied ? "Link copied!" : "Copy invite link"}</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .discovery-empty-container {
          width: 100%;
          max-width: 1120px;
          margin-inline: auto;
          padding-block: 40px;
        }

        .discovery-empty-poster {
          position: relative;
          background: var(--paper);
          color: var(--ink);
          border: 2px solid var(--ink);
          border-radius: 14px;
          padding: clamp(28px, 4vw, 48px);
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
          align-items: center;
        }

        .discovery-empty-poster::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: var(--grad);
          translate: 7px 7px;
          z-index: -1;
        }

        @media (min-width: 980px) {
          .discovery-empty-poster {
            grid-template-columns: 1fr 1.1fr;
            gap: 48px;
          }
        }

        .discovery-empty-drawing-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .discovery-empty-content-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-stamp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          height: 28px;
          padding: 0 12px;
          border-radius: 4px;
          border: 2px dashed var(--ink);
          font-family: var(--f-mono);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink);
        }

        .empty-heading {
          font-family: var(--f-display);
          font-weight: 800;
          font-size: clamp(26px, 3.2vw, 42px);
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: -0.025em;
          color: var(--ink);
          margin: 0;
        }

        .empty-body {
          font-size: 16px;
          line-height: 1.55;
          color: var(--ink-body);
          margin: 0;
        }

        .empty-checklist {
          list-style: none;
          padding: 0;
          margin: 8px 0 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
        }

        .step-done {
          background: var(--paper-2);
          color: var(--ink);
        }

        .step-next {
          background: var(--ink);
          color: white;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }

        .step-pending {
          background: var(--paper-2);
          opacity: 0.65;
        }

        .step-disc {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-disc-done {
          background: var(--ink);
        }

        .step-disc-next {
          background: transparent;
          border: 2px solid #ff5ca8;
          box-shadow: 0 0 10px rgb(255 92 168 / 0.45);
        }

        .step-disc-pending {
          background: transparent;
          border: 2px dashed var(--ink-muted);
        }

        .next-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--grad);
        }

        .step-text {
          flex: 1;
        }

        .step-status-chip {
          font-family: var(--f-mono);
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          opacity: 0.7;
        }

        .next-chip {
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 1;
        }

        .empty-actions-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 20px;
          margin-top: 8px;
        }

        .copy-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          font-family: var(--f-body);
          font-size: 15px;
          font-weight: 700;
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          padding: 8px 0;
        }

        .copy-link-btn:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
