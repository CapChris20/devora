// One Discovery Grid profile card — per DISCOVERY_GRID.md § 4.5.
// Paper face, 2px ink border, radius 16, padding 0 28px 26px, gradient hard shadow (7px).
// Band with dot texture over family gradient, 112px avatar with gradient ring,
// Unbounded 800 uppercase name, short major + year, socials, tags, looking for, and View profile.

"use client";

// ===== IMPORTS =====

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Users } from "lucide-react";

import type { DiscoveryProfile } from "../mock-profiles";
import { getMockInitials } from "../mock-profiles";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./DiscoverySocialIcons";
import { sanitizeSocialProfileUrl } from "@/backend/firebase/safe-http-url";

// ===== TYPES =====

type DiscoveryProfileCardProps = {
  profile: DiscoveryProfile;
  onView: (profile: DiscoveryProfile) => void;
  isRequested?: boolean;
  index?: number;
};

// ===== NAMED CONSTANTS =====

const SOCIAL_LINK_META: Array<{
  key: "github" | "linkedin" | "instagram";
  label: string;
  Icon: typeof GithubIcon;
}> = [
  { key: "github", label: "GitHub", Icon: GithubIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
];

// ===== MAIN COMPONENT =====

/**
 * One student card in the discovery grid (§ 4.5).
 */
export default function DiscoveryProfileCard({
  profile,
  onView,
  isRequested = false,
  index = 0,
}: DiscoveryProfileCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [photoFailed, setPhotoFailed] = useState(false);

  // cyan and gold -> ember; purple and pink -> rose per § 4.5
  const isRose = profile.accent === "pink" || profile.accent === "purple";
  const familyClass = isRose ? "fam-rose" : "";

  const initials = getMockInitials(profile.displayName);
  const trimmedPhoto = profile.photoUrl?.trim();
  const showPhoto = Boolean(trimmedPhoto) && !photoFailed;

  // First two career niches plus first interest per § 4.5 item 6
  const tags = [
    ...(profile.careerNiche || []).slice(0, 2),
    ...(profile.casualInterests || []).slice(0, 1),
  ];

  // Looking for: first two values joined by "or", lowercase per § 4.5 item 7
  const lookingForText =
    profile.lookingFor && profile.lookingFor.length > 0
      ? `Looking for ${profile.lookingFor.slice(0, 2).join(" or ").toLowerCase()}`
      : null;

  const availableSocials = SOCIAL_LINK_META.filter((item) =>
    Boolean(sanitizeSocialProfileUrl(profile.links[item.key], item.key))
  );

  return (
    <motion.article
      className={`pcard ${familyClass}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 11) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* 1. Band (88px, dot texture over family gradient, top radius 14px) */}
      <div className="pband" aria-hidden="true" />

      {/* 2. Avatar (112px, 5px gradient ring, overlaps band by 60px) */}
      <div className="pavatar">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trimmedPhoto}
            alt={`${profile.displayName}'s profile photo`}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* 3. Name (Unbounded 800 uppercase 21px) */}
      <h2 className="pname">{profile.displayName}</h2>

      {/* 4. Major and year ("CIS, Junior", short major in bold) */}
      <p className="pmeta">
        <b>{profile.majorShort || profile.major}</b>, {profile.classRank}
      </p>

      {/* 5. Socials (40px ink-outlined circles, hover fills with family gradient) */}
      {availableSocials.length > 0 && (
        <div className="psocial">
          {availableSocials.map(({ key, label, Icon }) => (
            <a
              key={key}
              href={sanitizeSocialProfileUrl(profile.links[key], key)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${profile.displayName} on ${label}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      )}

      {/* 6. Tags (first two niches + first interest, 28px paper-2 pills) */}
      {tags.length > 0 && (
        <div className="ptags">
          {tags.map((tag, i) => (
            <span key={i} className="ptag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 7. Looking for ("Looking for friend or campus events") */}
      {lookingForText && (
        <div className="plook">
          <Users size={16} aria-hidden="true" />
          <span>{lookingForText}</span>
        </div>
      )}

      {/* 8. Requested indicator if already requested */}
      {isRequested && (
        <div className="requested">
          <Check size={16} strokeWidth={3} aria-hidden="true" />
          <span>Requested</span>
        </div>
      )}

      {/* 9. View profile button (48px, pinned to bottom, hover fills with family gradient) */}
      <button
        type="button"
        className="btn btn-ink pview"
        onClick={() => onView(profile)}
        aria-label={`View ${profile.displayName}'s profile`}
      >
        View profile
      </button>
    </motion.article>
  );
}
