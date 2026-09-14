// Default "view my profile" layout — sidebar, Discovery Grid preview, and public/private sections.
// Edit button flips the parent (AccountPageContent) into AccountProfileEditor.
// Field names here match Firestore (bio, aboutYou, careerNiche, casualInterests, links, …).

"use client";

import { useState, type ReactNode } from "react";

import type { UserProfile } from "@/backend/firebase";

import AccountDiscoveryPreview from "./AccountDiscoveryPreview";
import AccountInfoCard from "./AccountInfoCard";
import {
  formatJoinedDate,
  formatLinkLabel,
  getInitials,
  getProfileCompleteness,
  getProfileSubtitle,
  isUmichVerified,
} from "./account-helpers";

type AccountProfileViewProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape
  profile: UserProfile;
  // Parent sets isEditing=true when this runs
  onEdit: () => void;
};

// How many interest tags show before "+N more"
// Manipulate here: raise to show more chips before the expand button
const TAG_PREVIEW_LIMIT = 10;

// Renders interest/career tags; can collapse long lists behind "+N more".
function TagList({ items, limit }: { items: string[]; limit?: number }) {
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  const [expanded, setExpanded] = useState(false);
  // Show only the first `limit` tags until they expand.
  // vocab: slice(0, limit) = take the first `limit` items
  const visible = limit && !expanded ? items.slice(0, limit) : items;
  const hiddenCount = limit ? Math.max(0, items.length - limit) : 0;

  // Nothing to show — render nothing (parent shows empty hint instead).
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="account-tag-row">
        {visible.map((item) => (
          <span key={item} className="account-tag">
            {item}
          </span>
        ))}
      </div>
      {/* Expand button when there are more tags than the preview limit */}
      {hiddenCount > 0 && !expanded ? (
        <button type="button" className="account-text-btn" onClick={() => setExpanded(true)}>
          +{hiddenCount} more
        </button>
      ) : null}
    </div>
  );
}

// Section wrapper with optional Public / Only you badge.
function SectionBlock({
  title,
  visibility,
  children,
}: {
  title: string;
  visibility?: "public" | "private";
  // vocab: ReactNode = anything React can render (JSX, text, null, …)
  children: ReactNode;
}) {
  return (
    <section className="account-section-block">
      <div className="account-section-block-header">
        <h3 className="account-section-title">{title}</h3>
        {visibility ? (
          <span
            className={
              visibility === "public" ? "account-visibility-badge" : "account-private-badge"
            }
          >
            {visibility === "public" ? "Public" : "Only you"}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// Read-only profile: left column (avatar + preview) and right column (details).
export default function AccountProfileView({ profile, onEdit }: AccountProfileViewProps) {
  // privateOpen = whether the email/school panel at the bottom is expanded
  const [privateOpen, setPrivateOpen] = useState(false);
  const initials = getInitials(profile);
  // vocab: getProfileCompleteness = 0–100 score + list of missing sections
  const completeness = getProfileCompleteness(profile);
  // vocab/symbol: ?? {} = if links is missing, use an empty object
  const links = profile.links ?? {};
  // Build the three social rows even when a link is missing (shows "Not added").
  const socialEntries = [
    { key: "github", label: "GitHub", href: links.github },
    { key: "linkedin", label: "LinkedIn", href: links.linkedin },
    { key: "instagram", label: "Instagram", href: links.instagram },
  ];

  return (
    <div className="account-profile-view account-split-layout">
      {/* Left column — avatar, strength meter, Discovery preview, quick stats */}
      <aside className="account-split-left">
        <div className="glass-card flex flex-col items-center gap-4 rounded-2xl p-6 text-center">
          <div className="account-avatar-ring">
            {/* Photo if they uploaded one; otherwise initials */}
            {/* vocab / profile field: photoURL = Firebase Storage download link (or empty) */}
            {profile.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt="" />
            ) : (
              <span className="account-avatar-initials">{initials}</span>
            )}
          </div>
          <div>
            <h2 className="account-hero-name">{profile.displayName}</h2>
            <p className="account-hero-subtitle mt-1">{getProfileSubtitle(profile)}</p>
            {/* School uses account-school so contrast stays high in both themes */}
            <p className="account-school mt-1">{profile.school}</p>
          </div>
          <div className="account-hero-badges justify-center">
            {isUmichVerified(profile.email) ? (
              <span className="account-verified-badge">Verified @umich.edu</span>
            ) : null}
            <span className="account-meta-chip">Joined {formatJoinedDate(profile.createdAt)}</span>
          </div>
          <button type="button" className="devora-btn-outline w-full" onClick={onEdit}>
            Edit profile
          </button>
        </div>

        {/* Profile strength meter — only when something is still missing */}
        {completeness.score < 100 ? (
          <div className="account-completeness glass-card">
            <div className="account-completeness-top">
              <p className="account-section-eyebrow">Profile strength</p>
              <span className="account-completeness-score">{completeness.score}%</span>
            </div>
            <div className="account-completeness-track">
              <div
                className="account-completeness-fill"
                style={{ width: `${completeness.score}%` }}
              />
            </div>
            <p className="account-empty-hint">
              Add: {completeness.missing.slice(0, 3).join(", ")}
              {completeness.missing.length > 3 ? "…" : ""}
            </p>
          </div>
        ) : null}

        <AccountDiscoveryPreview profile={profile} />

        <div className="grid grid-cols-2 gap-3">
          {/* vocab / profile fields: major, classRank, age, gender — basics from onboarding */}
          <AccountInfoCard label="Major" value={profile.major || "—"} />
          <AccountInfoCard label="Class rank" value={profile.classRank || "—"} />
          <AccountInfoCard label="Age" value={profile.age || "—"} />
          <AccountInfoCard label="Gender" value={profile.gender || "—"} />
        </div>
      </aside>

      {/* Right column — public detail sections + collapsible private email/school */}
      <div className="account-split-right">
        <div className="glass-card account-details-card">
          <SectionBlock title="Bio" visibility="public">
            {profile.bio?.trim() ? (
              <p className="account-bio-text">{profile.bio}</p>
            ) : (
              <p className="account-empty-hint">
                No bio yet. This is the first thing classmates read on the grid.
              </p>
            )}
          </SectionBlock>

          <SectionBlock title="Looking for" visibility="public">
            {/* vocab / profile field: aboutYou = "looking for" tags */}
            {(profile.aboutYou?.length ?? 0) > 0 ? (
              <TagList items={profile.aboutYou ?? []} />
            ) : (
              <p className="account-empty-hint">
                Tell people what kind of collaborators you want — edit profile to add this.
              </p>
            )}
          </SectionBlock>

          <SectionBlock title="Experience & projects" visibility="public">
            {/* vocab / profile field: hasExperience + experienceDetails = project write-up */}
            {profile.hasExperience && profile.experienceDetails?.trim() ? (
              <p className="account-body-text whitespace-pre-wrap">{profile.experienceDetails}</p>
            ) : (
              <p className="account-empty-hint">
                No experience listed. Add projects or internships to build credibility.
              </p>
            )}
          </SectionBlock>

          <SectionBlock title="Career focus" visibility="public">
            {/* vocab / profile field: careerNiche = career/focus pills for their major */}
            {(profile.careerNiche?.length ?? 0) > 0 ? (
              <TagList items={profile.careerNiche ?? []} />
            ) : (
              <p className="account-empty-hint">No career focus tags yet.</p>
            )}
            {profile.careerNicheOther ? (
              <p className="account-body-text mt-2">{profile.careerNicheOther}</p>
            ) : null}
          </SectionBlock>

          <SectionBlock title="Interests" visibility="public">
            {/* vocab / profile field: casualInterests = hobby pills (+ custom typed) */}
            {(profile.casualInterests?.length ?? 0) > 0 ? (
              <TagList items={profile.casualInterests ?? []} limit={TAG_PREVIEW_LIMIT} />
            ) : (
              <p className="account-empty-hint">No interests added yet.</p>
            )}
          </SectionBlock>

          <SectionBlock title="Social links" visibility="public">
            <ul className="account-social-list">
              {socialEntries.map((entry) => (
                <li key={entry.key}>
                  {/* Live link when set; otherwise a "Not added" placeholder */}
                  {entry.href?.trim() ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="account-social-link"
                    >
                      <span className="account-social-label">{entry.label}</span>
                      <span className="account-social-url">{formatLinkLabel(entry.href)}</span>
                    </a>
                  ) : (
                    <div className="account-social-missing">
                      <span className="account-social-label">{entry.label}</span>
                      <span className="account-empty-hint">Not added</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </SectionBlock>
        </div>

        {/* Private details — email and school, collapsed by default */}
        <div className="account-private-panel glass-card">
          <button
            type="button"
            className="account-private-toggle"
            // vocab/symbol: !open = flip true↔false
            onClick={() => setPrivateOpen((open) => !open)}
            aria-expanded={privateOpen}
          >
            <span className="account-section-title">Private details</span>
            <span className="account-private-badge">Only you</span>
            <span className="account-chevron" data-open={privateOpen}>
              ▾
            </span>
          </button>
          {privateOpen ? (
            <dl className="account-private-list">
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>School</dt>
                <dd>{profile.school}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
}
