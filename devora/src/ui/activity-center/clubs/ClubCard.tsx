// Neo-brutalist card displaying a CECS student organization.
// Shows: name, description, category tag, member count, follower count, and preview of latest post.
// Includes a one-click Follow / Unfollow button and links to /activity-center/clubs/[clubId].

"use client";

import Link from "next/link";
import { Users, Bookmark, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import type { Club, ClubCategory } from "@/types/clubs";

interface ClubCardProps {
  club: Club;
  isFollowed: boolean;
  onToggleFollow: (clubId: string) => void;
  isToggling?: boolean;
}

function getCategoryBadgeClass(category: ClubCategory): string {
  switch (category) {
    case "Professional":
      return "border-[#0284c7] bg-[#e0f2fe] text-[#0369a1]";
    case "Academic":
      return "border-[#d97706] bg-[#fef3c7] text-[#b45309]";
    case "Social":
      return "border-[#059669] bg-[#d1fae5] text-[#047857]";
    case "Competitive":
      return "border-[#7c3aed] bg-[#ede9fe] text-[#6d28d9]";
    default:
      return "border-nb-ink bg-nb-white text-nb-ink";
  }
}

export default function ClubCard({
  club,
  isFollowed,
  onToggleFollow,
  isToggling = false,
}: ClubCardProps) {
  return (
    <div className="group relative flex h-full flex-col justify-between rounded-xl border-2 border-nb-ink bg-nb-white p-6 shadow-nb transition-all duration-200 hover:-translate-y-1 hover:shadow-nb-lg">
      <div>
        {/* Top bar: Category badge + Follow button */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`inline-block rounded-md border-2 px-2.5 py-0.5 font-nb-mono text-xs font-bold uppercase tracking-wider ${getCategoryBadgeClass(
              club.category
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
            className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-nb-ink px-3 py-1 font-nb-mono text-xs font-bold tracking-wider uppercase transition-all active:translate-x-px active:translate-y-px ${
              isFollowed
                ? "bg-nb-ink text-nb-white hover:bg-neutral-800"
                : "bg-nb-white text-nb-ink hover:bg-neutral-100 shadow-nb-sm"
            } ${isToggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={isFollowed ? `Unfollow ${club.name}` : `Follow ${club.name}`}
          >
            <Bookmark size={13} className={isFollowed ? "fill-current" : ""} />
            <span>{isFollowed ? "Following" : "Follow"}</span>
          </button>
        </div>

        {/* Club Name & Short Name */}
        <Link
          href={`/activity-center/clubs/${club.id}`}
          className="block group-hover:underline decoration-nb-pink decoration-2 underline-offset-4"
        >
          <div className="flex items-baseline gap-2">
            <h3 className="font-nb-display text-xl font-bold leading-tight text-nb-ink">
              {club.shortName}
            </h3>
            {club.shortName !== club.name && (
              <span className="font-nb-mono text-xs text-nb-muted truncate">
                {club.name}
              </span>
            )}
          </div>
        </Link>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 line-clamp-3">
          {club.description}
        </p>

        {/* Meeting Frequency / Schedule */}
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-nb-mono text-neutral-700">
          <span className="font-bold text-nb-ink">Meetings: </span>
          <span>{club.meetingFrequency}</span>
        </div>
      </div>

      {/* Bottom section: latest post preview & stats */}
      <div className="mt-5 pt-4 border-t-2 border-dashed border-neutral-200">
        {/* Latest Post preview if available */}
        {club.latestPost && (
          <div className="mb-4 rounded-lg border border-nb-ink/20 bg-nb-pink/5 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-nb-mono text-[11px] font-bold text-nb-ink mb-1">
              <MessageSquare size={12} className="text-nb-pink" />
              <span>Latest Update:</span>
            </div>
            <p className="text-neutral-700 line-clamp-2 leading-relaxed">
              {club.latestPost.text}
            </p>
          </div>
        )}

        {/* Stats & Action Row */}
        <div className="flex items-center justify-between text-xs font-nb-mono text-nb-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Members on Devora">
              <Users size={14} className="text-nb-ink" />
              <strong className="text-nb-ink">{club.memberCount}</strong> members
            </span>
            <span className="flex items-center gap-1.5" title="Followers on Devora">
              <Bookmark size={14} className="text-nb-pink" />
              <strong className="text-nb-ink">{club.followerCount}</strong> followers
            </span>
          </div>

          <Link
            href={`/activity-center/clubs/${club.id}`}
            className="inline-flex items-center gap-1 font-bold text-nb-ink hover:text-nb-pink hover:translate-x-0.5 transition-all"
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
              className="inline-flex items-center gap-1 text-[11px] font-nb-mono text-nb-muted hover:text-nb-ink hover:underline"
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

