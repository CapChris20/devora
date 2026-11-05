// Large circular PFP used on Discovery cards and the peek overlay.
// Flow: show the student's photoURL, and if it is missing or fails, show initials.
// The orbit wrapper is the spinning accent ring. Used by DiscoveryProfileCard and DiscoveryProfilePeek.

"use client";

// ===== IMPORTS =====

import { useEffect, useState } from "react";

import { getMockInitials, type DiscoveryAccent } from "../mock-profiles";

// ===== NAMED CONSTANTS =====

const AVATAR_SIZE_CARD = "card";
const AVATAR_SIZE_PEEK = "peek";
const CARD_ORBIT_CLASS = "discovery-avatar-orbit";
const PEEK_ORBIT_CLASS = "discovery-avatar-orbit discovery-avatar-orbit-peek";
const CARD_AVATAR_CLASS = "discovery-avatar";
const PEEK_AVATAR_CLASS = "discovery-avatar discovery-avatar-peek";

// ===== TYPES =====

type DiscoveryAvatarProps = {
  // Kept so a card and its peek stay keyed to the same student
  id: string;
  displayName: string;
  // Ring + glow — shader-family pair (gold/orange, magenta/violet, etc.), not flat cyan
  accent: DiscoveryAccent;
  // peek = bigger circle in the overlay; card = grid size
  size?: "card" | "peek";
  // Firestore photoURL. Blank means initials, not a generated face.
  photoUrl?: string;
};

// ===== HELPER FUNCTIONS =====

function readOrbitClassName(size: "card" | "peek"): string {
  if (size === AVATAR_SIZE_PEEK) {
    return PEEK_ORBIT_CLASS;
  }
  return CARD_ORBIT_CLASS;
}

function readAvatarClassName(size: "card" | "peek"): string {
  if (size === AVATAR_SIZE_PEEK) {
    return PEEK_AVATAR_CLASS;
  }
  return CARD_AVATAR_CLASS;
}

// ===== MAIN COMPONENT =====

/**
 * Circular photo, or initials if the photo cannot load, inside a spinning accent ring.
 * @param id - Student id. Initials do not use it; it keeps the prop stable for the card and peek.
 * @param displayName - Name used to build the initials fallback
 * @param accent - Ring color token stored on the profile
 * @param size - "card" for the grid, "peek" for the overlay. Defaults to "card".
 * @param photoUrl - Uploaded profile photo. Omit it to show initials.
 * @returns The avatar element
 */
export default function DiscoveryAvatar({
  id,
  displayName,
  accent,
  size = AVATAR_SIZE_CARD,
  photoUrl,
}: DiscoveryAvatarProps) {
  // vocab: useState = React hook — hasPhotoLoadFailed flips to true if the <img> fails to load
  const [hasPhotoLoadFailed, setHasPhotoLoadFailed] = useState(false);
  const initials = getMockInitials(displayName);
  const trimmedPhotoUrl = photoUrl?.trim() ?? "";
  const shouldShowPhoto = trimmedPhotoUrl.length > 0 && !hasPhotoLoadFailed;

  // A new photo on the same card should try the image again instead of staying on initials.
  // vocab: useEffect = run after render when photoUrl changes
  useEffect(() => {
    setHasPhotoLoadFailed(false);
  }, [photoUrl]);

  const photoAltText = `${displayName} profile photo`;

  return (
    <div className={readOrbitClassName(size)} data-accent={accent} data-student-id={id}>
      {/* Orbit ring is decorative; the photo/initials carry the accessible name. */}
      <div className={readAvatarClassName(size)} data-accent={accent}>
        {shouldShowPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trimmedPhotoUrl}
            alt={photoAltText}
            // vocab: onError = browser fires this if the image 404s or the network fails
            onError={() => setHasPhotoLoadFailed(true)}
          />
        ) : (
          <span className="discovery-avatar-initials" aria-label={displayName}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
