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
          <h1 className="t-band account-head-title">My profile</h1>
          <p className="lead account-head-lead mt-1.5">
            This is how classmates see you on the Discovery Grid.
          </p>
        </div>

        <button type="button" onClick={onEdit} className="account-edit-profile-btn">
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
                  <BadgeCheck size={13} className="text-amber-500 dark:text-amber-400" />
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
              <Globe size={14} className="opacity-70" />
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
                      <Plus size={12} color="currentColor" />
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
                      <Plus size={12} color="currentColor" />
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
                      <Plus size={12} color="currentColor" />
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
                      <Plus size={12} color="currentColor" />
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
                      <Plus size={12} color="currentColor" />
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
                            <Plus size={12} color="currentColor" />
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
                <Lock size={15} className="opacity-70" />
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

        .account-head-title {
          color: #ffffff;
          margin: 0;
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          font-size: clamp(18px, 1.8vw, 22px);
          line-height: 1.1;
        }

        :global(html[data-theme="light"]) .account-head-title {
          color: #0a0a0a;
        }

        .account-head-lead {
          color: var(--text-body, #d8cdd5);
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 11.5px;
          margin-top: 2px;
          margin-bottom: 0;
        }

        :global(html[data-theme="light"]) .account-head-lead {
          color: #4b5563;
        }

        .account-edit-profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          border-radius: 8px;
          background: #ffffff !important;
          color: #0a0a0a !important;
          border: 2px solid #ffffff !important;
          box-shadow: 3px 3px 0px #000000;
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-size: 11.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .account-edit-profile-btn:hover {
          background: #e5e5e5 !important;
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #000000;
        }

        .account-edit-profile-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0px #000000;
        }

        :global(html[data-theme="light"]) .account-edit-profile-btn {
          background: #0a0a0a !important;
          color: #ffffff !important;
          border: 2px solid #0a0a0a !important;
          box-shadow: 3px 3px 0px #0a0a0a !important;
        }

        :global(html[data-theme="light"]) .account-edit-profile-btn:hover {
          background: #262626 !important;
          box-shadow: 4px 4px 0px #0a0a0a !important;
        }

        .account-page-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          background: #0d0914;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 10px;
          padding: 8px 16px;
          box-shadow: 4px 4px 0px #000000;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .account-page-head:hover {
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 5px 5px 0px #000000;
        }

        :global(html[data-theme="light"]) .account-page-head {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .account-page-head:hover {
          box-shadow: 5px 5px 0px #0a0a0a;
        }

        .account-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .account-split-grid {
            grid-template-columns: 4.6fr 7.4fr;
          }
        }

        .glass-panel {
          background: #0d0914;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          padding: 12px 14px;
          box-shadow: 4px 4px 0px #000000;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .glass-panel:hover {
          border-color: rgba(255, 255, 255, 0.55);
          box-shadow: 5px 5px 0px #000000;
        }

        .identity-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-ring-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ffd76f 0%, #ff9a3d 50%, #ff5ca8 100%);
          border: 2px solid #0a0a0a;
          box-shadow: 3px 3px 0px #000000;
          padding: 2.5px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: #140d1e;
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
          font-weight: 900;
          font-size: 16px;
          color: white;
        }

        .identity-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .identity-name {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 16px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: white;
          margin: 0;
        }

        .identity-major {
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-body, #d8cdd5);
          margin: 0;
        }

        .identity-school {
          font-family: var(--f-mono, monospace);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted, #a597bd);
          margin: 0;
        }

        .chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .chip-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 22px;
          padding: 0 8px;
          border-radius: 999px;
          background: #181220;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          font-family: var(--f-mono, monospace);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          box-shadow: 2px 2px 0px #000000;
        }

        .profile-strength-box {
          background: #140d1e;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 6px 10px;
          margin-top: 8px;
          box-shadow: 2.5px 2.5px 0px #000000;
        }

        .strength-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .strength-pct {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          font-size: 13.5px;
          color: white;
        }

        .strength-bar-track {
          width: 100%;
          height: 5px;
          background: #08040f;
          border: 1px solid #0a0a0a;
          border-radius: 999px;
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          background: linear-gradient(135deg, #ffd76f 0%, #ff9a3d 50%, #ff5ca8 100%);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .strength-hint {
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 10.5px;
          color: #d8cdd5;
          margin: 4px 0 0;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 10px;
          margin: 8px 0 0;
          padding: 8px 0 0;
          border-top: 1.5px solid rgba(255, 255, 255, 0.15);
        }

        .fact-item {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .fact-item dt {
          font-family: var(--f-mono, monospace);
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted, #a597bd);
        }

        .fact-val {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 32px;
          border-radius: 8px;
          background: #2a101d;
          border: 2px solid #ef4444;
          color: #fca5a5;
          font-family: var(--f-mono, monospace);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          box-shadow: 3px 3px 0px #000000;
          transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .btn-danger:hover {
          background: #3b1429;
          border-color: #f87171;
          color: #ffffff;
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #000000;
        }

        .btn-danger:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0px #000000;
        }

        .public-legend-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--f-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #a597bd);
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.15);
        }

        .sections-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px 12px;
        }

        @media (min-width: 640px) {
          .sections-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 11px;
          color: white;
          margin: 0;
        }

        .public-stamp {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 1px 5px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          font-family: var(--f-mono, monospace);
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #a597bd);
        }

        .section-body {
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 11.5px;
          line-height: 1.35;
          color: var(--text-body, #d8cdd5);
          margin: 0;
        }

        .empty-section-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted, #a597bd);
        }

        .add-link,
        .social-add-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #181220;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 6px;
          padding: 2px 8px;
          cursor: pointer;
          color: #ffffff;
          box-shadow: 2px 2px 0px #000000;
          transition: all 0.15s ease;
        }

        .add-link:hover,
        .social-add-link:hover {
          background: #251c33;
          border-color: rgba(255, 255, 255, 0.6);
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000000;
        }

        .add-link:active,
        .social-add-link:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px #000000;
        }

        .add-link-text {
          font-family: var(--f-mono, monospace);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        :global(html[data-theme="light"]) .add-link,
        :global(html[data-theme="light"]) .social-add-link {
          background: #ffffff;
          border: 1.5px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .add-link:hover,
        :global(html[data-theme="light"]) .social-add-link:hover {
          background: #f4f4f2;
          box-shadow: 3px 3px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .add-link-text {
          color: #0a0a0a;
        }

        .tags-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .profile-tag {
          height: 24px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border-radius: 6px;
          background: #181220;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          font-family: var(--f-mono, monospace);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #ffffff;
          box-shadow: 2px 2px 0px #000000;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        :global(html[data-theme="light"]) .profile-tag {
          background: #ffffff;
          border: 1.5px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        .profile-tag:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000000;
        }

        .social-links-col {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .social-link-row {
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          border-radius: 6px;
          background: #140d1e;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          box-shadow: 2px 2px 0px #000000;
        }

        .social-link-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .social-name {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
        }

        .social-val {
          font-family: var(--f-mono, monospace);
          font-size: 12px;
          color: #d8cdd5;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .private-disclosure-btn {
          width: 100%;
          min-height: 48px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          background: #0d0914;
          border: 2.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          box-shadow: 6px 6px 0px #000000;
          transition: all 0.15s ease;
        }

        .private-disclosure-btn:hover {
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 8px 8px 0px #000000;
        }

        .disclosure-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .disclosure-label {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 13.5px;
          color: white;
        }

        .only-you-chip {
          height: 22px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd76f 0%, #ff9a3d 100%);
          border: 1.5px solid #0a0a0a;
          font-family: var(--f-mono, monospace);
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0a0a0a;
          box-shadow: 1.5px 1.5px 0px #000000;
        }

        :global(.disclosure-chevron) {
          transition: transform 0.26s cubic-bezier(0.23, 1, 0.32, 1);
          color: white;
        }

        :global(.disclosure-chevron.is-open) {
          transform: rotate(180deg);
        }

        .private-disclosure-body {
          margin-top: 8px;
          padding: 18px;
          background: #0d0914;
          border: 2.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          box-shadow: 6px 6px 0px #000000;
        }

        .private-details-dl {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin: 0;
        }

        @media (min-width: 640px) {
          .private-details-dl {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .private-val {
          font-family: var(--f-mono, monospace);
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin: 4px 0 0;
        }

        /* ── LIGHT THEME (Neo-Brutalist Paper & Crisp Ink) ── */
        :global(html[data-theme="light"]) .glass-panel {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 8px 8px 0px #0a0a0a;
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .glass-panel:hover {
          box-shadow: 10px 10px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .avatar-ring-wrapper {
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .avatar-inner {
          background: #f4f4f2;
        }

        :global(html[data-theme="light"]) .avatar-initials {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .identity-name {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .identity-major {
          color: #2a2226;
          font-weight: 600;
        }

        :global(html[data-theme="light"]) .identity-school {
          color: #574a50;
        }

        :global(html[data-theme="light"]) .chip-badge {
          background: #f4f4f2;
          border: 1.5px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .profile-strength-box {
          background: #faf8fc;
          border: 1.5px solid #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .strength-pct {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .strength-hint {
          color: #4b5563;
        }

        :global(html[data-theme="light"]) .strength-bar-track {
          background: #e5e7eb;
          border: 1px solid #0a0a0a;
        }

        :global(html[data-theme="light"]) .facts-grid {
          border-top: 1.5px solid #0a0a0a;
        }

        :global(html[data-theme="light"]) .fact-item dt {
          color: #b45309;
        }

        :global(html[data-theme="light"]) .fact-val {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .btn-danger {
          background: #fee2e2;
          border: 2px solid #dc2626;
          color: #991b1b;
          box-shadow: 3px 3px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .btn-danger:hover {
          background: #fca5a5;
          border-color: #991b1b;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .public-legend-line {
          color: #4b5563;
          border-bottom: 1.5px solid #0a0a0a;
        }

        :global(html[data-theme="light"]) .section-title {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .public-stamp {
          border-color: #0a0a0a;
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .section-body {
          color: #1f2937;
        }

        :global(html[data-theme="light"]) .profile-tag {
          border-color: #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .profile-tag:hover {
          box-shadow: 3px 3px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .social-link-row {
          background: #f9f9f7;
          border: 1.5px solid #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .social-link-left {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .social-val {
          color: #4b5563;
        }

        :global(html[data-theme="light"]) .add-link,
        :global(html[data-theme="light"]) .social-add-link {
          box-shadow: 2.5px 2.5px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .add-link:hover,
        :global(html[data-theme="light"]) .social-add-link:hover {
          box-shadow: 3.5px 3.5px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .private-disclosure-btn {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 6px 6px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .private-disclosure-btn:hover {
          box-shadow: 8px 8px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .disclosure-label {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) :global(.disclosure-chevron) {
          color: #0a0a0a;
        }

        :global(html[data-theme="light"]) .only-you-chip {
          box-shadow: 1.5px 1.5px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .private-disclosure-body {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 6px 6px 0px #0a0a0a;
        }

        :global(html[data-theme="light"]) .private-val {
          color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}
