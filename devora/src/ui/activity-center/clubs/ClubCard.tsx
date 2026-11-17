// Neo-brutalist card displaying a CECS student organization.
// Shows: monogram avatar, name, description, category tag, meeting schedule,
// member count, follower count, and preview of latest post.
// Strictly ZERO emojis, zero pink borders, zero pink shadows.

"use client";

import Link from "next/link";
import { Users, Bookmark, Megaphone, ArrowRight, ExternalLink, Calendar } from "lucide-react";
import type { Club, ClubCategory } from "@/types/clubs";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

interface ClubCardProps {
  club: Club;
  isFollowed: boolean;
  onToggleFollow: (clubId: string) => void;
  isToggling?: boolean;
}

function getCategoryBadgeClass(category: ClubCategory, isLight: boolean): string {
  switch (category) {
    case "Professional":
      return isLight
        ? "border-sky-500/60 bg-sky-100 text-sky-950 font-bold"
        : "border-sky-400/40 bg-sky-500/15 text-sky-300 font-bold";
    case "Academic":
      return isLight
        ? "border-amber-500/60 bg-amber-100 text-amber-950 font-bold"
        : "border-amber-400/40 bg-amber-500/15 text-amber-300 font-bold";
    case "Social":
      return isLight
        ? "border-emerald-500/60 bg-emerald-100 text-emerald-950 font-bold"
        : "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 font-bold";
    case "Competitive":
      return isLight
        ? "border-purple-500/60 bg-purple-100 text-purple-950 font-bold"
        : "border-purple-400/40 bg-purple-500/15 text-purple-300 font-bold";
    default:
      return isLight
        ? "border-neutral-400 bg-neutral-100 text-neutral-800 font-bold"
        : "border-white/20 bg-neutral-800 text-neutral-300 font-bold";
  }
}

// Generate deterministic club monogram colors
function getMonogramTone(id: string): { bg: string; text: string; border: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const tones = [
    { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/40" },
    { bg: "bg-sky-500/15 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500/40" },
    { bg: "bg-purple-500/15 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/40" },
    { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/40" },
    { bg: "bg-orange-500/15 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/40" },
  ];
  const idx = Math.abs(hash) % tones.length;
  return tones[idx];
}

export default function ClubCard({
  club,
  isFollowed,
  onToggleFollow,
  isToggling = false,
}: ClubCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const tone = getMonogramTone(club.id);

  // Short monogram for the club avatar
  const monogram = club.shortName.slice(0, 4);

  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border-2 transition-all duration-200 p-6 ${
        isLight
          ? "bg-white border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#0a0a0a] text-[#0a0a0a]"
          : "bg-[#120b1c] border-white/20 shadow-[5px_5px_0px_#000000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] hover:border-white/40 text-white"
      }`}
    >
      <div>
        {/* Top bar: Category badge + Follow button */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`inline-block rounded-md border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider ${getCategoryBadgeClass(
              club.category,
              isLight
            )}`}
          >
            {club.category}
          </span>

          <button
            type="button"
            disabled={isToggling}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFollow(club.id);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3.5 py-1.5 font-mono text-xs font-extrabold tracking-wider uppercase transition-all duration-150 select-none active:translate-x-px active:translate-y-px ${
              isFollowed
                ? isLight
                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
                  : "bg-white text-[#0a0a0a] border-white shadow-[2px_2px_0px_#000000]"
                : isLight
                ? "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-100"
                : "bg-[#191124] text-white border-white/30 shadow-[2px_2px_0px_#000000] hover:border-white"
            } ${isToggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={isFollowed ? `Unfollow ${club.name}` : `Follow ${club.name}`}
          >
            <Bookmark size={13} className={isFollowed ? "fill-current" : ""} />
            <span>{isFollowed ? "Following" : "Follow"}</span>
          </button>
        </div>

        {/* Club Identity: Monogram Avatar + Club Names */}
        <Link
          href={`/activity-center/clubs/${club.id}`}
          className="flex items-start gap-3.5 mb-3 group-hover:opacity-95"
        >
          <div
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-display font-extrabold text-xs sm:text-sm tracking-tight shrink-0 shadow-[2px_2px_0px_#000000] ${tone.bg} ${tone.text} ${tone.border}`}
          >
            {monogram}
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="font-display text-xl font-black leading-tight tracking-tight hover:underline underline-offset-4">
              {club.shortName}
            </h3>
            {club.shortName !== club.name && (
              <span className={`font-mono text-xs truncate mt-0.5 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                {club.name}
              </span>
            )}
          </div>
        </Link>

        {/* Description */}
        <p className={`mt-2 text-xs sm:text-sm leading-relaxed line-clamp-3 ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
          {club.description}
        </p>

        {/* Meeting Frequency / Schedule Pill */}
        <div
          className={`mt-4 rounded-lg border px-3 py-2 flex items-center gap-2 text-xs font-mono ${
            isLight
              ? "bg-[#faf8f5] border-neutral-300 text-neutral-800"
              : "bg-[#181123] border-white/10 text-neutral-300"
          }`}
        >
          <Calendar size={13} className="text-[#fb923c] shrink-0" />
          <span className="font-bold">Meetings:</span>
          <span className="truncate">{club.meetingFrequency}</span>
        </div>
      </div>

      {/* Bottom section: latest post preview & stats */}
      <div className="mt-5 pt-4 border-t-2 border-dashed border-neutral-300 dark:border-white/15">
        {/* Latest Post preview if available */}
        {club.latestPost && (
          <div
            className={`mb-4 rounded-lg border p-3 text-xs ${
              isLight
                ? "bg-[#fffaf0] border-amber-300/80 text-neutral-800"
                : "bg-[#181024] border-amber-400/25 text-neutral-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#fb923c] mb-1">
              <Megaphone size={12} />
              <span>LATEST ANNOUNCEMENT</span>
            </div>
            <p className="line-clamp-2 leading-relaxed opacity-90">
              {club.latestPost.text}
            </p>
          </div>
        )}

        {/* Stats & Action Row */}
        <div className={`flex items-center justify-between text-xs font-mono ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Members on Devora">
              <Users size={14} className="currentColor" />
              <strong className={isLight ? "text-[#0a0a0a]" : "text-white"}>{club.memberCount}</strong> members
            </span>
            <span className="flex items-center gap-1.5" title="Followers on Devora">
              <Bookmark size={14} className="currentColor" />
              <strong className={isLight ? "text-[#0a0a0a]" : "text-white"}>{club.followerCount}</strong> followers
            </span>
          </div>

          <Link
            href={`/activity-center/clubs/${club.id}`}
            className={`inline-flex items-center gap-1 font-bold font-mono transition-all hover:translate-x-0.5 ${
              isLight ? "text-[#0a0a0a] hover:text-[#fb923c]" : "text-white hover:text-[#fb923c]"
            }`}
            aria-label={`View ${club.shortName} details and post feed`}
          >
            <span>Feed</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {club.link && (
          <div className="mt-2 text-right">
            <a
              href={club.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-[11px] font-mono hover:underline ${
                isLight ? "text-neutral-500 hover:text-[#0a0a0a]" : "text-neutral-400 hover:text-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <span>Official Link</span>
              <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
