// Profile peek modal per DISCOVERY_GRID.md § 4.9.
// Paper face, ink border, radius 20, gradient hard shadow (10px).
// 120px family-gradient band with dots, 124px avatar with gradient ring,
// 2-column tag groups (Career path, Interests, Looking for, Clubs & orgs),
// Connect (primary --grad) and Connect with a message (280 chars note).

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, MessageSquare, Send, UserPlus, X } from "lucide-react";

import type { DiscoveryProfile } from "../mock-profiles";
import { getMockInitials } from "../mock-profiles";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./DiscoverySocialIcons";
import { sanitizeSocialProfileUrl } from "@/backend/firebase/safe-http-url";

// ===== TYPES =====

type DiscoveryProfilePeekProps = {
  profile: DiscoveryProfile;
  onClose: () => void;
  requested?: boolean;
  onConnect: (note: string) => void;
};

// ===== NAMED CONSTANTS =====

const MAX_NOTE_LENGTH = 280;

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

export default function DiscoveryProfilePeek({
  profile,
  onClose,
  requested = false,
  onConnect,
}: DiscoveryProfilePeekProps) {
  const shouldReduceMotion = useReducedMotion();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const isRose = profile.accent === "pink" || profile.accent === "purple";
  const familyClass = isRose ? "fam-rose" : "";

  const firstName = profile.displayName.split(" ")[0];
  const firstNiche = profile.careerNiche?.[0] || "CECS";
  const placeholderText = `Say hi to ${firstName} about ${firstNiche}…`;

  const initials = getMockInitials(profile.displayName);
  const trimmedPhoto = profile.photoUrl?.trim();
  const showPhoto = Boolean(trimmedPhoto) && !photoFailed;

  const availableSocials = SOCIAL_LINK_META.filter((item) =>
    Boolean(sanitizeSocialProfileUrl(profile.links[item.key], item.key))
  );

  // Focus trap inside the modal dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSendConnection(includeNote: boolean) {
    onConnect(includeNote ? noteText.trim() : "");
    setIsComposing(false);
    setNoteText("");
  }

  return (
    <motion.div
      className="drawer-backdrop"
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 40px)",
        overflowY: "auto",
      }}
      onClick={onClose}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${profile.displayName}'s profile`}
        className={`peek ${familyClass}`}
        onClick={(e) => e.stopPropagation()}
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 50, scale: 0.96 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? undefined
            : { opacity: 0, y: 20, scale: 0.98 }
        }
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 120px Family-gradient band with dots + 44px round close button */}
        <div className="peek-band" aria-hidden="true">
          <button
            type="button"
            className="peek-close-btn"
            aria-label="Close profile"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero: 124px avatar overlapping band, name, major + rank + concentration */}
        <div className="peek-hero-row">
          <div className="peek-avatar">
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

          <div className="peek-hero-copy">
            <h2 className="peek-name">{profile.displayName}</h2>
            <p className="peek-meta">
              <b>{profile.major}</b>, {profile.classRank}
              {profile.concentration ? `, ${profile.concentration} concentration` : ""}
            </p>
          </div>
        </div>

        {/* Socials */}
        {availableSocials.length > 0 && (
          <div className="psocial" style={{ justifyContent: "flex-start", marginBottom: 12 }}>
            {availableSocials.map(({ key, label, Icon }) => (
              <a
                key={key}
                href={sanitizeSocialProfileUrl(profile.links[key], key)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.displayName} on ${label}`}
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && <p className="peek-bio">{profile.bio}</p>}

        {/* 2-column grid of tag groups */}
        <div className="peek-tag-grid">
          {profile.careerNiche?.length > 0 && (
            <div className="peek-tag-block">
              <span className="peek-tag-label">Career path</span>
              <div className="peek-tag-list">
                {profile.careerNiche.map((niche, i) => (
                  <span key={i} className="ptag">
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.casualInterests?.length > 0 && (
            <div className="peek-tag-block">
              <span className="peek-tag-label">Interests</span>
              <div className="peek-tag-list">
                {profile.casualInterests.map((interest, i) => (
                  <span key={i} className="ptag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.lookingFor?.length > 0 && (
            <div className="peek-tag-block">
              <span className="peek-tag-label">Looking for</span>
              <div className="peek-tag-list">
                {profile.lookingFor.map((item, i) => (
                  <span key={i} className="ptag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.clubs?.length > 0 && (
            <div className="peek-tag-block">
              <span className="peek-tag-label">Clubs and orgs</span>
              <div className="peek-tag-list">
                {profile.clubs.map((club, i) => (
                  <span key={i} className="ptag">
                    {club}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="peek-actions">
          {requested ? (
            <div className="peek-status-banner" role="status">
              <Check size={18} strokeWidth={3} />
              <span>Request sent to {firstName}. You can chat once they connect back.</span>
            </div>
          ) : isComposing ? (
            <div className="peek-compose-box">
              <textarea
                id="discovery-connect-note"
                className="peek-compose-textarea"
                rows={3}
                maxLength={MAX_NOTE_LENGTH}
                placeholder={placeholderText}
                value={noteText}
                autoFocus
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="peek-compose-hint">
                <span>Up to 280 characters. {firstName} sees it with your request.</span>
                <span>
                  {noteText.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsComposing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSendConnection(true)}
                >
                  <Send size={18} />
                  <span>Send request with note</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSendConnection(false)}
              >
                <UserPlus size={18} />
                <span>Connect</span>
              </button>
              <button
                type="button"
                className="btn btn-ink"
                onClick={() => setIsComposing(true)}
              >
                <MessageSquare size={18} />
                <span>Connect with a message</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
