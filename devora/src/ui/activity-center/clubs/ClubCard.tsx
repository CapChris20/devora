// Card for one CECS student organization in the Activity Center Clubs tab.
// One flat card face: category tag + Follow, short name + full name, description,
// an inline meetings line, then "N members · N followers" and a Feed link in the footer.
// No boxes inside the card, no pink borders or shadows, no emojis.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Bookmark, ArrowRight, ExternalLink } from "lucide-react";
import type { Club } from "@/types/clubs";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// ===== TYPES =====

interface ClubCardProps {
  club: Club;
  isFollowed: boolean;
  onToggleFollow: (clubId: string) => void;
  isToggling?: boolean;
}

// ===== CLASS NAME HELPERS =====
// Each helper names one visual decision so the JSX never needs nested ternaries.

function getCardClassName(isLight: boolean): string {
  if (isLight) {
    return "bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] hover:shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]";
  }
  return "bg-[#120c1c] border-2 border-white/20 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:border-white/35 text-white";
}

function getFollowButtonClassName(isFollowed: boolean, isLight: boolean): string {
  if (isFollowed && isLight) return "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[3px_3px_0px_#FB923C]";
  if (isFollowed) return "bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] border-2 border-white shadow-[3px_3px_0px_#000000] font-black";
  if (isLight) return "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]";
  return "bg-transparent text-white border-white/30 shadow-[3px_3px_0px_#000000] hover:border-white/60";
}

function getCategoryBadgeClassName(category: string, isLight: boolean): string {
  if (isLight) return "bg-neutral-100 text-neutral-800 border border-neutral-300";
  return "bg-gradient-to-r from-[#ffd76f]/10 to-[#ff9a3d]/10 border border-[#ff9a3d]/35 text-[#ffd76f]";
}

function formatCount(count: number, singularWord: string): string {
  const word = count === 1 ? singularWord : `${singularWord}s`;
  return `${count} ${word}`;
}

// ===== MAIN =====

export default function ClubCard({
  club,
  isFollowed,
  onToggleFollow,
  isToggling = false,
}: ClubCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const followBtnRef = useRef<HTMLButtonElement>(null);

  const handleFollowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow(club.id);

    if (followBtnRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        followBtnRef.current,
        { scale: 0.86 },
        { scale: 1, duration: 0.45, ease: "elastic.out(1.2, 0.4)" }
      );
    }
  };

  const clubDetailsHref = `/activity-center/clubs/${club.id}`;
  const hasFullNameDifferentFromShortName = club.shortName !== club.name;
  const mutedTextClassName = isLight ? "text-neutral-600" : "text-neutral-300";
  const quietTextClassName = isLight ? "text-neutral-500" : "text-neutral-400";
  const strongTextClassName = isLight ? "text-[#0a0a0a]" : "text-white";
  const dividerClassName = isLight ? "border-[#0a0a0a]/15" : "border-white/10";

  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl p-6 sm:p-7 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 ${getCardClassName(isLight)}`}
    >
      {/* 1. Category tag + Follow button */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-block rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${getCategoryBadgeClassName(club.category, isLight)}`}
        >
          {club.category}
        </span>

        <button
          ref={followBtnRef}
          type="button"
          disabled={isToggling}
          aria-pressed={isFollowed}
          aria-label={isFollowed ? `Unfollow ${club.name}` : `Follow ${club.name}`}
          onClick={handleFollowClick}
          className={`inline-flex items-center gap-1.5 h-9 rounded-lg border-2 px-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-[transform,box-shadow] duration-150 select-none cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed ${getFollowButtonClassName(isFollowed, isLight)}`}
        >
          <Bookmark size={13} className={isFollowed ? "fill-current" : ""} aria-hidden="true" />
          <span>{isFollowed ? "Following" : "Follow"}</span>
        </button>
      </div>

      {/* 2. Short name in the display face, full name underneath */}
      <Link href={clubDetailsHref} className="mt-5 flex flex-col min-w-0 group/name">
        <h3 className="font-display text-2xl sm:text-[28px] font-black uppercase leading-none tracking-tight group-hover/name:underline decoration-2 underline-offset-4">
          {club.shortName}
        </h3>
        {hasFullNameDifferentFromShortName && (
          <span className={`mt-2 font-body text-sm font-medium leading-snug ${quietTextClassName}`}>
            {club.name}
          </span>
        )}
      </Link>

      {/* 3. Description */}
      <p className={`mt-4 font-body text-[15px] leading-[1.6] line-clamp-3 ${mutedTextClassName}`}>
        {club.description}
      </p>

      {/* 4. Meetings, inline on the card */}
      {club.meetingFrequency && (
        <p className={`mt-4 font-body text-sm leading-snug ${mutedTextClassName}`}>
          <span className={`font-bold ${strongTextClassName}`}>Meetings: </span>
          {club.meetingFrequency}
        </p>
      )}

      {/* 5. Footer: counts, Feed link, official site */}
      <div className={`mt-auto pt-6`}>
        <div className={`flex items-center justify-between gap-3 pt-4 border-t-2 ${dividerClassName}`}>
          <p className={`font-body text-sm ${quietTextClassName}`}>
            <span className={`font-bold ${strongTextClassName}`}>{formatCount(club.memberCount, "member")}</span>
            <span aria-hidden="true"> · </span>
            <span className={`font-bold ${strongTextClassName}`}>{formatCount(club.followerCount, "follower")}</span>
          </p>

          <Link
            href={clubDetailsHref}
            aria-label={`Open the ${club.shortName} feed`}
            className={`inline-flex items-center gap-1 shrink-0 font-mono text-xs font-bold uppercase tracking-wider transition-transform hover:translate-x-1 ${strongTextClassName}`}
          >
            <span>Feed</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {club.link && (
          <a
            href={club.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            className={`mt-3 inline-flex items-center gap-1 font-body text-xs hover:underline ${quietTextClassName}`}
          >
            <span>Official site</span>
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
