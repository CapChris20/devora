// Membership ticket card for a CECS student organization in Campus Hub.
// Top band: category gradient + category tag + shortName huge in Archivo Black.
// Body: name, description (clamped 3 lines), meetings, Open feed link, View Official Page button.
// Stub: perforation dashed border, ticket punch notches, member/follower counts, Follow button.

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Club } from "@/types/clubs";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

interface ClubCardProps {
  club: Club;
  isFollowed: boolean;
  onToggleFollow: (clubId: string) => void;
  isToggling?: boolean;
  isFeatured?: boolean;
}

// Category gradient mapping per Design Law
function getCategoryGradient(category: string): string {
  switch (category.toLowerCase()) {
    case "academic":
      return "bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa]";
    case "competitive":
      return "bg-gradient-to-br from-[#a78bfa] to-[#e879f9]";
    case "social":
      return "bg-gradient-to-br from-[#fda4af] to-[#fb7185]";
    case "professional":
    default:
      return "bg-gradient-to-br from-[#ff6b9d] to-[#fb923c]";
  }
}

export default function ClubCard({
  club,
  isFollowed,
  onToggleFollow,
  isToggling = false,
  isFeatured = false,
}: ClubCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const followBtnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const stickerRef = useRef<HTMLSpanElement>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = club.logoUrl || `/clubs/logos/${club.id}.png`;

  const handleFollowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow(club.id);

    if (followBtnRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        followBtnRef.current,
        { scale: 0.85 },
        { scale: 1, duration: 0.45, ease: "elastic.out(1.2, 0.4)" }
      );
    }
  };

  const handlePointerEnter = () => {
    if (stickerRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(stickerRef.current, {
        rotate: -6,
        scale: 1.08,
        duration: 0.5,
        ease: "elastic.out(1.2, 0.4)",
      });
    }
  };

  const handlePointerLeave = () => {
    if (stickerRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(stickerRef.current, {
        rotate: 4,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1.2, 0.4)",
      });
    }
  };

  const bandGradient = getCategoryGradient(club.category);

  return (
    <article
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`group relative flex flex-col overflow-hidden rounded-[10px] transition-all duration-150 ${
        isFeatured ? "md:col-span-2" : ""
      } ${
        isLight
          ? "bg-white border-[3px] border-[#0a0a0a] shadow-[5px_5px_0px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0a0a0a]"
          : "bg-[#120c1c] border-2 border-white/25 shadow-[6px_6px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#000000]"
      }`}
    >
      {/* ── 1. Top Ticket Band: Category Gradient + Poster Short Name + Official Logo ── */}
      <div
        className={`relative flex flex-col justify-between gap-4 min-h-[148px] p-4 sm:p-[18px] border-b-[3px] ${
          isLight ? "border-[#0a0a0a]" : "border-white/25"
        } ${bandGradient}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border-2 border-[#0a0a0a] bg-white font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a] shadow-[2px_2px_0px_0px_#0a0a0a]">
              {club.category}
            </span>

            {isFeatured && (
              <span
                ref={stickerRef}
                className="px-2.5 py-0.5 rounded-lg border-2 border-[#0a0a0a] bg-white font-mono text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_0px_#0a0a0a] rotate-[3deg]"
              >
                ★ Featured
              </span>
            )}
          </div>

          {/* Official Org Logo Badge */}
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-[11px] border-[2.5px] border-[#0a0a0a] bg-white p-1.5 shadow-[3px_3px_0px_0px_#0a0a0a] overflow-hidden flex items-center justify-center">
            {!logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={`${club.name} logo`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="font-display font-black text-xs sm:text-sm text-[#0a0a0a] uppercase tracking-wider text-center">
                {club.shortName.slice(0, 3)}
              </span>
            )}
          </div>
        </div>

        <h3
          className={`font-display uppercase font-normal tracking-[-0.03em] text-[#0a0a0a] leading-[0.85] break-words ${
            isFeatured
              ? "text-[clamp(44px,6vw,72px)]"
              : "text-[42px]"
          }`}
        >
          {club.shortName}
        </h3>
      </div>

      {/* ── 2. Card Body: Name, Description, Meetings, Links ── */}
      <div className="flex-1 flex flex-col gap-2 p-4 sm:p-[18px]">
        <p className={`m-0 font-bold text-base leading-snug ${isLight ? "text-[#0a0a0a]" : "text-white"}`}>
          {club.name}
        </p>

        <p
          className={`m-0 font-body text-[15px] leading-[1.55] ${
            isFeatured ? "line-clamp-2" : "line-clamp-3"
          } ${isLight ? "text-[#575757]" : "text-neutral-300"}`}
        >
          {club.description}
        </p>

        {club.meetingFrequency && (
          <p className={`mt-0.5 font-body text-sm ${isLight ? "text-[#262626]" : "text-neutral-200"}`}>
            <span className="font-bold">Meets: </span>
            <span>{club.meetingFrequency}</span>
          </p>
        )}

        {/* Links row */}
        <div className="mt-auto pt-3.5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/activity-center/clubs/${club.id}`}
            className={`group/feed inline-flex items-center gap-2 font-black text-sm border-b-[3px] pb-0.5 transition-colors ${
              isLight
                ? "text-[#0a0a0a] border-[#0a0a0a] hover:border-[#fb923c]"
                : "text-white border-white/60 hover:border-white"
            }`}
          >
            <span>Open feed</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover/feed:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          {(club.link || club.id) && (
            <a
              href={club.link || `https://umdearborn.campuslabs.com/engage/organization/${club.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-[9px] border-2 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
                isLight
                  ? "border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[3px_3px_0px_0px_#0a0a0a] hover:bg-neutral-50"
                  : "border-white/30 bg-[#1f1630] text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-[#281d3d]"
              }`}
            >
              <span>View Official Page</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {/* ── 3. Stub: Ticket Perforation with Cutout Notches + Counts + Follow ── */}
      <div
        className={`relative grid grid-cols-[1fr_1fr_auto] items-center border-t-[3px] border-dashed ${
          isLight
            ? "border-[#0a0a0a] bg-[#f2f2f0]"
            : "border-white/25 bg-[#181124]"
        }`}
      >
        {/* Left notch */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-[12px] -left-[12px] w-[22px] height-[22px] h-[22px] rounded-full border-[3px] ${
            isLight
              ? "border-[#0a0a0a] bg-[#faf8f5]"
              : "border-white/25 bg-[#0e0918]"
          }`}
        />
        {/* Right notch */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-[12px] -right-[12px] w-[22px] height-[22px] h-[22px] rounded-full border-[3px] ${
            isLight
              ? "border-[#0a0a0a] bg-[#faf8f5]"
              : "border-white/25 bg-[#0e0918]"
          }`}
        />

        {/* Member stat */}
        <div className="py-3 px-4 flex flex-col min-w-0">
          <b className={`font-display font-normal text-2xl leading-none tabular-nums ${isLight ? "text-[#0a0a0a]" : "text-white"}`}>
            {club.memberCount}
          </b>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#575757] dark:text-neutral-400 mt-0.5">
            Members
          </span>
        </div>

        {/* Follower stat */}
        <div
          className={`py-3 px-4 flex flex-col min-w-0 border-l-[3px] ${
            isLight ? "border-[#0a0a0a]" : "border-white/25"
          }`}
        >
          <b className={`font-display font-normal text-2xl leading-none tabular-nums ${isLight ? "text-[#0a0a0a]" : "text-white"}`}>
            {club.followerCount}
          </b>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#575757] dark:text-neutral-400 mt-0.5">
            Followers
          </span>
        </div>

        {/* Follow action button */}
        <div className="p-3 pr-4">
          <button
            ref={followBtnRef}
            type="button"
            disabled={isToggling}
            aria-pressed={isFollowed}
            aria-label={isFollowed ? `Unfollow ${club.name}` : `Follow ${club.name}`}
            onClick={handleFollowClick}
            className={`inline-flex items-center justify-center min-h-[44px] px-5 sm:px-6 rounded-[9px] font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-150 border-[2.5px] cursor-pointer disabled:opacity-50 select-none active:translate-x-0.5 active:translate-y-0.5 ${
              isFollowed
                ? "bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] border-[#0a0a0a] shadow-[3px_3px_0px_0px_#0a0a0a]"
                : isLight
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[3.5px_3.5px_0px_0px_#0a0a0a] hover:bg-neutral-800 hover:-translate-x-0.5 hover:-translate-y-0.5"
                : "bg-white text-[#0a0a0a] border-white shadow-[3.5px_3.5px_0px_0px_#000000] hover:bg-neutral-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
            }`}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </article>
  );
}
