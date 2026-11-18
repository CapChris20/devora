// Study group card component.
// Displays course tag, meeting preference, topic, description, coordination method, member avatar stack, and Join/Leave.
// The most active group receives featured wide styling and a rotated sticker.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";

import type { StudyGroup } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";
import {
  COURSE_TONES,
  MEETING_PREFERENCE_LABELS,
} from "../placeholder-data";
import Avatar from "../shared/Avatar";
import Tag from "../shared/Tag";

// ===== TYPES =====

type GroupCardProps = {
  group: StudyGroup;
  isFeatured?: boolean;
};

// ===== MAIN COMPONENT =====

export default function GroupCard({
  group,
  isFeatured = false,
}: GroupCardProps) {
  const countElRef = useRef<HTMLSpanElement>(null);
  const meAvatarRef = useRef<HTMLSpanElement>(null);

  const { joinedGroupIds, toggleJoinGroup } = useActivityCenter();
  const isJoined = Boolean(joinedGroupIds[group.id]);

  // Determine course tag accent tone deterministically from course code
  const courseIndex = Math.abs(
    group.course.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % 4;
  const courseTone = COURSE_TONES[courseIndex];

  // Up to 4 member avatars
  const displayMembers = group.members.slice(0, 4);
  const totalMemberCount = group.members.length + (isJoined ? 1 : 0);

  const handleJoinClick = () => {
    const willJoin = !isJoined;
    toggleJoinGroup(group.id);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (countElRef.current) {
        gsap.fromTo(
          countElRef.current,
          { scale: 0.86 },
          {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1.1, 0.45)",
            clearProps: "transform",
          }
        );
      }

      if (willJoin && meAvatarRef.current) {
        gsap.fromTo(
          meAvatarRef.current,
          { scale: 0, rotation: -90 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: "back.out(2.5)",
            clearProps: "transform",
          }
        );
      }
    });
  };

  return (
    <article
      data-in
      data-group={group.id}
      className={`card lift relative flex flex-col gap-3 p-5 min-w-0 bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg ${
        isFeatured ? "md:col-span-2" : ""
      }`}
    >
      {/* Rotated sticker on the featured group */}
      {isFeatured && (
        <span
          className="sticker absolute -top-3.5 right-4 rotate-4 px-2.5 py-1 rounded-[8px] border-nb border-nb-ink bg-nb-brand font-nb-mono text-[11px] font-bold tracking-[0.1em] uppercase shadow-nb-sm pointer-events-none select-none text-[#0A0A0A]"
        >
          Most active
        </span>
      )}

      {/* Course and preference tags */}
      <div className="flex flex-wrap gap-1.5">
        <Tag tone={courseTone}>{group.course}</Tag>
        <Tag>{MEETING_PREFERENCE_LABELS[group.meetingPreference]}</Tag>
      </div>

      {/* Topic and description */}
      <h3
        className={`m-0 font-bold leading-tight text-nb-ink ${
          isFeatured ? "text-[26px]" : "text-xl"
        }`}
      >
        {group.topic}
      </h3>
      <p className="m-0 text-sm text-nb-muted leading-relaxed">
        {group.description}
      </p>

      {/* Coordination method */}
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-nb-ink m-0">
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        <span>{group.coordinationMethod}</span>
      </p>

      {/* Card footer: member stack + join toggle */}
      <div className="mt-auto pt-3.5 border-t-nb border-nb-ink flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Member avatars */}
          <span className="flex items-center">
            {displayMembers.map((memberUid) => (
              <Avatar key={memberUid} uid={memberUid} size="xs" />
            ))}
            {isJoined && (
              <span ref={meAvatarRef}>
                <Avatar size="xs" isMe tone="bg-nb-orchid" data-me />
              </span>
            )}
          </span>

          <span className="inline-flex items-baseline gap-1">
            <span
              ref={countElRef}
              data-n
              className="font-nb-display text-[22px] leading-none tabular-nums text-nb-ink"
            >
              {totalMemberCount}
            </span>
            <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
              {totalMemberCount === 1 ? "member" : "members"}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleJoinClick}
          className={`min-h-[46px] px-5 sm:px-6 rounded-[10px] border-[2.5px] border-nb-ink font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3.5px_3.5px_0px_#0A0A0A] transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap cursor-pointer ${
            isJoined ? "bg-nb-white text-nb-ink" : "bg-nb-ink text-nb-white"
          }`}
        >
          {isJoined ? "Joined ✓ · Leave" : "Join group"}
        </button>
      </div>
    </article>
  );
}
