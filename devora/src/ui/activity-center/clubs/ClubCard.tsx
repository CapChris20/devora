// Neo-brutalist card displaying a CECS student organization.
// Clean single-surface layout without nested sub-boxes per DESIGN_SCOPE.md & DESIGN.md.
// Shows: Category, follow toggle, bold title & full name, description, meeting frequency,
// member & follower counts, and feed link.
// Strictly ZERO emojis, zero pink borders, zero pink shadows.

"use client";

import Link from "next/link";
import { Users, Bookmark, ArrowRight, ExternalLink, Calendar } from "lucide-react";
import type { Club } from "@/types/clubs";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

interface ClubCardProps {
  club: Club;
  isFollowed: boolean;
  onToggleFollow: (clubId: string) => void;
  isToggling?: boolean;
}

export default function ClubCard({
  club,
  isFollowed,
  onToggleFollow,
  isToggling = false,
}: ClubCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border-2 transition-all duration-200 p-6 sm:p-7 ${
        isLight
          ? "bg-white border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
          : "bg-[#0e0918] border-white/20 shadow-[6px_6px_0px_#000000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000000] hover:border-white/35 text-white"
      }`}
    >
      <div className="flex flex-col gap-3.5">
        {/* Top bar: Category badge + Follow button */}
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-block rounded px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${
              isLight
                ? "bg-neutral-100 text-neutral-700 border border-neutral-300"
                : "bg-white/5 text-neutral-300 border border-white/10"
            }`}
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
            className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 font-mono text-xs font-extrabold tracking-wider uppercase transition-all duration-150 select-none cursor-pointer active:translate-x-px active:translate-y-px ${
              isFollowed
                ? isLight
                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
                  : "bg-white text-[#0a0a0a] border-white shadow-[2px_2px_0px_#000000]"
                : isLight
                ? "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-100"
                : "bg-[#181123] text-white border-white/25 shadow-[2px_2px_0px_#000000] hover:border-white/50"
            } ${isToggling ? "opacity-60 cursor-not-allowed" : ""}`}
            aria-label={isFollowed ? `Unfollow ${club.name}` : `Follow ${club.name}`}
          >
            <Bookmark size={13} className={isFollowed ? "fill-current" : ""} />
            <span>{isFollowed ? "Following" : "Follow"}</span>
          </button>
        </div>

        {/* Club Identity: Bold display shortName + Full name */}
        <Link
          href={`/activity-center/clubs/${club.id}`}
          className="flex flex-col min-w-0 group/link mt-1"
        >
          <h3 className="font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight group-hover/link:underline underline-offset-4">
            {club.shortName}
          </h3>
          {club.shortName !== club.name && (
            <span
              className={`font-mono text-xs truncate mt-1 ${
                isLight ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              {club.name}
            </span>
          )}
        </Link>

        {/* Description */}
        <p
          className={`text-sm leading-relaxed line-clamp-3 ${
            isLight ? "text-neutral-600" : "text-neutral-300"
          }`}
        >
          {club.description}
        </p>

        {/* Meeting Schedule: Clean inline row */}
        {club.meetingFrequency && (
          <div
            className={`flex items-center gap-2 pt-1 font-mono text-xs ${
              isLight ? "text-neutral-600" : "text-neutral-300"
            }`}
          >
            <Calendar size={13} className="text-[#fb923c] shrink-0" />
            <span className="font-bold">Meetings:</span>
            <span className="truncate">{club.meetingFrequency}</span>
          </div>
        )}
      </div>

      {/* Bottom section: Stats & Action row */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/10 flex flex-col gap-2">
        <div
          className={`flex items-center justify-between text-xs font-mono ${
            isLight ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5" title="Members on Devora">
              <Users size={14} />
              <strong className={isLight ? "text-[#0a0a0a]" : "text-white"}>
                {club.memberCount}
              </strong>{" "}
              members
            </span>
            <span className="flex items-center gap-1.5" title="Followers on Devora">
              <Bookmark size={14} />
              <strong className={isLight ? "text-[#0a0a0a]" : "text-white"}>
                {club.followerCount}
              </strong>{" "}
              followers
            </span>
          </div>

          <Link
            href={`/activity-center/clubs/${club.id}`}
            className={`inline-flex items-center gap-1 font-bold font-mono transition-all hover:translate-x-1 ${
              isLight
                ? "text-[#0a0a0a] hover:text-[#fb923c]"
                : "text-white hover:text-[#fb923c]"
            }`}
            aria-label={`View ${club.shortName} details and post feed`}
          >
            <span>Feed</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {club.link && (
          <div className="text-right">
            <a
              href={club.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-[11px] font-mono hover:underline ${
                isLight
                  ? "text-neutral-500 hover:text-[#0a0a0a]"
                  : "text-neutral-400 hover:text-white"
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
