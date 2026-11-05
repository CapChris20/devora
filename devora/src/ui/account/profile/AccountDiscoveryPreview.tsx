// Mini mock-up of how your profile card looks on the Discovery Grid.
// Uses the same tags and bio helpers so the preview stays honest.
// Shown in the account left column so students see what classmates will see.

"use client";

// ===== IMPORTS =====

import type { UserProfile } from "@/backend/firebase";

import {
  getDiscoveryTags,
  getInitials,
  getProfileSubtitle,
  truncateBio,
} from "./account-helpers";

// ===== NAMED CONSTANTS =====

const DISCOVERY_PREVIEW_TAG_LIMIT = 3;
const HOW_YOU_APPEAR_LABEL = "How you appear";
const PUBLIC_TO_STUDENTS_LABEL = "Public to students";
const MISSING_BIO_PREVIEW =
  "Add a bio so classmates know what you're working on.";
const MISSING_TAGS_HINT = "Add career focus and interests to show tags here.";

// ===== TYPES =====

type AccountDiscoveryPreviewProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape
  profile: UserProfile;
};

// ===== HELPER FUNCTIONS =====

function readBioSnippet(profile: UserProfile): string {
  // Short bio quote, or a nudge if they have not written one yet.
  // vocab: truncateBio = cut to ~80 chars with an ellipsis (matches grid cards)
  // vocab: ?. = skip trim when bio is missing
  if (profile.bio?.trim()) {
    return truncateBio(profile.bio);
  }

  return MISSING_BIO_PREVIEW;
}

// ===== MAIN COMPONENT =====

/**
 * Compact "what classmates see" card for the account left column.
 * @param props - The saved profile to preview
 * @param props.profile - Firestore profile used for the name, photo, tags, and bio
 * @returns The discovery-card preview
 */
export default function AccountDiscoveryPreview({ profile }: AccountDiscoveryPreviewProps) {
  const initials = getInitials(profile);
  // vocab: getDiscoveryTags = careerNiche + casualInterests, deduped, capped for the card
  // Manipulate here: raise DISCOVERY_PREVIEW_TAG_LIMIT if the preview should show more chips
  const tags = getDiscoveryTags(profile, DISCOVERY_PREVIEW_TAG_LIMIT);
  const bioSnippet = readBioSnippet(profile);
  const hasProfilePhoto = Boolean(profile.photoURL);
  const hasTags = tags.length > 0;

  return (
    <div className="account-discovery-preview">
      <div className="account-discovery-preview-header">
        <p className="account-section-eyebrow">{HOW_YOU_APPEAR_LABEL}</p>
        <span className="account-visibility-badge">{PUBLIC_TO_STUDENTS_LABEL}</span>
      </div>
      <div className="account-discovery-card">
        {/* Avatar + name + major/rank line */}
        <div className="account-discovery-card-top">
          <div className="account-discovery-avatar">
            {/* vocab / profile field: photoURL = Storage URL, or fall back to initials */}
            {hasProfilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt={`${profile.displayName || "Student"} profile photo`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="account-discovery-name">{profile.displayName}</p>
            <p className="account-discovery-meta">{getProfileSubtitle(profile)}</p>
          </div>
        </div>
        {/* Tag chips, or empty hint when none are set */}
        {hasTags ? (
          <div className="account-tag-row">
            {tags.map((tag) => (
              <span key={tag} className="account-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="account-empty-hint">{MISSING_TAGS_HINT}</p>
        )}
        <p className="account-discovery-bio">&ldquo;{bioSnippet}&rdquo;</p>
      </div>
    </div>
  );
}
