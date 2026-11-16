// Connections section container.
// Combines RequestDeck (left column) and Connections grid with search (right column).
// Applies cascading GSAP entrance animation on mount.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";
import EmptyState from "../shared/EmptyState";
import ConnectionCard from "./ConnectionCard";
import ConnectionSearch from "./ConnectionSearch";
import RequestDeck from "./RequestDeck";

// ===== MAIN COMPONENT =====

export default function ConnectionsFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { connections, people, searchQuery } = useActivityCenter();

  // Filter connections by name and major
  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredConnections = connections.filter((uid) => {
    const profile = people[uid];
    if (!profile) return false;
    if (!cleanQuery) return true;
    return `${profile.name} ${profile.major}`.toLowerCase().includes(cleanQuery);
  });

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
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Header */}
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
            <span>Stay connected across semesters</span>
          </p>
          <h2 className="m-0 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.025em] leading-[1.05] text-nb-ink">
            Your people
          </h2>
          <p className="mt-2 text-base text-nb-muted max-w-[56ch]">
            Accept requests from classmates, then message them any time, even after
            the semester ends.
          </p>
        </div>

        <span className="font-nb-mono text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border-2 border-dashed border-nb-ink text-nb-ink">
          Sample data
        </span>
      </div>

      {/* 2-column layout: Requests (left) & Connections (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-9 items-start">
        {/* Left column: Requests deck */}
        <RequestDeck />

        {/* Right column: Connections list */}
        <section aria-label="Connections" data-in className="w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3.5 after:content-[''] after:flex-1 after:h-[3px] after:bg-nb-ink after:rounded-[3px]">
            <h3 className="m-0 text-lg font-bold whitespace-nowrap text-nb-ink">
              Connections
            </h3>
            <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted whitespace-nowrap">
              {connections.length} people
            </span>
          </div>

          <ConnectionSearch />

          {connections.length === 0 ? (
            <EmptyState
              title="No connections yet"
              description="Find classmates by major and year on the Discovery Grid."
            />
          ) : filteredConnections.length === 0 ? (
            <EmptyState
              title={`No one matches "${searchQuery}"`}
              description="Try a first name or a major."
            />
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {filteredConnections.map((uid) => (
                <ConnectionCard key={uid} uid={uid} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
