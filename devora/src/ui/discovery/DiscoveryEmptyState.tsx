// Discovery Grid empty state — Faint Placeholder Cards ("Awaiting Enrollments")
// per Option 1: 3-4 faint ghost / placeholder cards with dashed frames,
// empty avatar rings, signature hard offset shadows, and "Awaiting enrollments" styling.

"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, User, Sparkles } from "lucide-react";
import type { UserProfile } from "@/backend/firebase";

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
};

type PlaceholderCardMeta = {
  slot: string;
  majorHint: string;
  shadowColor: string;
  ringColor: string;
  tagHints: string[];
};

const PLACEHOLDER_CARDS: PlaceholderCardMeta[] = [
  {
    slot: "01",
    majorHint: "Computer Science",
    shadowColor: "#ff9a3d",
    ringColor: "rgba(255, 154, 61, 0.6)",
    tagHints: ["Software Dev", "Web & Mobile", "Algorithms"],
  },
  {
    slot: "02",
    majorHint: "Software Engineering",
    shadowColor: "#ff5ca8",
    ringColor: "rgba(255, 92, 168, 0.6)",
    tagHints: ["Cloud Systems", "DevOps", "Cybersecurity"],
  },
  {
    slot: "03",
    majorHint: "Computer Engineering",
    shadowColor: "#ff2bd6",
    ringColor: "rgba(255, 43, 214, 0.6)",
    tagHints: ["Embedded", "Robotics", "Hardware"],
  },
  {
    slot: "04",
    majorHint: "Data Science",
    shadowColor: "#ff9a3d",
    ringColor: "rgba(255, 154, 61, 0.6)",
    tagHints: ["Machine Learning", "AI", "Data Viz"],
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

  // Option 1: Faint Placeholder Cards ("Awaiting Enrollments")
  return (
    <section className="awaiting-enrollments-wrapper" aria-label="Awaiting enrollments on Discovery Grid">
      {/* ── Page Header / Sub-banner ── */}
      <div className="awaiting-header-banner">
        <div className="awaiting-badge">
          <Sparkles size={13} color="#ff5ca8" />
          <span>Awaiting Enrollments · CECS Hub</span>
        </div>

        <h2 className="awaiting-title">
          Awaiting Enrollments
        </h2>

        <p className="awaiting-subtitle">
          Student profile cards appear on this grid as classmates create and publish their profiles.
          Complete your profile or invite peers to fill the first slots.
        </p>

        <div className="awaiting-actions">
          <Link
            href="/account-page"
            className="awaiting-primary-btn"
          >
            <span>{isProfileComplete ? "View Your Profile" : "Finish Your Profile"}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="awaiting-secondary-btn"
            aria-label="Copy invite link"
          >
            <Copy size={15} />
            <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
          </button>
        </div>
      </div>

      {/* ── 4-Up Faint Placeholder Cards Grid with Hard Shadows ── */}
      <div className="awaiting-cards-grid">
        {PLACEHOLDER_CARDS.map((card) => {
          return (
            <article
              key={card.slot}
              className="faint-placeholder-card"
              style={{
                boxShadow: `7px 7px 0 0 ${card.shadowColor}`,
              }}
            >
              {/* Top Faint Band */}
              <div className="faint-card-band">
                <span className="faint-band-label">SLOT {card.slot}</span>
                <span className="faint-band-pill">AWAITING</span>
              </div>

              {/* Faint Dashed Avatar Ring */}
              <div
                className="faint-avatar-ring"
                style={{
                  borderColor: card.ringColor,
                }}
              >
                <User size={30} color={card.shadowColor} opacity={0.65} />
              </div>

              {/* Identity Placeholder */}
              <div className="faint-card-body">
                <h3 className="faint-card-name">Awaiting Student</h3>
                <p className="faint-card-meta">{card.majorHint}</p>
                <p className="faint-card-school">CECS · UM-Dearborn</p>
              </div>

              {/* Faint Tag Chips */}
              <div className="faint-card-tags">
                {card.tagHints.map((tag) => (
                  <span key={tag} className="faint-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom Awaiting Enrollments Note */}
              <div className="faint-card-foot">
                <span className="faint-foot-pulse" style={{ background: card.shadowColor }} />
                <span className="faint-foot-text">Awaiting enrollment</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
