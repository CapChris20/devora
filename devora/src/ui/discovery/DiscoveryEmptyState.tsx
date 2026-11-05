// Discovery Grid empty state — 4-card open-seats layout with signature hard shadows.
// Replaces the cluttered single-poster empty state per user request:
// Features 3 or 4 open-seat cards in a responsive grid, each displaying Devora's
// signature 3D hard offset shadows, avatar placeholders, tags, and interactive CTAs.

"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, UserPlus, Users, Code, Cpu, Database } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
};

type OpenSeatMeta = {
  seatNumber: string;
  title: string;
  major: string;
  status: string;
  tags: string[];
  shadowColor: string;
  ringGradient: string;
  icon: typeof UserPlus;
  isSelfSlot?: boolean;
};

const OPEN_SEATS: OpenSeatMeta[] = [
  {
    seatNumber: "01",
    title: "Your Seat",
    major: "Computer Science",
    status: "Ready to join the grid",
    tags: ["Full-Stack", "Web & Mobile", "AI / ML"],
    shadowColor: "#ff9a3d",
    ringGradient: "linear-gradient(135deg, #ff9a3d, #ff5ca8)",
    icon: Sparkles,
    isSelfSlot: true,
  },
  {
    seatNumber: "02",
    title: "Seat 02 · Open",
    major: "Software Engineering",
    status: "Awaiting first classmate",
    tags: ["Cloud Architecture", "Cybersecurity", "Hackathons"],
    shadowColor: "#ff5ca8",
    ringGradient: "linear-gradient(135deg, #ff5ca8, #ff2bd6)",
    icon: Code,
  },
  {
    seatNumber: "03",
    title: "Seat 03 · Open",
    major: "Computer Engineering",
    status: "Awaiting first classmate",
    tags: ["Embedded Systems", "Robotics", "Hardware / IoT"],
    shadowColor: "#ff2bd6",
    ringGradient: "linear-gradient(135deg, #ff5ca8, #ff2bd6)",
    icon: Cpu,
  },
  {
    seatNumber: "04",
    title: "Seat 04 · Open",
    major: "Data Science & AI",
    status: "Awaiting first classmate",
    tags: ["Machine Learning", "Data Pipelines", "Algorithms"],
    shadowColor: "#ff9a3d",
    ringGradient: "linear-gradient(135deg, #ff9a3d, #ff5ca8)",
    icon: Database,
  },
];

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
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const isProfileComplete = Boolean(viewerProfile?.onboardingComplete);

  // If search/filter miss, show simple reset box
  if (hasPublicStudents) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "40px auto",
          padding: "36px 28px",
          textAlign: "center",
          background: "var(--paper, #f4eef0)",
          color: "var(--ink, #0d0b0e)",
          border: "2px solid var(--ink, #0d0b0e)",
          borderRadius: 16,
          boxShadow: "7px 7px 0 0 var(--pink, #ff5ca8)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display), 'Unbounded', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          No students match your filters
        </h2>
        <p
          style={{
            fontSize: 15.5,
            color: "var(--ink-body, #2a2226)",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          Try resetting your filters or clearing keywords to see all classmates on the grid.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="btn btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minHeight: 46,
            padding: "0 24px",
            borderRadius: 9999,
            background: "linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)",
            color: "#0d0b0e",
            fontWeight: 800,
            border: "2px solid #0d0b0e",
            boxShadow: "3px 3px 0 0 #0d0b0e",
            cursor: "pointer",
          }}
        >
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  // True empty grid: 4-card open-seat layout with hard offset shadows
  return (
    <section className="discovery-empty-seats-wrapper" aria-label="Seats open on Discovery Grid">
      {/* ── Top Header Banner ── */}
      <div className="discovery-empty-seats-header">
        <div className="empty-eyebrow-pill">
          <Sparkles size={13} color="#ff5ca8" />
          <span>Seats Still Open · CECS Hub</span>
        </div>

        <h2 className="empty-main-title">
          No Classmates On The Grid Yet
        </h2>

        <p className="empty-main-subtitle">
          CECS students at UM‑Dearborn appear here once they make their profiles public.
          Invite your peers or complete your profile to take the first seat.
        </p>

        <div className="empty-cta-actions">
          <Link
            href="/account-page"
            className="empty-cta-primary"
          >
            <span>{isProfileComplete ? "View Your Profile" : "Finish Your Profile"}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="empty-cta-secondary"
            aria-label="Copy invite link"
          >
            <Copy size={16} />
            <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
          </button>
        </div>
      </div>

      {/* ── 4-Up Open Seat Cards Grid with Shadows ── */}
      <div className="empty-seats-grid">
        {OPEN_SEATS.map((seat) => {
          const IconComponent = seat.icon;
          return (
            <article
              key={seat.seatNumber}
              className="open-seat-card"
              style={{
                boxShadow: `7px 7px 0 0 ${seat.shadowColor}`,
              }}
            >
              {/* Top Accent Band */}
              <div className="seat-card-band">
                <span className="seat-badge">SEAT {seat.seatNumber}</span>
                <span className="seat-chip-open">OPEN</span>
              </div>

              {/* Avatar Ring */}
              <div
                className="seat-avatar-ring"
                style={{
                  background: `linear-gradient(#f4eef0, #f4eef0) padding-box, ${seat.ringGradient} border-box`,
                }}
              >
                <IconComponent
                  size={32}
                  color={seat.shadowColor}
                  strokeWidth={2.2}
                />
              </div>

              {/* Identity */}
              <div className="seat-card-body">
                <h3 className="seat-card-name">
                  {seat.isSelfSlot ? (viewerProfile?.displayName || "You") : seat.title}
                </h3>
                <p className="seat-card-major">{seat.major}</p>
                <p className="seat-card-status">{seat.status}</p>
              </div>

              {/* Tag Pills */}
              <div className="seat-card-tags">
                {seat.tags.map((tag) => (
                  <span key={tag} className="seat-tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              {seat.isSelfSlot ? (
                <Link
                  href="/account-page"
                  className="seat-action-btn seat-self-btn"
                >
                  <span>Claim Seat</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="seat-action-btn seat-invite-btn"
                >
                  <Users size={15} />
                  <span>Invite Peer</span>
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
