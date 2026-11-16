// Study groups feed component.
// Renders the study group header, course filter chips, group cards grid, and empty state.
// Applies GSAP cascading entrance with slight alternating rotation on mount.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";
import { AVAILABLE_COURSES } from "../placeholder-data";
import EmptyState from "../shared/EmptyState";
import CreateGroupModal from "./CreateGroupModal";
import GroupCard from "./GroupCard";

// ===== MAIN COMPONENT =====

export default function GroupFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    groups,
    isGroupsLoading,
    courseFilter,
    setCourseFilter,
    openCreateGroupModal,
  } = useActivityCenter();

  // Filter groups based on course filter chip
  const filteredGroups = groups.filter(
    (g) => courseFilter === "All" || g.course === courseFilter
  );

  // Find busiest group to feature with "Most active" sticker (when > 2 groups)
  const busiestGroup =
    filteredGroups.length > 2
      ? [...filteredGroups].sort(
          (a, b) => b.members.length - a.members.length
        )[0]
      : null;

  // Cascading entrance animation for all [data-in] elements
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = containerRef.current?.querySelectorAll("[data-in]");
        if (items && items.length > 0) {
          gsap.fromTo(
            items,
            {
              y: 34,
              autoAlpha: 0,
              rotation: (i: number) => (i % 2 === 0 ? 1.2 : -1.2),
            },
            {
              y: 0,
              autoAlpha: 1,
              rotation: 0,
              duration: 0.6,
              ease: "back.out(1.5)",
              stagger: 0.055,
              clearProps: "transform,opacity,visibility",
            }
          );
        }
      });
    },
    { dependencies: [courseFilter], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Feed header */}
      <div
        data-in
        className="flex flex-wrap items-end justify-between gap-3.5 mb-5.5"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 mb-2 font-nb-mono text-[11px] font-bold tracking-[0.18em] uppercase text-nb-muted">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full border-2 border-nb-ink bg-nb-brand flex-shrink-0"
            />
            <span>
              {isGroupsLoading
                ? "Loading groups..."
                : `${groups.length} ${groups.length === 1 ? "group" : "groups"} open`}
            </span>
          </p>
          <h2 className="m-0 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.025em] leading-[1.05] text-nb-ink">
            Study groups by course
          </h2>
          <p className="mt-2 text-base text-nb-muted max-w-[56ch]">
            Join one for your class or start your own. Async groups work around
            any schedule.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateGroupModal}
          className="btn min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
        >
          + New group
        </button>
      </div>

      {/* Course Filter Chips */}
      <div
        data-in
        role="group"
        aria-label="Filter by course"
        className="flex flex-wrap gap-2 mb-6.5"
      >
        {["All", ...AVAILABLE_COURSES].map((courseCode) => {
          const isSelected = courseFilter === courseCode;
          return (
            <button
              key={courseCode}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setCourseFilter(courseCode)}
              className={`min-h-[38px] px-4 rounded-full border-2 border-nb-ink font-nb-mono text-xs font-bold tracking-[0.08em] uppercase transition-all duration-120 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-sm active:translate-x-px active:translate-y-px ${
                isSelected
                  ? "bg-nb-ink text-nb-white"
                  : "bg-nb-white text-nb-ink"
              }`}
            >
              {courseCode}
            </button>
          );
        })}
      </div>

      {/* Feed Content */}
      {isGroupsLoading ? (
        <div className="grid gap-5.5 grid-cols-1 md:grid-cols-2 py-4" aria-busy="true">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-44 bg-nb-white/60 border-nb border-nb-ink/30 rounded-nb animate-pulse"
            />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          statusTag={
            courseFilter === "All"
              ? "GROUPS // 0_ACTIVE"
              : `COURSE // 0_${courseFilter}`
          }
          icon={
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-nb-ink"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          title={
            courseFilter === "All"
              ? "No study groups yet"
              : `No ${courseFilter} groups yet`
          }
          description={
            courseFilter === "All"
              ? "Be the first student to start a study group. Classmates in your courses will see it right away."
              : `Be the first to start a group for ${courseFilter}. Classmates in that course will see it right away.`
          }
          action={
            <button
              type="button"
              onClick={openCreateGroupModal}
              className="btn min-h-[46px] px-6 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5"
            >
              + Start a group
            </button>
          }
        />
      ) : (
        /* Groups Card Grid */
        <div className="grid gap-5.5 grid-cols-1 md:grid-cols-2">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isFeatured={group.id === busiestGroup?.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateGroupModal />
    </div>
  );
}
