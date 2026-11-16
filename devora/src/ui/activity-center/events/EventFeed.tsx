// Main events feed component.
// Renders the feed header, category chips, weekly grouped ticket feeds, and empty states.
// Applies GSAP cascading entrance with slight alternating rotation on mount.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type { ActivityEventTag } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";
import { CALENDAR_WEEKS } from "../placeholder-data";
import EmptyState from "../shared/EmptyState";
import EventFilter from "./EventFilter";
import EventTicket from "./EventTicket";

// ===== MAIN COMPONENT =====

export default function EventFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { events, eventFilter } = useActivityCenter();

  // Filter events based on active category chip
  const filteredEvents = events.filter(
    (e) => eventFilter === "all" || e.tags.includes(eventFilter as ActivityEventTag)
  );

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
    { dependencies: [eventFilter], scope: containerRef }
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
            <span>{events.length} events through finals</span>
          </p>
          <h2 className="m-0 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.025em] leading-[1.05] text-nb-ink">
            Upcoming CECS events
          </h2>
          <p className="mt-2 text-base text-nb-muted max-w-[56ch]">
            Posted early, so you can plan around class and your commute. Save the
            ones you want on your week.
          </p>
        </div>

        <span className="font-nb-mono text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border-2 border-dashed border-nb-ink text-nb-ink">
          Sample data
        </span>
      </div>

      {/* Filter Chips */}
      <EventFilter />

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title={`No ${eventFilter} events yet`}
          description="New events show up here as soon as they are posted. Check back this week."
        />
      ) : (
        /* Weeks groups */
        <div className="flex flex-col gap-7.5">
          {CALENDAR_WEEKS.map((week, weekIndex) => {
            const eventsInWeek = filteredEvents.filter(
              (e) => e.week === weekIndex
            );
            if (eventsInWeek.length === 0) return null;

            return (
              <section key={week.title}>
                {/* Week section header with ink line divider */}
                <div
                  data-in
                  className="flex items-center gap-3 mb-3.5 after:content-[''] after:flex-1 after:h-[3px] after:bg-nb-ink after:rounded-[3px]"
                >
                  <h3 className="m-0 text-lg font-bold whitespace-nowrap text-nb-ink">
                    {week.title}
                  </h3>
                  <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted whitespace-nowrap">
                    {week.range}
                  </span>
                </div>

                {week.note && (
                  <p data-in className="-mt-1 mb-3.5 text-[13px] text-nb-muted">
                    {week.note}
                  </p>
                )}

                {/* Tickets grid */}
                <div className="grid gap-4.5">
                  {eventsInWeek.map((event) => (
                    <EventTicket key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
