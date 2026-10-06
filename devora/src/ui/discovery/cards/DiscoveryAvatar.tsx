// Large circular PFP used on Discovery cards and the peek overlay.
// Tries the Dicebear mock photo first; if that fails, falls back to initials.
// The orbit wrapper is the spinning accent ring — the inner circle clips the photo.
// Used by DiscoveryProfileCard + DiscoveryProfilePeek.

"use client";

import { useState } from "react";

import {
  getMockInitials,
  getMockPhotoUrl,
  type DiscoveryAccent,
} from "../mock-profiles";

type DiscoveryAvatarProps = {
  // Seed for Dicebear + initials (usually the mock profile id / display name)
  id: string;
  displayName: string;
  // Ring + glow — shader-family pair (gold/orange, magenta/violet, etc.), not flat cyan
  accent: DiscoveryAccent;
  // peek = bigger circle in the overlay; card = grid size
  size?: "card" | "peek";
};

// Circular photo (or initials) sitting inside a spinning accent ring.
export default function DiscoveryAvatar({
  id,
  displayName,
  accent,
  size = "card",
}: DiscoveryAvatarProps) {
  // vocab: useState = React hook — broken flips to true if the <img> fails to load
  const [broken, setBroken] = useState(false);
  const initials = getMockInitials(displayName);
  const photoUrl = getMockPhotoUrl(id);
  const showPhoto = !broken;

  return (
    <div
      className={
        size === "peek"
          ? "discovery-avatar-orbit discovery-avatar-orbit-peek"
          : "discovery-avatar-orbit"
      }
      data-accent={accent}
    >
      <div
        className={size === "peek" ? "discovery-avatar discovery-avatar-peek" : "discovery-avatar"}
        data-accent={accent}
        aria-hidden="true"
      >
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            // vocab: onError = browser fires this if the image 404s / network fails
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="discovery-avatar-initials">{initials}</span>
        )}
      </div>
    </div>
  );
}
