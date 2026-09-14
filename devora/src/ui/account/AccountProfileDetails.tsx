// Read-only detail panels for bio, interests, career focus, and social links.
// Older/alternate layout helper — AccountProfileView is the main view today.
// Keep comments here so Chris can still reuse pieces without guessing field names.

"use client";

import type { UserProfile } from "@/backend/firebase";

import { formatLinkLabel } from "./account-helpers";

type AccountProfileDetailsProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape
  profile: UserProfile;
};

// Small tag row, or an empty-state sentence when the list is blank.
function TagList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="theme-muted text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        // pointer-events-none = looks like a pill but isn't clickable in view mode
        <span key={item} className="onboarding-pill onboarding-pill-active pointer-events-none">
          {item}
        </span>
      ))}
    </div>
  );
}

// Stack of glass cards showing the public profile fields.
export default function AccountProfileDetails({ profile }: AccountProfileDetailsProps) {
  // vocab/symbol: ?? {} = if links is missing, use an empty object
  const links = profile.links ?? {};
  // Only keep socials that actually have a URL (hide empty ones).
  // vocab/symbol: ?.trim() = optional chaining — skip if href is undefined
  const socialEntries = [
    { key: "linkedin", label: "LinkedIn", href: links.linkedin },
    { key: "github", label: "GitHub", href: links.github },
    { key: "instagram", label: "Instagram", href: links.instagram },
  ].filter((entry) => entry.href?.trim());

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Email card */}
      <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
        <span className="text-lg" aria-hidden>
          ✉
        </span>
        <div>
          <p className="page-section-label theme-muted text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            Email
          </p>
          <p className="theme-heading mt-1 text-sm font-medium">{profile.email}</p>
        </div>
      </div>

      {/* Bio card */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-5">
        <p className="page-section-label soft-pink text-xs font-semibold uppercase tracking-[0.12em]">
          Bio
        </p>
        {profile.bio?.trim() ? (
          <p className="theme-body text-sm leading-relaxed">{profile.bio}</p>
        ) : (
          <p className="theme-muted text-sm">No bio yet. Tap Edit profile to add one.</p>
        )}
      </div>

      {/* Experience card — only when they listed projects */}
      {profile.hasExperience && profile.experienceDetails?.trim() ? (
        <div className="glass-card flex flex-col gap-3 rounded-2xl p-5">
          <p className="page-section-label soft-peach text-xs font-semibold uppercase tracking-[0.12em]">
            Experience & projects
          </p>
          <p className="theme-body whitespace-pre-wrap text-sm leading-relaxed">
            {profile.experienceDetails}
          </p>
        </div>
      ) : null}

      {/* Interests tags — vocab / profile field: casualInterests */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4">
        <p className="page-section-label soft-violet text-xs font-semibold uppercase tracking-[0.12em]">
          Interests
        </p>
        <TagList items={profile.casualInterests ?? []} emptyLabel="No interests yet" />
      </div>

      {/* Career focus tags + optional free-text note — vocab: careerNiche */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4">
        <p className="page-section-label soft-peach text-xs font-semibold uppercase tracking-[0.12em]">
          Career focus
        </p>
        <TagList items={profile.careerNiche ?? []} emptyLabel="No career focus yet" />
        {profile.careerNicheOther ? (
          <p className="theme-muted text-sm">{profile.careerNicheOther}</p>
        ) : null}
      </div>

      {/* Looking-for tags — vocab / profile field: aboutYou */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4">
        <p className="page-section-label soft-pink text-xs font-semibold uppercase tracking-[0.12em]">
          Looking for
        </p>
        <TagList items={profile.aboutYou ?? []} emptyLabel="Nothing added yet" />
      </div>

      {/* Social links — only render the card if at least one URL exists */}
      {socialEntries.length > 0 ? (
        <div className="glass-card flex flex-col gap-3 rounded-2xl p-4">
          <p className="page-section-label soft-violet text-xs font-semibold uppercase tracking-[0.12em]">
            Socials
          </p>
          <ul className="flex flex-col gap-2">
            {socialEntries.map((entry) => (
              <li key={entry.key}>
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="account-social-url soft-pink text-sm transition-opacity hover:opacity-80"
                >
                  {/* vocab/symbol: ! = TypeScript non-null assertion — we already filtered empties */}
                  {entry.label} · {formatLinkLabel(entry.href!)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
