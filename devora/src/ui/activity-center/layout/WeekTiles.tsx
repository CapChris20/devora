// Bento grid of summary tiles for the user's weekly activity.
// Shows Next up event, joined study groups, and saved events.
// Tiles are clickable navigation buttons whose numbers count up and pop on change.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";

// ===== MAIN COMPONENT =====

export default function WeekTiles() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    joinedGroupsCount,
    savedEventsCount,
  } = useActivityCenter();

  // References to count text elements for GSAP count-up tweens
  const groupsElRef = useRef<HTMLSpanElement>(null);
  const savedElRef = useRef<HTMLSpanElement>(null);

  // Store previous values to detect changes
  const prevCountsRef = useRef({
    groups: joinedGroupsCount,
    saved: savedEventsCount,
  });

  const isInitialMount = useRef(true);

  // Initial drop-in animation
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".bento-tile", {
          y: 50,
          rotation: (index: number) => (index % 2 === 0 ? 3 : -3),
          autoAlpha: 0,
          duration: 0.7,
          ease: "back.out(1.5)",
          stagger: 0.07,
          clearProps: "transform,opacity,visibility",
        });

        // Count up initial numbers
        const targets = [
          { ref: groupsElRef, target: joinedGroupsCount },
          { ref: savedElRef, target: savedEventsCount },
        ];

        targets.forEach(({ ref, target }) => {
          if (!ref.current) return;
          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: target,
            duration: 1.1,
            delay: 0.7,
            ease: "power2.out",
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent = Math.round(counterObj.val).toString();
              }
            },
          });
        });
      });
    },
    { scope: containerRef }
  );

  // Reactive updates when count values change after mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prev = prevCountsRef.current;
    const checks: Array<{
      key: keyof typeof prev;
      value: number;
      ref: React.RefObject<HTMLSpanElement>;
    }> = [
      { key: "groups", value: joinedGroupsCount, ref: groupsElRef },
      { key: "saved", value: savedEventsCount, ref: savedElRef },
    ];

    checks.forEach(({ key, value, ref }) => {
      if (prev[key] !== value && ref.current) {
        const fromVal = prev[key];
        const counterObj = { val: fromVal };
        const tile = ref.current.closest(".bento-tile");

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.to(counterObj, {
            val: value,
            duration: 0.6,
            ease: "power2.out",
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent = Math.round(counterObj.val).toString();
              }
            },
          });

          if (tile) {
            gsap.fromTo(
              tile,
              { rotation: -2 },
              {
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.4)",
                clearProps: "transform",
              }
            );
          }
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          ref.current.textContent = value.toString();
        }
      }
    });

    prevCountsRef.current = {
      groups: joinedGroupsCount,
      saved: savedEventsCount,
    };
  }, [joinedGroupsCount, savedEventsCount]);

  return (
    <div
      ref={containerRef}
      aria-label="Your week at a glance"
      className="grid grid-cols-2 gap-3.5"
    >
      {/* Next up tile */}
      <button
        type="button"
        onClick={() => router.push("/activity-center/events")}
        className="bento-tile col-span-2 relative text-left flex flex-col justify-between gap-2.5 min-h-[128px] p-4 bg-nb-brand border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
      >
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-ink">
          Next up
        </span>
        <span className="text-[22px] font-bold leading-tight text-nb-ink">
          CIS 310 Exam 2 Review Session
        </span>
        <span className="text-[13px] font-semibold text-nb-ink">
          Wed, Nov 18 · 4:00 PM · Engineering Lab Building
        </span>
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 w-[30px] h-[30px] grid place-items-center rounded-full border-2 border-nb-ink bg-nb-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>

      {/* Your groups tile */}
      <button
        type="button"
        onClick={() => router.push("/activity-center/study-groups")}
        className="bento-tile relative text-left flex flex-col justify-between gap-2.5 min-h-[108px] p-4 bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
      >
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-ink">
          Your groups
        </span>
        <span
          ref={groupsElRef}
          className="font-nb-display text-4xl sm:text-[40px] leading-none tabular-nums text-nb-ink"
        >
          {joinedGroupsCount}
        </span>
        <span className="text-[13px] text-nb-muted">Study groups joined</span>
      </button>

      {/* Saved events tile */}
      <button
        type="button"
        onClick={() => router.push("/activity-center/events")}
        className="bento-tile relative text-left flex flex-col justify-between gap-2.5 min-h-[108px] p-4 bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
      >
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-ink">
          Saved
        </span>
        <span
          ref={savedElRef}
          className="font-nb-display text-4xl sm:text-[40px] leading-none tabular-nums text-nb-ink"
        >
          {savedEventsCount}
        </span>
        <span className="text-[13px] text-nb-muted">Events on your list</span>
      </button>
    </div>
  );
}
