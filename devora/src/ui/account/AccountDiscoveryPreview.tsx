// Mini mock-up of how your profile card looks on the Discovery Grid.
// Uses the same tags/bio helpers so the preview stays honest.
// Shown in the account left column so students see what classmates will see.

"use client";

import type { UserProfile } from "@/backend/firebase";

import {
  getDiscoveryTags,
  getInitials,
  getProfileSubtitle,
  truncateBio,
} from "./account-helpers";

type AccountDiscoveryPreviewProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape
  profile: UserProfile;
};

// Compact "what classmates see" card for the account left column.
export default function AccountDiscoveryPreview({ profile }: AccountDiscoveryPreviewProps) {
  const initials = getInitials(profile);
  // vocab: getDiscoveryTags = careerNiche + casualInterests, deduped, capped for the card
  // Manipulate here: change the max arg in getDiscoveryTags() if you want more/fewer chips
  const tags = getDiscoveryTags(profile);
  // Short bio quote, or a nudge if they haven't written one yet.
  // vocab: truncateBio = cut to ~80 chars with an ellipsis (matches grid cards)
  const bioSnippet = profile.bio?.trim()
    ? truncateBio(profile.bio)
    : "Add a bio so classmates know what you're working on.";

  return (
    <div className="account-discovery-preview">
      <div className="account-discovery-preview-header">
        <p className="account-section-eyebrow">Discovery preview</p>
        <span className="account-visibility-badge">Public on grid</span>
      </div>
      <div className="account-discovery-card">
        {/* Avatar + name + major/rank line */}
        <div className="account-discovery-card-top">
          <div className="account-discovery-avatar">
            {/* vocab / profile field: photoURL = Storage URL, or fall back to initials */}
            {profile.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt="" />
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
        {tags.length > 0 ? (
          <div className="account-tag-row">
            {tags.map((tag) => (
              <span key={tag} className="account-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="account-empty-hint">Add career focus and interests to show tags here.</p>
        )}
        <p className="account-discovery-bio">&ldquo;{bioSnippet}&rdquo;</p>
      </div>
    </div>
  );
}
