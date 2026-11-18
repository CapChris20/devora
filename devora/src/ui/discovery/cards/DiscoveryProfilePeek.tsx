// Profile peek modal per Coach Connect Design Law.
// Spacious white card face, 3px ink borders, 8px hard offset shadow.
// Solid brand-gradient header band, properly offset avatar, readable metadata,
// generous tag pills, and bold high-contrast action buttons.
// Zero pink glow, zero clipped avatar, zero compacted layout.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, MessageSquare, Send, UserPlus, X } from "lucide-react";

import type { DiscoveryProfile } from "../mock-profiles";
import { getMockInitials } from "../mock-profiles";
import { GithubIcon, InstagramIcon, LinkedinIcon, DiscordIcon } from "./DiscoverySocialIcons";
import { sanitizeSocialProfileUrl } from "@/backend/firebase/safe-http-url";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

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
  key: "github" | "linkedin" | "instagram" | "discord";
  label: string;
  Icon: typeof GithubIcon;
}> = [
  { key: "github", label: "GitHub", Icon: GithubIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "discord", label: "Discord", Icon: DiscordIcon },
];

// ===== MAIN COMPONENT =====

export default function DiscoveryProfilePeek({
  profile,
  onClose,
  requested = false,
  onConnect,
}: DiscoveryProfilePeekProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const shouldReduceMotion = useReducedMotion();

  const [photoFailed, setPhotoFailed] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${profile.displayName}'s profile`}
        onClick={(e) => e.stopPropagation()}
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 40, scale: 0.96 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? undefined
            : { opacity: 0, y: 20, scale: 0.98 }
        }
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-[620px] rounded-[16px] overflow-hidden my-auto border-[3px] transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#140e22] border-2 border-white/30 shadow-[8px_8px_0px_#000000] text-white"
        }`}
      >
        {/* ── 1. Top Brand Banner + Close Button ── */}
        <div className="relative h-24 sm:h-28 w-full bg-gradient-to-r from-[#ff6b9d] via-[#fb923c] to-[#ff5ca8] border-b-[3px] border-[#0a0a0a] dark:border-white/30">
          <button
            type="button"
            aria-label="Close profile"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] transition-all hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer z-10"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── 2. Hero: Avatar + Name + Major ── */}
        <div className="px-6 sm:px-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-[#0a0a0a] dark:border-white bg-[#faf8f5] dark:bg-[#201730] flex items-center justify-center font-display text-3xl font-normal shadow-[3px_3px_0px_#0a0a0a] overflow-hidden shrink-0 z-10 text-[#0a0a0a] dark:text-white">
              {showPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trimmedPhoto}
                  alt={`${profile.displayName}'s profile photo`}
                  onError={() => setPhotoFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display uppercase font-normal text-2xl sm:text-3xl tracking-tight leading-none text-[#0a0a0a] dark:text-white m-0">
                {profile.displayName}
              </h2>
              <p className="mt-1.5 font-mono text-xs sm:text-sm font-semibold text-[#575757] dark:text-neutral-300">
                <span className="font-bold text-[#0a0a0a] dark:text-white">{profile.major}</span>
                <span> · </span>
                <span>{profile.classRank}</span>
                {profile.concentration ? ` (${profile.concentration})` : ""}
              </p>
            </div>
          </div>

          {/* Social Links */}
          {availableSocials.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {availableSocials.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={sanitizeSocialProfileUrl(profile.links[key], key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${profile.displayName} on ${label}`}
                  className="w-8 h-8 rounded-lg border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#1f1630] text-[#0a0a0a] dark:text-white flex items-center justify-center shadow-[1.5px_1.5px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}

          {/* Bio text */}
          {profile.bio && (
            <p className="font-body text-[15px] sm:text-base leading-[1.6] text-[#262626] dark:text-neutral-200 mb-5">
              {profile.bio}
            </p>
          )}

          {/* ── 3. Tags Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-[#e3e3df] dark:border-white/10">
            {profile.courses && profile.courses.length > 0 && (
              <div className="sm:col-span-2">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757] dark:text-neutral-400 mb-1.5">
                  Current Courses
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.courses.map((course, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-[6px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-mono text-[11px] font-black text-[#0a0a0a] dark:text-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.careerNiche?.length > 0 && (
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757] dark:text-neutral-400 mb-1.5">
                  Career path
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.careerNiche.map((niche, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1f1630] font-mono text-[11px] font-bold text-[#0a0a0a] dark:text-white shadow-[1px_1px_0px_#0a0a0a]"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.casualInterests?.length > 0 && (
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757] dark:text-neutral-400 mb-1.5">
                  Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.casualInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1f1630] font-mono text-[11px] font-bold text-[#0a0a0a] dark:text-white shadow-[1px_1px_0px_#0a0a0a]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.lookingFor?.length > 0 && (
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757] dark:text-neutral-400 mb-1.5">
                  Looking for
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.lookingFor.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1f1630] font-mono text-[11px] font-bold text-[#0a0a0a] dark:text-white shadow-[1px_1px_0px_#0a0a0a]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.clubs?.length > 0 && (
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757] dark:text-neutral-400 mb-1.5">
                  Clubs &amp; orgs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.clubs.map((club, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1f1630] font-mono text-[11px] font-bold text-[#0a0a0a] dark:text-white shadow-[1px_1px_0px_#0a0a0a]"
                    >
                      {club}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Action Buttons Footer ── */}
        <div className="px-6 sm:px-8 py-5 border-t-[3px] border-[#0a0a0a] dark:border-white/20 bg-[#f2f2f0] dark:bg-[#181124]">
          {requested ? (
            <div
              className="flex items-center gap-2.5 p-3 rounded-lg border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a]"
              role="status"
            >
              <Check size={18} strokeWidth={3} />
              <span>Request sent to {firstName}. You can chat once connected.</span>
            </div>
          ) : isComposing ? (
            <div className="flex flex-col gap-2.5">
              <textarea
                id="discovery-connect-note"
                rows={3}
                maxLength={MAX_NOTE_LENGTH}
                placeholder={placeholderText}
                value={noteText}
                autoFocus
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#100a1c] font-body text-sm text-[#0a0a0a] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a]"
              />
              <div className="flex items-center justify-between font-mono text-[11px] text-[#575757] dark:text-neutral-400">
                <span>Up to 280 characters note</span>
                <span>
                  {noteText.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="min-h-[40px] px-4 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#1e152e] text-[#0a0a0a] dark:text-white font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-100 dark:hover:bg-[#251a3a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSendConnection(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 min-h-[40px] px-5 rounded-[8px] border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send request with note</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSendConnection(false)}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-[8px] border-[2.5px] border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer select-none"
              >
                <UserPlus size={16} />
                <span>Connect</span>
              </button>

              <button
                type="button"
                onClick={() => setIsComposing(true)}
                className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[8px] border-[2.5px] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer select-none ${
                  isLight
                    ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                    : "bg-white text-[#0a0a0a] border-white shadow-[3px_3px_0px_#000000]"
                }`}
              >
                <MessageSquare size={16} />
                <span>Connect with a message</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
