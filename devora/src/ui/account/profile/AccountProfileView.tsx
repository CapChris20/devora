// Redesigned Account Profile View per DESIGN.md § 5.2.
// Compact layout so all profile information is visible without excessive scrolling.
// Left: Glass panel with 72px avatar (gradient ring), identity, chips, profile strength, facts, sign out.
// Right: Glass panel with public legend, 2-col compact section grid (Bio, Looking for,
// Experience, Career focus, Interests, Social links), plus compact "Private details" disclosure.

"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Globe,
  Lock,
  LogOut,
  PenLine,
  ChevronDown,
  Plus,
} from "lucide-react";

import type { UserProfile } from "@/backend/firebase";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
} from "@/ui/discovery/cards/DiscoverySocialIcons";
import {
  formatJoinedDate,
  getInitials,
  getProfileCompleteness,
  getProfileSubtitle,
  isUmichVerified,
} from "./account-helpers";

type AccountProfileViewProps = {
  profile: UserProfile;
  onEdit: () => void;
  onSignOut: () => void;
};

export default function AccountProfileView({
  profile,
  onEdit,
  onSignOut,
}: AccountProfileViewProps) {
  const [isPrivateOpen, setIsPrivateOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const completeness = getProfileCompleteness(profile);
  const subtitle = getProfileSubtitle(profile);
  const joinedText = formatJoinedDate(profile.createdAt);
  const isVerified = isUmichVerified(profile.email);
  const initials = getInitials(profile);
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.displayName ||
    "Student";

  // Social link helpers
  const links = profile.links ?? {};
  const socialItems = [
    {
      key: "github",
      label: "GitHub",
      val: links.github,
      Icon: GithubIcon,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      val: links.linkedin,
      Icon: LinkedinIcon,
    },
    {
      key: "instagram",
      label: "Instagram",
      val: links.instagram,
      Icon: InstagramIcon,
    },
  ];

  return (
    <div className="account-view-root">
      {/* ── Page Head ── */}
      <div className="account-page-head">
        <div>
          <h1 className="t-band text-white">My profile</h1>
          <p className="lead text-[var(--text-body)] mt-1.5">
            This is how classmates see you on the Discovery Grid.
          </p>
        </div>

        <button type="button" onClick={onEdit} className="btn-primary">
          <PenLine size={16} />
          <span>Edit profile</span>
        </button>
      </div>

      {/* ── 2-Column Split Grid (5fr 7fr from 1024px) ── */}
      <div className="account-split-grid">
        {/* ── Left Column (5fr) ── */}
        <div className="account-left-col">
          <div className="glass-panel account-identity-panel">
            {/* Identity row: 72px avatar + name + major/year + school */}
            <div className="identity-row">
              <div className="avatar-ring-wrapper">
                <div className="avatar-inner">
                  {profile.photoURL && !avatarFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photoURL}
                      alt={fullName}
                      className="avatar-img"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <div className="avatar-initials">{initials}</div>
                  )}
                </div>
              </div>

              <div className="identity-info">
                <h2 className="identity-name">{fullName}</h2>
                <p className="identity-major">{subtitle}</p>
                <p className="identity-school">UM&#8209;Dearborn CECS</p>
              </div>
            </div>

            {/* Chips row */}
            <div className="chips-row">
              {isVerified && (
                <div className="chip-badge">
                  <BadgeCheck size={13} color="#ff5ca8" />
                  <span>Verified @umich.edu</span>
                </div>
              )}
              <div className="chip-badge">
                <Calendar size={13} />
                <span>{joinedText || "Joined Aug 2026"}</span>
              </div>
            </div>

            {/* Profile strength box */}
            <div className="profile-strength-box">
              <div className="strength-header">
                <span className="mono text-[var(--text-muted)] text-xs">Profile strength</span>
                <span className="strength-pct">{completeness.score}%</span>
              </div>
              <div className="strength-bar-track">
                <div
                  className="strength-bar-fill"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              <p className="strength-hint">
                {completeness.score < 100
                  ? "Add experience to reach 100%."
                  : "Profile is 100% complete."}
              </p>
            </div>

            {/* Facts Grid (2x2 <dl>) */}
            <dl className="facts-grid">
              <div className="fact-item">
                <dt className="mono text-[var(--text-muted)]">Major</dt>
                <dd className="fact-val">{profile.major || "—"}</dd>
              </div>
              <div className="fact-item">
                <dt className="mono text-[var(--text-muted)]">Class rank</dt>
                <dd className="fact-val">{profile.classRank || "—"}</dd>
              </div>
              <div className="fact-item">
                <dt className="mono text-[var(--text-muted)]">Age</dt>
                <dd className="fact-val">{profile.age || "—"}</dd>
              </div>
              <div className="fact-item">
                <dt className="mono text-[var(--text-muted)]">Gender</dt>
                <dd className="fact-val">{profile.gender || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Sign Out danger button */}
          <button
            type="button"
            onClick={onSignOut}
            className="btn-danger w-full mt-3.5"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>

        {/* ── Right Column (7fr) ── */}
        <div className="account-right-col">
          <div className="glass-panel">
            {/* Legend line */}
            <div className="public-legend-line">
              <Globe size={14} color="#ff5ca8" />
              <span>Sections marked public show on the Discovery Grid.</span>
            </div>

            {/* 2-column section grid */}
            <div className="sections-grid">
              {/* 1. Bio */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Bio</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                {profile.bio ? (
                  <p className="section-body">{profile.bio}</p>
                ) : (
                  <div className="empty-section-hint">
                    <span>No bio yet.</span>
                    <button type="button" onClick={onEdit} className="add-link">
                      <Plus size={13} color="#ff5ca8" />
                      <span className="add-link-text">Add bio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Looking for */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Looking for</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                {profile.aboutYou && profile.aboutYou.length > 0 ? (
                  <div className="tags-flex">
                    {profile.aboutYou.map((tag) => (
                      <span key={tag} className="profile-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section-hint">
                    <span>No items.</span>
                    <button type="button" onClick={onEdit} className="add-link">
                      <Plus size={13} color="#ff5ca8" />
                      <span className="add-link-text">Add looking for</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Experience & projects */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Experience &amp; projects</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                {profile.experienceDetails ? (
                  <p className="section-body">{profile.experienceDetails}</p>
                ) : (
                  <div className="empty-section-hint">
                    <span>No experience listed.</span>
                    <button type="button" onClick={onEdit} className="add-link">
                      <Plus size={13} color="#ff5ca8" />
                      <span className="add-link-text">Add experience</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Career focus */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Career focus</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                {profile.careerNiche && profile.careerNiche.length > 0 ? (
                  <div className="tags-flex">
                    {profile.careerNiche.map((tag) => (
                      <span key={tag} className="profile-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section-hint">
                    <span>No focus tags.</span>
                    <button type="button" onClick={onEdit} className="add-link">
                      <Plus size={13} color="#ff5ca8" />
                      <span className="add-link-text">Add focus</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Interests */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Interests</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                {profile.casualInterests && profile.casualInterests.length > 0 ? (
                  <div className="tags-flex">
                    {profile.casualInterests.map((tag) => (
                      <span key={tag} className="profile-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section-hint">
                    <span>No interests.</span>
                    <button type="button" onClick={onEdit} className="add-link">
                      <Plus size={13} color="#ff5ca8" />
                      <span className="add-link-text">Add interests</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Social links */}
              <div className="section-block">
                <div className="section-head">
                  <h3 className="section-title">Social links</h3>
                  <span className="public-stamp">
                    <Globe size={12} />
                    <span>Public</span>
                  </span>
                </div>
                <div className="social-links-col">
                  {socialItems.map((item) => {
                    const Icon = item.Icon;
                    return (
                      <div key={item.key} className="social-link-row">
                        <div className="social-link-left">
                          <Icon size={14} />
                          <span className="social-name">{item.label}</span>
                        </div>
                        {item.val ? (
                          <span className="social-val">{item.val}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={onEdit}
                            className="social-add-link"
                          >
                            <Plus size={12} color="#ff5ca8" />
                            <span className="add-link-text">Add link</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Private details disclosure */}
          <div className="private-details-wrapper mt-3.5">
            <button
              type="button"
              className="private-disclosure-btn glass-panel"
              onClick={() => setIsPrivateOpen(!isPrivateOpen)}
              aria-expanded={isPrivateOpen}
            >
              <div className="disclosure-left">
                <Lock size={15} color="#ff5ca8" />
                <span className="disclosure-label">Private details</span>
                <span className="only-you-chip">Only you</span>
              </div>

              <ChevronDown
                size={18}
                className={`disclosure-chevron ${isPrivateOpen ? "is-open" : ""}`}
              />
            </button>

            {isPrivateOpen && (
              <div className="private-disclosure-body glass-panel">
                <dl className="private-details-dl">
                  <div>
                    <dt className="mono text-[var(--text-muted)] text-xs">Email</dt>
                    <dd className="private-val">{profile.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="mono text-[var(--text-muted)] text-xs">School</dt>
                    <dd className="private-val">
                      {profile.school || "University of Michigan-Dearborn"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-view-root {
          width: 100%;
        }

        .account-page-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          background: #0d0a11;
          border: 2px solid rgba(255, 92, 168, 0.35);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 14px 36px -10px rgba(0, 0, 0, 0.75), 0 0 20px -8px rgba(255, 92, 168, 0.2);
        }

        .account-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .account-split-grid {
            grid-template-columns: 4.8fr 7.2fr;
          }
        }

        .glass-panel {
          background: #0f0b13;
          border: 2px solid #2f2536;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px -8px rgba(255, 92, 168, 0.15);
        }

        .identity-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar-ring-wrapper {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          padding: 3px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--surface, #1c181c);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.avatar-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: white;
        }

        .identity-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .identity-name {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          text-transform: uppercase;
          font-size: clamp(20px, 2vw, 26px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: white;
          margin: 0;
        }

        .identity-major {
          font-size: 14px;
          color: var(--text-body);
          margin: 0;
        }

        .identity-school {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 0;
        }

        .chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
        }

        .chip-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 12px;
          border-radius: 999px;
          background: #18121d;
          border: 1.5px solid #3d2f47;
          font-family: var(--f-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .profile-strength-box {
          background: #16101c;
          border: 1.5px solid #2f2536;
          border-radius: 14px;
          padding: 14px 16px;
          margin-top: 16px;
        }

        .strength-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .strength-pct {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: white;
        }

        .strength-bar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .strength-hint {
          font-size: 12px;
          color: #d8cdd5;
          margin: 6px 0 0;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 16px;
          margin: 16px 0 0;
          padding: 14px 0 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .fact-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .fact-val {
          font-size: 15px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          border-radius: 999px;
          background: #1c0c14;
          border: 2px solid #852230;
          color: #ff8fa0;
          font-family: var(--f-mono);
          font-size: 13.5px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .btn-danger:hover {
          border-color: #ff5ca8;
          background: #2a101d;
        }

        .public-legend-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgb(255 255 255 / 0.08);
        }

        .sections-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px 20px;
        }

        @media (min-width: 640px) {
          .sections-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 13px;
          color: white;
          margin: 0;
        }

        .public-stamp {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--f-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .section-body {
          font-size: 13.5px;
          line-height: 1.45;
          color: var(--text-body);
          margin: 0;
        }

        .empty-section-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }

        .add-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgb(255 92 168 / 0.1);
          border: 1px solid rgb(255 92 168 / 0.45);
          border-radius: 999px;
          padding: 3px 10px;
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s var(--spring);
        }

        .add-link:hover {
          background: rgb(255 92 168 / 0.22);
          border-color: #ff5ca8;
          transform: translateY(-1px);
        }

        .add-link-text {
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .tags-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .profile-tag {
          height: 30px;
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          border-radius: 999px;
          background: #18121d;
          border: 1.5px solid #3d2f47;
          font-size: 12.5px;
          font-weight: 600;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .social-links-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .social-link-row {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-radius: 12px;
          background: #16101c;
          border: 1.5px solid #2f2536;
        }

        .social-link-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .social-name {
          font-weight: 600;
          font-size: 13px;
        }

        .social-val {
          font-size: 12px;
          color: #d8cdd5;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .social-add-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #281228;
          border: 1.5px solid #ff5ca8;
          padding: 4px 12px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s var(--spring);
        }

        .social-add-link:hover {
          background: #ff5ca8;
          color: #0d0b0e;
          transform: translateY(-1px);
        }

        .private-disclosure-btn {
          width: 100%;
          min-height: 46px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          outline: none;
        }

        .disclosure-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .disclosure-label {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 13px;
          color: white;
        }

        .only-you-chip {
          height: 20px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border-radius: 999px;
          border: 1px solid rgb(255 255 255 / 0.25);
          font-family: var(--f-mono);
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        :global(.disclosure-chevron) {
          transition: transform 0.26s cubic-bezier(0.23, 1, 0.32, 1);
          color: white;
        }

        :global(.disclosure-chevron.is-open) {
          transform: rotate(180deg);
        }

        .private-disclosure-body {
          margin-top: 6px;
          padding: 16px;
        }

        .private-details-dl {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 0;
        }

        @media (min-width: 640px) {
          .private-details-dl {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .private-val {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 2px 0 0;
        }
      `}</style>
    </div>
  );
}
